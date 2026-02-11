import { AlertTriangle, FileText, UploadCloud } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/utils/extract-pdf-text";
import { sanitizeStatement } from "@/utils/statement-sanitizer";

interface AddTransactionsFromFileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function AddTransactionsFromFileModal({
	open,
	onOpenChange,
}: AddTransactionsFromFileModalProps) {
	const [file, setFile] = useState<File | null>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [isExtracting, setIsExtracting] = useState(false);
	const [extractedText, setExtractedText] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [step, setStep] = useState<1 | 2>(1);

	const handleFile = (nextFile: File | null) => {
		if (!nextFile) return;
		if (nextFile.type !== "application/pdf") {
			setError("Please upload a PDF file.");
			return;
		}
		setFile(nextFile);
		setExtractedText("");
		setError(null);
	};

	const handleDrop = (event: React.DragEvent<HTMLElement>) => {
		event.preventDefault();
		setIsDragging(false);
		const droppedFile = event.dataTransfer.files?.[0] ?? null;
		handleFile(droppedFile);
	};

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		event.stopPropagation();
		if (!file) {
			setError("Please select a PDF file to continue.");
			return;
		}
		setIsExtracting(true);
		setError(null);
		try {
			const result = await extractTextFromPDF(file);
			const sanitizedResult = sanitizeStatement(result.text.trim());
			setExtractedText(sanitizedResult || "No text found in PDF.");
			setStep(2);
		} catch (submitError) {
			console.error("Failed to extract text from PDF:", submitError);
			setError("We couldn't read that PDF. Please try a different file.");
		} finally {
			setIsExtracting(false);
		}
	};

	const resetState = () => {
		setFile(null);
		setIsDragging(false);
		setIsExtracting(false);
		setExtractedText("");
		setError(null);
		setStep(1);
	};

	const fileSizeLabel = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : null;

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!nextOpen) {
					resetState();
				}
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-[520px]">
				<DialogHeader>
					<DialogTitle>Add transactions from file</DialogTitle>
					<DialogDescription>
						{step === 1
							? "Upload a PDF statement to extract the transaction text"
							: "Review and edit the extracted text for analysis"}
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-5">
					{step === 1 ? (
						<>
							<input
								id="transaction-file-input"
								type="file"
								accept="application/pdf"
								className="sr-only"
								onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
							/>
							<label
								htmlFor="transaction-file-input"
								className={cn(
									"relative flex cursor-pointer flex-col rounded-xl border border-dashed p-6 transition",
									"bg-muted/40 hover:bg-muted/60",
									isDragging && "border-primary bg-primary/5",
									!!error && "border-destructive/60",
								)}
								onDragOver={(event) => {
									event.preventDefault();
									setIsDragging(true);
								}}
								onDragLeave={() => setIsDragging(false)}
								onDrop={handleDrop}
							>
								<div className="flex flex-col items-center gap-3 text-center">
									<div className="flex h-12 w-12 items-center justify-center rounded-full bg-background shadow-sm">
										<UploadCloud className="h-6 w-6 text-primary" />
									</div>
									<div className="space-y-1">
										<p className="text-sm font-medium">Drag and drop a PDF statement</p>
										<p className="text-xs text-muted-foreground">
											or click to select a file from your computer
										</p>
									</div>
									<span className="inline-flex h-9 items-center rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground shadow-sm">
										Choose file
									</span>
								</div>
							</label>

							{file && (
								<div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2">
									<div className="flex items-center gap-3">
										<FileText className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium">{file.name}</p>
											{fileSizeLabel && (
												<p className="text-xs text-muted-foreground">{fileSizeLabel}</p>
											)}
										</div>
									</div>
									<Button type="button" variant="ghost" onClick={() => setFile(null)}>
										Remove
									</Button>
								</div>
							)}

							{error && <p className="text-sm text-destructive">{error}</p>}

							<DialogFooter>
								<Button type="submit" disabled={!file || isExtracting}>
									{isExtracting ? "Extracting..." : "Process file"}
								</Button>
								<Button
									type="button"
									variant="secondary"
									onClick={() => onOpenChange(false)}
								>
									Cancel
								</Button>
							</DialogFooter>
						</>
					) : (
						<>
							<div className="space-y-3">
								<Alert className="mb-6 border-red-200 bg-red-50 text-red-900">
									<AlertTriangle className="stroke-red-900 w-5 h-5" />
									<AlertTitle className="text-base font-semibold">
										Privacy notice
									</AlertTitle>
									<AlertDescription>
										The text below will be sent to an external LLM for analysis. Review it
										carefully and remove any personal or sensitive information before
										continuing.
									</AlertDescription>
								</Alert>
								<Textarea
									value={extractedText}
									onChange={(event) => setExtractedText(event.target.value)}
									className="min-h-[220px] resize-y"
									placeholder="Extracted text will appear here."
								/>
							</div>

							<DialogFooter>
								<Button type="button" variant="secondary" onClick={() => setStep(1)}>
									Back
								</Button>
								<Button type="button" disabled>
									Analyze
								</Button>
							</DialogFooter>
						</>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
