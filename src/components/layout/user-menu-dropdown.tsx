import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/features/auth/use-session";
import { useSignOut } from "@/features/auth/use-sign-out";

export const UserMenuDropdown = () => {
	const { data } = useSession();
	const signOut = useSignOut();

	const firstName = data?.user?.name?.trim() || "User";
	const initial = firstName[0]?.toUpperCase() || "U";

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button variant="ghost" className="h-auto gap-3 px-2 py-1.5">
					<span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">
						{initial}
					</span>
					<span className="text-sm font-medium">{firstName}</span>
					<ChevronDown className="h-4 w-4 text-muted-foreground" />
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-44">
				<DropdownMenuItem
					className="text-destructive focus:text-destructive"
					onSelect={() => signOut.mutate()}
					disabled={signOut.isPending}
				>
					{signOut.isPending ? "Logging out..." : "Logout"}
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
};
