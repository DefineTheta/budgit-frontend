import { format } from "date-fns";
import { AlertTriangle, Calendar } from "lucide-react";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { MonthPicker } from "@/components/ui/monthpicker";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type StepTwoReviewProps = {
	extractedText: string;
	referenceMonth: Date | undefined;
	error: string | null;
	onTextChange: (value: string) => void;
	onMonthSelect: (date: Date) => void;
	onBack: () => void;
	onAnalyze: () => void;
	isAnalyzing: boolean;
};

export const AddTransactionsFromFileStepTwo = ({
	extractedText,
	referenceMonth,
	error,
	onTextChange,
	onMonthSelect,
	onBack,
	onAnalyze,
	isAnalyzing,
}: StepTwoReviewProps) => {
	const [pickerOpen, setPickerOpen] = useState(false);

	return (
		<>
			<div className="space-y-3">
				<Alert className="mb-6 border-red-200 bg-red-50 text-red-900">
					<AlertTriangle className="stroke-red-900 h-5 w-5" />
					<AlertTitle className="text-base font-semibold">Privacy notice</AlertTitle>
					<AlertDescription>
						The text below will be sent to an external LLM for analysis. Review it
						carefully and remove any personal or sensitive information before continuing.
					</AlertDescription>
				</Alert>
				{error && <p className="text-sm text-destructive">{error}</p>}
				<Textarea
					value={extractedText}
					onChange={(event) => onTextChange(event.target.value)}
					className="min-h-[220px] resize-y"
					placeholder="Extracted text will appear here."
				/>
				<div className="space-y-2">
					<p className="text-sm font-medium">Statement month</p>
					<Popover open={pickerOpen} onOpenChange={setPickerOpen}>
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
								onMonthSelect={(date) => {
									onMonthSelect(date);
									setPickerOpen(false);
								}}
							/>
						</PopoverContent>
					</Popover>
					<p className="text-xs text-muted-foreground">
						We use this month as the statement reference date
					</p>
				</div>
			</div>

			<DialogFooter>
				<Button type="button" variant="secondary" onClick={onBack}>
					Back
				</Button>
				<Button
					type="button"
					onClick={onAnalyze}
					disabled={!extractedText.trim() || isAnalyzing}
				>
					{isAnalyzing ? "Analyzing..." : "Analyze"}
				</Button>
			</DialogFooter>
		</>
	);
};
