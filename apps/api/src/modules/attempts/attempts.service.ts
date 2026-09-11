import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { testQuestionSnapshotSchema, type AttemptListQuery, type SaveAttemptAnswerInput } from '@edudocs/contracts';
import { Prisma } from '../../generated/prisma';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttemptsService {
  constructor(private readonly prisma: PrismaService) {}

  async start(userId: string, testId: string) {
    const test = await this.prisma.test.findFirst({ where: { id: testId, ownerId: userId, status: 'PUBLISHED', deletedAt: null }, select: { id: true, durationMinutes: true } });
    if (!test) throw new NotFoundException({ code: 'TEST_NOT_AVAILABLE', message: 'Không tìm thấy đề đã xuất bản.' });
    const startedAt = new Date();
    const expiresAt = test.durationMinutes ? new Date(startedAt.getTime() + test.durationMinutes * 60_000) : null;
    const attempt = await this.prisma.attempt.create({ data: { testId: test.id, userId, startedAt, expiresAt } });
    return this.progress(userId, attempt.id);
  }

  async progress(userId: string, id: string) {
    const attempt = await this.loadOwned(userId, id);
    return this.progressView(attempt);
  }

  async saveAnswer(userId: string, attemptId: string, testQuestionId: string, input: SaveAttemptAnswerInput) {
    await this.prisma.$transaction(async (tx) => {
      const attempt = await this.loadOwnedTx(tx, userId, attemptId);
      this.assertEditable(attempt);
      const testQuestion = await tx.testQuestion.findFirst({ where: { id: testQuestionId, testId: attempt.testId } });
      if (!testQuestion) throw new NotFoundException({ code: 'TEST_QUESTION_NOT_FOUND', message: 'Không tìm thấy câu hỏi trong đề.' });
      await tx.attemptAnswer.upsert({
        where: { attemptId_testQuestionId: { attemptId, testQuestionId } },
        create: { attemptId, testQuestionId, selectedOptionKey: input.selectedOptionKey ?? null, markedForReview: input.markedForReview ?? false, answeredAt: new Date() },
        update: { ...(input.selectedOptionKey !== undefined ? { selectedOptionKey: input.selectedOptionKey } : {}), ...(input.markedForReview !== undefined ? { markedForReview: input.markedForReview } : {}), answeredAt: new Date() },
      });
    });
    return this.progress(userId, attemptId);
  }

  async submit(userId: string, attemptId: string) {
    return this.prisma.$transaction(async (tx) => {
      const attempt = await this.loadOwnedTx(tx, userId, attemptId);
      if (attempt.status !== 'IN_PROGRESS') return this.resultView(await this.loadResultTx(tx, userId, attemptId));
      const testQuestions = await tx.testQuestion.findMany({ where: { testId: attempt.testId }, orderBy: { orderIndex: 'asc' } });
      const answers = await tx.attemptAnswer.findMany({ where: { attemptId } });
      let correctCount = 0; let incorrectCount = 0; let unansweredCount = 0; let score = 0; let totalPoints = 0;
      for (const question of testQuestions) {
        const snapshot = this.snapshot(question.snapshotJson);
        totalPoints += snapshot.points;
        const answer = answers.find((item) => item.testQuestionId === question.id);
        if (!answer?.selectedOptionKey) { unansweredCount += 1; continue; }
        const isCorrect = answer.selectedOptionKey === snapshot.correctOptionKey;
        if (isCorrect) { correctCount += 1; score += snapshot.points; } else incorrectCount += 1;
        await tx.attemptAnswer.update({ where: { id: answer.id }, data: { isCorrect } });
      }
      await tx.attempt.update({ where: { id: attemptId }, data: { status: 'GRADED', submittedAt: new Date(), score, totalPoints, totalQuestionCount: testQuestions.length, correctCount, incorrectCount, unansweredCount } });
      return this.resultView(await this.loadResultTx(tx, userId, attemptId));
    });
  }

  async result(userId: string, attemptId: string) {
    const attempt = await this.loadResultTx(this.prisma, userId, attemptId);
    if (attempt.status === 'IN_PROGRESS') throw new ConflictException({ code: 'ATTEMPT_NOT_SUBMITTED', message: 'Bài làm chưa được nộp.' });
    return this.resultView(attempt);
  }

  async list(userId: string, query: AttemptListQuery) {
    const where = { userId, ...(query.status ? { status: query.status } : {}) };
    const [total, items] = await this.prisma.$transaction([this.prisma.attempt.count({ where }), this.prisma.attempt.findMany({ where, include: { test: { select: { title: true } } }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: (query.page - 1) * query.limit, take: query.limit })]);
    return { items: items.map((attempt) => ({ id: attempt.id, testId: attempt.testId, testTitle: attempt.test.title, status: attempt.status, score: attempt.score, totalPoints: attempt.totalPoints, startedAt: attempt.startedAt, submittedAt: attempt.submittedAt })), meta: { page: query.page, limit: query.limit, total, totalPages: Math.max(1, Math.ceil(total / query.limit)) } };
  }

  private assertEditable(attempt: { status: string; expiresAt: Date | null }) {
    if (attempt.status !== 'IN_PROGRESS') throw new ConflictException({ code: 'ATTEMPT_NOT_EDITABLE', message: 'Bài làm không còn có thể chỉnh sửa.' });
    if (attempt.expiresAt && attempt.expiresAt <= new Date()) throw new ConflictException({ code: 'ATTEMPT_EXPIRED', message: 'Bài làm đã hết thời gian.' });
  }

  private async loadOwned(userId: string, id: string) { return this.loadAttempt(this.prisma, userId, id); }
  private async loadOwnedTx(tx: Prisma.TransactionClient, userId: string, id: string) { return this.loadAttempt(tx, userId, id); }
  private async loadAttempt(client: Prisma.TransactionClient | PrismaService, userId: string, id: string) {
    const attempt = await client.attempt.findFirst({ where: { id, userId, test: { ownerId: userId, deletedAt: null } }, include: { test: { include: { questions: { orderBy: { orderIndex: 'asc' } } } }, answers: true } });
    if (!attempt) throw new NotFoundException({ code: 'ATTEMPT_NOT_FOUND', message: 'Không tìm thấy bài làm.' });
    return attempt;
  }
  private async loadResultTx(client: Prisma.TransactionClient | PrismaService, userId: string, id: string) { return this.loadAttempt(client, userId, id); }
  private snapshot(value: Prisma.JsonValue | null) { const parsed = testQuestionSnapshotSchema.safeParse(value); if (!parsed.success) throw new ConflictException({ code: 'TEST_SNAPSHOT_INVALID', message: 'Dữ liệu đề kiểm tra không hợp lệ.' }); return parsed.data; }
  private progressView(attempt: Awaited<ReturnType<AttemptsService['loadOwned']>>) { return { id: attempt.id, testId: attempt.testId, status: attempt.status, startedAt: attempt.startedAt, expiresAt: attempt.expiresAt, submittedAt: attempt.submittedAt, questions: attempt.test.questions.map((question) => { const snapshot = this.snapshot(question.snapshotJson); const answer = attempt.answers.find((item) => item.testQuestionId === question.id); return { testQuestionId: question.id, orderIndex: question.orderIndex, points: snapshot.points, text: snapshot.text, options: snapshot.options, selectedOptionKey: answer?.selectedOptionKey ?? null, markedForReview: answer?.markedForReview ?? false }; }) }; }
  private resultView(attempt: Awaited<ReturnType<AttemptsService['loadOwned']>>) { return { ...this.progressView(attempt), score: attempt.score ?? 0, totalPoints: attempt.totalPoints ?? 0, totalQuestionCount: attempt.totalQuestionCount ?? attempt.test.questions.length, correctCount: attempt.correctCount ?? 0, incorrectCount: attempt.incorrectCount ?? 0, unansweredCount: attempt.unansweredCount ?? 0, questions: attempt.test.questions.map((question) => { const snapshot = this.snapshot(question.snapshotJson); const answer = attempt.answers.find((item) => item.testQuestionId === question.id); return { testQuestionId: question.id, orderIndex: question.orderIndex, points: snapshot.points, text: snapshot.text, options: snapshot.options, selectedOptionKey: answer?.selectedOptionKey ?? null, markedForReview: answer?.markedForReview ?? false, isCorrect: answer?.isCorrect ?? null, ...(attempt.test.showAnswers ? { correctOptionKey: snapshot.correctOptionKey, explanation: snapshot.explanation } : {}) }; }) }; }
}
