import { parseQuestionImport } from './question-import.parser';

describe('parseQuestionImport', () => {
  it('keeps valid TXT parsing while removing unsupported control characters', () => {
    const items = parseQuestionImport(`\u0000Câu 1: HTTP là viết tắt của cụm nào?
A. HyperText Transfer Protocol
B. High Transfer Text Process
C. Hyper Tool Transfer Program
D. Home Text Transmission Protocol
Đáp án: A`);

    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ text: 'HTTP là viết tắt của cụm nào?', correctOptionKey: 'A', errors: [] });
  });
});
