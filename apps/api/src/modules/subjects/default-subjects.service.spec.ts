import { DEFAULT_SUBJECT_PROFILES } from './default-subject-profiles';
import { ensureDefaultSubjects } from './default-subjects.service';

describe('ensureDefaultSubjects', () => {
  it('has unique normalized default profile names', () => {
    const names = DEFAULT_SUBJECT_PROFILES.map((profile) => profile.name.normalize('NFKC').trim().toLocaleLowerCase());
    expect(new Set(names).size).toBe(DEFAULT_SUBJECT_PROFILES.length);
  });

  it('creates only missing profiles and does not overwrite an existing description', async () => {
    const existing = { name: 'Mạng máy tính', description: 'Mô tả do người dùng sửa' };
    const create = jest.fn();
    const transaction = jest.fn(async (callback) => callback({ subject: { findMany: jest.fn().mockResolvedValue([existing]), create } }));
    const result = await ensureDefaultSubjects({ $transaction: transaction } as never, 'owner-a');

    expect(result).toEqual({ created: DEFAULT_SUBJECT_PROFILES.length - 1, skipped: 1 });
    expect(create).toHaveBeenCalledTimes(DEFAULT_SUBJECT_PROFILES.length - 1);
    expect(create).not.toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ name: 'Mạng máy tính' }) }));
  });

  it('is idempotent when every profile already exists for the same owner', async () => {
    const create = jest.fn();
    const transaction = jest.fn(async (callback) => callback({ subject: { findMany: jest.fn().mockResolvedValue(DEFAULT_SUBJECT_PROFILES), create } }));
    await expect(ensureDefaultSubjects({ $transaction: transaction } as never, 'owner-a')).resolves.toEqual({ created: 0, skipped: DEFAULT_SUBJECT_PROFILES.length });
    expect(create).not.toHaveBeenCalled();
  });
});
