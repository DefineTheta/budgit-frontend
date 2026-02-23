import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "@tanstack/react-router";

const otpFormSchema = z.object({
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	code: z.string().min(1, "Code is required"),
});

type OtpLoginFormProps = {
	onBackToPassword: () => void;
	onCodeRequested: (email: string) => void;
};

export function OtpLoginForm({ onBackToPassword, onCodeRequested }: OtpLoginFormProps) {
	const router = useRouter();

	const [isCodeStep, setIsCodeStep] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const form = useForm({
		defaultValues: {
			email: "",
			code: "",
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);

			try {
				if (!isCodeStep) {
					const { error } = await authClient.emailOtp.sendVerificationOtp({
						email: value.email.trim(),
						type: "sign-in",
					});

					if (error) {
						setSubmitError(getAuthErrorMessage(error));
						return;
					}

					onCodeRequested(value.email);
					setIsCodeStep(true);
					return;
				}

				const { error } = await authClient.signIn.emailOtp({
					email: value.email.trim(),
					otp: value.code.trim(),
				});

				if (error) {
					setSubmitError(getAuthErrorMessage(error));
					return;
				}

				await router.navigate({ to: "/" });
			} catch (err: unknown) {
				setSubmitError(getAuthErrorMessage(err));
			}
		},
	});

	return (
		<form
			className="space-y-5"
			onSubmit={(event) => {
				event.preventDefault();
				event.stopPropagation();
				form.handleSubmit();
			}}
		>
			{!isCodeStep ? (
				<form.Field
					name="email"
					validators={{
						onChange: ({ value }) => {
							const result = otpFormSchema.shape.email.safeParse(value);
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
								<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
							) : null}
						</div>
					)}
				</form.Field>
			) : null}

			{isCodeStep ? (
				<form.Field
					name="code"
					validators={{
						onChange: ({ value }) => {
							const result = otpFormSchema.shape.code.safeParse(value);
							if (!result.success) {
								return result.error.issues[0]?.message;
							}
						},
					}}
				>
					{(field) => (
						<div className="flex flex-col space-y-3">
							<Label htmlFor={field.name}>Email Code</Label>
							<form.Subscribe selector={(state) => state.isSubmitting}>
								{(isSubmitting) => (
									<InputOTP
										id={field.name}
										maxLength={6}
										autoComplete="one-time-code"
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(nextValue) => {
											setSubmitError(null);
											field.handleChange(nextValue);
										}}
										disabled={isSubmitting}
									>
										<InputOTPGroup>
											<InputOTPSlot index={0} className="h-13 w-14 text-xl" />
											<InputOTPSlot index={1} className="h-13 w-14 text-xl" />
											<InputOTPSlot index={2} className="h-13 w-14 text-xl" />
											<InputOTPSlot index={3} className="h-13 w-14 text-xl" />
											<InputOTPSlot index={4} className="h-13 w-14 text-xl" />
											<InputOTPSlot index={5} className="h-13 w-14 text-xl" />
										</InputOTPGroup>
									</InputOTP>
								)}
							</form.Subscribe>
							{field.state.meta.isTouched && field.state.meta.errors[0] ? (
								<p className="text-sm text-destructive">{field.state.meta.errors[0]}</p>
							) : null}
						</div>
					)}
				</form.Field>
			) : null}

			{submitError ? (
				<Alert variant="destructive">
					<AlertDescription>{submitError}</AlertDescription>
				</Alert>
			) : null}

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<div className="pt-1 flex flex-col space-y-3">
						<Button className="w-full" type="submit" disabled={isSubmitting}>
							{isCodeStep ? "Login with code" : "Email me a login code"}
						</Button>
						<Button
							className="w-full"
							variant="outline"
							type="button"
							onClick={onBackToPassword}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
