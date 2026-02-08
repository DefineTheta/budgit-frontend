import z from "zod";

export const AllocationSchema = z.object({
	id: z.uuid(),
	month: z.coerce.date(),
	amount: z.int(),
});

export const createAllocationSchema = z.object({
	month: z.string().regex(/^\d{4}-\d{2}-01$/, "Month must be in YYYY-MM-01 format"),
	amount: z.int(),
});
export const updateAllocationSchema = z.object({
	amount: z.int(),
});

export type Allocation = z.infer<typeof AllocationSchema>;

export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;
export type UpdateAllocationInput = z.infer<typeof updateAllocationSchema>;
