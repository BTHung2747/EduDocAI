import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

export type ExtractedSection = { title?: string; pageStart?: number; pageEnd?: number; contentText: string };
export class NoExtractableTextError extends Error {}
// eslint-disable-next-line no-control-regex -- extraction must remove invisible control characters.
const clean = (text: string) => text.replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim();

export async function extractDocument(buffer: Buffer, extension: string): Promise<{ pageCount: number; sections: ExtractedSection[] }> {
  if (extension === 'txt') {
    const text = clean(buffer.toString('utf8').replace(/^\uFEFF/, ''));
    if (!text) throw new NoExtractableTextError();
    return { pageCount: 1, sections: [{ title: 'Nội dung', pageStart: 1, pageEnd: 1, contentText: text }] };
  }
  if (extension === 'docx') {
    const html = (await mammoth.convertToHtml({ buffer })).value;
    const sections = html.match(/<(h[1-6]|p)[^>]*>([\s\S]*?)<\/\1>/gi)?.map((part, index) => {
      const heading = /^<h/i.test(part); const text = clean(part.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&'));
      return { title: heading ? text : undefined, pageStart: 1, pageEnd: 1, contentText: text, orderIndex: index };
    }).filter((item) => item.contentText) ?? [];
    if (!sections.length) throw new NoExtractableTextError();
    return { pageCount: 1, sections };
  }
  const pages: string[] = [];
  const parsed = await pdfParse(buffer, { pagerender: async (page: { getTextContent: () => Promise<{ items: Array<{ str: string }> }> }) => {
    const content = await page.getTextContent(); const text = clean(content.items.map((item) => item.str).join(' ')); pages.push(text); return text;
  }});
  const sections = pages.map((text, index) => ({ title: `Trang ${index + 1}`, pageStart: index + 1, pageEnd: index + 1, contentText: text })).filter((item) => item.contentText);
  if (!sections.length) throw new NoExtractableTextError();
  return { pageCount: parsed.numpages || pages.length, sections };
}
