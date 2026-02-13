const currency = new Intl.NumberFormat("en-AU", {
	style: "currency",
	currency: "AUD",
});

export const formatCurrency = (amountInCents: number) => {
	return currency.format(amountInCents / 100);
};
