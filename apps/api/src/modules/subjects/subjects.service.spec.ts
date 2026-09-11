import { NotFoundException } from '@nestjs/common';
import { SubjectsService } from './subjects.service';

describe('SubjectsService ownership', () => {
  it('queries a subject with its owner before mutation', async () => {
    const findFirst = jest.fn().mockResolvedValue(null);
    const service = new SubjectsService({ subject: { findFirst } } as never);
    await expect(service.requireOwned('owner-a', 'subject-b')).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith({ where: { id: 'subject-b', ownerId: 'owner-a', deletedAt: null } });
  });
});
