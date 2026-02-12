import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { CategorySelect } from "@/features/categories/components/category-select";
import { PayeeSelect } from "@/features/payees/components/payee-select";
import { cn } from "@/lib/utils";
import type { EditableDraft, EditableField } from "./add-transactions-from-file-types";

type StepThreeTableProps = {
	drafts: EditableDraft[];
	payeeMap: Map<string, string>;
	categoryMap: Map<string, string>;
	editingCell: { id: string; field: EditableField } | null;
	selectedIds: string[];
	onToggleRow: (id: string, checked: boolean) => void;
	onToggleAll: (checked: boolean) => void;
	bulkPayeeId: string;
	bulkCategoryId: string;
	onBulkPayeeChange: (value: string) => void;
	onBulkCategoryChange: (value: string) => void;
	canAddTransactions: boolean;
	addTooltipMessage: string;
	addError: string | null;
	onAddTransactions: () => void;
	isAddingTransactions: boolean;
	onEditCell: (cell: { id: string; field: EditableField } | null) => void;
	onUpdateDraft: (id: string, updates: Partial<EditableDraft>) => void;
	formatCurrency: (amount: number) => string;
	onBack: () => void;
};

export const AddTransactionsFromFileStepThree = ({
	drafts,
	payeeMap,
	categoryMap,
	editingCell,
	selectedIds,
	onToggleRow,
	onToggleAll,
	bulkPayeeId,
	bulkCategoryId,
	onBulkPayeeChange,
	onBulkCategoryChange,
	canAddTransactions,
	addTooltipMessage,
	addError,
	onAddTransactions,
	isAddingTransactions,
	onEditCell,
	onUpdateDraft,
	formatCurrency,
	onBack,
}: StepThreeTableProps) => {
	const attentionCount = drafts.filter(
		(draft) => !draft.payeeId || !draft.categoryId,
	).length;
	const goodCount = drafts.filter((draft) => draft.payeeId && draft.categoryId).length;
	const totalAmount = drafts.reduce((sum, draft) => sum + draft.amount, 0);
	const selectedDrafts = drafts.filter((draft) => selectedIds.includes(draft.id));
	const selectedTotal = selectedDrafts.reduce((sum, draft) => sum + draft.amount, 0);
	const allSelected = drafts.length > 0 && selectedIds.length === drafts.length;
	const someSelected = selectedIds.length > 0 && !allSelected;

	return (
		<>
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="flex flex-wrap items-center gap-2">
					<span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">
						<AlertTriangle className="h-3.5 w-3.5" />
						{attentionCount} needs attention
					</span>
					<span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-900">
						<Check className="h-3.5 w-3.5" />
						{goodCount} ready
					</span>
				</div>
				<p className="text-sm font-semibold text-foreground">
					Total outflow: <span className="font-bold">{formatCurrency(totalAmount)}</span>
				</p>
			</div>

			<div className="space-y-2">
				{drafts.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						No transactions found in the analysis.
					</p>
				) : (
					<div className="max-h-[420px] overflow-y-auto rounded-xl border bg-background">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead className="w-8">
										<Checkbox
											checked={
												allSelected ? true : someSelected ? "indeterminate" : false
											}
											onCheckedChange={(checked) => onToggleAll(checked === true)}
											aria-label="Select all transactions"
										/>
									</TableHead>
									<TableHead className="w-[140px]">Date</TableHead>
									<TableHead className="min-w-[220px]">Payee</TableHead>
									<TableHead className="min-w-[220px]">Category</TableHead>
									<TableHead className="w-[220px] text-right">Outflow</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{drafts.map((draft) => {
									const isMissingSelection = !draft.payeeId || !draft.categoryId;
									const isComplete = !!draft.payeeId && !!draft.categoryId;
									const payeeLabel = draft.payeeId ? payeeMap.get(draft.payeeId) : "";
									const categoryLabel = draft.categoryId
										? categoryMap.get(draft.categoryId)
										: "";

									return (
										<TableRow
											key={draft.id}
											className={cn(
												"border-b py-2",
												isMissingSelection && "bg-amber-50/60",
												isComplete && "bg-emerald-50/70",
											)}
										>
											<TableCell className="w-8">
												<div className="flex items-center gap-2">
													<Checkbox
														checked={selectedIds.includes(draft.id)}
														onCheckedChange={(checked) =>
															onToggleRow(draft.id, checked === true)
														}
														aria-label={`Select ${draft.payeeName || "transaction"}`}
													/>
													{isMissingSelection ? (
														<AlertTriangle className="h-4 w-4 text-amber-500" />
													) : isComplete ? (
														<Check className="h-4 w-4 text-emerald-700" />
													) : null}
												</div>
											</TableCell>
											<TableCell className="w-[140px]">
												{editingCell?.id === draft.id && editingCell.field === "date" ? (
													<Input
														autoFocus
														type="date"
														value={draft.date}
														onChange={(event) =>
															onUpdateDraft(draft.id, { date: event.target.value })
														}
														onBlur={() => onEditCell(null)}
														className="h-9"
													/>
												) : (
													<button
														type="button"
														className="h-9 w-full rounded-md border border-transparent px-2 text-left text-sm hover:border-border hover:bg-muted/40"
														onClick={() => onEditCell({ id: draft.id, field: "date" })}
													>
														{draft.date || "Select date"}
													</button>
												)}
											</TableCell>
											<TableCell className="min-w-[220px]">
												{editingCell?.id === draft.id && editingCell.field === "payee" ? (
													<PayeeSelect
														value={draft.payeeId}
														onChange={(value) => {
															onUpdateDraft(draft.id, { payeeId: value });
															onEditCell(null);
														}}
														placeholder={draft.payeeName || "Payee"}
														className="h-9"
													/>
												) : (
													<button
														type="button"
														className="h-9 w-full rounded-md border border-transparent px-2 text-left text-sm hover:border-border hover:bg-muted/40"
														onClick={() => onEditCell({ id: draft.id, field: "payee" })}
													>
														{payeeLabel || draft.payeeName || "Select payee"}
													</button>
												)}
											</TableCell>
											<TableCell className="min-w-[220px]">
												{editingCell?.id === draft.id &&
												editingCell.field === "category" ? (
													<CategorySelect
														value={draft.categoryId}
														onChange={(value) => {
															onUpdateDraft(draft.id, { categoryId: value });
															onEditCell(null);
														}}
														placeholder={draft.categoryName || "Category"}
														className="h-9"
													/>
												) : (
													<button
														type="button"
														className="h-9 w-full rounded-md border border-transparent px-2 text-left text-sm hover:border-border hover:bg-muted/40"
														onClick={() =>
															onEditCell({ id: draft.id, field: "category" })
														}
													>
														{categoryLabel || draft.categoryName || "Select category"}
													</button>
												)}
											</TableCell>
											<TableCell className="w-[220px]">
												{editingCell?.id === draft.id &&
												editingCell.field === "amount" ? (
													<Input
														autoFocus
														type="number"
														min="0"
														step="0.01"
														value={draft.amount}
														onChange={(event) =>
															onUpdateDraft(draft.id, {
																amount: Number(event.target.value),
															})
														}
														onBlur={() => onEditCell(null)}
														className="h-9 text-right"
														placeholder="0.00"
													/>
												) : (
													<button
														type="button"
														className="h-9 w-full rounded-md border border-transparent px-2 text-right text-sm hover:border-border hover:bg-muted/40"
														onClick={() => onEditCell({ id: draft.id, field: "amount" })}
													>
														{formatCurrency(draft.amount)}
													</button>
												)}
											</TableCell>
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</div>

			{selectedIds.length > 0 && (
				<div className="mt-3 rounded-xl border bg-muted/40 p-3">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="text-sm font-medium">
							Selected: {selectedIds.length} transactions
							<span className="ml-2 text-muted-foreground">
								({formatCurrency(selectedTotal)} total)
							</span>
						</div>
						<div className="flex flex-wrap items-center gap-2">
							<PayeeSelect
								value={bulkPayeeId}
								onChange={onBulkPayeeChange}
								placeholder="Set payee"
								className="h-9 min-w-[180px]"
							/>
							<CategorySelect
								value={bulkCategoryId}
								onChange={onBulkCategoryChange}
								placeholder="Set category"
								className="h-9 min-w-[180px]"
							/>
						</div>
					</div>
				</div>
			)}

			{addError && <p className="mt-3 text-sm text-destructive">{addError}</p>}

			<DialogFooter>
				<Button type="button" variant="secondary" onClick={onBack}>
					Back
				</Button>
				<TooltipProvider>
					<Tooltip>
						<TooltipTrigger asChild>
							<span className="inline-flex">
								<Button
									type="button"
									onClick={onAddTransactions}
									disabled={!canAddTransactions || isAddingTransactions}
								>
									{isAddingTransactions ? "Adding..." : "Add transactions"}
								</Button>
							</span>
						</TooltipTrigger>
						{!canAddTransactions && <TooltipContent>{addTooltipMessage}</TooltipContent>}
					</Tooltip>
				</TooltipProvider>
			</DialogFooter>
		</>
	);
};
