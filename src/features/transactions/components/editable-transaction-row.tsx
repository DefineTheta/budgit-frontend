import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { CategorySelect } from "@/features/categories/components/category-select";
import { PayeeSelect } from "@/features/payees/components/payee-select";

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
	const [date, setDate] = useState<Date>(new Date());
	const [payee, setPayee] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [outflow, setOutflow] = useState(0);
	const [inflow, setInflow] = useState(0);

	const handleCreateTransaction = async (createMore = false) => {
		onSave(
			{
				date,
				payee,
				category,
				memo,
				outflow: outflow * 100,
				inflow: inflow * 100,
			},
			createMore,
		);

		if (createMore) {
			setPayee("");
			setCategory("");
			setMemo("");
			setOutflow(0);
			setInflow(0);
		}
	};

	return (
		<>
			<TableRow className="bg-muted/50 border-b-0">
				<TableCell>
					<Checkbox checked={true} />
				</TableCell>
				<TableCell>
					<DatePicker
						date={date}
						onDateChange={setDate}
						placeholder="Select date"
						className="h-8 text-sm"
					/>
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
						onChange={(e) => setOutflow(Number(e.target.value))}
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
						onChange={(e) => setInflow(Number(e.target.value))}
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
