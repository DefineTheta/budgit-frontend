import { useState, useCallback } from "react";
import { Parser } from "expr-eval";

const parser = new Parser();

const formatCurrency = (val: number) =>
	new Intl.NumberFormat("en-AU", { style: "currency", currency: "AUD" }).format(val);

export const useMathInput = (initialValue: number = 0) => {
	const [displayValue, setDisplayValue] = useState<string>(formatCurrency(initialValue));
	const [numericValue, setNumericValue] = useState<number>(initialValue);
	const [error, setError] = useState<string | null>(null);

	const calculate = useCallback(() => {
		try {
			if (!displayValue.trim()) return;

			if (/[^0-9+\-*/().\s]/.test(displayValue)) {
				throw new Error("Invalid characters");
			}

			let result = parser.evaluate(displayValue);

			if (!isFinite(result) || isNaN(result)) {
				throw new Error("Cannot divide by zero");
			}

			result = Math.round(result * 100) / 100;

			setNumericValue(result);
			setDisplayValue(formatCurrency(result));
			setError(null);

			return result;
		} catch (err) {
			setError("Invalid calculation");
		}
	}, [displayValue]);

	const handleChange = (text: string) => {
		const cleanText = text.replace(/[^0-9+\-*/().\s]/g, "");
		setDisplayValue(cleanText);
		setError(null);
	};

	const changeValue = (amount: number) => {
		setDisplayValue(formatCurrency(amount));
		setNumericValue(amount);
	};

	return {
		displayValue,
		numericValue,
		changeValue,
		error,
		handleChange,
		calculate,
	};
};
