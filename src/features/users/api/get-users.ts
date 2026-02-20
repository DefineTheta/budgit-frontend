import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api-client";
import type { QueryConfig } from "@/lib/react-query";

const UserSchema = z
	.object({
		id: z.string(),
		first_name: z.string().nullish(),
		firstName: z.string().nullish(),
		last_name: z.string().nullish(),
		lastName: z.string().nullish(),
		name: z.string().nullish(),
		email: z.string().nullish(),
	})
	.passthrough();

export type User = {
	id: string;
	firstName: string;
	lastName: string | null;
};

const toUser = (user: z.infer<typeof UserSchema>): User => {
	const fullName = user.name?.trim();
	const nameParts = fullName ? fullName.split(/\s+/) : [];
	const fallbackFirstName = user.email ? user.email.split("@")[0] : "User";

	return {
		id: user.id,
		firstName: user.firstName ?? user.first_name ?? nameParts[0] ?? fallbackFirstName,
		lastName:
			user.lastName ??
			user.last_name ??
			(nameParts.length > 1 ? nameParts.slice(1).join(" ") : null),
	};
};

export const usersListQueryKey = ["users", "list"] as const;

export const getUsers = async (): Promise<User[]> => {
	const response = await api.get<unknown[]>("/users");
	return z.array(UserSchema).parse(response).map(toUser);
};

export const getUsersQueryOptions = () =>
	queryOptions({
		queryKey: usersListQueryKey,
		queryFn: getUsers,
	});

type UseUsersOptions = {
	queryConfig?: QueryConfig<typeof getUsersQueryOptions>;
};

export const useUsers = ({ queryConfig }: UseUsersOptions = {}) =>
	useQuery({
		...getUsersQueryOptions(),
		...queryConfig,
	});
