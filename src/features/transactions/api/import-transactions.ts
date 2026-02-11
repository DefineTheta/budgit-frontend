import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api-client";
import type { MutationConfig } from "@/lib/react-query";
import type { ImportTransactionInput, TransactionDraft } from "../config/schemas";

export const importTransactions = ({
	data,
}: {
	data: ImportTransactionInput;
}): Promise<TransactionDraft[]> => {
	return api.post("/transactions/import/parse", data);
};

type UseImportTransactionsOptions = {
	mutationConfig?: MutationConfig<typeof importTransactions>;
};

export const useImportTransactions = ({
	mutationConfig,
}: UseImportTransactionsOptions = {}) => {
	return useMutation({
		...mutationConfig,
		mutationFn: importTransactions,
	});
};
