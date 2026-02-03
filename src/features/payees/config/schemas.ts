import z from "zod";

export const PayeeSchema = z.object({
	id: z.uuid(),
	name: z.string(),
});

export const createPayeeSchema = z.object({
	name: z.string(),
});

export type Payee = z.infer<typeof PayeeSchema>;

export type CreatePayeeInput = z.infer<typeof createPayeeSchema>;
