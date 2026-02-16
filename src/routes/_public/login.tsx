import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
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

const loginSearchSchema = z.object({
	redirect: z
		.string()
		.optional()
		.refine((val) => !val || val.startsWith("/"), {
			message: "Redirect must be relative",
		})
		.catch("/"),
});

const loginFormSchema = z.object({
	email: z.string().min(1, "Email is required").email("Enter a valid email"),
	password: z
		.string()
		.min(1, "Password is required")
		.min(6, "Password must be at least 6 characters"),
});

export const Route = createFileRoute("/_public/login")({
	validateSearch: loginSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const router = useRouter();
	const search = Route.useSearch();

	const form = useForm({
		defaultValues: {
			email: "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			try {
				const { error } = await authClient.signIn.email({
					email: value.email,
					password: value.password,
				});

				if (error) {
					console.log("error");
					return;
				}

				await router.navigate({ to: "/" });
			} catch (err: unknown) {
				console.error(err);
			}
		},
	});

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<Card className="w-full max-w-sm">
				<CardHeader>
					<CardTitle>Login</CardTitle>
					<CardDescription>Enter your credentials to continue.</CardDescription>
				</CardHeader>
				<CardContent>
					<form
						className="space-y-4"
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
												onChange={(event) => field.handleChange(event.target.value)}
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
										<p className="text-sm text-destructive">
											{field.state.meta.errors[0]}
										</p>
									) : null}
								</div>
							)}
						</form.Field>

						<form.Subscribe selector={(state) => state.isSubmitting}>
							{(isSubmitting) => (
								<Button
									asChild
									className={`h-auto px-0 ${isSubmitting ? "pointer-events-none opacity-50" : ""}`}
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
								<>
									<Button className="w-full" type="submit" disabled={isSubmitting}>
										{isSubmitting ? "Logging in..." : "Login"}
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
								</>
							)}
						</form.Subscribe>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
