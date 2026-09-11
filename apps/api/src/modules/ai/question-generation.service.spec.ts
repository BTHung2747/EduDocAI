import { sharedSubjectId } from './question-generation.service';

describe('sharedSubjectId', () => {
  it('inherits a subject when every selected document has the same subject', () => {
    expect(sharedSubjectId(['subject-a'])).toBe('subject-a');
    expect(sharedSubjectId(['subject-a', 'subject-a'])).toBe('subject-a');
  });

  it('does not choose a random subject for mixed or unclassified documents', () => {
    expect(sharedSubjectId(['subject-a', 'subject-b'])).toBeNull();
    expect(sharedSubjectId(['subject-a', null])).toBeNull();
  });
});
