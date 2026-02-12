import { FileText, UploadCloud } from "lucide-react";
import type { DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type StepOneUploadProps = {
	file: File | null;
	fileSizeLabel: string | null;
	isDragging: boolean;
	isExtracting: boolean;
	error: string | null;
	onFileChange: (file: File | null) => void;
	onDrop: (event: DragEvent<HTMLElement>) => void;
	onDragOver: (event: DragEvent<HTMLElement>) => void;
	onDragLeave: () => void;
	onRemoveFile: () => void;
	onCancel: () => void;
};

export const AddTransactionsFromFileStepOne = ({
	file,
	fileSizeLabel,
	isDragging,
	isExtracting,
	error,
	onFileChange,
	onDrop,
	onDragOver,
	onDragLeave,
	onRemoveFile,
	onCancel,
}: StepOneUploadProps) => (
	<>
		<input
			id="transaction-file-input"
			type="file"
			accept="application/pdf"
			className="sr-only"
			onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
		/>
		<label
			htmlFor="transaction-file-input"
			className={cn(
				"relative flex cursor-pointer flex-col rounded-xl border border-dashed p-6 transition",
				"bg-muted/40 hover:bg-muted/60",
				isDragging && "border-primary bg-primary/5",
				!!error && "border-destructive/60",
			)}
			onDragOver={onDragOver}
			onDragLeave={onDragLeave}
			onDrop={onDrop}
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
				<Button type="button" variant="ghost" onClick={onRemoveFile}>
					Remove
				</Button>
			</div>
		)}

		{error && <p className="text-sm text-destructive">{error}</p>}

		<DialogFooter>
			<Button type="submit" disabled={!file || isExtracting}>
				{isExtracting ? "Extracting..." : "Process file"}
			</Button>
			<Button type="button" variant="secondary" onClick={onCancel}>
				Cancel
			</Button>
		</DialogFooter>
	</>
);
