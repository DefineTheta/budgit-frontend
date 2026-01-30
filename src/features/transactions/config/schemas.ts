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

export type Transaction = z.infer<typeof TransactionSchema>;
