import { useForm } from "@tanstack/react-form";
import { CircleQuestionMark, Plus, Trash2 } from "lucide-react";
import {
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { CategorySelect } from "@/features/categories/components/category-select";
import { PayeeSelect } from "@/features/payees/components/payee-select";
import type { Transaction } from "@/features/transactions/config/schemas";
import type { User } from "@/features/users/api/get-users";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/currency";
import { TransactionShareControl } from "./transaction-share-control";

const toCents = (value: string) => {
	const parsed = Number.parseFloat(value);
	if (Number.isNaN(parsed)) return 0;
	return Math.round(parsed * 100);
};

interface EditableTransactionRowProps {
	users: User[];
	onCancel: () => void;
	onSave: (
		data: {
			date: Date;
			payee: string;
			category: string;
			memo: string;
			outflow: number;
			inflow: number;
			splitWith: string[];
			splits?: {
				category: string;
				memo: string;
				outflow: number;
				inflow: number;
			}[];
		},
		createMore: boolean,
	) => void;
}

type SplitRow = {
	id: string;
	category: string;
	memo: string;
	outflow: string;
	inflow: string;
	type?: "USER" | "SYSTEM";
};

export function EditableTransactionRow({
	users,
	onCancel,
	onSave,
}: EditableTransactionRowProps) {
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const dateInputRef = useRef<HTMLInputElement>(null);
	const splitIdRef = useRef(0);
	const createMoreRef = useRef(false);

	const nextSplitId = () => {
		splitIdRef.current += 1;
		return `split-${splitIdRef.current}`;
	};

	const form = useForm({
		defaultValues: {
			date: new Date(),
			payee: "",
			category: "",
			memo: "",
			outflow: "",
			inflow: "",
			isSplitMode: false,
			splitRows: [] as SplitRow[],
			splitWith: [] as string[],
		},
		onSubmit: ({ value }) => {
			const outflowAmount = toCents(value.outflow);
			const inflowAmount = toCents(value.inflow);
			const transactionAmount =
				inflowAmount > 0 ? inflowAmount : outflowAmount > 0 ? -outflowAmount : 0;

			if (outflowAmount > 0 && inflowAmount > 0) {
				setErrorMessage("Transaction cannot have both inflow and outflow.");
				return;
			}

			let splitsPayload:
				| {
						category: string;
						memo: string;
						outflow: number;
						inflow: number;
				  }[]
				| undefined;

			if (value.isSplitMode) {
				if (value.splitRows.some((split) => !split.category)) {
					setErrorMessage("Each split must have a category.");
					return;
				}

				if (
					value.splitRows.some(
						(split) => toCents(split.outflow) > 0 && toCents(split.inflow) > 0,
					)
				) {
					setErrorMessage("Each split can only have inflow or outflow, not both.");
					return;
				}

				splitsPayload = value.splitRows.map((split) => ({
					category: split.category,
					memo: split.memo,
					outflow: toCents(split.outflow),
					inflow: toCents(split.inflow),
				}));

				const splitTotal = splitsPayload.reduce(
					(sum, split) =>
						sum +
						(split.inflow > 0 ? split.inflow : split.outflow > 0 ? -split.outflow : 0),
					0,
				);

				if (splitTotal !== transactionAmount) {
					setErrorMessage("Split amounts must add up to the transaction total.");
					return;
				}
			}

			setErrorMessage(null);

			onSave(
				{
					date: value.date,
					payee: value.payee,
					category: value.isSplitMode
						? (value.splitRows[0]?.category ?? "")
						: value.category,
					memo: value.memo,
					outflow: outflowAmount,
					inflow: inflowAmount,
					splitWith: value.splitWith,
					splits: splitsPayload,
				},
				createMoreRef.current,
			);

			if (!createMoreRef.current) return;

			form.setFieldValue("payee", "");
			form.setFieldValue("category", "");
			form.setFieldValue("memo", "");
			form.setFieldValue("outflow", "");
			form.setFieldValue("inflow", "");
			form.setFieldValue("isSplitMode", false);
			form.setFieldValue("splitRows", []);
			form.setFieldValue("splitWith", []);
			setErrorMessage(null);

			requestAnimationFrame(() => {
				dateInputRef.current?.focus();
			});
		},
	});

	const handleEnableSplit = () => {
		const values = form.state.values;
		if (values.isSplitMode) return;

		form.setFieldValue("splitRows", [
			{
				id: nextSplitId(),
				category: values.category,
				memo: values.memo,
				outflow: values.outflow,
				inflow: values.inflow,
			},
		]);
		form.setFieldValue("category", "");
		form.setFieldValue("isSplitMode", true);
	};

	const handleDeleteSplitRow = (id: string) => {
		const nextRows = form.state.values.splitRows.filter((row) => row.id !== id);
		form.setFieldValue("splitRows", nextRows);
		if (nextRows.length === 0) {
			form.setFieldValue("isSplitMode", false);
		}
	};

	const handleAddSplitRow = () => {
		form.setFieldValue("splitRows", [
			...form.state.values.splitRows,
			{
				id: nextSplitId(),
				category: "",
				memo: "",
				outflow: "",
				inflow: "",
				type: "USER",
			},
		]);
	};

	const handleUpdateSplitRow = (id: string, patch: Partial<SplitRow>) => {
		form.setFieldValue(
			"splitRows",
			form.state.values.splitRows.map((row) =>
				row.id === id ? { ...row, ...patch } : row,
			),
		);
	};

	const handleCreateTransaction = (createMore = false) => {
		createMoreRef.current = createMore;
		form.handleSubmit();
	};

	const handleAmountEnterKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		handleCreateTransaction(true);
	};

	return (
		<form.Subscribe selector={(store) => store.values}>
			{(values) => {
				const splitOutflowTotal = values.splitRows.reduce(
					(sum, row) => sum + toCents(row.outflow),
					0,
				);
				const splitInflowTotal = values.splitRows.reduce(
					(sum, row) => sum + toCents(row.inflow),
					0,
				);
				const totalOutflow = toCents(values.outflow);
				const totalInflow = toCents(values.inflow);
				const remainingOutflow = totalOutflow - splitOutflowTotal;
				const remainingInflow = totalInflow - splitInflowTotal;
				const hasOverAssignedSplits =
					splitOutflowTotal > totalOutflow || splitInflowTotal > totalInflow;

				return (
					<>
						<TableRow className="bg-muted/50 border-b-0">
							<TableCell className="px-2">
								<Checkbox checked={true} />
							</TableCell>
							<TableCell className="px-1">
								<DatePickerInput
									date={values.date}
									onDateChange={(date) => form.setFieldValue("date", date ?? new Date())}
									inputRef={dateInputRef}
								/>
							</TableCell>
							<TableCell className="px-1">
								<PayeeSelect
									value={values.payee}
									onChange={(value) => form.setFieldValue("payee", value)}
									className="h-8"
								/>
							</TableCell>
							<TableCell className="px-1">
								<CategorySelect
									value={values.isSplitMode ? "" : values.category}
									onChange={(value) => form.setFieldValue("category", value)}
									onSplitClick={handleEnableSplit}
									disabled={values.isSplitMode}
									placeholder={values.isSplitMode ? "Split" : "Category"}
									className="h-8"
								/>
							</TableCell>
							<TableCell className="px-1">
								<Input
									value={values.memo}
									onChange={(event) => form.setFieldValue("memo", event.target.value)}
									placeholder="Memo"
									className="h-8 w-full min-w-0 bg-background"
								/>
							</TableCell>
							<TableCell className="px-1">
								<Input
									type="decimal"
									value={values.outflow}
									onChange={(event) => form.setFieldValue("outflow", event.target.value)}
									onKeyDown={handleAmountEnterKey}
									placeholder="0.00"
									className="h-8 bg-background"
									min="0"
									step="0.01"
								/>
							</TableCell>
							<TableCell className="px-1">
								<Input
									type="decimal"
									value={values.inflow}
									onChange={(event) => form.setFieldValue("inflow", event.target.value)}
									onKeyDown={handleAmountEnterKey}
									placeholder="0.00"
									className="h-8 bg-background"
									min="0"
									step="0.01"
								/>
							</TableCell>
							<TableCell className="px-1">
								<TransactionShareControl
									users={users}
									splitWith={values.splitWith}
									onChange={(splitWith) => form.setFieldValue("splitWith", splitWith)}
								/>
							</TableCell>
						</TableRow>

						{values.isSplitMode && values.splitRows.length > 0 ? (
							<>
								{values.splitRows.map((splitRow) => (
									<TableRow key={splitRow.id} className="bg-muted/50 border-b-0">
										<TableCell />
										<TableCell />
										<TableCell>
											<div className="flex items-center justify-end">
												<Button
													type="button"
													variant="secondary"
													size="icon"
													className="h-8 w-8 rounded-full"
													onClick={() => handleDeleteSplitRow(splitRow.id)}
													aria-label="Delete split"
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
										<TableCell className="px-1">
											<CategorySelect
												value={splitRow.category}
												onChange={(value) =>
													handleUpdateSplitRow(splitRow.id, { category: value })
												}
												showSplitButton={false}
												className="h-8"
											/>
										</TableCell>
										<TableCell className="px-1">
											<Input
												value={splitRow.memo}
												onChange={(event) =>
													handleUpdateSplitRow(splitRow.id, { memo: event.target.value })
												}
												placeholder="Memo"
												className="h-8 w-full min-w-0 bg-background"
											/>
										</TableCell>
										<TableCell className="px-1">
											<Input
												type="decimal"
												value={splitRow.outflow}
												onChange={(event) =>
													handleUpdateSplitRow(splitRow.id, {
														outflow: event.target.value,
													})
												}
												onKeyDown={handleAmountEnterKey}
												placeholder="0.00"
												className="h-8 bg-background"
												min="0"
												step="0.01"
											/>
										</TableCell>
										<TableCell className="px-1">
											<Input
												type="decimal"
												value={splitRow.inflow}
												onChange={(event) =>
													handleUpdateSplitRow(splitRow.id, {
														inflow: event.target.value,
													})
												}
												onKeyDown={handleAmountEnterKey}
												placeholder="0.00"
												className="h-8 bg-background"
												min="0"
												step="0.01"
											/>
										</TableCell>
										<TableCell />
									</TableRow>
								))}
								<TableRow className="text-sm bg-muted/50 border-b-0">
									<TableCell />
									<TableCell />
									<TableCell />
									<TableCell>
										<Button
											type="button"
											variant="secondary"
											className="h-8 w-full px-2 text-accent-foreground"
											onClick={handleAddSplitRow}
										>
											<Plus className="h-4 w-4" />
											Add another split
										</Button>
									</TableCell>
									<TableCell>
										<p
											className={cn(
												"text-sm text-muted-foreground",
												hasOverAssignedSplits && "text-destructive",
											)}
										>
											Remaining to assign:
										</p>
									</TableCell>
									<TableCell>
										<p
											className={cn(
												"text-muted-foreground",
												hasOverAssignedSplits && "text-destructive",
											)}
										>
											{formatCurrency(remainingOutflow)}
										</p>
									</TableCell>
									<TableCell>
										<p
											className={cn(
												"text-muted-foreground",
												hasOverAssignedSplits && "text-destructive",
											)}
										>
											{formatCurrency(remainingInflow)}
										</p>
									</TableCell>
									<TableCell />
								</TableRow>
							</>
						) : null}

						<TableRow className="bg-muted/50">
							<TableCell colSpan={100}>
								<div className="flex items-center justify-between gap-2">
									{errorMessage ? (
										<p className="text-sm text-destructive">{errorMessage}</p>
									) : (
										<div />
									)}
									<div className="flex justify-end gap-2">
										<Button onClick={() => handleCreateTransaction()}>Save</Button>
										<Button onClick={() => handleCreateTransaction(true)}>
											Save and add another
										</Button>
										<Button variant="outline" onClick={onCancel}>
											Cancel
										</Button>
									</div>
								</div>
							</TableCell>
						</TableRow>
					</>
				);
			}}
		</form.Subscribe>
	);
}

