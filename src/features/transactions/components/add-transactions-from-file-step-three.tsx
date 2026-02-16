import { AlertTriangle, Check } from "lucide-react";
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useCallback, useMemo, useState } from "react";
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
	const hasSelection = selectedIds.length > 0;
	const [payeeSearch, setPayeeSearch] = useState("");

	const filteredDrafts = useMemo(() => {
		const query = payeeSearch.trim().toLowerCase();
		if (!query) return drafts;

		return drafts.filter((draft) => {
			const payeeLabel = draft.payeeId ? payeeMap.get(draft.payeeId) : "";
			const searchablePayee = (payeeLabel || draft.payeeName || "").toLowerCase();
			return searchablePayee.includes(query);
		});
	}, [drafts, payeeMap, payeeSearch]);

	const handleToggleAllVisible = useCallback(() => {
		if (hasSelection) {
			onToggleAll(false);
			return;
		}

		filteredDrafts.forEach((draft) => {
			onToggleRow(draft.id, true);
		});
	}, [filteredDrafts, hasSelection, onToggleAll, onToggleRow]);

	const columns = useMemo<ColumnDef<EditableDraft>[]>(
		() => [
			{
				id: "select",
				header: () => (
					<Checkbox
						checked={hasSelection ? "indeterminate" : false}
						onCheckedChange={handleToggleAllVisible}
						aria-label="Select all transactions"
					/>
				),
				cell: ({ row }) => {
					const draft = row.original;
					const isMissingSelection = !draft.payeeId || !draft.categoryId;
					const isComplete = !!draft.payeeId && !!draft.categoryId;

					return (
						<div className="flex items-center gap-2">
							<Checkbox
								checked={selectedIds.includes(draft.id)}
								onCheckedChange={(checked) => onToggleRow(draft.id, checked === true)}
								aria-label={`Select ${draft.payeeName || "transaction"}`}
							/>
							{isMissingSelection ? (
								<AlertTriangle className="h-4 w-4 text-amber-500" />
							) : isComplete ? (
								<Check className="h-4 w-4 text-emerald-700" />
							) : null}
						</div>
					);
				},
				size: 40,
			},
			{
				accessorKey: "date",
				header: "Date",
				cell: ({ row }) => {
					const draft = row.original;

					if (editingCell?.id === draft.id && editingCell.field === "date") {
						return (
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
						);
					}

					return (
						<button
							type="button"
							className="h-9 w-full rounded-md border border-transparent px-2 text-left text-sm hover:border-border hover:bg-muted/40"
							onClick={() => onEditCell({ id: draft.id, field: "date" })}
						>
							{draft.date || "Select date"}
						</button>
					);
				},
				size: 140,
			},
			{
				accessorKey: "payeeId",
				header: "Payee",
				cell: ({ row }) => {
					const draft = row.original;
					const payeeLabel = draft.payeeId ? payeeMap.get(draft.payeeId) : "";

					if (editingCell?.id === draft.id && editingCell.field === "payee") {
						return (
							<PayeeSelect
								value={draft.payeeId}
								onChange={(value) => {
									onUpdateDraft(draft.id, { payeeId: value });
									onEditCell(null);
								}}
								placeholder={draft.payeeName || "Payee"}
								className="h-9"
							/>
						);
					}

					return (
						<button
							type="button"
							className="h-9 w-full rounded-md border border-transparent px-2 text-left text-sm hover:border-border hover:bg-muted/40"
							onClick={() => onEditCell({ id: draft.id, field: "payee" })}
						>
							{payeeLabel || draft.payeeName || "Select payee"}
						</button>
					);
				},
				size: 220,
			},
			{
				accessorKey: "categoryId",
				header: "Category",
				cell: ({ row }) => {
					const draft = row.original;
					const categoryLabel = draft.categoryId ? categoryMap.get(draft.categoryId) : "";

					if (editingCell?.id === draft.id && editingCell.field === "category") {
						return (
							<CategorySelect
								value={draft.categoryId}
								onChange={(value) => {
									onUpdateDraft(draft.id, { categoryId: value });
									onEditCell(null);
								}}
								placeholder={draft.categoryName || "Category"}
								className="h-9"
							/>
						);
					}

					return (
						<button
							type="button"
							className="h-9 w-full rounded-md border border-transparent px-2 text-left text-sm hover:border-border hover:bg-muted/40"
							onClick={() => onEditCell({ id: draft.id, field: "category" })}
						>
							{categoryLabel || draft.categoryName || "Select category"}
						</button>
					);
				},
				size: 220,
			},
			{
				accessorKey: "amount",
				header: () => <div className="text-right">Outflow</div>,
				cell: ({ row }) => {
					const draft = row.original;

					if (editingCell?.id === draft.id && editingCell.field === "amount") {
						return (
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
						);
					}

					return (
						<button
							type="button"
							className="h-9 w-full rounded-md border border-transparent px-2 text-right text-sm hover:border-border hover:bg-muted/40"
							onClick={() => onEditCell({ id: draft.id, field: "amount" })}
						>
							{formatCurrency(draft.amount)}
						</button>
					);
				},
				size: 220,
			},
		],
		[
			categoryMap,
			editingCell,
			formatCurrency,
			handleToggleAllVisible,
			hasSelection,
			onEditCell,
			onToggleRow,
			onUpdateDraft,
			payeeMap,
			selectedIds,
		],
	);

	const table = useReactTable({
		data: filteredDrafts,
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

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
					<>
						<Input
							type="search"
							value={payeeSearch}
							onChange={(event) => setPayeeSearch(event.target.value)}
							placeholder="Search by payee"
							className="mb-3 h-9"
						/>
						<div className="rounded-xl border bg-background">
							<Table containerClassName="max-h-[420px] overflow-y-auto">
							<TableHeader className="sticky top-0 z-10 bg-background">
								{table.getHeaderGroups().map((headerGroup) => (
									<TableRow key={headerGroup.id}>
										{headerGroup.headers.map((header) => (
											<TableHead
												key={header.id}
												className={cn(
													"sticky top-0 z-10 bg-background",
													header.column.id === "select" && "w-8",
													header.column.id === "date" && "w-[140px]",
													header.column.id === "payeeId" && "min-w-[220px]",
													header.column.id === "categoryId" && "min-w-[220px]",
													header.column.id === "amount" && "w-[220px]",
												)}
											>
												{header.isPlaceholder
													? null
													: flexRender(
															header.column.columnDef.header,
															header.getContext(),
														)}
											</TableHead>
										))}
									</TableRow>
								))}
							</TableHeader>
							<TableBody>
								{table.getRowModel().rows.length > 0 ? (
									table.getRowModel().rows.map((row) => {
									const draft = row.original;
									const isMissingSelection = !draft.payeeId || !draft.categoryId;
									const isComplete = !!draft.payeeId && !!draft.categoryId;

									return (
										<TableRow
											key={row.id}
											className={cn(
												"border-b py-2",
												isMissingSelection && "bg-amber-50/60",
												isComplete && "bg-emerald-50/70",
											)}
										>
											{row.getVisibleCells().map((cell) => (
												<TableCell
													key={cell.id}
													className={cn(
														cell.column.id === "select" && "w-8",
														cell.column.id === "date" && "w-[140px]",
														cell.column.id === "payeeId" && "min-w-[220px]",
														cell.column.id === "categoryId" && "min-w-[220px]",
														cell.column.id === "amount" && "w-[220px]",
													)}
												>
													{flexRender(cell.column.columnDef.cell, cell.getContext())}
												</TableCell>
											))}
										</TableRow>
									);
									})
								) : (
									<TableRow>
										<TableCell colSpan={columns.length} className="h-14 text-center">
											No transactions match that payee.
										</TableCell>
									</TableRow>
								)}
							</TableBody>
							</Table>
						</div>
					</>
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
