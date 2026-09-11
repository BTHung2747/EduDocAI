import { z } from 'zod';

export const userRoleSchema = z.enum(['USER', 'ADMIN']);
export type UserRole = z.infer<typeof userRoleSchema>;

export const userStatusSchema = z.enum(['ACTIVE', 'LOCKED']);
export type UserStatus = z.infer<typeof userStatusSchema>;

const normalizedEmailSchema = z.string().trim().toLowerCase().pipe(z.email());

export const registerSchema = z
  .object({
    email: normalizedEmailSchema,
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    displayName: z.string().trim().min(1).max(100),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });
export type RegisterInput = z.input<typeof registerSchema>;

export const loginSchema = z.object({
  email: normalizedEmailSchema,
  password: z.string().min(1),
});
export type LoginInput = z.input<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: normalizedEmailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
  confirmPassword: z.string().min(8),
}).refine((value) => value.password === value.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp.',
  path: ['confirmPassword'],
});

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    fieldErrors: z.record(z.string(), z.array(z.string())).optional(),
  }),
});

export type ApiSuccess<T> = { data: T; meta?: Record<string, unknown> };
export type ApiError = z.infer<typeof apiErrorSchema>;

export interface AuthenticatedUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
}

export const subjectInputSchema = z.object({
  name: z.string().trim().min(1).max(100),
  description: z.string().trim().max(500).optional().nullable(),
});
export type SubjectInput = z.infer<typeof subjectInputSchema>;
export const defaultSubjectsResultSchema = z.object({ created: z.number().int().nonnegative(), skipped: z.number().int().nonnegative() });
export type DefaultSubjectsResult = z.infer<typeof defaultSubjectsResultSchema>;

export const documentStatusSchema = z.enum(['PROCESSING', 'READY', 'FAILED']);
export type DocumentStatus = z.infer<typeof documentStatusSchema>;

export const subjectAssignmentSourceSchema = z.enum(['MANUAL', 'AI']);
export type SubjectAssignmentSource = z.infer<typeof subjectAssignmentSourceSchema>;

export const updateDocumentSchema = z.object({
  displayName: z.string().trim().min(1).max(255).optional(),
  subjectId: z.string().uuid().nullable().optional(),
});
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;

export const semanticSearchRequestSchema = z.object({ query: z.string().trim().min(1).max(1000), subjectId: z.string().uuid().optional(), documentIds: z.array(z.string().uuid()).max(50).optional(), limit: z.number().int().min(1).max(30).optional() });
export type SemanticSearchRequest = z.infer<typeof semanticSearchRequestSchema>;
export const semanticSearchResultSchema = z.object({ documentId:z.string().uuid(), documentName:z.string(), subjectId:z.string().uuid().nullable(), chunkId:z.string().uuid(), sectionId:z.string().uuid().nullable(), sectionTitle:z.string().nullable(), pageStart:z.number().int().nullable(), pageEnd:z.number().int().nullable(), excerpt:z.string(), relevanceScore:z.number().min(0).max(1) });
export type SemanticSearchResult = z.infer<typeof semanticSearchResultSchema>;
export const semanticSearchResponseSchema = z.object({ data:z.array(semanticSearchResultSchema) });
export type SemanticSearchResponse = z.infer<typeof semanticSearchResponseSchema>;

