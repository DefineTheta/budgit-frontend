import { useForm } from "@tanstack/react-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateAccount } from "../api/create-account";
import { ACCOUNT_TYPE, ACCOUNT_TYPE_LABLES, type AccountType } from "../config/constants";
import { CreateAccountSchema } from "../config/schemas";

interface CreateAccountModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function CreateAccountModal({ open, onOpenChange }: CreateAccountModalProps) {
	const createAccountMutation = useCreateAccount({
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
				form.reset();
			},
		},
	});

	const form = useForm({
		defaultValues: {
			name: "",
			account_type: ACCOUNT_TYPE.CASH as AccountType,
		},
		onSubmit: async ({ value }) => {
			try {
				const validated = CreateAccountSchema.parse(value);
				await createAccountMutation.mutateAsync({ data: validated });
			} catch (error) {
				console.error("Validation error:", error);
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create Account</DialogTitle>
					<DialogDescription>
						Add a new account to track your transactions.
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.Field
						name="name"
						validators={{
							onChange: ({ value }) =>
								!value || value.trim() === "" ? "Account name is required" : undefined,
						}}
					>
						{(field) => (
							<div>
								<label htmlFor="name" className="text-sm font-medium">
									Account Name
								</label>
								<Input
									id="name"
									value={field.state.value}
									onBlur={field.handleBlur}
									onChange={(e) => field.handleChange(e.target.value)}
									placeholder="e.g., Main Checking"
								/>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive mt-1">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<form.Field name="account_type">
						{(field) => (
							<div>
								<label htmlFor="account_type" className="text-sm font-medium">
									Account Type
								</label>
								<Select
									value={field.state.value.toString()}
									onValueChange={(value) =>
										field.handleChange(Number(value) as AccountType)
									}
								>
									<SelectTrigger id="account_type">
										<SelectValue placeholder="Select account type" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={ACCOUNT_TYPE.CASH.toString()}>
											{ACCOUNT_TYPE_LABLES[ACCOUNT_TYPE.CASH]}
										</SelectItem>
										<SelectItem value={ACCOUNT_TYPE.DEBIT.toString()}>
											{ACCOUNT_TYPE_LABLES[ACCOUNT_TYPE.DEBIT]}
										</SelectItem>
										<SelectItem value={ACCOUNT_TYPE.CREDIT.toString()}>
											{ACCOUNT_TYPE_LABLES[ACCOUNT_TYPE.CREDIT]}
										</SelectItem>
									</SelectContent>
								</Select>
								{field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive mt-1">
										{field.state.meta.errors[0]}
									</p>
								)}
							</div>
						)}
					</form.Field>

					<DialogFooter>
						<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
							Cancel
						</Button>
						<Button type="submit" disabled={createAccountMutation.isPending}>
							{createAccountMutation.isPending ? "Creating..." : "Create Account"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
