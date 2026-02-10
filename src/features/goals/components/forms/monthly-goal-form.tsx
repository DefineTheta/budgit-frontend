import { useForm } from "@tanstack/react-form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type CreateGoalInput, CreateGoalSchema } from "@/features/goals/config/schemas";
import { useCreateGoal } from "../../api/create-goal";
import { useUpdateGoal } from "../../api/update-goal";

interface MonthlyGoalFormProps {
	goal?: CreateGoalInput;
	goalId?: string;
	categoryId: string;
	onSuccess: () => void;
}

const day = [
	{ label: "1st", value: "1" },
	{ label: "2nd", value: "2" },
	{ label: "3rd", value: "3" },
	{ label: "4th", value: "4" },
	{ label: "5th", value: "5" },
	{ label: "6th", value: "6" },
	{ label: "7th", value: "7" },
	{ label: "8th", value: "8" },
	{ label: "9th", value: "9" },
	{ label: "10th", value: "10" },
	{ label: "11th", value: "11" },
	{ label: "12th", value: "12" },
	{ label: "13th", value: "13" },
	{ label: "14th", value: "14" },
	{ label: "15th", value: "15" },
	{ label: "16th", value: "16" },
	{ label: "17th", value: "17" },
	{ label: "18th", value: "18" },
	{ label: "19th", value: "19" },
	{ label: "20th", value: "20" },
	{ label: "21st", value: "21" },
	{ label: "22nd", value: "22" },
	{ label: "23rd", value: "23" },
	{ label: "24th", value: "24" },
	{ label: "25th", value: "25" },
	{ label: "26th", value: "26" },
	{ label: "27th", value: "27" },
	{ label: "28th", value: "28" },
	{ label: "29th", value: "29" },
	{ label: "30th", value: "30" },
	{ label: "31st", value: "31" },
	{ label: "Last day of month", value: "32" },
];

export const MonthlyGoalForm = ({
	goal,
	goalId,
	categoryId,
	onSuccess,
}: MonthlyGoalFormProps) => {
	const { mutate: createGoalMutation } = useCreateGoal();
	const { mutate: updateGoalMutation } = useUpdateGoal();

	const form = useForm({
		defaultValues: goal ? { ...goal, amount: goal.amount / 100 } : undefined,
		validators: {
			onSubmit: CreateGoalSchema,
		},
		onSubmit: (e) => {
			const data = {
				...e.value,
				repeat_day_week: undefined,
				repeat_date_year: undefined,
				amount: e.value.amount * 100,
			};
			const options = {
				onSuccess,
			};

			if (goal && goalId) {
				updateGoalMutation(
					{
						goalId,
						data,
					},
					options,
				);
			} else {
				createGoalMutation(
					{
						categoryId,
						data,
					},
					options,
				);
			}
		},
	});

	return (
		<form
			id="monthly-goal-form"
			onSubmit={(e) => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
			className="space-y-4"
		>
			<form.Field name="amount">
				{(field) => {
					const error = field.state.meta.errors[0];
					const errorMessage = typeof error === "string" ? error : error?.message;
					return (
						<div>
							<label htmlFor={field.name} className="text-sm font-medium">
								I want to save
							</label>
							<Input
								id={field.name}
								name={field.name}
								type="number"
								min="0"
								step="0.01"
								value={field.state.value}
								onBlur={field.handleBlur}
								onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
								placeholder="0.00"
								autoComplete="off"
							/>
							{errorMessage && (
								<p className="text-sm text-destructive mt-1">{errorMessage}</p>
							)}
						</div>
					);
				}}
			</form.Field>
			<form.Field name="repeat_day_month">
				{(field) => {
					const error = field.state.meta.errors[0];
					const errorMessage = typeof error === "string" ? error : error?.message;
					return (
						<div>
							<label
								htmlFor="monthly-goal-form-select-day"
								className="text-sm font-medium"
							>
								By
							</label>
							<Select
								name={field.name}
								value={String(field.state.value)}
								onValueChange={(val) => field.handleChange(Number(val))}
							>
								<SelectTrigger id="monthly-goal-form-select-day">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{day.map((d) => (
										<SelectItem key={d.value} value={d.value}>
											{d.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							{errorMessage && (
								<p className="text-sm text-destructive mt-1">{errorMessage}</p>
							)}
						</div>
					);
				}}
			</form.Field>
			<form.Field name="goal_type_id">
				{(field) => {
					const error = field.state.meta.errors[0];
					const errorMessage = typeof error === "string" ? error : error?.message;
					return (
						<div>
							<label
								htmlFor="monthly-goal-form-select-goal-type"
								className="text-sm font-medium"
							>
								Next month I want to
							</label>
							<Select
								name={field.name}
								value={String(field.state.value)}
								onValueChange={(val) => field.handleChange(Number(val))}
							>
								<SelectTrigger id="monthly-goal-form-select-goal-type">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem key={1} value="1">
										Set aside another{" "}
										{Intl.NumberFormat("en-AU", {
											style: "currency",
											currency: "AUD",
										}).format(form.getFieldValue("amount") ?? 0)}
									</SelectItem>
									<SelectItem key={2} value="2">
										Refil upto{" "}
										{Intl.NumberFormat("en-AU", {
											style: "currency",
											currency: "AUD",
										}).format(form.getFieldValue("amount") ?? 0)}
									</SelectItem>
								</SelectContent>
							</Select>
							{errorMessage && (
								<p className="text-sm text-destructive mt-1">{errorMessage}</p>
							)}
						</div>
					);
				}}
			</form.Field>
		</form>
	);
};
