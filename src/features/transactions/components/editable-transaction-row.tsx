import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { TableCell, TableRow } from "@/components/ui/table";
import { usePayees } from "@/features/payees/api/get-payees";
import { CreatableSelect } from "@/components/ui/createable-select";
import { useCategories } from "@/features/categories/api/get-categories";
import { useCreatePayee } from "@/features/payees/api/create-payee";

interface EditableTransactionRowProps {
	onCancel: () => void;
	onSave: (data: {
		date: Date;
		payee: string;
		category: string;
		memo: string;
		outflow: number;
		inflow: number;
	}) => void;
}

export function EditableTransactionRow({
	onCancel,
	onSave,
}: EditableTransactionRowProps) {
	const payeesQuery = usePayees();
	const categoriesQuery = useCategories();

	const [date, setDate] = useState<Date>(new Date());
	const [payee, setPayee] = useState("");
	const [category, setCategory] = useState("");
	const [memo, setMemo] = useState("");
	const [outflow, setOutflow] = useState(0);
	const [inflow, setInflow] = useState(0);

	const { mutate: createPayeeMutation, isPending: creatingPayee } = useCreatePayee({
		mutationConfig: {
			onSuccess: (payee) => setPayee(payee.id),
		},
	});

	const payees =
		payeesQuery.data?.map((payee) => ({
			label: payee.name,
			value: payee.id,
		})) || [];

	const categories =
		categoriesQuery.data?.map((c) => ({
			label: c.name,
			value: c.id,
		})) || [];

	const handleCreatePayee = async (name: string) => {
		console.log(name);
		createPayeeMutation({ data: { name } });
	};

	const handleCreateCategories = async (name: string) => {
		console.log(name);
	};

	const handleCreateTransaction = async () => {
		onSave({
			date,
			payee,
			category,
			memo,
			outflow: outflow * 100,
			inflow: inflow * 100,
		});
	};

	return (
		<>
			<TableRow className="bg-muted/50 border-b-0">
				<TableCell>
					<DatePicker
						date={date}
						onDateChange={setDate}
						placeholder="Select date"
						className="h-8 text-sm"
					/>
				</TableCell>
				<TableCell>
					<CreatableSelect
						options={payees}
						value={payee}
						onChange={setPayee}
						onCreate={handleCreatePayee}
						placeholder="Payee"
						className="h-8"
					/>
				</TableCell>
				<TableCell>
					<CreatableSelect
						options={categories}
						value={category}
						onChange={setCategory}
						onCreate={handleCreateCategories}
						placeholder="Category"
						className="h-8"
					/>
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
						<Button onClick={handleCreateTransaction}>Save</Button>
						<Button>Save and add another</Button>
						<Button variant="outline" onClick={onCancel}>
							Cancel
						</Button>
					</div>
				</TableCell>
			</TableRow>
		</>
	);
}
