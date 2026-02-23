import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import z from "zod";
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
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

const signupFormSchema = z
	.object({
		email: z.string().min(1, "Email is required").email("Enter a valid email"),
		firstName: z.string().min(1, "First name is required"),
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

export const Route = createFileRoute("/_public/signup")({
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();

	const form = useForm({
		defaultValues: {
			email: "",
			firstName: "",
			password: "",
			confirmPassword: "",
		},
		onSubmit: async ({ value }) => {
			const parsed = signupFormSchema.safeParse(value);
			if (!parsed.success) {
				console.error(parsed.error.flatten());
				return;
			}

			try {
				const { error } = await authClient.signUp.email({
					email: value.email,
					password: value.password,
					name: value.firstName,
				});

				if (error) {
					console.error("Error signing up");
				}

				await router.navigate({ to: "/budget" });
			} catch (err: unknown) {
				console.error(err);
			}
		},
	});

	return (
		<Card className="w-full border-violet-200/70 bg-white/90 shadow-xl shadow-violet-950/10 backdrop-blur-sm">
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-2xl tracking-tight">Create your account</CardTitle>
				<CardDescription>
					Get started in minutes and bring structure to every dollar.
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
						name="email"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.email.safeParse(value);
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
											onChange={(event) => field.handleChange(event.target.value)}
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
						name="firstName"
						validators={{
							onChange: ({ value }) => {
								const result = signupFormSchema.shape.firstName.safeParse(value);
								if (!result.success) {
									return result.error.issues[0]?.message;
								}
							},
						}}
					>
						{(field) => (
							<div className="space-y-2">
								<Label htmlFor={field.name}>First name</Label>
								<form.Subscribe selector={(state) => state.isSubmitting}>
									{(isSubmitting) => (
										<Input
											id={field.name}
											type="text"
											placeholder="Jane"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
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
								const result = signupFormSchema.shape.password.safeParse(value);
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
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
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
									signupFormSchema.shape.confirmPassword.safeParse(value);
								if (!fieldResult.success) {
									return fieldResult.error.issues[0]?.message;
								}

								const schemaResult = signupFormSchema.safeParse({
									email: form.getFieldValue("email"),
									firstName: form.getFieldValue("firstName"),
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
								<Label htmlFor={field.name}>Confirm password</Label>
								<form.Subscribe selector={(state) => state.isSubmitting}>
									{(isSubmitting) => (
										<Input
											id={field.name}
											type="password"
											value={field.state.value}
											onBlur={field.handleBlur}
											onChange={(event) => field.handleChange(event.target.value)}
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

					<form.Subscribe selector={(state) => state.isSubmitting}>
						{(isSubmitting) => (
							<div className="space-y-3 pt-1">
								<Button className="w-full" type="submit" disabled={isSubmitting}>
									{isSubmitting ? "Creating account..." : "Sign up"}
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
									<a href="/login" aria-disabled={isSubmitting}>
										Login
									</a>
								</Button>
							</div>
						)}
					</form.Subscribe>
				</form>
			</CardContent>
		</Card>
	);
}
