import { endOfMonth } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCategories } from "@/features/categories/api/get-categories";
import { useGetPayees } from "@/features/payees/api/get-payees";
import { useCreateBatchTransactions } from "@/features/transactions/api/create-batch-transactions";
import { useImportTransactions } from "@/features/transactions/api/import-transactions";
import { AddTransactionsFromFileStepOne } from "@/features/transactions/components/add-transactions-from-file-step-one";
import { AddTransactionsFromFileStepThree } from "@/features/transactions/components/add-transactions-from-file-step-three";
import { AddTransactionsFromFileStepTwo } from "@/features/transactions/components/add-transactions-from-file-step-two";
import type {
	EditableDraft,
	EditableField,
} from "@/features/transactions/components/add-transactions-from-file-types";
import { cn } from "@/lib/utils";
import { extractTextFromPDF } from "@/utils/extract-pdf-text";
import { sanitizeStatement } from "@/utils/statement-sanitizer";

interface AddTransactionsFromFileModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	accountId: string;
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
	const [referenceMonth, setReferenceMonth] = useState<Date | undefined>(undefined);
	const [drafts, setDrafts] = useState<EditableDraft[]>([]);
	const [editingCell, setEditingCell] = useState<{
		id: string;
		field: EditableField;
	} | null>(null);
	const [selectedDraftIds, setSelectedDraftIds] = useState<string[]>([]);
	const [bulkPayeeId, setBulkPayeeId] = useState("");
	const [bulkCategoryId, setBulkCategoryId] = useState("");
	const [addError, setAddError] = useState<string | null>(null);
	const { mutateAsync: importTransactions, isPending: isAnalyzing } =
		useImportTransactions();
	const { mutateAsync: _createBatchTransactions, isPending: isCreatingBatch } =
		useCreateBatchTransactions();
	const categoriesQuery = useCategories();
	const payeesQuery = useGetPayees();

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
		setReferenceMonth(undefined);
		setDrafts([]);
		setEditingCell(null);
		setSelectedDraftIds([]);
		setBulkPayeeId("");
		setBulkCategoryId("");
		setAddError(null);
	};

	const findCategoryId = useCallback(
		(name: string) =>
			categoriesQuery.data?.find(
				(category) => category.name.toLowerCase() === name.toLowerCase(),
			)?.id ?? "",
		[categoriesQuery.data],
	);

	const findPayeeId = useCallback(
		(name: string) =>
			payeesQuery.data?.find((payee) => payee.name.toLowerCase() === name.toLowerCase())
				?.id ?? "",
		[payeesQuery.data],
	);

	const updateDraft = (id: string, updates: Partial<EditableDraft>) => {
		setDrafts((prev) =>
			prev.map((draft) => (draft.id === id ? { ...draft, ...updates } : draft)),
		);
	};

	const toggleDraftSelection = (id: string, checked: boolean) => {
		setSelectedDraftIds((prev) =>
			checked ? [...prev, id] : prev.filter((draftId) => draftId !== id),
		);
	};

	const toggleAllDrafts = (checked: boolean) => {
		setSelectedDraftIds(checked ? drafts.map((draft) => draft.id) : []);
	};

	const applyBulkPayee = (value: string) => {
		setBulkPayeeId(value);
		setDrafts((prev) =>
			prev.map((draft) =>
				selectedDraftIds.includes(draft.id) ? { ...draft, payeeId: value } : draft,
			),
		);
		setAddError(null);
	};

	const applyBulkCategory = (value: string) => {
		setBulkCategoryId(value);
		setDrafts((prev) =>
			prev.map((draft) =>
				selectedDraftIds.includes(draft.id) ? { ...draft, categoryId: value } : draft,
			),
		);
		setAddError(null);
	};

	const payeeMap = useMemo(() => {
		return new Map(payeesQuery.data?.map((payee) => [payee.id, payee.name]) ?? []);
	}, [payeesQuery.data]);

	const categoryMap = useMemo(() => {
		return new Map(
			categoriesQuery.data?.map((category) => [category.id, category.name]) ?? [],
		);
	}, [categoriesQuery.data]);

	useEffect(() => {
		if (!categoriesQuery.data && !payeesQuery.data) return;
		setDrafts((prev) =>
			prev.map((draft) => {
				const nextDraft = { ...draft };
				if (!nextDraft.categoryId && nextDraft.categoryName && categoriesQuery.data) {
					nextDraft.categoryId = findCategoryId(nextDraft.categoryName);
				}
				if (!nextDraft.payeeId && nextDraft.payeeName && payeesQuery.data) {
					nextDraft.payeeId = findPayeeId(nextDraft.payeeName);
				}
				return nextDraft;
			}),
		);
	}, [categoriesQuery.data, findCategoryId, findPayeeId, payeesQuery.data]);

	useEffect(() => {
		setSelectedDraftIds((prev) =>
			prev.filter((id) => drafts.some((draft) => draft.id === id)),
		);
	}, [drafts]);

	useEffect(() => {
		setSelectedDraftIds((prev) =>
			prev.filter((id) => drafts.some((draft) => draft.id === id)),
		);
	}, [drafts]);

	const formatCurrency = (amount: number) => {
		return new Intl.NumberFormat("en-AU", {
			style: "currency",
			currency: "AUD",
		}).format(amount);
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
			setDrafts(
				result.map((draft, index) => ({
					id: `${draft.date}-${draft.merchant}-${index}`,
					date: draft.date,
					payeeId: findPayeeId(draft.merchant),
					payeeName: draft.merchant,
					categoryId: findCategoryId(draft.category),
					categoryName: draft.category,
					amount: draft.amount,
					confidence: draft.confidence,
				})),
			);
			setSelectedDraftIds([]);
			setAddError(null);
			setStep(3);
		} catch (submitError) {
			console.error("Failed to analyze transactions:", submitError);
			setError("We couldn't analyze that text. Please try again.");
		}
	};

	const fileSizeLabel = file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : null;
	const allReady =
		drafts.length > 0 && drafts.every((draft) => draft.payeeId && draft.categoryId);
	const addTooltipMessage = !drafts.length
		? "No transactions to add."
		: "Assign a payee and category for every transaction.";

	const handleAddTransactions = async () => {
		const hasMissingAssignments = drafts.some(
			(draft) => !draft.payeeId || !draft.categoryId,
		);
		if (hasMissingAssignments) {
			setAddError("All transactions need an assigned payee and category.");
			return;
		}
		setAddError(null);
		try {
			// await createBatchTransactions({
			// 	data: drafts.map((draft) => ({
			// 		account_id: accountId,
			// 		category_id: draft.categoryId,
			// 		payee_id: draft.payeeId,
			// 		date: new Date(draft.date),
			// 		memo: null,
			// 		inflow: 0,
			// 		outflow: Math.round(draft.amount * 100),
			// 	})),
			// });
			onOpenChange(false);
		} catch (submitError) {
			console.error("Failed to create transactions:", submitError);
			setAddError("We couldn't add the transactions. Please try again.");
		}
	};

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
			<DialogContent className={cn(step === 3 ? "sm:max-w-[980px]" : "sm:max-w-[520px]")}>
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
						<AddTransactionsFromFileStepOne
							file={file}
							fileSizeLabel={fileSizeLabel}
							isDragging={isDragging}
							isExtracting={isExtracting}
							error={error}
							onFileChange={handleFile}
							onDrop={handleDrop}
							onDragOver={(event) => {
								event.preventDefault();
								setIsDragging(true);
							}}
							onDragLeave={() => setIsDragging(false)}
							onRemoveFile={() => setFile(null)}
							onCancel={() => onOpenChange(false)}
						/>
					) : step === 2 ? (
						<AddTransactionsFromFileStepTwo
							extractedText={extractedText}
							referenceMonth={referenceMonth}
							error={error}
							onTextChange={setExtractedText}
							onMonthSelect={setReferenceMonth}
							onBack={() => setStep(1)}
							onAnalyze={handleAnalyze}
							isAnalyzing={isAnalyzing}
						/>
					) : (
						<AddTransactionsFromFileStepThree
							drafts={drafts}
							payeeMap={payeeMap}
							categoryMap={categoryMap}
							editingCell={editingCell}
							selectedIds={selectedDraftIds}
							onToggleRow={toggleDraftSelection}
							onToggleAll={toggleAllDrafts}
							bulkPayeeId={bulkPayeeId}
							bulkCategoryId={bulkCategoryId}
							onBulkPayeeChange={applyBulkPayee}
							onBulkCategoryChange={applyBulkCategory}
							canAddTransactions={allReady}
							addTooltipMessage={addTooltipMessage}
							addError={addError}
							onAddTransactions={handleAddTransactions}
							isAddingTransactions={isCreatingBatch}
							onEditCell={setEditingCell}
							onUpdateDraft={updateDraft}
							formatCurrency={formatCurrency}
							onBack={() => setStep(2)}
						/>
					)}
				</form>
			</DialogContent>
		</Dialog>
	);
}
