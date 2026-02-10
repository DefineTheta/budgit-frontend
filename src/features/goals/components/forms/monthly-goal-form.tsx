import { useForm } from "@tanstack/react-form";
import { CreateGoalSchema, type CreateGoalInput } from "@/features/goals/config/schemas";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateGoal } from "../../api/create-goal";
import { useUpdateGoal } from "../../api/update-goal";
import type { MutationOptions } from "@tanstack/react-query";

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
	const { mutate: createGoalMutation, isPending: isCreatingGoal } = useCreateGoal();
	const { mutate: updateGoalMutation, isPending: isUpdatingGoal } = useUpdateGoal();

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
				form.handleSubmit();
			}}
		>
			<FieldGroup className="flex flex-col -space-y-3">
				<form.Field
					name="amount"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>I want to save</FieldLabel>
								<Input
									id={field.name}
									name={field.name}
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(parseFloat(e.target.value) || 0)}
									aria-invalid={isInvalid}
									autoComplete="off"
								/>
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="repeat_day_month"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>By</FieldLabel>
								<Select
									name={field.name}
									value={String(field.state.value)}
									onValueChange={(val) => field.handleChange(Number(val))}
								>
									<SelectTrigger
										id="monthly-goal-form-select-day"
										aria-invalid={isInvalid}
									>
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
				<form.Field
					name="goal_type_id"
					children={(field) => {
						const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;
						return (
							<Field data-invalid={isInvalid}>
								<FieldLabel htmlFor={field.name}>Next month I want to</FieldLabel>
								<Select
									name={field.name}
									value={String(field.state.value)}
									onValueChange={(val) => field.handleChange(Number(val))}
								>
									<SelectTrigger
										id="monthly-goal-form-select-goal-type"
										aria-invalid={isInvalid}
									>
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
								{isInvalid && <FieldError errors={field.state.meta.errors} />}
							</Field>
						);
					}}
				/>
			</FieldGroup>
		</form>
	);
};