export const aiJobTypeSchema=z.literal('DOCUMENT_ANALYSIS'); export type AiJobType=z.infer<typeof aiJobTypeSchema>;
export const aiJobStatusSchema=z.enum(['QUEUED','RUNNING','SUCCEEDED','FAILED']); export type AiJobStatus=z.infer<typeof aiJobStatusSchema>;
export const createAiJobRequestSchema=z.object({type:aiJobTypeSchema,documentId:z.string().uuid(),retry:z.boolean().default(false)}); export type CreateAiJobRequest=z.infer<typeof createAiJobRequestSchema>;
export const aiJobResponseSchema=z.object({id:z.string().uuid(),documentId:z.string().uuid().nullable(),type:aiJobTypeSchema,status:aiJobStatusSchema,errorCode:z.string().nullable().optional(),errorMessage:z.string().nullable().optional(),createdAt:z.string().or(z.date()),startedAt:z.string().or(z.date()).nullable(),finishedAt:z.string().or(z.date()).nullable()}); export type AiJobResponse=z.infer<typeof aiJobResponseSchema>;
export const analysisViewStatusSchema=z.enum(['NOT_GENERATED','QUEUED','RUNNING','SUCCEEDED','FAILED']); export type AnalysisViewStatus=z.infer<typeof analysisViewStatusSchema>;
export const aiJobListQuerySchema=z.object({page:z.coerce.number().int().min(1).default(1),limit:z.coerce.number().int().min(1).max(100).default(20),status:aiJobStatusSchema.optional(),type:aiJobTypeSchema.optional(),documentId:z.string().uuid().optional()}); export type AiJobListQuery=z.infer<typeof aiJobListQuerySchema>;
export const analysisViewSchema=z.discriminatedUnion('status',[z.object({status:z.literal('NOT_GENERATED')}),z.object({status:z.literal('QUEUED'),jobId:z.string().uuid().optional()}),z.object({status:z.literal('RUNNING'),jobId:z.string().uuid().optional()}),z.object({status:z.literal('FAILED'),errorCode:z.string().nullable().optional(),errorMessage:z.string().nullable().optional(),retryAllowed:z.literal(true)}),z.object({status:z.literal('SUCCEEDED'),documentId:z.string().uuid(),documentName:z.string(),provider:z.string().nullable(),model:z.string().nullable(),promptVersion:z.string(),completedAt:z.date().nullable()})]); export type AnalysisView=z.infer<typeof analysisViewSchema>;
export const documentAskRequestSchema=z.object({question:z.string().trim().min(1).max(1000)}); export const citationSchema=z.object({chunkId:z.string().uuid(),documentName:z.string(),pageStart:z.number().int().nullable(),pageEnd:z.number().int().nullable(),section:z.string().nullable(),excerpt:z.string().min(1)}); export const groundedAnswerSchema=z.discriminatedUnion('grounded',[z.object({grounded:z.literal(true),answer:z.string().min(1),citations:z.array(citationSchema).min(1)}),z.object({grounded:z.literal(false),answer:z.null(),citations:z.array(citationSchema).length(0),refusalReason:z.literal('NOT_FOUND_IN_SELECTED_DOCUMENTS')})]); export type GroundedAnswer=z.infer<typeof groundedAnswerSchema>;

export const questionDifficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);
export type QuestionDifficulty = z.infer<typeof questionDifficultySchema>;

export const questionOptionKeySchema = z.enum(['A', 'B', 'C', 'D']);
export type QuestionOptionKey = z.infer<typeof questionOptionKeySchema>;

export const questionGenerationRequestSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(10).refine((ids) => new Set(ids).size === ids.length, 'Document IDs must be unique.'),
  count: z.number().int().min(1).max(20),
  difficulty: questionDifficultySchema,
  topic: z.string().trim().min(1).max(200).optional(),
  subjectId: z.string().uuid().nullable().optional(),
});
export type QuestionGenerationRequest = z.infer<typeof questionGenerationRequestSchema>;

export const questionGenerationCitationSchema = z.object({
  chunkId: z.string().uuid(),
  pageStart: z.number().int().positive().nullable(),
  pageEnd: z.number().int().positive().nullable(),
  quote: z.string().trim().min(1).max(1000),
}).strict();

export const generatedQuestionSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  options: z.object({
    A: z.string().trim().min(1).max(1000),
    B: z.string().trim().min(1).max(1000),
    C: z.string().trim().min(1).max(1000),
    D: z.string().trim().min(1).max(1000),
  }).strict().superRefine((options, context) => {
    const normalized = Object.values(options).map((value) => value.normalize('NFKC').trim().toLocaleLowerCase());
    if (new Set(normalized).size !== 4) context.addIssue({ code: 'custom', message: 'Options must be distinct.' });
  }),
  correctOption: questionOptionKeySchema,
  explanation: z.string().trim().min(1).max(2000),
  difficulty: questionDifficultySchema,
  citations: z.array(questionGenerationCitationSchema).min(1).max(8),
}).strict();
export type GeneratedQuestion = z.infer<typeof generatedQuestionSchema>;

