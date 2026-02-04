import z from "zod";

export const CategorySchema = z.object({
	id: z.uuid(),
	name: z.string(),
});

export const createCategorySchema = z.object({
	name: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
