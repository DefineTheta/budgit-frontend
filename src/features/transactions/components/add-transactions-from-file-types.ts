import type { TransactionDraft } from "@/features/transactions/config/schemas";

export type EditableDraft = {
	id: string;
	date: string;
	payeeId: string;
	payeeName: string;
	categoryId: string;
	categoryName: string;
	amount: number;
	confidence: TransactionDraft["confidence"];
};

export type EditableField = "date" | "payee" | "category" | "amount";
