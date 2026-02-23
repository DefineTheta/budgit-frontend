import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message";
import { authClient } from "@/lib/auth-client";

const resetPasswordSearchSchema = z.object({
	token: z.string().optional().catch(""),
});

const resetPasswordFormSchema = z
	.object({
		password: z
			.string()
			.min(1, "Password is required")
			.min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(1, "Confirm password is required"),
	})
	.refine((data) => data.password === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match",
	});

export const Route = createFileRoute("/_public/reset-password")({
	validateSearch: resetPasswordSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);

			const parsed = resetPasswordFormSchema.safeParse(value);
			if (!parsed.success) {
				setSubmitError(
					parsed.error.issues[0]?.message ?? "Please review your input and try again.",
				);
				return;
			}

			try {
				const { error } = await authClient.resetPassword({
					newPassword: value.password.trim(),
					token: search.token || undefined,
				});

				if (error) {
					setSubmitError(getAuthErrorMessage(error));
					return;
				}

				await router.navigate({ to: "/login" });
			} catch (error: unknown) {
				setSubmitError(getAuthErrorMessage(error));
			}
		},
	});

	return (
		<Card className="w-full border-violet-200/70 bg-white/90 shadow-xl shadow-violet-950/10 backdrop-blur-sm">
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-2xl tracking-tight">Reset password</CardTitle>
				<CardDescription>
					Choose a strong new password to keep your account secure.
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-1 pb-7">
				<form
					className="space-y-5"
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
				>
					<form.Field
						name="password"
						validators={{
							onChange: ({ value }) => {
								const result = resetPasswordFormSchema.shape.password.safeParse(value);
								if (!result.success) {
									return result.error.issues[0]?.message;
								}
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>New password</Label>
								<form.Subscribe selector={(state) => state.isSubmitting}>
									{(isSubmitting) => (
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												setSubmitError(null);
												field.handleChange(event.target.value);
											}}
											disabled={isSubmitting}
										/>
									)}
								</form.Subscribe>
								{field.state.meta.isTouched && field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								) : null}
							</div>
						)}
					</form.Field>

					<form.Field
						name="confirmPassword"
						validators={{
							onChange: ({ value }) => {
								const fieldResult =
									resetPasswordFormSchema.shape.confirmPassword.safeParse(value);
								if (!fieldResult.success) {
									return fieldResult.error.issues[0]?.message;
								}

								const schemaResult = resetPasswordFormSchema.safeParse({
									password: form.getFieldValue("password"),
									confirmPassword: value,
								});

								if (!schemaResult.success) {
									const confirmIssue = schemaResult.error.issues.find(
										(issue) => issue.path[0] === "confirmPassword",
									);
									return confirmIssue?.message;
								}
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>Confirm new password</Label>
								<form.Subscribe selector={(state) => state.isSubmitting}>
									{(isSubmitting) => (
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => {
												setSubmitError(null);
												field.handleChange(event.target.value);
											}}
											disabled={isSubmitting}
										/>
									)}
								</form.Subscribe>
								{field.state.meta.isTouched && field.state.meta.errors[0] ? (
									<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
								) : null}
							</div>
						)}
					</form.Field>

					{submitError ? (
						<Alert variant="destructive">
							<AlertDescription>{submitError}</AlertDescription>
						</Alert>
					) : null}

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<div className="pt-1">
								<Button className="w-full" type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Resetting password..." : "Reset Password"}
								</Button>
							</div>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
