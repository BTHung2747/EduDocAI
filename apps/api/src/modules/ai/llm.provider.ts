export interface LlmProvider { readonly name: string; generateStructured<T>(prompt: string, schema: { parse(value: unknown): T }): Promise<{ value: T; model: string }>; }
export class FakeLlmProvider implements LlmProvider {
  readonly name = 'fake';
  constructor(private readonly response: unknown = {}) {}
  async generateStructured<T>(_prompt: string, schema: { parse(value: unknown): T }) {
    return { value: schema.parse(this.response), model: 'fake' };
  }
}
