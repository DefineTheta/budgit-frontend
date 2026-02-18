import z from "zod";

export const TransactionSchema = z.object({
	id: z.uuid(),
	account_id: z.uuid(),
	payee_id: z.uuid(),
	account: z.string(),
	payee: z.string(),
	date: z.coerce.date(),
	memo: z.string().nullable(),
	amount: z.number(),
	splits: z.array(
		z.object({
			id: z.uuid(),
			amount: z.number(),
			memo: z.string().nullable(),
			category_id: z.uuid(),
			category: z.string(),
			type: z.enum(["USER", "SYSTEM"]),
		}),
	),
});

export const TransactionDraftSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	merchant: z.string(),
	amount: z.number(),
	category: z.string(),
	confidence: z.enum(["high", "medium", "low"]),
});

export const CreateTransactionSchema = z.object({
	date: z.string(),
	memo: z.string().nullable().optional(),
	amount: z.number().default(0),
	cleared: z.boolean().default(false),
	payee_id: z.uuid(),
	account_id: z.uuid(),
	splits: z
		.array(
			z.object({
				category_id: z.uuid(),
				amount: z.number(),
				memo: z.string().nullable(),
			}),
		)
		.min(1),
	splitWith: z.array(z.string()),
});
export const UpdateTransactionSchema = CreateTransactionSchema.partial({
	date: true,
	cleared: true,
	payee_id: true,
	account_id: true,
});

export const ImportTransactionSchema = z.object({
	reference_date: z.coerce.date(),
	text: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionDraft = z.infer<typeof TransactionDraftSchema>;

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof UpdateTransactionSchema>;
export type ImportTransactionInput = z.infer<typeof ImportTransactionSchema>;
