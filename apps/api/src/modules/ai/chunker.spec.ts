import { chunkSections } from './chunker';
import { FakeEmbeddingProvider } from './embedding.provider';
describe('M2B indexing primitives', () => {
  it('keeps overlap and source mapping', () => { const words=Array.from({length:800},(_,i)=>`w${i}`).join(' '); const chunks=chunkSections([{sectionOrder:2,contentText:words,pageStart:4,pageEnd:5}]); expect(chunks).toHaveLength(2); expect(chunks[0].contentText.split(' ')).toHaveLength(650); expect(chunks[1].contentText.split(' ')[0]).toBe('w550'); expect(chunks.every(c=>c.sectionOrder===2&&c.pageStart===4&&c.pageEnd===5)).toBe(true); });
  it('creates stable 384-dimensional batch vectors', async () => { const provider=new FakeEmbeddingProvider(); const vectors=await provider.embed(['một','hai']); expect(vectors).toHaveLength(2); expect(vectors.every(v=>v.length===384)).toBe(true); expect(vectors[0]).toEqual((await provider.embed(['một']))[0]); });
});
