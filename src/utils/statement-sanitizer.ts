export const sanitizeStatement = (fullText: string): string => {
	// Split into lines for processing
	const lines = fullText.split("\n");

	console.log(lines);

	// STEP 1: THE HEADER CROP (The big chop)
	// We look for the "Anchor Line" that starts the transaction table.
	// Most banks use some variation of these words in a single line.
	const headerRegex = /(date|trans|details|description).*(amount|debit|credit|payment)/i;

	const headerIndex = lines.findIndex((line) => headerRegex.test(line));

	// If found, discard everything before it (This kills 99% of Name/Address/Account#)
	// If not found (OCR fail?), keep the bottom 70% of the doc as a fallback.
	let contentLines =
		headerIndex !== -1
			? lines.slice(headerIndex)
			: lines.slice(Math.floor(lines.length * 0.3));

	// STEP 2: THE KEYWORD PURGE (Save tokens)
	// Remove lines that are obviously not transactions
	const junkRegex =
		/page \d|opening balance|closing balance|total for this period|interest charged/i;
	contentLines = contentLines.filter((line) => !junkRegex.test(line));

	// Join back to string for PII scrubbing
	let text = contentLines.join("\n");

	// STEP 3: THE AGGRESSIVE SCRUB (Redact specific patterns)

	// Credit Cards / Account Numbers (12-19 digits)
	// We use \b boundary to avoid matching timestamps or small amounts
	text = text.replace(/\b\d{4}[ -]?\d{4}[ -]?\d{4}[ -]?\d{1,4}\b/g, "[REDACTED_CARD]");

	// Phone Numbers (International & US)
	text = text.replace(
		/(\+\d{1,2}\s?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/g,
		"[REDACTED_PHONE]",
	);

	// Emails
	text = text.replace(
		/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
		"[REDACTED_EMAIL]",
	);

	// SSN / Tax IDs (3-2-4 format)
	text = text.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED_SSN]");

	return text;
};
