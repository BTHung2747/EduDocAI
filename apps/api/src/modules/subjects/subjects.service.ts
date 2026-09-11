import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type SubjectInput = { name: string; description?: string | null };

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  list(ownerId: string) {
    return this.prisma.subject.findMany({ where: { ownerId, deletedAt: null }, orderBy: { name: 'asc' } });
  }

  async create(ownerId: string, input: SubjectInput) {
    const exists = await this.prisma.subject.findFirst({ where: { ownerId, name: input.name, deletedAt: null } });
    if (exists) throw new ConflictException({ code: 'SUBJECT_NAME_EXISTS', message: 'Tên môn học đã tồn tại.' });
    return this.prisma.subject.create({ data: { ownerId, name: input.name, description: input.description || null } });
  }

  async update(ownerId: string, id: string, input: SubjectInput) {
    await this.requireOwned(ownerId, id);
    if (input.name) {
      const duplicate = await this.prisma.subject.findFirst({ where: { ownerId, name: input.name, deletedAt: null, NOT: { id } } });
      if (duplicate) throw new ConflictException({ code: 'SUBJECT_NAME_EXISTS', message: 'Tên môn học đã tồn tại.' });
    }
    return this.prisma.subject.update({ where: { id }, data: { name: input.name, description: input.description || null } });
  }

  async remove(ownerId: string, id: string) {
    await this.requireOwned(ownerId, id);
    await this.prisma.$transaction([
      this.prisma.document.updateMany({ where: { ownerId, subjectId: id, deletedAt: null }, data: { subjectId: null } }),
      this.prisma.subject.update({ where: { id }, data: { deletedAt: new Date() } }),
    ]);
  }

  async requireOwned(ownerId: string, id: string) {
    const subject = await this.prisma.subject.findFirst({ where: { id, ownerId, deletedAt: null } });
    if (!subject) throw new NotFoundException({ code: 'SUBJECT_NOT_FOUND', message: 'Không tìm thấy môn học.' });
    return subject;
  }
}