interface EditableTransactionEditRowProps {
	transaction: Transaction;
	users: User[];
	onCancel: () => void;
	initialFocus?: {
		field: "date" | "payee" | "category" | "memo" | "outflow" | "inflow";
		splitId?: string;
	} | null;
	onSave: (data: {
		date: Date;
		payee_id: string;
		category_id: string;
		memo: string | null;
		outflow: number;
		inflow: number;
		splitWith: string[];
		splits?: {
			category_id: string;
			memo: string;
			outflow: number;
			inflow: number;
		}[];
	}) => void;
}

export function EditableTransactionEditRow({
	transaction,
	users,
	onCancel,
	initialFocus,
	onSave,
}: EditableTransactionEditRowProps) {
	const firstSplit = transaction.splits[0];
	const outflowAmount = transaction.amount < 0 ? Math.abs(transaction.amount) : 0;
	const inflowAmount = transaction.amount > 0 ? transaction.amount : 0;
	const hasInitialSplits = transaction.splits.length > 1;

	const [date, setDate] = useState<Date | undefined>(transaction.date);
	const [payee, setPayee] = useState(transaction.payee_id);
	const [category, setCategory] = useState(firstSplit?.category_id ?? "");
	const [memo, setMemo] = useState(transaction.memo ?? "");
	const [outflow, setOutflow] = useState(String(outflowAmount / 100));
	const [inflow, setInflow] = useState(String(inflowAmount / 100));
	const [isSplitMode, setIsSplitMode] = useState(hasInitialSplits);
	const [splitWith, setSplitWith] = useState<string[]>(() => {
		const debtorUserIds = transaction.splits
			.map((split) => split.debtor_user_id)
			.filter((id): id is string => Boolean(id));

		return [...new Set(debtorUserIds)];
	});
	const [splitRows, setSplitRows] = useState<SplitRow[]>(
		hasInitialSplits
			? transaction.splits.map((split) => ({
					id: split.id,
					category: split.category_id,
					memo: split.memo ?? "",
					outflow: split.amount < 0 ? String(Math.abs(split.amount) / 100) : "",
					inflow: split.amount > 0 ? String(split.amount / 100) : "",
					type: split.type,
				}))
			: [],
	);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const dateInputRef = useRef<HTMLInputElement>(null);
	const memoInputRef = useRef<HTMLInputElement>(null);
	const outflowInputRef = useRef<HTMLInputElement>(null);
	const inflowInputRef = useRef<HTMLInputElement>(null);
	const payeeFieldRef = useRef<HTMLDivElement>(null);
	const categoryFieldRef = useRef<HTMLDivElement>(null);
	const splitCategoryRefs = useRef<Record<string, HTMLDivElement | null>>({});
	const splitMemoRefs = useRef<Record<string, HTMLInputElement | null>>({});
	const splitOutflowRefs = useRef<Record<string, HTMLInputElement | null>>({});
	const splitInflowRefs = useRef<Record<string, HTMLInputElement | null>>({});
	const [payeeOpenRequestId, setPayeeOpenRequestId] = useState(0);
	const [categoryOpenRequestId, setCategoryOpenRequestId] = useState(0);
	const [splitCategoryOpenRequest, setSplitCategoryOpenRequest] = useState<{
		id: string;
		requestId: number;
	} | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") {
				onCancel();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onCancel]);

	useEffect(() => {
		if (!initialFocus) return;

		const focusElement = () => {
			if (initialFocus.splitId && isSplitMode) {
				if (initialFocus.field === "category") {
					setSplitCategoryOpenRequest({
						id: initialFocus.splitId,
						requestId: Date.now(),
					});
					splitCategoryRefs.current[initialFocus.splitId]
						?.querySelector<HTMLButtonElement>("button")
						?.focus();
					return;
				}

				if (initialFocus.field === "memo") {
					splitMemoRefs.current[initialFocus.splitId]?.focus();
					return;
				}

				if (initialFocus.field === "outflow") {
					splitOutflowRefs.current[initialFocus.splitId]?.focus();
					return;
				}

				if (initialFocus.field === "inflow") {
					splitInflowRefs.current[initialFocus.splitId]?.focus();
					return;
				}
			}

			switch (initialFocus.field) {
				case "date":
					dateInputRef.current?.focus();
					break;
				case "payee":
					setPayeeOpenRequestId(Date.now());
					payeeFieldRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
					break;
				case "category":
					if (isSplitMode) return;
					setCategoryOpenRequestId(Date.now());
					categoryFieldRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
					break;
				case "memo":
					memoInputRef.current?.focus();
					break;
				case "outflow":
					outflowInputRef.current?.focus();
					break;
				case "inflow":
					inflowInputRef.current?.focus();
					break;
			}
		};

		requestAnimationFrame(focusElement);
	}, [initialFocus, isSplitMode]);

	const handleDeleteSplitRow = (id: string) => {
		setSplitRows((currentRows) => {
			const nextRows = currentRows.filter((row) => row.id !== id);
			if (nextRows.length === 0) {
				setIsSplitMode(false);
			}
			return nextRows;
		});
	};

	const handleAddSplitRow = () => {
		setSplitRows((currentRows) => [
			...currentRows,
			{
				id: `${transaction.id}-split-${Date.now()}-${currentRows.length}`,
				category: "",
				memo: "",
				outflow: "",
				inflow: "",
				type: "USER",
			},
		]);
		setIsSplitMode(true);
	};

	const handleUpdateSplitRow = (id: string, patch: Partial<SplitRow>) => {
		setSplitRows((currentRows) =>
			currentRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
		);
	};

	const handleSave = () => {
		const outflowCents = toCents(outflow);
		const inflowCents = toCents(inflow);

		if (outflowCents > 0 && inflowCents > 0) {
			setErrorMessage("Transaction cannot have both inflow and outflow.");
			return;
		}

		if (isSplitMode) {
			if (splitRows.some((split) => !split.category)) {
				setErrorMessage("Each split must have a category.");
				return;
			}

			if (
				splitRows.some((split) => toCents(split.outflow) > 0 && toCents(split.inflow) > 0)
			) {
				setErrorMessage("Each split can only have inflow or outflow, not both.");
				return;
			}

			const transactionAmount =
				inflowCents > 0 ? inflowCents : outflowCents > 0 ? -outflowCents : 0;
			const splitAmountTotal = splitRows.reduce((sum, split) => {
				const splitOutflow = toCents(split.outflow);
				const splitInflow = toCents(split.inflow);
				return (
					sum + (splitInflow > 0 ? splitInflow : splitOutflow > 0 ? -splitOutflow : 0)
				);
			}, 0);

			if (splitAmountTotal !== transactionAmount) {
				setErrorMessage("Split amounts must add up to the transaction total.");
				return;
			}
		}

		setErrorMessage(null);

		onSave({
			date: date ?? new Date(),
			payee_id: payee,
			category_id: isSplitMode ? (splitRows[0]?.category ?? "") : category,
			memo: memo.trim() ? memo : null,
			outflow: outflowCents,
			inflow: inflowCents,
			splitWith,
			splits: isSplitMode
				? splitRows.map((split) => ({
						category_id: split.category,
						memo: split.memo,
						outflow: toCents(split.outflow),
						inflow: toCents(split.inflow),
					}))
				: undefined,
		});
	};

	const handleAmountEnterKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		handleSave();
	};

	const splitOutflowTotal = splitRows.reduce(
		(sum, split) => sum + toCents(split.outflow),
		0,
	);
	const splitInflowTotal = splitRows.reduce(
		(sum, split) => sum + toCents(split.inflow),
		0,
	);
	const totalOutflow = toCents(outflow);
	const totalInflow = toCents(inflow);
	const remainingOutflow = totalOutflow - splitOutflowTotal;
	const remainingInflow = totalInflow - splitInflowTotal;
	const hasOverAssignedSplits =
		splitOutflowTotal > totalOutflow || splitInflowTotal > totalInflow;

	return (
		<>
			<TableRow className="bg-muted/50 border-b-0">
				<TableCell>
					<Checkbox checked={false} />
				</TableCell>
				<TableCell>
					<DatePickerInput date={date} onDateChange={setDate} inputRef={dateInputRef} />
				</TableCell>
				<TableCell>
					<div ref={payeeFieldRef}>
						<PayeeSelect
							value={payee}
							onChange={setPayee}
							openRequestId={payeeOpenRequestId}
							className="h-8"
						/>
					</div>
				</TableCell>
				<TableCell>
					<div ref={categoryFieldRef}>
						<CategorySelect
							value={isSplitMode ? "" : category}
							onChange={setCategory}
							openRequestId={categoryOpenRequestId}
							disabled={isSplitMode}
							showSplitButton={false}
							placeholder={isSplitMode ? "Split" : "Category"}
							className="h-8"
						/>
					</div>
				</TableCell>
				<TableCell>
					<Input
						ref={memoInputRef}
						value={memo}
						onChange={(e) => setMemo(e.target.value)}
						placeholder="Memo"
						className="h-8 w-full min-w-0 bg-background"
					/>
				</TableCell>
				<TableCell>
					<Input
						ref={outflowInputRef}
						type="decimal"
						value={outflow}
						onChange={(e) => setOutflow(e.target.value)}
						onKeyDown={handleAmountEnterKey}
						placeholder="0.00"
						className="h-8 bg-background"
						min="0"
						step="0.01"
					/>
				</TableCell>
				<TableCell>
					<Input
						ref={inflowInputRef}
						type="decimal"
						value={inflow}
						onChange={(e) => setInflow(e.target.value)}
						onKeyDown={handleAmountEnterKey}
						placeholder="0.00"
						className="h-8 bg-background"
						min="0"
						step="0.01"
					/>
				</TableCell>
				<TableCell>
					<TransactionShareControl
						users={users}
						splitWith={splitWith}
						onChange={setSplitWith}
					/>
				</TableCell>
			</TableRow>

			{isSplitMode && splitRows.length > 0 ? (
				<>
					{splitRows.map((split) => {
						const isSystemSplit = split.type === "SYSTEM";

						return (
							<TableRow key={split.id} className="bg-muted/50 border-b-0">
								<TableCell />
								<TableCell />
								<TableCell>
									<div className="flex items-center justify-end">
										{isSystemSplit ? (
											<Tooltip>
												<TooltipTrigger asChild>
													<span className="inline-flex h-8 w-8 items-center justify-center text-muted-foreground">
														<CircleQuestionMark className="h-4 w-4" />
													</span>
												</TooltipTrigger>
												<TooltipContent>
													This split was created by the system.
												</TooltipContent>
											</Tooltip>
										) : (
											<Button
												type="button"
												variant="secondary"
												size="icon"
												className="h-8 w-8 rounded-full"
												onClick={() => handleDeleteSplitRow(split.id)}
												aria-label="Delete split"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										)}
									</div>
								</TableCell>
								<TableCell>
									<div
										ref={(node) => {
											splitCategoryRefs.current[split.id] = node;
										}}
									>
										<CategorySelect
											value={split.category}
											onChange={(value) =>
												handleUpdateSplitRow(split.id, { category: value })
											}
											disabled={isSystemSplit}
											openRequestId={
												splitCategoryOpenRequest?.id === split.id
													? splitCategoryOpenRequest.requestId
													: undefined
											}
											showSplitButton={false}
											className="h-8"
										/>
									</div>
								</TableCell>
								<TableCell>
									<Input
										ref={(node) => {
											splitMemoRefs.current[split.id] = node;
										}}
										value={split.memo}
										onChange={(event) =>
											handleUpdateSplitRow(split.id, { memo: event.target.value })
										}
										placeholder="Memo"
										className="h-8 w-full min-w-0 bg-background"
										disabled={isSystemSplit}
									/>
								</TableCell>
								<TableCell>
									<Input
										ref={(node) => {
											splitOutflowRefs.current[split.id] = node;
										}}
										type="decimal"
										value={split.outflow}
										onChange={(event) =>
											handleUpdateSplitRow(split.id, { outflow: event.target.value })
										}
										onKeyDown={handleAmountEnterKey}
										placeholder="0.00"
										className="h-8 bg-background"
										min="0"
										step="0.01"
										disabled={isSystemSplit}
									/>
								</TableCell>
								<TableCell>
									<Input
										ref={(node) => {
											splitInflowRefs.current[split.id] = node;
										}}
										type="decimal"
										value={split.inflow}
										onChange={(event) =>
											handleUpdateSplitRow(split.id, { inflow: event.target.value })
										}
										onKeyDown={handleAmountEnterKey}
										placeholder="0.00"
										className="h-8 bg-background"
										min="0"
										step="0.01"
										disabled={isSystemSplit}
									/>
								</TableCell>
								<TableCell />
							</TableRow>
						);
					})}

					<TableRow className="text-sm bg-muted/50 border-b-0">
						<TableCell />
						<TableCell />
						<TableCell />
						<TableCell>
							<Button
								type="button"
								variant="secondary"
								className="h-8 w-full px-2 text-accent-foreground"
								onClick={handleAddSplitRow}
							>
								<Plus className="h-4 w-4" />
								Add another split
							</Button>
						</TableCell>
						<TableCell>
							<p
								className={cn(
									"text-sm text-muted-foreground",
									hasOverAssignedSplits && "text-destructive",
								)}
							>
								Remaining to assign:
							</p>
						</TableCell>
						<TableCell>
							<p
								className={cn(
									"text-muted-foreground",
									hasOverAssignedSplits && "text-destructive",
								)}
							>
								{formatCurrency(remainingOutflow)}
							</p>
						</TableCell>
						<TableCell>
							<p
								className={cn(
									"text-muted-foreground",
									hasOverAssignedSplits && "text-destructive",
								)}
							>
								{formatCurrency(remainingInflow)}
							</p>
						</TableCell>
						<TableCell />
					</TableRow>
				</>
			) : null}

			<TableRow className="bg-muted/50">
				<TableCell colSpan={100}>
					<div className="flex items-center justify-between gap-2">
						{errorMessage ? (
							<p className="text-sm text-destructive">{errorMessage}</p>
						) : (
							<div />
						)}
						<div className="flex justify-end gap-2">
							<Button onClick={handleSave}>Save</Button>
							<Button variant="outline" onClick={onCancel}>
								Cancel
							</Button>
						</div>
					</div>
				</TableCell>
			</TableRow>
		</>
	);
}
