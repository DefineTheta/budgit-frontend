import z from "zod";

export const TransactionSchema = z.object({
	id: z.string(),
	account_id: z.string(),
	category_id: z.string(),
	payee_id: z.string(),
	transaction_group_id: z.string().nullable(),
	category: z.string(),
	payee: z.string(),
	date: z.coerce.date(),
	memo: z.string().nullable(),
	inflow: z.int(),
	outflow: z.int(),
});

export const TransactionDraftSchema = z.object({
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
	merchant: z.string(),
	amount: z.number(),
	category: z.string(),
	confidence: z.enum(["high", "medium", "low"]),
});

export const CreateTransactionSchema = z.object({
	account_id: z.string(),
	category_id: z.string(),
	payee_id: z.string(),
	transaction_group_id: z.string().optional(),
	date: z.coerce.date(),
	memo: z.string().nullable(),
	inflow: z.int(),
	outflow: z.int(),
});

export const ImportTransactionSchema = z.object({
	reference_date: z.coerce.date(),
	text: z.string(),
});

export type Transaction = z.infer<typeof TransactionSchema>;
export type TransactionDraft = z.infer<typeof TransactionDraftSchema>;

export type CreateTransactionInput = z.infer<typeof CreateTransactionSchema>;
export type ImportTransactionInput = z.infer<typeof ImportTransactionSchema>;
