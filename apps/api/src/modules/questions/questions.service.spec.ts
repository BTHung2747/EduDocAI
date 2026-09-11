import { updateQuestionSchema } from '@edudocs/contracts';
import { QuestionsService } from './questions.service';

const ownerId = '11111111-1111-4111-8111-111111111111';
const questionId = '22222222-2222-4222-8222-222222222222';
const question = {
  id: questionId, ownerId, subjectId: null, sourceType: 'MANUAL', status: 'DRAFT', text: 'Câu hỏi?', explanation: 'Lời giải.', difficulty: 'MEDIUM', correctOptionKey: 'A', createdAt: new Date(), updatedAt: new Date(),
  options: [{ key: 'A', text: 'Một', orderIndex: 0 }, { key: 'B', text: 'Hai', orderIndex: 1 }, { key: 'C', text: 'Ba', orderIndex: 2 }, { key: 'D', text: 'Bốn', orderIndex: 3 }], citations: [],
};

describe('QuestionsService', () => {
  it('lets an owner create, update and soft-delete their question', async () => {
    const prisma = { question: { create: jest.fn().mockResolvedValue(question), findFirst: jest.fn().mockResolvedValue(question), update: jest.fn().mockResolvedValue(question), updateMany: jest.fn() }, questionOption: { deleteMany: jest.fn() }, $transaction: jest.fn(async (callback: (tx: unknown) => Promise<unknown>) => callback({ questionOption: { deleteMany: jest.fn() }, question: { update: jest.fn().mockResolvedValue(question) } })) };
    const service = new QuestionsService(prisma as never, { requireOwned: jest.fn() } as never);
    const input = { text: 'Câu hỏi?', options: { A: 'Một', B: 'Hai', C: 'Ba', D: 'Bốn' }, correctOptionKey: 'A' as const, explanation: 'Lời giải.', difficulty: 'MEDIUM' as const };
    await expect(service.create(ownerId, input)).resolves.toMatchObject({ id: questionId, status: 'DRAFT' });
    await expect(service.update(ownerId, questionId, input)).resolves.toMatchObject({ id: questionId });
    await service.remove(ownerId, questionId);
    expect(prisma.question.update).toHaveBeenCalledWith(expect.objectContaining({ data: { deletedAt: expect.any(Date) } }));
  });

  it('does not expose a question owned by another user', async () => {
    const prisma = { question: { findFirst: jest.fn().mockResolvedValue(null) } };
    const service = new QuestionsService(prisma as never, {} as never);
    await expect(service.get(ownerId, questionId)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects an update without exactly four options', () => {
    expect(updateQuestionSchema.safeParse({ text: 'Q', options: { A: '1', B: '2', C: '3' }, correctOptionKey: 'A', explanation: 'E', difficulty: 'MEDIUM' }).success).toBe(false);
  });
});