export const questionGenerationOutputSchema = z.object({
  questions: z.array(generatedQuestionSchema).min(1).max(20),
}).strict();
export type QuestionGenerationOutput = z.infer<typeof questionGenerationOutputSchema>;

export const questionGenerationJobResponseSchema = z.object({
  id: z.string().uuid(),
  type: z.literal('QUESTION_GENERATION'),
  status: z.enum(['QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED']),
  createdAt: z.string().or(z.date()),
});
export type QuestionGenerationJobResponse = z.infer<typeof questionGenerationJobResponseSchema>;

export const questionSourceTypeSchema = z.enum(['AI', 'IMPORT', 'MANUAL']);
export const questionStatusSchema = z.enum(['DRAFT', 'APPROVED']);
export const questionOptionsSchema = z.object({
  A: z.string().trim().min(1).max(1000),
  B: z.string().trim().min(1).max(1000),
  C: z.string().trim().min(1).max(1000),
  D: z.string().trim().min(1).max(1000),
}).strict().superRefine((options, context) => {
  const values = Object.values(options).map((value) => value.normalize('NFKC').trim().toLocaleLowerCase());
  if (new Set(values).size !== 4) context.addIssue({ code: 'custom', message: 'Options must be distinct.' });
});
export type QuestionOptions = z.infer<typeof questionOptionsSchema>;

const questionContentSchema = z.object({
  text: z.string().trim().min(1).max(2000),
  options: questionOptionsSchema,
  correctOptionKey: questionOptionKeySchema,
  explanation: z.string().trim().min(1).max(2000),
  difficulty: questionDifficultySchema,
  subjectId: z.string().uuid().nullable().optional(),
});
export const createQuestionSchema = questionContentSchema;
export const updateQuestionSchema = questionContentSchema;
export type CreateQuestionInput = z.infer<typeof createQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof updateQuestionSchema>;

export const questionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().min(1).max(200).optional(),
  subjectId: z.string().uuid().optional(),
  difficulty: questionDifficultySchema.optional(),
  sourceType: questionSourceTypeSchema.optional(),
  status: questionStatusSchema.optional(),
});
export type QuestionListQuery = z.infer<typeof questionListQuerySchema>;

export const questionCitationResponseSchema = z.object({
  documentId: z.string().uuid(), chunkId: z.string().uuid(), pageStart: z.number().int().nullable(), pageEnd: z.number().int().nullable(), quote: z.string(),
});
export const questionResponseSchema = z.object({
  id: z.string().uuid(), subjectId: z.string().uuid().nullable(), sourceType: questionSourceTypeSchema, status: questionStatusSchema,
  text: z.string(), options: questionOptionsSchema, correctOptionKey: questionOptionKeySchema, explanation: z.string(), difficulty: questionDifficultySchema,
  citations: z.array(questionCitationResponseSchema), createdAt: z.date().or(z.string()), updatedAt: z.date().or(z.string()),
});
export type QuestionResponse = z.infer<typeof questionResponseSchema>;

export const questionImportErrorSchema = z.object({ field: z.string().min(1), message: z.string().min(1) });
export type QuestionImportError = z.infer<typeof questionImportErrorSchema>;
export const questionImportItemUpdateSchema = questionContentSchema;
export type QuestionImportItemUpdate = z.infer<typeof questionImportItemUpdateSchema>;
export const questionImportItemResponseSchema = z.object({
  id: z.string().uuid(), orderIndex: z.number().int().nonnegative(), text: z.string().nullable(), options: questionOptionsSchema.nullable(),
  correctOptionKey: questionOptionKeySchema.nullable(), explanation: z.string().nullable(), difficulty: questionDifficultySchema,
  isValid: z.boolean(), errors: z.array(questionImportErrorSchema),
});
export const questionImportPreviewResponseSchema = z.object({
  id: z.string().uuid(), fileName: z.string(), status: z.enum(['PREVIEW', 'COMMITTED']), totalCount: z.number().int().nonnegative(),
  validCount: z.number().int().nonnegative(), invalidCount: z.number().int().nonnegative(), items: z.array(questionImportItemResponseSchema),
});
export type QuestionImportPreviewResponse = z.infer<typeof questionImportPreviewResponseSchema>;

