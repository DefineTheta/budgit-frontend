const DEFAULT_ERROR_MESSAGE = "Something went wrong. Please try again.";

const FRIENDLY_ERROR_MESSAGES: Record<string, string> = {
	invalid_credentials: "The email or password you entered is incorrect.",
	invalid_email_or_password: "The email or password you entered is incorrect.",
	email_not_verified: "Please verify your email before signing in.",
	invalid_otp: "That code is not valid. Please check it and try again.",
	invalid_code: "That code is not valid. Please check it and try again.",
	otp_expired: "That code has expired. Request a new one and try again.",
	code_expired: "That code has expired. Request a new one and try again.",
	too_many_requests: "Too many attempts. Please wait a moment and try again.",
	rate_limit_exceeded: "Too many attempts. Please wait a moment and try again.",
	user_not_found: "We couldn't find an account for that email.",
};

function toSnakeCase(value: string): string {
	return value
		.trim()
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "_")
		.replace(/^_+|_+$/g, "");
}

function pickStringErrorField(error: unknown, key: string): string | null {
	if (typeof error !== "object" || error === null) {
		return null;
	}

	const value = Reflect.get(error, key);
	if (typeof value !== "string") {
		return null;
	}

	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

function getFriendlyMessageByCode(code: string | null): string | null {
	if (!code) {
		return null;
	}

	const normalized = toSnakeCase(code);
	return FRIENDLY_ERROR_MESSAGES[normalized] ?? null;
}

function getFriendlyMessageByMessage(message: string | null): string | null {
	if (!message) {
		return null;
	}

	const normalized = toSnakeCase(message);

	if (normalized.includes("invalid") && normalized.includes("credential")) {
		return FRIENDLY_ERROR_MESSAGES.invalid_credentials;
	}

	if (normalized.includes("invalid") && (normalized.includes("otp") || normalized.includes("code"))) {
		return FRIENDLY_ERROR_MESSAGES.invalid_otp;
	}

	if (normalized.includes("expired") && (normalized.includes("otp") || normalized.includes("code"))) {
		return FRIENDLY_ERROR_MESSAGES.otp_expired;
	}

	if (normalized.includes("too_many") || normalized.includes("rate_limit")) {
		return FRIENDLY_ERROR_MESSAGES.too_many_requests;
	}

	if (normalized.includes("not_verified")) {
		return FRIENDLY_ERROR_MESSAGES.email_not_verified;
	}

	if (normalized.includes("user") && normalized.includes("not_found")) {
		return FRIENDLY_ERROR_MESSAGES.user_not_found;
	}

	return null;
}

export function getAuthErrorMessage(error: unknown): string {
	if (!error) {
		return DEFAULT_ERROR_MESSAGE;
	}

	if (typeof error === "string") {
		return getFriendlyMessageByMessage(error) ?? error;
	}

	if (error instanceof Error) {
		return getFriendlyMessageByMessage(error.message) ?? error.message;
	}

	const code = pickStringErrorField(error, "code") ?? pickStringErrorField(error, "error");
	const message = pickStringErrorField(error, "message");

	return (
		getFriendlyMessageByCode(code) ??
		getFriendlyMessageByMessage(message) ??
		message ??
		DEFAULT_ERROR_MESSAGE
	);
}
