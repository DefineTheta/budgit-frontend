import { pdfjsLib } from "@/lib/pdf-worker";

export interface PDFExtractResult {
	text: string;
	isScanned: boolean;
}

export const extractTextFromPDF = async (file: File): Promise<PDFExtractResult> => {
	const arrayBuffer = await file.arrayBuffer();

	const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
	const pdf = await loadingTask.promise;

	let fullText = "";
	let totalPages = pdf.numPages;

	for (let i = 1; i <= totalPages; i++) {
		const page = await pdf.getPage(i);
		const textContent = await page.getTextContent();

		let lastY = -1;
		let pageText = "";

		for (const item of textContent.items as any[]) {
			const currentY = item.transform[5];

			if (lastY !== -1 && Math.abs(currentY - lastY) > 5) {
				pageText += "\n";
			} else if (lastY !== -1) {
				pageText += " ";
			}

			pageText += item.str;
			lastY = currentY;
		}

		fullText += pageText + "\n";
	}

	// If less than 30 characters are read then the PDF most likely is an image
	const isScanned = fullText.trim().length < 50;

	return {
		text: fullText,
		isScanned,
	};
};
