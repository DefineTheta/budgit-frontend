import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarGroup } from "@/components/ui/avatar-group";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { User } from "@/features/users/api/get-users";
import { cn } from "@/lib/utils";

const getInitial = (firstName: string) => firstName.trim().charAt(0).toUpperCase() || "U";
const getDisplayName = (user: User) =>
	[user.firstName, user.lastName].filter(Boolean).join(" ") || user.firstName;

interface TransactionShareControlProps {
	users: User[];
	splitWith: string[];
	onChange: (splitWith: string[]) => void;
	className?: string;
	showPlus?: boolean;
	disabled?: boolean;
}

export const TransactionShareControl = ({
	users,
	splitWith,
	onChange,
	className,
	showPlus = true,
	disabled = false,
}: TransactionShareControlProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState<string>("");

	const usersById = useMemo(() => new Map(users.map((user) => [user.id, user])), [users]);
	const sharedUsers = splitWith
		.map((id) => usersById.get(id))
		.filter((user): user is User => Boolean(user));
	const availableUsers = users.filter((user) => !splitWith.includes(user.id));

	const handleOpenChange = (nextOpen: boolean) => {
		setIsOpen(nextOpen);
		if (!nextOpen) {
			setSelectedUserId("");
			return;
		}

		if (!selectedUserId && availableUsers[0]) {
			setSelectedUserId(availableUsers[0].id);
		}
	};

	const handleShare = () => {
		if (!selectedUserId || splitWith.includes(selectedUserId)) return;
		onChange([...splitWith, selectedUserId]);
		setIsOpen(false);
		setSelectedUserId("");
	};

	if (disabled && sharedUsers.length === 0) {
		return null;
	}

	const trigger = (
		<button
			type="button"
			aria-disabled={disabled}
			className={cn(
				"inline-flex h-8 items-center rounded-md border border-transparent px-1 text-muted-foreground transition-colors hover:border-border hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
				disabled && "cursor-default hover:border-transparent hover:text-muted-foreground",
				className,
			)}
		>
			<AvatarGroup>
				{sharedUsers.map((user) => (
					<Tooltip key={user.id}>
						<TooltipTrigger asChild>
							<span>
								<Avatar className="h-6 w-6 border border-background">
									<AvatarFallback>{getInitial(user.firstName)}</AvatarFallback>
								</Avatar>
							</span>
						</TooltipTrigger>
						<TooltipContent>{getDisplayName(user)}</TooltipContent>
					</Tooltip>
				))}
				{showPlus ? (
					<span className="ml-1 inline-flex h-6 w-6 items-center justify-center rounded-full border border-dashed border-muted-foreground/40 bg-background">
						<Plus className="h-3.5 w-3.5" />
					</span>
				) : null}
			</AvatarGroup>
		</button>
	);

	if (disabled) {
		return trigger;
	}

	return (
		<Popover open={isOpen} onOpenChange={handleOpenChange}>
			<PopoverTrigger asChild>{trigger}</PopoverTrigger>
			<PopoverContent align="end" className="w-72 space-y-3 p-3">
				{availableUsers.length > 0 ? (
					<Select value={selectedUserId} onValueChange={setSelectedUserId}>
						<SelectTrigger>
							<SelectValue placeholder="Select user" />
						</SelectTrigger>
						<SelectContent>
							{availableUsers.map((user) => (
								<SelectItem key={user.id} value={user.id}>
									{[user.firstName, user.lastName].filter(Boolean).join(" ")}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				) : (
					<p className="text-sm text-muted-foreground">No users left to share with.</p>
				)}
				<div className="flex justify-end gap-2">
					<Button
						type="button"
						onClick={handleShare}
						disabled={availableUsers.length === 0 || !selectedUserId}
					>
						Share
					</Button>
					<Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
						Cancel
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	);
};
