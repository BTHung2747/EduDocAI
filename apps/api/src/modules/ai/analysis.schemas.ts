import { z } from 'zod';
export const summaryOutputSchema=z.object({summary:z.string().min(1),scope:z.object({pageStart:z.number().int().positive(),pageEnd:z.number().int().positive(),chunkIds:z.array(z.string().uuid()).min(1)})});
export const topicsOutputSchema=z.object({topics:z.array(z.object({title:z.string().min(1),shortSummary:z.string().min(1),pageStart:z.number().int().positive(),pageEnd:z.number().int().positive(),chunkIds:z.array(z.string().uuid()).min(1)}))});
