import { TestsService } from './tests.service';

const ownerId = '11111111-1111-4111-8111-111111111111';
const testId = '22222222-2222-4222-8222-222222222222';
const questionA = '33333333-3333-4333-8333-333333333333';
const questionB = '44444444-4444-4444-8444-444444444444';
const draft = (questions: Array<{ questionId: string; orderIndex: number; points: number }> = []) => ({ id: testId, ownerId, title: 'Đề mẫu', description: null, durationMinutes: null, shuffleQuestions: false, shuffleOptions: false, showAnswers: false, status: 'DRAFT', publishedAt: null, createdAt: new Date(), updatedAt: new Date(), questions: questions.map((item, index) => ({ id: `item-${index}`, ...item })) });

describe('TestsService', () => {
  const input = { title: 'Đề mẫu', description: null, durationMinutes: null, shuffleQuestions: false, shuffleOptions: false, showAnswers: false, questionIds: [questionA] };

  it('creates a valid draft from approved owner questions', async () => {
    const tx = { question: { findMany: jest.fn().mockResolvedValue([{ id: questionA }]) }, test: { create: jest.fn().mockResolvedValue(draft([{ questionId: questionA, orderIndex: 0, points: 1 }])) } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)) };
    const service = new TestsService(prisma as never);
    await expect(service.create(ownerId, input)).resolves.toMatchObject({ status: 'DRAFT', totalPoints: 1 });
    expect(tx.test.create).toHaveBeenCalled();
  });

  it('blocks DRAFT or foreign questions from a test', async () => {
    const tx = { question: { findMany: jest.fn().mockResolvedValue([]) }, test: { create: jest.fn() } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)) };
    const service = new TestsService(prisma as never);
    await expect(service.create(ownerId, input)).rejects.toMatchObject({ status: 409 });
    expect(tx.test.create).not.toHaveBeenCalled();
  });

  it('reorders questions transactionally and calculates total points on the backend', async () => {
    const reordered = draft([{ questionId: questionB, orderIndex: 0, points: 1 }, { questionId: questionA, orderIndex: 1, points: 1 }]);
    const tx = { test: { findFirst: jest.fn().mockResolvedValue(draft()), findUniqueOrThrow: jest.fn().mockResolvedValue(reordered) }, testQuestion: { findMany: jest.fn().mockResolvedValue([{ questionId: questionA }, { questionId: questionB }]), updateMany: jest.fn() } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)) };
    const service = new TestsService(prisma as never);
    const result = await service.reorderQuestions(ownerId, testId, { questionIds: [questionB, questionA] });
    expect(result.totalPoints).toBe(2);
    expect(result.questions[0]).toMatchObject({ questionId: questionB, orderIndex: 0 });
    expect(tx.testQuestion.updateMany).toHaveBeenCalled();
  });

  it('publishes a valid draft and persists question snapshots', async () => {
    const published = { ...draft([{ questionId: questionA, orderIndex: 0, points: 1 }]), status: 'PUBLISHED', publishedAt: new Date() };
    const tx = { test: { findFirst: jest.fn().mockResolvedValue(draft()), update: jest.fn().mockResolvedValue(published) }, testQuestion: { findMany: jest.fn().mockResolvedValue([{ id: 'item-1', questionId: questionA, orderIndex: 0, points: 1, question: { ownerId, deletedAt: null, status: 'APPROVED', text: 'Q', correctOptionKey: 'A', explanation: 'E', options: [{ key: 'A', text: 'A' }, { key: 'B', text: 'B' }, { key: 'C', text: 'C' }, { key: 'D', text: 'D' }] } }]), update: jest.fn() } };
    const prisma = { $transaction: jest.fn(async (callback: (client: unknown) => Promise<unknown>) => callback(tx)) };
    const service = new TestsService(prisma as never);
    await expect(service.publish(ownerId, testId)).resolves.toMatchObject({ status: 'PUBLISHED', totalPoints: 1 });
    expect(tx.testQuestion.update).toHaveBeenCalledWith(expect.objectContaining({ data: { snapshotJson: expect.objectContaining({ correctOptionKey: 'A', points: 1 }) } }));
  });
});
