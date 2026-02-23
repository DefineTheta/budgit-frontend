import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import z from "zod";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { EmailPasswordForm } from "@/features/auth/components/email-password-form";
import { OtpLoginForm } from "@/features/auth/components/otp-login-form";

const loginSearchSchema = z.object({
	redirect: z
		.string()
		.optional()
		.refine((val) => !val || val.startsWith("/"), {
			message: "Redirect must be relative",
		})
		.catch("/"),
});

export const Route = createFileRoute("/_public/login")({
	validateSearch: loginSearchSchema,
	component: RouteComponent,
});

function RouteComponent() {
	const [useOtpLogin, setUseOtpLogin] = useState(false);
	const [otpEmail, setOtpEmail] = useState<string | null>(null);

	return (
		<Card className="w-full border-violet-200/70 bg-white/90 shadow-xl shadow-violet-950/10 backdrop-blur-sm">
			<CardHeader className="space-y-2 pb-3">
				<CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
				<CardDescription>
					{useOtpLogin ? (
						otpEmail ? (
							<>
								A login code has been sent to{" "}
								<span className="font-semibold underline">{otpEmail}</span>.
							</>
						) : (
							"Use a secure one-time code sent to your email."
						)
					) : (
						"Sign in to continue building smarter budgets and better money habits."
					)}
				</CardDescription>
			</CardHeader>
			<CardContent className="pt-1 pb-7">
				{useOtpLogin ? (
					<OtpLoginForm
						onBackToPassword={() => {
							setUseOtpLogin(false);
							setOtpEmail(null);
						}}
						onCodeRequested={(email: string) => setOtpEmail(email)}
					/>
				) : (
					<EmailPasswordForm
						onUseLoginCode={() => {
							setUseOtpLogin(true);
							setOtpEmail(null);
						}}
					/>
				)}
			</CardContent>
		</Card>
	);
}
