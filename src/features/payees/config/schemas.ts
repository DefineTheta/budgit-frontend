import z from "zod";

export const PayeeSchema = z.object({
	id: z.uuid(),
	name: z.string(),
});

export type Payee = z.infer<typeof PayeeSchema>;
