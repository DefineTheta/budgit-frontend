import { useForm } from "@tanstack/react-form";
import { GitBranch, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { CategorySelect } from "@/features/categories/components/category-select";
import { PayeeSelect } from "@/features/payees/components/payee-select";
import { useCreateTransaction } from "@/features/transactions/api/create-transaction";

type SplitFormValue = {
	category_id: string;
	memo: string;
	outflow: string;
	inflow: string;
};

type AdvancedTransactionSheetProps = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	accountId: string;
	initialValues: {
		date: Date;
		payee_id: string;
		category_id: string;
		memo: string;
		outflow: string;
		inflow: string;
	};
	onCreated?: () => void;
};

const toCents = (value: string) => {
	const parsed = Number.parseFloat(value);
	if (Number.isNaN(parsed)) return 0;
	return Math.round(parsed * 100);
};

const toDateString = (date: Date) => {
	return [
		date.getFullYear(),
		String(date.getMonth() + 1).padStart(2, "0"),
		String(date.getDate()).padStart(2, "0"),
	].join("-");
};

const getSignedAmount = (inflow: string, outflow: string) => {
	const inflowCents = toCents(inflow);
	const outflowCents = toCents(outflow);

	if (inflowCents > 0 && outflowCents > 0) {
		return { amount: 0, hasDirectionError: true };
	}

	if (inflowCents > 0) {
		return { amount: inflowCents, hasDirectionError: false };
	}

	if (outflowCents > 0) {
		return { amount: -outflowCents, hasDirectionError: false };
	}

	return { amount: 0, hasDirectionError: false };
};

const centsToInput = (amount: number) => {
	if (amount === 0) return "";
	return String(Math.abs(amount) / 100);
};

const getDerivedState = (values: {
	payee_id: string;
	category_id: string;
	inflow: string;
	outflow: string;
	splits: SplitFormValue[];
}) => {
	const transactionResult = getSignedAmount(values.inflow, values.outflow);
	const splitResults = values.splits.map((split) => getSignedAmount(split.inflow, split.outflow));
	const splitTotal = splitResults.reduce((sum, split) => sum + split.amount, 0);
	const hasSplitDirectionError = splitResults.some((result) => result.hasDirectionError);
	const areSplitsBalanced = values.splits.length === 0 || splitTotal === transactionResult.amount;

	const hasCategory =
		values.splits.length > 0
			? values.splits.every((split) => split.category_id)
			: Boolean(values.category_id);

	const canSubmit =
		Boolean(values.payee_id) &&
		hasCategory &&
		!transactionResult.hasDirectionError &&
		!hasSplitDirectionError &&
		areSplitsBalanced;

	return {
		transactionAmount: transactionResult.amount,
		splitTotal,
		hasDirectionError: transactionResult.hasDirectionError,
		hasSplitDirectionError,
		areSplitsBalanced,
		canSubmit,
	};
};

