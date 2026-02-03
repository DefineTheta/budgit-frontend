import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./sidebar";

type MainLayoutProps = {
	children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<SidebarProvider>
			<Sidebar />
			<main className="flex-1 overflow-y-auto p-8">{children}</main>
		</SidebarProvider>
	);
};
