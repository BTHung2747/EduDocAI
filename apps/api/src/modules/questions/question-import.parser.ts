import { questionOptionsSchema } from '@edudocs/contracts';

export type ParsedImportItem = {
  text: string | null;
  options: Record<string, string> | null;
  correctOptionKey: string | null;
  explanation: string | null;
  errors: Array<{ field: string; message: string }>;
};

const normalize = (value: string) => value.normalize('NFKC').replace(/\r\n?/g, '\n').trim();

function stripUnsupportedControlCharacters(value: string) {
  return Array.from(value, (character) => {
    const code = character.charCodeAt(0);
    return code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) ? '' : character;
  }).join('');
}

export function parseQuestionImport(source: string): ParsedImportItem[] {
  const text = normalize(stripUnsupportedControlCharacters(source.replace(/^\uFEFF/, '')));
  const starts = [...text.matchAll(/^\s*Câu\s+\d+\s*:\s*(.*)$/gim)];
  if (!starts.length) return [{ text: null, options: null, correctOptionKey: null, explanation: null, errors: [{ field: 'file', message: 'Không tìm thấy câu hỏi theo mẫu Câu n:.' }] }];
  return starts.map((match, index) => parseBlock(`${match[1]}\n${text.slice((match.index ?? 0) + match[0].length, starts[index + 1]?.index)}`));
}

function parseBlock(block: string): ParsedImportItem {
  const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
  const options: Record<string, string> = {};
  const question: string[] = [];
  let explanation: string | null = null;
  let correctOptionKey: string | null = null;
  let current: 'question' | 'option' | 'explanation' = 'question';
  let optionKey: string | null = null;

  for (const line of lines) {
    const option = line.match(/^([A-D])[.)]\s*(.+)$/i);
    const answer = line.match(/^Đáp\s*án\s*:\s*(.*?)\s*$/i);
    const explanationLine = line.match(/^Giải\s*thích\s*:\s*(.*)$/i);
    if (option) { optionKey = option[1].toUpperCase(); options[optionKey] = option[2]; current = 'option'; continue; }
    if (answer) { correctOptionKey = answer[1].trim().toUpperCase() || null; current = 'question'; optionKey = null; continue; }
    if (explanationLine) { explanation = explanationLine[1]; current = 'explanation'; optionKey = null; continue; }
    if (current === 'option' && optionKey) options[optionKey] = `${options[optionKey]} ${line}`.trim();
    else if (current === 'explanation') explanation = `${explanation ?? ''} ${line}`.trim();
    else question.push(line);
  }

  const errors: ParsedImportItem['errors'] = [];
  const text = question.join(' ').trim() || null;
  if (!text) errors.push({ field: 'text', message: 'Thiếu nội dung câu hỏi.' });
  const parsedOptions = questionOptionsSchema.safeParse(options);
  if (!parsedOptions.success) errors.push({ field: 'options', message: 'Cần đủ bốn lựa chọn A/B/C/D, không trùng nhau.' });
  if (!correctOptionKey) errors.push({ field: 'correctOptionKey', message: 'Thiếu đáp án đúng.' });
  else if (!['A', 'B', 'C', 'D'].includes(correctOptionKey)) errors.push({ field: 'correctOptionKey', message: 'Đáp án đúng phải là A, B, C hoặc D.' });
  return { text, options: parsedOptions.success ? parsedOptions.data : Object.keys(options).length ? options : null, correctOptionKey, explanation: explanation?.trim() || null, errors };
}
