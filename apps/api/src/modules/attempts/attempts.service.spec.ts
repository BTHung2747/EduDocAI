import { AttemptsService } from './attempts.service';

const userId = '11111111-1111-4111-8111-111111111111';
const testId = '22222222-2222-4222-8222-222222222222';
const attemptId = '33333333-3333-4333-8333-333333333333';
const testQuestionId = '44444444-4444-4444-8444-444444444444';
const snapshot = { text: '2 + 2 bằng mấy?', options: { A: '4', B: '3', C: '2', D: '1' }, correctOptionKey: 'A', explanation: '2 cộng 2 bằng 4.', points: 1 };

function attempt(status = 'IN_PROGRESS', answers: Array<{ id: string; testQuestionId: string; selectedOptionKey: string | null; markedForReview: boolean; isCorrect: boolean | null }> = []) {
  return { id: attemptId, testId, userId, status, startedAt: new Date(), expiresAt: null, submittedAt: status === 'IN_PROGRESS' ? null : new Date(), score: status === 'IN_PROGRESS' ? null : 1, totalPoints: status === 'IN_PROGRESS' ? null : 1, correctCount: status === 'IN_PROGRESS' ? null : 1, incorrectCount: status === 'IN_PROGRESS' ? null : 0, unansweredCount: status === 'IN_PROGRESS' ? null : 0, test: { ownerId: userId, deletedAt: null, showAnswers: true, questions: [{ id: testQuestionId, orderIndex: 0, snapshotJson: snapshot }] }, answers };
}

describe('AttemptsService', () => {
  it('starts an attempt only from an owned PUBLISHED test', async () => {
    const prisma = { test: { findFirst: jest.fn().mockResolvedValue({ id: testId, durationMinutes: 30 }) }, attempt: { create: jest.fn().mockResolvedValue({ id: attemptId }), findFirst: jest.fn().mockResolvedValue(attempt()) } };
    const service = new AttemptsService(prisma as never);
    await expect(service.start(userId, testId)).resolves.toMatchObject({ id: attemptId, status: 'IN_PROGRESS' });
    expect(prisma.test.findFirst).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ status: 'PUBLISHED', ownerId: userId }) }));
  });

  it('does not expose correct answers or explanations before submit', async () => {
    const prisma = { attempt: { findFirst: jest.fn().mockResolvedValue(attempt()) } };
    const service = new AttemptsService(prisma as never);
    const view = await service.progress(userId, attemptId);
    expect(view.questions[0]).not.toHaveProperty('correctOptionKey');
    expect(view.questions[0]).not.toHaveProperty('explanation');
  });

  it('saves an answer and grades it from the publish snapshot', async () => {
    const inProgress = attempt('IN_PROGRESS', [{ id: 'answer-1', testQuestionId, selectedOptionKey: 'A', markedForReview: false, isCorrect: null }]);
    const graded = attempt('GRADED', [{ id: 'answer-1', testQuestionId, selectedOptionKey: 'A', markedForReview: false, isCorrect: true }]);
    const tx = { attempt: { findFirst: jest.fn().mockResolvedValue(inProgress), update: jest.fn() }, testQuestion: { findFirst: jest.fn().mockResolvedValue({ id: testQuestionId }), findMany: jest.fn().mockResolvedValue([{ id: testQuestionId, snapshotJson: snapshot }]) }, attemptAnswer: { upsert: jest.fn(), findMany: jest.fn().mockResolvedValue(inProgress.answers), update: jest.fn() } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)), attempt: { findFirst: jest.fn().mockResolvedValue(inProgress) } };
    const service = new AttemptsService(prisma as never);
    await service.saveAnswer(userId, attemptId, testQuestionId, { selectedOptionKey: 'A' });
    expect(tx.attemptAnswer.upsert).toHaveBeenCalled();
    tx.attempt.findFirst.mockReset().mockResolvedValueOnce(inProgress).mockResolvedValue(graded);
    const result = await service.submit(userId, attemptId);
    expect(tx.attempt.update).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ score: 1, correctCount: 1, status: 'GRADED' }) }));
    expect(result).toMatchObject({ score: 1, totalPoints: 1, correctCount: 1 });
  });

  it('does not grade an already submitted attempt a second time', async () => {
    const graded = attempt('GRADED', [{ id: 'answer-1', testQuestionId, selectedOptionKey: 'A', markedForReview: false, isCorrect: true }]);
    const tx = { attempt: { findFirst: jest.fn().mockResolvedValue(graded), update: jest.fn() }, testQuestion: { findMany: jest.fn() }, attemptAnswer: { findMany: jest.fn(), update: jest.fn() } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)) };
    const service = new AttemptsService(prisma as never);
    await expect(service.submit(userId, attemptId)).resolves.toMatchObject({ status: 'GRADED', score: 1 });
    expect(tx.testQuestion.findMany).not.toHaveBeenCalled();
    expect(tx.attempt.update).not.toHaveBeenCalled();
  });

  it('blocks answer changes after submission', async () => {
    const tx = { attempt: { findFirst: jest.fn().mockResolvedValue(attempt('GRADED')) }, testQuestion: { findFirst: jest.fn() }, attemptAnswer: { upsert: jest.fn() } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)) };
    const service = new AttemptsService(prisma as never);
    await expect(service.saveAnswer(userId, attemptId, testQuestionId, { selectedOptionKey: 'A' })).rejects.toMatchObject({ status: 409 });
    expect(tx.attemptAnswer.upsert).not.toHaveBeenCalled();
  });
});
