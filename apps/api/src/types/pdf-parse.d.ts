declare module 'pdf-parse' {
  const parse: (buffer: Buffer, options?: unknown) => Promise<{ numpages: number; text: string }>;
  export default parse;
}
