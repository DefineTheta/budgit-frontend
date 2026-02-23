import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
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

const forgotPasswordSchema = z.object({
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
});

export const Route = createFileRoute("/_public/forgot-password")({
	component: RouteComponent,
});

function RouteComponent() {
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [requestedEmail, setRequestedEmail] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);

			try {
				const email = value.email.trim();
				const { error } = await authClient.requestPasswordReset({
					email,
				});

				if (error) {
					setSubmitError(getAuthErrorMessage(error));
					return;
				}

				setRequestedEmail(email);
			} catch (error: unknown) {
				setSubmitError(getAuthErrorMessage(error));
			}
		},
	});

	return (
		<Card className="w-full border-violet-200/70 bg-white/90 shadow-xl shadow-violet-950/10 backdrop-blur-sm">
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-2xl tracking-tight">Forgot password</CardTitle>
				<CardDescription>
					{requestedEmail
						? "If an account matches this email, reset instructions will arrive shortly."
						: "Enter your email and we will send a secure reset link right away."}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-1 pb-7">
				{requestedEmail ? (
					<div className="space-y-5">
						<Alert>
							<AlertDescription>
								If an account exists for{" "}
								<span className="font-semibold">{requestedEmail}</span>, you will receive
								a password reset email shortly. For security, we show this message for
								every request.
							</AlertDescription>
						</Alert>
						<Button asChild className="w-full" variant="outline">
							<Link to="/login">Back to login</Link>
						</Button>
					</div>
				) : (
					<form
						className="space-y-5"
						onSubmit={(event) => {
							event.preventDefault();
							event.stopPropagation();
							form.handleSubmit();
						}}
					>
						<form.Field
							name="email"
							validators={{
								onChange: ({ value }) => {
									const result = forgotPasswordSchema.shape.email.safeParse(value);
									if (!result.success) {
										return result.error.issues[0]?.message;
									}
								},
							}}
						>
							{(field) => (
								<div className="space-y-2">
									<Label htmlFor={field.name}>Email</Label>
									<form.Subscribe selector={(state) => state.isSubmitting}>
										{(isSubmitting) => (
											<Input
												id={field.name}
												type="email"
												placeholder="you@example.com"
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
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
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
								<div className="space-y-3 pt-1">
									<Button className="w-full" type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Sending reset link..." : "Send reset link"}
									</Button>
									<Button
										asChild
										className="w-full"
										variant="outline"
										disabled={isSubmitting}
									>
										<Link to="/login" aria-disabled={isSubmitting}>
											Back to login
										</Link>
									</Button>
								</div>
							)}
						</form.Subscribe>
					</form>
				)}
			</CardContent>
		</Card>
	);
}
