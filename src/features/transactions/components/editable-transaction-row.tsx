import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";

interface EditableTransactionRowProps {
	onCancel: () => void;
}

export function EditableTransactionRow({ onCancel }: EditableTransactionRowProps) {
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [payee, setPayee] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [outflow, setOutflow] = useState("");
	const [inflow, setInflow] = useState("");

	return (
		<TableRow className="bg-background">
			<TableCell>
				<DatePicker
					date={date}
					onDateChange={setDate}
					placeholder="Select date"
					className="h-8 text-sm"
				/>
			</TableCell>
			<TableCell>
				<Input
					value={payee}
					onChange={(e) => setPayee(e.target.value)}
					placeholder="Payee"
					className="h-8"
				/>
			</TableCell>
			<TableCell>
				<Input
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					placeholder="Category"
					className="h-8"
				/>
			</TableCell>
			<TableCell>
				<Input
					value={memo}
					onChange={(e) => setMemo(e.target.value)}
					placeholder="Memo"
					className="h-8"
				/>
			</TableCell>
			<TableCell>
				<Input
					type="number"
					value={outflow}
					onChange={(e) => setOutflow(e.target.value)}
					placeholder="0.00"
					className="h-8"
					min="0"
					step="0.01"
				/>
			</TableCell>
			<TableCell>
				<Input
					type="number"
					value={inflow}
					onChange={(e) => setInflow(e.target.value)}
					placeholder="0.00"
					className="h-8"
					min="0"
					step="0.01"
				/>
			</TableCell>
			<TableCell>
				<Button
					variant="ghost"
					size="icon"
					onClick={onCancel}
					className="h-8 w-8"
					aria-label="Cancel"
				>
					<X className="h-4 w-4" />
				</Button>
			</TableCell>
		</TableRow>
	);
}
