export interface EmbeddingProvider { readonly name: string; readonly dimension: number; embed(texts: string[]): Promise<number[][]>; }
export class FakeEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'fake'; readonly dimension = 384;
  async embed(texts: string[]) { return texts.map(text => { const out = Array.from({ length: 384 }, (_, i) => ((text.charCodeAt(i % Math.max(1,text.length)) || 0) % 31) / 31); const norm = Math.hypot(...out) || 1; return out.map(n => n / norm); }); }
}
