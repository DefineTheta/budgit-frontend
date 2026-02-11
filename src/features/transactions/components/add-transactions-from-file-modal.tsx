import { endOfMonth, format } from "date-fns";
import { AlertTriangle, Calendar, FileText, UploadCloud } from "lucide-react";
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
import { MonthPicker } from "@/components/ui/monthpicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { useImportTransactions } from "@/features/transactions/api/import-transactions";
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
	const [step, setStep] = useState<1 | 2 | 3>(1);
	const [analysisResult, setAnalysisResult] = useState<string | null>(null);
	const [referenceMonth, setReferenceMonth] = useState<Date | undefined>(undefined);
	const { mutateAsync: importTransactions, isPending: isAnalyzing } =
		useImportTransactions();

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
			setAnalysisResult(null);
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
		setAnalysisResult(null);
		setError(null);
		setStep(1);
		setReferenceMonth(undefined);
	};

	const handleAnalyze = async () => {
		if (!extractedText.trim()) {
			setError("Please provide text to analyze.");
			return;
		}
		if (!referenceMonth) {
			setError("Please select a statement month.");
			return;
		}
		setError(null);
		try {
			const referenceDate = endOfMonth(referenceMonth);
			const result = await importTransactions({
				data: {
					text: extractedText,
					reference_date: referenceDate,
				},
			});
			setAnalysisResult(JSON.stringify(result, null, 2));
			setStep(3);
		} catch (submitError) {
			console.error("Failed to analyze transactions:", submitError);
			setError("We couldn't analyze that text. Please try again.");
		}
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
							: step === 2
								? "Review and edit the extracted text for analysis"
								: "Preview the parsed transactions"}
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
					) : step === 2 ? (
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
								{error && <p className="text-sm text-destructive">{error}</p>}
								<Textarea
									value={extractedText}
									onChange={(event) => setExtractedText(event.target.value)}
									className="min-h-[220px] resize-y"
									placeholder="Extracted text will appear here."
								/>
								<div className="space-y-2">
									<p className="text-sm font-medium">Statement month</p>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"w-full justify-start text-left font-normal",
													!referenceMonth && "text-muted-foreground",
												)}
											>
												<Calendar className="mr-2 h-4 w-4" />
												{referenceMonth ? (
													format(referenceMonth, "MMM yyyy")
												) : (
													<span>Select month</span>
												)}
											</Button>
										</PopoverTrigger>
										<PopoverContent className="w-auto p-0" align="start">
											<MonthPicker
												selectedMonth={referenceMonth}
												onMonthSelect={(date) => setReferenceMonth(date)}
											/>
										</PopoverContent>
									</Popover>
									<p className="text-xs text-muted-foreground">
										We use this month as the statement reference date
									</p>
								</div>
							</div>

							<DialogFooter>
								<Button type="button" variant="secondary" onClick={() => setStep(1)}>
									Back
								</Button>
								<Button
									type="button"
									onClick={handleAnalyze}
									disabled={!extractedText.trim() || isAnalyzing}
								>
									{isAnalyzing ? "Analyzing..." : "Analyze"}
								</Button>
							</DialogFooter>
						</>
					) : (
						<>
							<div className="space-y-2">
								<p className="text-sm font-medium">Parsed transactions</p>
								<pre className="max-h-64 overflow-y-auto whitespace-pre-wrap rounded-lg border bg-background p-3 text-xs text-muted-foreground">
									{analysisResult}
								</pre>
							</div>

							<DialogFooter>
								<Button type="button" variant="secondary" onClick={() => setStep(2)}>
									Back
								</Button>
								<Button type="button" onClick={() => onOpenChange(false)}>
									Close
								</Button>
							</DialogFooter>
						</>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