export function AdvancedTransactionSheet({
	open,
	onOpenChange,
	accountId,
	initialValues,
	onCreated,
}: AdvancedTransactionSheetProps) {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const { mutateAsync: createTransaction, isPending } = useCreateTransaction();

	const form = useForm({
		defaultValues: {
			date: initialValues.date,
			payee_id: initialValues.payee_id,
			category_id: initialValues.category_id,
			memo: initialValues.memo,
			outflow: initialValues.outflow,
			inflow: initialValues.inflow,
			splits: [] as SplitFormValue[],
		},
		onSubmit: async ({ value }) => {
			const transactionResult = getSignedAmount(value.inflow, value.outflow);

			if (transactionResult.hasDirectionError) {
				setSubmitError("Transaction cannot have both inflow and outflow.");
				return;
			}

			const hasSplitDirectionError = value.splits.some((split) => {
				const splitResult = getSignedAmount(split.inflow, split.outflow);
				return splitResult.hasDirectionError;
			});

			if (hasSplitDirectionError) {
				setSubmitError("Each split can only have inflow or outflow, not both.");
				return;
			}

			const splitAmounts = value.splits.map((split) => getSignedAmount(split.inflow, split.outflow));
			const splitTotal = splitAmounts.reduce((sum, split) => sum + split.amount, 0);

			if (value.splits.length > 0 && splitTotal !== transactionResult.amount) {
				setSubmitError("Split amounts must add up to the transaction total.");
				return;
			}

			setSubmitError(null);

			await createTransaction({
				data: {
					date: toDateString(value.date),
					account_id: accountId,
					payee_id: value.payee_id,
					memo: value.memo.trim() ? value.memo : null,
					amount: transactionResult.amount,
					cleared: false,
					splits:
						value.splits.length > 0
							? value.splits.map((split, index) => ({
									category_id: split.category_id,
									amount: splitAmounts[index]?.amount ?? 0,
									memo: split.memo.trim() ? split.memo : "",
								}))
							: [
								{
									category_id: value.category_id,
									amount: transactionResult.amount,
									memo: "",
								},
							],
				},
			});

			onOpenChange(false);
			onCreated?.();
		},
	});

	const handleAddSplit = (values: {
		category_id: string;
		inflow: string;
		outflow: string;
		splits: SplitFormValue[];
	}) => {
		const state = getDerivedState({
			payee_id: "",
			category_id: values.category_id,
			inflow: values.inflow,
			outflow: values.outflow,
			splits: values.splits,
		});
		const nextSplits = [...values.splits];

		if (nextSplits.length === 0) {
			nextSplits.push({
				category_id: values.category_id,
				memo: "",
				inflow: state.transactionAmount > 0 ? centsToInput(state.transactionAmount) : "",
				outflow: state.transactionAmount < 0 ? centsToInput(state.transactionAmount) : "",
			});
		} else {
			nextSplits.push({
				category_id: "",
				memo: "",
				inflow: "",
				outflow: "",
			});
		}

		form.setFieldValue("splits", nextSplits);
	};

	const handleUpdateSplit = (
		values: { splits: SplitFormValue[] },
		index: number,
		value: Partial<SplitFormValue>,
	) => {
		form.setFieldValue(
			"splits",
			values.splits.map((split, splitIndex) =>
				splitIndex === index ? { ...split, ...value } : split,
			),
		);
	};

	const handleRemoveSplit = (values: { splits: SplitFormValue[] }, index: number) => {
		form.setFieldValue(
			"splits",
			values.splits.filter((_, splitIndex) => splitIndex !== index),
		);
	};

	return (
		<Sheet open={open} onOpenChange={onOpenChange}>
			<SheetContent className="w-full overflow-y-auto sm:max-w-xl">
				<SheetHeader>
					<SheetTitle>Advanced transaction</SheetTitle>
					<SheetDescription>
						Create a transaction with optional split details.
					</SheetDescription>
				</SheetHeader>

				<form
					className="mt-6 space-y-4"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field name="date">
						{(field) => (
							<div className="space-y-2">
								<p className="text-sm font-medium">Date</p>
								<DatePickerInput
									date={field.state.value}
									onDateChange={(date) => field.handleChange(date ?? new Date())}
								/>
							</div>
						)}
					</form.Field>

					<form.Field name="payee_id">
						{(field) => (
							<div className="space-y-2">
								<p className="text-sm font-medium">Payee</p>
								<PayeeSelect value={field.state.value} onChange={field.handleChange} />
							</div>
						)}
					</form.Field>

					<form.Subscribe selector={(store) => store.values.splits.length > 0}>
						{(hasSplits) =>
							hasSplits ? null : (
								<form.Field name="category_id">
									{(field) => (
										<div className="space-y-2">
											<p className="text-sm font-medium">Category</p>
											<CategorySelect value={field.state.value} onChange={field.handleChange} />
											<Button
												type="button"
												variant="outline"
												className="mt-1"
												onClick={() => handleAddSplit(form.state.values)}
											>
												<GitBranch className="mr-2 h-4 w-4" />
												Split
											</Button>
										</div>
									)}
								</form.Field>
							)
						}
					</form.Subscribe>

					<form.Field name="memo">
						{(field) => (
							<div className="space-y-2">
								<p className="text-sm font-medium">Memo</p>
								<Input
									value={field.state.value}
									onChange={(event) => field.handleChange(event.target.value)}
									placeholder="Memo"
								/>
							</div>
						)}
					</form.Field>

					<div className="grid grid-cols-2 gap-3">
						<form.Field name="outflow">
							{(field) => (
								<div className="space-y-2">
									<p className="text-sm font-medium">Outflow</p>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={field.state.value}
										onChange={(event) => field.handleChange(event.target.value)}
										placeholder="0.00"
									/>
								</div>
							)}
						</form.Field>
						<form.Field name="inflow">
							{(field) => (
								<div className="space-y-2">
									<p className="text-sm font-medium">Inflow</p>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={field.state.value}
										onChange={(event) => field.handleChange(event.target.value)}
										placeholder="0.00"
									/>
								</div>
							)}
						</form.Field>
					</div>

					<form.Subscribe selector={(store) => store.values}>
						{(values) => {
							const state = getDerivedState(values);

							return (
								<>
									{values.splits.length > 0 ? (
										<div className="space-y-4">
											<div className="flex items-center justify-between">
												<p className="text-sm font-semibold">Splits</p>
												<Button
													type="button"
													variant="outline"
													size="sm"
													onClick={() => handleAddSplit(values)}
												>
													<Plus className="mr-1 h-4 w-4" />
													Add split
												</Button>
											</div>
											{values.splits.map((split, index) => (
												<div
													key={`${index}-${split.category_id}`}
													className="space-y-3 rounded-md border border-dashed p-4"
												>
													<div className="flex items-center justify-between">
														<p className="text-xs font-medium text-muted-foreground">Split {index + 1}</p>
														<Button
															type="button"
															variant="ghost"
															size="icon"
															onClick={() => handleRemoveSplit(values, index)}
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</div>
													<CategorySelect
														value={split.category_id}
														onChange={(category_id) =>
															handleUpdateSplit(values, index, { category_id })
														}
													/>
													<Input
														value={split.memo}
														onChange={(event) =>
															handleUpdateSplit(values, index, { memo: event.target.value })
														}
														placeholder="Split memo"
													/>
													<div className="grid grid-cols-2 gap-3">
														<Input
															type="number"
															min="0"
															step="0.01"
															value={split.outflow}
															onChange={(event) =>
																handleUpdateSplit(values, index, { outflow: event.target.value })
															}
															placeholder="Outflow"
														/>
														<Input
															type="number"
															min="0"
															step="0.01"
															value={split.inflow}
															onChange={(event) =>
																handleUpdateSplit(values, index, { inflow: event.target.value })
															}
															placeholder="Inflow"
														/>
													</div>
												</div>
											))}
											<p className="text-xs text-muted-foreground">
												Left to split: {(
													Math.abs(state.transactionAmount - state.splitTotal) / 100
												).toFixed(2)}
											</p>
										</div>
									) : null}

									{state.hasDirectionError ? (
										<p className="text-sm text-destructive">
											Transaction cannot have both inflow and outflow.
										</p>
									) : null}

									{values.splits.length > 0 && !state.areSplitsBalanced ? (
										<p className="text-sm text-destructive">
											Split amounts must add up to the transaction total.
										</p>
									) : null}

									{state.hasSplitDirectionError ? (
										<p className="text-sm text-destructive">
											Each split can only have inflow or outflow, not both.
										</p>
									) : null}

									{submitError ? (
										<p className="text-sm text-destructive">{submitError}</p>
									) : null}

									<SheetFooter className="pt-2">
										<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
											Cancel
										</Button>
										<Button type="submit" disabled={!state.canSubmit || isPending}>
											{isPending ? "Adding..." : "Add transaction"}
										</Button>
									</SheetFooter>
								</>
							);
						}}
					</form.Subscribe>
				</form>
			</SheetContent>
		</Sheet>
	);
}
