import z from "zod";
import { ACCOUNT_TYPE } from "./constants";

export const AccountSchema = z.object({
	id: z.uuid(),
	name: z.string(),
	account_type: z.union([
		z.literal(ACCOUNT_TYPE.CASH),
		z.literal(ACCOUNT_TYPE.DEBIT),
		z.literal(ACCOUNT_TYPE.CREDIT),
	]),
});

export const CreateAccountSchema = z.object({
	name: z.string(),
	account_type: z.union([
		z.literal(ACCOUNT_TYPE.CASH),
		z.literal(ACCOUNT_TYPE.DEBIT),
		z.literal(ACCOUNT_TYPE.CREDIT),
	]),
});
export const UpdateAccountSchema = CreateAccountSchema.partial();

export type Account = z.infer<typeof AccountSchema>;

export type CreateAccountInput = z.infer<typeof CreateAccountSchema>;
export type UpdateAccountInput = z.infer<typeof UpdateAccountSchema>;
