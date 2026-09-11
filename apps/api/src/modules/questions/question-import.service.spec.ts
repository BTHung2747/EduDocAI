import { QuestionImportService } from './question-import.service';

const ownerId = '11111111-1111-4111-8111-111111111111';
const validText = `Câu 1: HTTP là viết tắt của cụm nào?
A. HyperText Transfer Protocol
B) High Transfer Text Process
C. Hyper Tool Transfer Program
D. Home Text Transmission Protocol
Đáp án: A
Giải thích: HTTP là giao thức truyền tải siêu văn bản.`;

describe('QuestionImportService', () => {
  it('creates a preview session for a valid UTF-8 TXT import without creating questions', async () => {
    const item = { id: '22222222-2222-4222-8222-222222222222', orderIndex: 0, text: 'HTTP là viết tắt của cụm nào?', optionsJson: { A: 'HyperText Transfer Protocol', B: 'High Transfer Text Process', C: 'Hyper Tool Transfer Program', D: 'Home Text Transmission Protocol' }, correctOptionKey: 'A', explanation: 'HTTP là giao thức truyền tải siêu văn bản.', difficulty: 'MEDIUM', isValid: true, errorsJson: null };
    const prisma = { questionImport: { create: jest.fn().mockResolvedValue({ id: '33333333-3333-4333-8333-333333333333', fileName: 'questions.txt', status: 'PREVIEW', totalCount: 1, validCount: 1, invalidCount: 0, items: [item] }) }, question: { create: jest.fn() } };
    const service = new QuestionImportService(prisma as never, { requireOwned: jest.fn() } as never, { get: jest.fn().mockReturnValue(20 * 1024 * 1024) } as never);
    const file = { originalname: 'questions.txt', mimetype: 'text/plain', buffer: Buffer.from(validText, 'utf8'), size: Buffer.byteLength(validText) } as Express.Multer.File;
    await expect(service.preview(ownerId, file)).resolves.toMatchObject({ validCount: 1, invalidCount: 0 });
    expect(prisma.questionImport.create).toHaveBeenCalled();
    expect(prisma.question.create).not.toHaveBeenCalled();
  });

  it('rejects an unsupported file before it saves a preview or any question', async () => {
    const prisma = { questionImport: { create: jest.fn() }, question: { create: jest.fn() } };
    const service = new QuestionImportService(prisma as never, {} as never, { get: jest.fn().mockReturnValue(20 * 1024 * 1024) } as never);
    const file = { originalname: 'questions.pdf', mimetype: 'application/pdf', buffer: Buffer.from('%PDF-'), size: 5 } as Express.Multer.File;
    await expect(service.preview(ownerId, file)).rejects.toMatchObject({ status: 400 });
    expect(prisma.questionImport.create).not.toHaveBeenCalled();
    expect(prisma.question.create).not.toHaveBeenCalled();
  });
});
