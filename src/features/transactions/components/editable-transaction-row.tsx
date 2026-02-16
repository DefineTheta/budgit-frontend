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
import { CategorySelect } from "@/features/categories/components/category-select";
import { PayeeSelect } from "@/features/payees/components/payee-select";
import type { Transaction } from "@/features/transactions/config/schemas";

const toCents = (value: string) => {
	const parsed = Number.parseFloat(value);
	if (Number.isNaN(parsed)) return 0;
	return Math.round(parsed * 100);
};

interface EditableTransactionRowProps {
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
	onCancel,
	onSave,
}: EditableTransactionRowProps) {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [payee, setPayee] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [outflow, setOutflow] = useState("");
	const [inflow, setInflow] = useState("");
	const dateInputRef = useRef<HTMLInputElement>(null);

	const handleCreateTransaction = async (createMore = false) => {
		onSave(
			{
				date: date ?? new Date(),
				payee,
				category,
				memo,
				outflow: toCents(outflow),
				inflow: toCents(inflow),
			},
			createMore,
		);

		if (createMore) {
			setPayee("");
			setCategory("");
			setMemo("");
			setOutflow("");
			setInflow("");
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
					<div className="flex justify-end gap-2">
						<Button onClick={() => handleCreateTransaction()}>Save</Button>
						<Button onClick={() => handleCreateTransaction(true)}>
							Save and add another
						</Button>
						<Button variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</TableCell>
			</TableRow>
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
	const [date, setDate] = useState<Date | undefined>(transaction.date);
	const [payee, setPayee] = useState(transaction.payee_id);
	const [category, setCategory] = useState(transaction.category_id);
	const [memo, setMemo] = useState(transaction.memo ?? "");
	const [outflow, setOutflow] = useState(String(transaction.outflow / 100));
	const [inflow, setInflow] = useState(String(transaction.inflow / 100));

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
