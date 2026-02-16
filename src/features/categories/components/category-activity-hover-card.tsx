import { format } from "date-fns";
import { useState } from "react";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useCategoryTransactions } from "@/features/transactions/api/get-category-transactions";

type CategoryActivityHoverCardProps = {
	categoryId: string;
	categoryName: string;
	activityAmount: number;
};

const currencyFormatter = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

const getSignedAmount = (inflow: number, outflow: number) => {
	if (inflow !== 0) {
		return inflow / 100;
	}

	if (outflow !== 0) {
		return -Math.abs(outflow) / 100;
	}

	return 0;
};

export const CategoryActivityHoverCard = ({
	categoryId,
	categoryName,
	activityAmount,
}: CategoryActivityHoverCardProps) => {
	const [open, setOpen] = useState(false);

	const categoryTransactionsQuery = useCategoryTransactions({
		categoryId,
		queryConfig: {
			enabled: open,
		},
	});

	const formattedActivityAmount = currencyFormatter.format(activityAmount);
	const transactionCount = categoryTransactionsQuery.data?.length ?? 0;

	return (
		<HoverCard open={open} onOpenChange={setOpen}>
			<HoverCardTrigger asChild>
				<button
					type="button"
					className="w-full cursor-help text-right underline underline-offset-4"
				>
					{formattedActivityAmount}
				</button>
			</HoverCardTrigger>
			<HoverCardContent className="w-[420px] p-0" align="end">
				<div className="px-4 pt-3 pb-2">
					<p className="text-base font-semibold">{categoryName} transactions</p>
					<p className="mt-1 text-sm text-muted-foreground">
						{categoryTransactionsQuery.isLoading
							? "Loading transactions..."
							: `${transactionCount} ${transactionCount === 1 ? "transaction" : "transactions"}`}
					</p>
				</div>
				{categoryTransactionsQuery.isLoading ? (
					<div className="px-4 pb-4 text-sm text-muted-foreground">Loading...</div>
				) : categoryTransactionsQuery.isError ? (
					<div className="px-4 pb-4 text-sm text-destructive">
						Could not load transactions.
					</div>
				) : (
					<div className="max-h-72 overflow-auto px-2 pb-2">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Account</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Payee</TableHead>
									<TableHead className="text-right">Amount</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{categoryTransactionsQuery.data?.length ? (
									categoryTransactionsQuery.data.map((transaction) => {
										const amount = getSignedAmount(
											transaction.inflow,
											transaction.outflow,
										);

										return (
											<TableRow key={transaction.id}>
												<TableCell>{transaction.account}</TableCell>
												<TableCell>{format(transaction.date, "dd/MM/yyyy")}</TableCell>
												<TableCell>{transaction.payee}</TableCell>
												<TableCell className="text-right">
													{currencyFormatter.format(amount)}
												</TableCell>
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell colSpan={4} className="text-center text-muted-foreground">
											No transactions.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					</div>
				)}
			</HoverCardContent>
		</HoverCard>
	);
};