export const testStatusSchema = z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']);
export const testConfigSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).nullable().optional(),
  durationMinutes: z.number().int().positive().max(1440).nullable().optional(),
  shuffleQuestions: z.boolean().default(false),
  shuffleOptions: z.boolean().default(false),
  showAnswers: z.boolean().default(false),
});
export const createTestSchema = testConfigSchema.extend({ questionIds: z.array(z.string().uuid()).max(100).default([]).refine((ids) => new Set(ids).size === ids.length, 'Question IDs must be unique.') });
export const updateTestSchema = testConfigSchema;
export type CreateTestInput = z.infer<typeof createTestSchema>;
export type UpdateTestInput = z.infer<typeof updateTestSchema>;
export const testQuestionIdsSchema = z.object({ questionIds: z.array(z.string().uuid()).min(1).max(100).refine((ids) => new Set(ids).size === ids.length, 'Question IDs must be unique.') });
export const testQuestionReorderSchema = testQuestionIdsSchema;
export type TestQuestionIdsInput = z.infer<typeof testQuestionIdsSchema>;
export const testListQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: testStatusSchema.optional(), q: z.string().trim().min(1).max(200).optional() });
export type TestListQuery = z.infer<typeof testListQuerySchema>;
export const testQuestionResponseSchema = z.object({ id: z.string().uuid(), questionId: z.string().uuid(), orderIndex: z.number().int().nonnegative(), points: z.number().int().positive() });
export const testResponseSchema = z.object({ id: z.string().uuid(), title: z.string(), description: z.string().nullable(), durationMinutes: z.number().int().nullable(), shuffleQuestions: z.boolean(), shuffleOptions: z.boolean(), showAnswers: z.boolean(), status: testStatusSchema, publishedAt: z.date().or(z.string()).nullable(), totalPoints: z.number().int().nonnegative(), questions: z.array(testQuestionResponseSchema), createdAt: z.date().or(z.string()), updatedAt: z.date().or(z.string()) });
export type TestResponse = z.infer<typeof testResponseSchema>;

export const testQuestionSnapshotSchema = z.object({ text: z.string(), options: questionOptionsSchema, correctOptionKey: questionOptionKeySchema, explanation: z.string(), points: z.number().int().positive() });
export type TestQuestionSnapshot = z.infer<typeof testQuestionSnapshotSchema>;
export const attemptStatusSchema = z.enum(['IN_PROGRESS', 'SUBMITTED', 'GRADED']);
export const saveAttemptAnswerSchema = z.object({ selectedOptionKey: questionOptionKeySchema.nullable().optional(), markedForReview: z.boolean().optional() });
export type SaveAttemptAnswerInput = z.infer<typeof saveAttemptAnswerSchema>;
export const attemptListQuerySchema = z.object({ page: z.coerce.number().int().min(1).default(1), limit: z.coerce.number().int().min(1).max(100).default(20), status: attemptStatusSchema.optional() });
export type AttemptListQuery = z.infer<typeof attemptListQuerySchema>;
export const attemptQuestionSchema = z.object({ testQuestionId: z.string().uuid(), orderIndex: z.number().int().nonnegative(), points: z.number().int().positive(), text: z.string(), options: questionOptionsSchema, selectedOptionKey: questionOptionKeySchema.nullable(), markedForReview: z.boolean() });
export const attemptProgressResponseSchema = z.object({ id: z.string().uuid(), testId: z.string().uuid(), status: attemptStatusSchema, startedAt: z.date().or(z.string()), expiresAt: z.date().or(z.string()).nullable(), submittedAt: z.date().or(z.string()).nullable(), questions: z.array(attemptQuestionSchema) });
export const attemptResultQuestionSchema = attemptQuestionSchema.extend({ correctOptionKey: questionOptionKeySchema.optional(), explanation: z.string().optional(), isCorrect: z.boolean().nullable() });
export const attemptResultResponseSchema = z.object({ id: z.string().uuid(), testId: z.string().uuid(), status: attemptStatusSchema, score: z.number().int(), totalPoints: z.number().int(), totalQuestionCount: z.number().int(), correctCount: z.number().int(), incorrectCount: z.number().int(), unansweredCount: z.number().int(), startedAt: z.date().or(z.string()), submittedAt: z.date().or(z.string()), questions: z.array(attemptResultQuestionSchema) });
