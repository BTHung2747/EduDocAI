import { DocumentWorker } from './document.worker';

describe('DocumentWorker subject classification', () => {
  it('keeps classification failure isolated from document processing', async () => {
    const classifier = { classify: jest.fn().mockRejectedValue(new Error('embedding failed')) };
    const worker = new DocumentWorker({} as never, {} as never, {} as never, {} as never, {} as never, classifier as never);

    await expect(worker.classifyReadyDocument('owner', 'document')).resolves.toBeUndefined();
    expect(classifier.classify).toHaveBeenCalledWith('owner', 'document');
  });
});
