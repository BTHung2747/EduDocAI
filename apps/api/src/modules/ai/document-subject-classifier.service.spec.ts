import { DocumentSubjectClassifier } from './document-subject-classifier.service';

const vector = (first: number, second = 0) => [first, second, ...Array.from({ length: 382 }, () => 0)];

describe('DocumentSubjectClassifier', () => {
  it('assigns the highest-scoring subject owned by the document owner', async () => {
    const updateMany = jest.fn().mockResolvedValue({ count: 1 });
    const prisma = {
      document: { findFirst: jest.fn().mockResolvedValue({ id: 'document', displayName: 'Giáo trình mạng', subjectAssignmentSource: null }), updateMany },
      subject: { findMany: jest.fn().mockResolvedValue([
        { id: 'subject-network', name: 'Mạng máy tính', description: 'Giao thức và hạ tầng mạng' },
        { id: 'subject-database', name: 'Cơ sở dữ liệu', description: 'Hệ quản trị cơ sở dữ liệu' },
      ]) },
      documentChunk: { findMany: jest.fn().mockResolvedValue([{ contentText: 'OSPF là giao thức định tuyến.', section: { title: 'Định tuyến' } }]) },
    };
    const embeddings = { embed: jest.fn().mockResolvedValue([vector(1), vector(1), vector(0.2, Math.sqrt(0.96))]) };
    const config = { get: jest.fn((key: string) => key === 'SUBJECT_CLASSIFICATION_THRESHOLD' ? 0.55 : 0.05) };
    const classifier = new DocumentSubjectClassifier(prisma as never, config as never, embeddings as never);

    await expect(classifier.classify('owner-a', 'document')).resolves.toEqual(expect.objectContaining({ assigned: true, subjectId: 'subject-network' }));
    expect(prisma.subject.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { ownerId: 'owner-a', deletedAt: null } }));
    expect(updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ subjectId: 'subject-network', subjectAssignmentSource: 'AI' }) }));
  });

  it('does not overwrite a manual assignment', async () => {
    const prisma = {
      document: { findFirst: jest.fn().mockResolvedValue({ id: 'document', displayName: 'Giáo trình', subjectAssignmentSource: 'MANUAL' }) },
      subject: { findMany: jest.fn() },
      documentChunk: { findMany: jest.fn() },
    };
    const embeddings = { embed: jest.fn() };
    const classifier = new DocumentSubjectClassifier(prisma as never, { get: jest.fn() } as never, embeddings as never);

    await expect(classifier.classify('owner-a', 'document')).resolves.toEqual({ assigned: false, confidence: null });
    expect(embeddings.embed).not.toHaveBeenCalled();
    expect(prisma.subject.findMany).not.toHaveBeenCalled();
  });
});
