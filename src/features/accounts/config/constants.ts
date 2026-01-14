export const ACCOUNT_TYPE = {
	CASH: 1,
	DEBIT: 2,
	CREDIT: 3,
} as const;

export type AccountType = (typeof ACCOUNT_TYPE)[keyof typeof ACCOUNT_TYPE];

export const ACCOUNT_TYPE_LABLES: Record<AccountType, string> = {
	[ACCOUNT_TYPE.CASH]: "Cash",
	[ACCOUNT_TYPE.DEBIT]: "Debit",
	[ACCOUNT_TYPE.CREDIT]: "Credit",
};
