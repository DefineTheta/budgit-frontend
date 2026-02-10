import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGoal } from "../api/get-goal";
import { MonthlyGoalForm } from "./forms/monthly-goal-form";

interface GoalModalProps {
	goalId?: string;
	categoryName: string;
	categoryId: string;
	open: boolean;
	edit: boolean;
	onOpenChange: (open: boolean) => void;
}

export function GoalModal({
	goalId,
	categoryName,
	categoryId,
	open,
	edit,
	onOpenChange,
}: GoalModalProps) {
	const goalQuery = useGoal({
		id: goalId ?? "",
		queryConfig: {
			enabled: !!goalId,
		},
	});

	const goal = goalQuery.data;
	if (!goal && edit) return null;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle className="mb-3">
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
					<DialogDescription>
						Set how much to save and when the goal should be met each month.
					</DialogDescription>
				</DialogHeader>

				<Tabs defaultValue="month" className="w-full">
					<TabsList className="my-2 w-full">
						<TabsTrigger value="week">Weekly</TabsTrigger>
						<TabsTrigger value="month">Monthly</TabsTrigger>
						<TabsTrigger value="year">Yearly</TabsTrigger>
					</TabsList>

					<TabsContent value="month">
						<MonthlyGoalForm
							goal={
								goal
									? {
											...goal,
											goal_type_id: goal.goal_type,
										}
									: undefined
							}
							goalId={goalId}
							categoryId={categoryId}
							onSuccess={() => onOpenChange(false)}
						/>
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
