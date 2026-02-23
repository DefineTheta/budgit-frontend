import { useForm } from "@tanstack/react-form";
import { Link, useRouter } from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import z from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { getAuthErrorMessage } from "@/features/auth/utils/get-auth-error-message";
import { authClient } from "@/lib/auth-client";

const loginFormSchema = z.object({
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});

type EmailPasswordFormProps = {
	onUseLoginCode: () => void;
};

export function EmailPasswordForm({ onUseLoginCode }: EmailPasswordFormProps) {
	const router = useRouter();
	const [submitError, setSubmitError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			setSubmitError(null);

			try {
				const { error } = await authClient.signIn.email({
					email: value.email.trim(),
					password: value.password.trim(),
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
			<form.Field
				name="email"
				validators={{
					onChange: ({ value }) => {
						const result = loginFormSchema.shape.email.safeParse(value);
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

			<form.Field
				name="password"
				validators={{
					onChange: ({ value }) => {
						const result = loginFormSchema.shape.password.safeParse(value);
						if (!result.success) {
							return result.error.issues[0]?.message;
						}
					},
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label htmlFor={field.name}>Password</Label>
						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<div className="relative">
									<Input
										id={field.name}
										type={showPassword ? "text" : "password"}
										value={field.state.value}
										onBlur={field.handleBlur}
										onChange={(event) => {
											setSubmitError(null);
											field.handleChange(event.target.value);
										}}
										disabled={isSubmitting}
										className="pr-10"
									/>
									<button
										type="button"
										onClick={() => setShowPassword((current) => !current)}
										disabled={isSubmitting}
										className="absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground transition-colors cursor-pointer hover:text-foreground disabled:cursor-not-allowed"
										aria-label={showPassword ? "Hide password" : "Show password"}
									>
										{showPassword ? (
											<EyeOff className="h-4 w-4" />
										) : (
											<Eye className="h-4 w-4" />
										)}
									</button>
								</div>
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
					<Button
						asChild
						className={`h-auto px-0 pt-1 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
						variant="link"
					>
						<a href="/forgot-password" aria-disabled={isSubmitting}>
							Forgot password?
						</a>
					</Button>
				)}
			</form.Subscribe>

			<form.Subscribe selector={(state) => state.isSubmitting}>
				{(isSubmitting) => (
					<div className="space-y-3 pt-1">
						<Button className="w-full" type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Logging in..." : "Login"}
						</Button>
						<Button
							className="w-full"
							variant="secondary"
							type="button"
							onClick={onUseLoginCode}
							disabled={isSubmitting}
						>
							Email me a login code
						</Button>
						<div className="flex items-center gap-3">
							<Separator className="flex-1" />
							<span className="text-xs text-muted-foreground uppercase">or</span>
							<Separator className="flex-1" />
						</div>
						<Button
							asChild
							className={`w-full ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
							variant="outline"
						>
							<Link to="/signup" aria-disabled={isSubmitting}>
								Sign up
							</Link>
						</Button>
					</div>
				)}
			</form.Subscribe>
		</form>
	);
}
