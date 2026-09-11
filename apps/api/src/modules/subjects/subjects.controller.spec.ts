import { SubjectsController } from './subjects.controller';

describe('SubjectsController defaults endpoint', () => {
  it('uses the authenticated user id as the owner', async () => {
    const defaults = { ensure: jest.fn().mockResolvedValue({ created: 12, skipped: 0 }) };
    const controller = new SubjectsController({} as never, defaults as never);

    await expect(controller.createDefaults({ id: 'owner-from-jwt' } as never)).resolves.toEqual({ data: { created: 12, skipped: 0 } });
    expect(defaults.ensure).toHaveBeenCalledWith('owner-from-jwt');
  });
});
