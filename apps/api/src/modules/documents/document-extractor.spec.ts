import { extractDocument, NoExtractableTextError } from './document-extractor';

describe('document extractor', () => {
  it('normalizes TXT line endings and removes control characters', async () => {
    const result = await extractDocument(Buffer.from('Dòng một\r\nDòng\u0000 hai'), 'txt');
    expect(result.sections[0]?.contentText).toBe('Dòng một\nDòng hai');
  });
  it('rejects a text file without extractable text', async () => {
    await expect(extractDocument(Buffer.from(' \r\n '), 'txt')).rejects.toBeInstanceOf(NoExtractableTextError);
  });
});
