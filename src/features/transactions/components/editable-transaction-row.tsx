import {
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePickerInput } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { CategorySelect } from "@/features/categories/components/category-select";
import { PayeeSelect } from "@/features/payees/components/payee-select";
import type { Transaction } from "@/features/transactions/config/schemas";
import { AdvancedTransactionSheet } from "./advanced-transaction-sheet";

const toCents = (value: string) => {
	const parsed = Number.parseFloat(value);
	if (Number.isNaN(parsed)) return 0;
	return Math.round(parsed * 100);
};

interface EditableTransactionRowProps {
	accountId: string;
	onCancel: () => void;
	onSave: (
		data: {
			date: Date;
			payee: string;
			category: string;
			memo: string;
			outflow: number;
			inflow: number;
		},
		createMore: boolean,
	) => void;
}

export function EditableTransactionRow({
	accountId,
	onCancel,
	onSave,
}: EditableTransactionRowProps) {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [payee, setPayee] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [outflow, setOutflow] = useState("");
	const [inflow, setInflow] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [advancedOpen, setAdvancedOpen] = useState(false);
	const [advancedSeed, setAdvancedSeed] = useState({
		date: new Date(),
		payee_id: "",
		category_id: "",
		memo: "",
		outflow: "",
		inflow: "",
	});
	const dateInputRef = useRef<HTMLInputElement>(null);

	const handleOpenAdvanced = () => {
		setAdvancedSeed({
			date: date ?? new Date(),
			payee_id: payee,
			category_id: category,
			memo,
			outflow,
			inflow,
		});
		setAdvancedOpen(true);
	};

	const handleCreateTransaction = async (createMore = false) => {
		const outflowAmount = toCents(outflow);
		const inflowAmount = toCents(inflow);

		if (outflowAmount > 0 && inflowAmount > 0) {
			setErrorMessage("Transaction cannot have both inflow and outflow.");
			return;
		}

		setErrorMessage(null);

		onSave(
			{
				date: date ?? new Date(),
				payee,
				category,
				memo,
				outflow: outflowAmount,
				inflow: inflowAmount,
			},
			createMore,
		);

		if (createMore) {
			setPayee("");
			setCategory("");
			setMemo("");
			setOutflow("");
			setInflow("");
			setErrorMessage(null);
			requestAnimationFrame(() => {
				dateInputRef.current?.focus();
			});
		}
	};

	const handleAmountEnterKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		handleCreateTransaction(true);
	};

	return (
		<>
			<TableRow className="bg-muted/50 border-b-0">
				<TableCell>
					<Checkbox checked={true} />
				</TableCell>
				<TableCell>
					{/* <CalendarDatePicker date={date} onDateSelect={setDate} /> */}
					{/* <DatePicker */}
					{/* 	date={date} */}
					{/* 	onDateChange={setDate} */}
					{/* 	placeholder="Select date" */}
					{/* 	className="h-8 text-sm" */}
					{/* /> */}
					<DatePickerInput date={date} onDateChange={setDate} inputRef={dateInputRef} />
				</TableCell>
				<TableCell>
					<PayeeSelect value={payee} onChange={setPayee} className="h-8" />
				</TableCell>
				<TableCell>
					<CategorySelect value={category} onChange={setCategory} className="h-8" />
				</TableCell>
				<TableCell>
					<Input
						value={memo}
						onChange={(e) => setMemo(e.target.value)}
						placeholder="Memo"
						className="h-8 w-full min-w-0 bg-background"
					/>
				</TableCell>
				<TableCell>
					<Input
						type="number"
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
						type="number"
						value={inflow}
						onChange={(e) => setInflow(e.target.value)}
						onKeyDown={handleAmountEnterKey}
						placeholder="0.00"
						className="h-8 bg-background"
						min="0"
						step="0.01"
					/>
				</TableCell>
			</TableRow>

			<TableRow className="bg-muted/50">
				<TableCell colSpan={100}>
					<div className="flex items-center justify-between gap-2">
						{errorMessage ? (
							<p className="text-sm text-destructive">{errorMessage}</p>
						) : (
							<div />
						)}
						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={handleOpenAdvanced}>
								<Settings className="mr-2 h-4 w-4" />
								Advanced
							</Button>
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

			<AdvancedTransactionSheet
				key={`${advancedSeed.date.getTime()}-${advancedSeed.payee_id}-${advancedSeed.category_id}`}
				open={advancedOpen}
				onOpenChange={setAdvancedOpen}
				accountId={accountId}
				initialValues={advancedSeed}
				onCreated={onCancel}
			/>
		</>
	);
}

interface EditableTransactionEditRowProps {
	transaction: Transaction;
	onCancel: () => void;
	onSave: (data: {
		date: Date;
		payee_id: string;
		category_id: string;
		memo: string | null;
		outflow: number;
		inflow: number;
	}) => void;
}

export function EditableTransactionEditRow({
	transaction,
	onCancel,
	onSave,
}: EditableTransactionEditRowProps) {
	const firstSplit = transaction.splits[0];
	const outflowAmount = transaction.amount < 0 ? Math.abs(transaction.amount) : 0;
	const inflowAmount = transaction.amount > 0 ? transaction.amount : 0;

	const [date, setDate] = useState<Date | undefined>(transaction.date);
	const [payee, setPayee] = useState(transaction.payee_id);
	const [category, setCategory] = useState(firstSplit?.category_id ?? "");
	const [memo, setMemo] = useState(transaction.memo ?? "");
	const [outflow, setOutflow] = useState(String(outflowAmount / 100));
	const [inflow, setInflow] = useState(String(inflowAmount / 100));

	useEffect(() => {
		const handleKeyDown = (event: globalThis.KeyboardEvent) => {
			if (event.key === "Escape") {
				onCancel();
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onCancel]);

	const handleSave = () => {
		onSave({
			date: date ?? new Date(),
			payee_id: payee,
			category_id: category,
			memo: memo.trim() ? memo : null,
			outflow: toCents(outflow),
			inflow: toCents(inflow),
		});
	};

	const handleAmountEnterKey = (event: ReactKeyboardEvent<HTMLInputElement>) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		handleSave();
	};

	return (
		<>
			<TableRow className="bg-muted/50 border-b-0">
				<TableCell>
					<Checkbox checked={false} />
				</TableCell>
				<TableCell>
					<DatePickerInput date={date} onDateChange={setDate} />
				</TableCell>
				<TableCell>
					<PayeeSelect value={payee} onChange={setPayee} className="h-8" />
				</TableCell>
				<TableCell>
					<CategorySelect value={category} onChange={setCategory} className="h-8" />
				</TableCell>
				<TableCell>
					<Input
						value={memo}
						onChange={(e) => setMemo(e.target.value)}
						placeholder="Memo"
						className="h-8 w-full min-w-0 bg-background"
					/>
				</TableCell>
				<TableCell>
					<Input
						type="number"
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
						type="number"
						value={inflow}
						onChange={(e) => setInflow(e.target.value)}
						onKeyDown={handleAmountEnterKey}
						placeholder="0.00"
						className="h-8 bg-background"
						min="0"
						step="0.01"
					/>
				</TableCell>
			</TableRow>

			<TableRow className="bg-muted/50">
				<TableCell colSpan={100}>
					<div className="flex justify-end gap-2">
						<Button onClick={handleSave}>Save</Button>
						<Button variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</TableCell>
			</TableRow>
		</>
	);
}
