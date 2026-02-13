import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
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

const GoalFormSchema = CreateGoalSchema.extend({
	amount: z.number().gte(0),
});

interface WeeklyGoalFormProps {
	goal?: CreateGoalInput;
	goalId?: string;
	categoryId: string;
	onSuccess: () => void;
}

const weekDays = [
	{ label: "Monday", value: "1" },
	{ label: "Tuesday", value: "2" },
	{ label: "Wednesday", value: "3" },
	{ label: "Thursday", value: "4" },
	{ label: "Friday", value: "5" },
	{ label: "Saturday", value: "6" },
	{ label: "Sunday", value: "7" },
];

export const WeeklyGoalForm = ({
	goal,
	goalId,
	categoryId,
	onSuccess,
}: WeeklyGoalFormProps) => {
	const { mutate: createGoalMutation } = useCreateGoal();
	const { mutate: updateGoalMutation } = useUpdateGoal();
	const [amountInput, setAmountInput] = useState(goal ? String(goal.amount / 100) : "");

	const form = useForm({
		defaultValues: goal
			? { ...goal, amount: goal.amount / 100 }
			: ({
					goal_type_id: 1,
					amount: 0,
					repeat_day_week: 1,
				} as CreateGoalInput),
		validators: {
			onSubmit: GoalFormSchema,
		},
		onSubmit: (e) => {
			const data = {
				...e.value,
				repeat_day_month: undefined,
				repeat_date_year: undefined,
				amount: Math.round(e.value.amount * 100),
			};
			const options = { onSuccess };

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
			id="weekly-goal-form"
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
					const errorMessage =
						typeof error === "string"
							? error
							: (error as { message?: string } | undefined)?.message;
					return (
						<div>
							<label htmlFor={field.name} className="text-sm font-medium">
								I need
							</label>
							<Input
								id={field.name}
								name={field.name}
								type="text"
								inputMode="decimal"
								min="0"
								step="0.01"
								value={amountInput}
								onBlur={field.handleBlur}
								onChange={(e) => {
									const nextValue = e.target.value;
									setAmountInput(nextValue);
									if (!nextValue.trim()) {
										field.handleChange(0);
										return;
									}
									const parsed = Number.parseFloat(nextValue);
									if (Number.isFinite(parsed)) {
										field.handleChange(parsed);
									}
								}}
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
			<form.Field name="repeat_day_week">
				{(field) => {
					const error = field.state.meta.errors[0];
					const errorMessage =
						typeof error === "string"
							? error
							: (error as { message?: string } | undefined)?.message;
					return (
						<div>
							<label
								htmlFor="weekly-goal-form-select-day"
								className="text-sm font-medium"
							>
								On
							</label>
							<Select
								name={field.name}
								value={String(field.state.value)}
								onValueChange={(val) => field.handleChange(Number(val))}
							>
								<SelectTrigger id="weekly-goal-form-select-day">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									{weekDays.map((day) => (
										<SelectItem key={day.value} value={day.value}>
											{day.label}
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
					const errorMessage =
						typeof error === "string"
							? error
							: (error as { message?: string } | undefined)?.message;
					return (
						<div>
							<label
								htmlFor="weekly-goal-form-select-goal-type"
								className="text-sm font-medium"
							>
								Goal type
							</label>
							<Select
								name={field.name}
								value={String(field.state.value)}
								onValueChange={(val) => field.handleChange(Number(val))}
							>
								<SelectTrigger id="weekly-goal-form-select-goal-type">
									<SelectValue placeholder="Select" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem key={1} value="1">
										Set aside another{" "}
										{Intl.NumberFormat("en-AU", {
											style: "currency",
											currency: "AUD",
										}).format(form.getFieldValue("amount") ?? 0)}
										/week
									</SelectItem>
									<SelectItem key={2} value="2">
										Refull upto{" "}
										{Intl.NumberFormat("en-AU", {
											style: "currency",
											currency: "AUD",
										}).format(form.getFieldValue("amount") ?? 0)}
										/week
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
