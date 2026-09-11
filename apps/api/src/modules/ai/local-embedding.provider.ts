import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EmbeddingProvider } from './embedding.provider';
@Injectable()
export class LocalEmbeddingProvider implements EmbeddingProvider {
  readonly name = 'local'; readonly dimension: number; private pipelinePromise?: Promise<any>;
  constructor(private readonly config: ConfigService) { this.dimension = Number(config.get('EMBEDDING_DIMENSION') || 384); }
  private pipeline() { return this.pipelinePromise ??= import('@huggingface/transformers').then(async ({ pipeline, env }) => { env.cacheDir = this.config.get('HF_CACHE_DIR') || '.cache/huggingface'; return pipeline('feature-extraction', this.config.get('EMBEDDING_MODEL') || 'Xenova/paraphrase-multilingual-MiniLM-L12-v2'); }); }
  async embed(texts: string[]) { const run = await this.pipeline(); const results = await Promise.all(texts.map(text => run(text, { pooling: 'mean', normalize: true }))); return results.map((result: { data: Float32Array }) => { const vector = Array.from(result.data); if (vector.length !== this.dimension) throw new Error('EMBEDDING_DIMENSION_MISMATCH'); return vector; }); }
}
