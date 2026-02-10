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
import { useDeleteAccount } from "../api/delete-account";
import { useUpdateAccount } from "../api/update-account";
import { ACCOUNT_TYPE, ACCOUNT_TYPE_LABLES, type AccountType } from "../config/constants";
import { type Account, UpdateAccountSchema } from "../config/schemas";

interface EditAccountModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	account: Account;
}

export function EditAccountModal({ open, onOpenChange, account }: EditAccountModalProps) {
	const updateAccountMutation = useUpdateAccount({
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	});

	const deleteAccountMutation = useDeleteAccount({
		mutationConfig: {
			onSuccess: () => {
				onOpenChange(false);
			},
		},
	});

	const form = useForm({
		defaultValues: {
			name: account.name,
			account_type: account.account_type as AccountType,
		},
		onSubmit: async ({ value }) => {
			try {
				const validated = UpdateAccountSchema.parse(value);
				await updateAccountMutation.mutateAsync({
					accountId: account.id,
					data: validated,
				});
			} catch (error) {
				console.error("Validation error:", error);
			}
		},
	});

	const handleDelete = async () => {
		if (
			window.confirm(
				`Are you sure you want to delete "${account.name}"? This action cannot be undone.`,
			)
		) {
			await deleteAccountMutation.mutateAsync({ accountId: account.id });
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit Account</DialogTitle>
					<DialogDescription>Update your account information.</DialogDescription>
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

					<DialogFooter className="w-full flex flex-row sm:justify-between">
						<Button
							type="button"
							variant="destructive"
							onClick={handleDelete}
							disabled={deleteAccountMutation.isPending}
						>
							{deleteAccountMutation.isPending ? "Deleting..." : "Delete"}
						</Button>
						<div className="flex gap-2">
							<Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={updateAccountMutation.isPending}>
								{updateAccountMutation.isPending ? "Saving..." : "Save Changes"}
							</Button>
						</div>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
