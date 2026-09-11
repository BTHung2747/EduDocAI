import { Test } from '@nestjs/testing';
import { DocumentAnalysisService } from './document-analysis.service';
import { DocumentAnalysisWorker } from './document-analysis.worker';
import { LLM_PROVIDER } from './ai.tokens';
import { PrismaService } from '../prisma/prisma.service';

describe('DOCUMENT_ANALYSIS wiring', () => {
  it('resolves DocumentAnalysisService with an overridable LLM_PROVIDER', async () => {
    const fakeLlm = { name: 'fake', generateStructured: jest.fn() };
    const module = await Test.createTestingModule({ providers: [DocumentAnalysisService, { provide: PrismaService, useValue: {} }, { provide: LLM_PROVIDER, useValue: fakeLlm }] }).compile();
    expect(module.get(DocumentAnalysisService)).toBeInstanceOf(DocumentAnalysisService);
    await module.close();
  });
  it('claims DOCUMENT_ANALYSIS and marks a successful job succeeded', async () => {
    const jobs = { claimNext: jest.fn().mockResolvedValue({ id: 'job', ownerId: 'owner', documentId: 'doc', inputJson: {} }), succeed: jest.fn(), fail: jest.fn() };
    const analysis = { analyze: jest.fn().mockResolvedValue(undefined) };
    const worker = new DocumentAnalysisWorker(jobs as never, analysis as never);
    await worker.processNext();
    expect(jobs.claimNext).toHaveBeenCalledWith('DOCUMENT_ANALYSIS'); expect(analysis.analyze).toHaveBeenCalledWith('owner', 'doc'); expect(jobs.succeed).toHaveBeenCalledWith('job');
  });
  it('marks a provider failure as failed without changing a document', async () => {
    const jobs = { claimNext: jest.fn().mockResolvedValue({ id: 'job', ownerId: 'owner', documentId: 'doc', inputJson: {} }), succeed: jest.fn(), fail: jest.fn() };
    const worker = new DocumentAnalysisWorker(jobs as never, { analyze: jest.fn().mockRejectedValue(new Error('provider')) } as never);
    await worker.processNext(); expect(jobs.fail).toHaveBeenCalledWith('job', 'ANALYSIS_FAILED'); expect(jobs.succeed).not.toHaveBeenCalled();
  });
});
