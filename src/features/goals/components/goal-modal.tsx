import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonthlyGoalForm } from "./forms/monthly-goal-form";

interface GoalModalProps {
	goalId: string | null;
	categoryName: string;
	categoryId: string;
	open: boolean;
	edit: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: () => void;
}

export function GoalModal({
	goalId,
	categoryName,
	categoryId,
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

				<Tabs defaultValue="month" className="mt-4 w-full">
					<TabsList className="mb-2 w-full">
						<TabsTrigger value="week">Weekly</TabsTrigger>
						<TabsTrigger value="month">Monthly</TabsTrigger>
						<TabsTrigger value="year">Yearly</TabsTrigger>
					</TabsList>

					<TabsContent value="month">
						<MonthlyGoalForm goal={{}} categoryId={categoryId} />
					</TabsContent>
				</Tabs>

				<DialogFooter className="mt-4">
					<Button type="submit" form="monthly-goal-form">
						Save goal
					</Button>
					<Button variant="secondary" onClick={() => onOpenChange(false)}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
