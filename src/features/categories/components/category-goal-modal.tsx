import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GoalModalProps {
	goalId: string | null;
	categoryName: string;
	open: boolean;
	edit: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
}

export function GoalModal({
	goalId,
	categoryName,
	open,
	edit,
	onOpenChange,
	onSave,
}: GoalModalProps) {
	if (!goalId && edit) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>
						{edit ? (
							<div>
								Edit goal for
								<span className="ml-2 underline underline-offset-8">
									{categoryName}
								</span>{" "}
							</div>
						) : (
							<div>
								Create goal for
								<span className="ml-2 underline underline-offset-8">{categoryName}</span>
							</div>
						)}
					</DialogTitle>
				</DialogHeader>

				<Tabs defaultValue="month">
					<TabsList>
						<TabsTrigger value="week">Weekly</TabsTrigger>
						<TabsTrigger value="month">Monthly</TabsTrigger>
						<TabsTrigger value="year">Yearly</TabsTrigger>
					</TabsList>

					<TabsContent value="month">
						<form>
							<Field>
						</form>
					</TabsContent>
				</Tabs>

				<DialogFooter>
					<Button type="submit">Save goal</Button>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
