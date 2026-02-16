import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./sidebar";
import { UserMenuDropdown } from "./user-menu-dropdown";

type MainLayoutProps = {
	children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<SidebarProvider>
			<Sidebar />
			<main className="flex-1 overflow-y-auto p-8">
				<header className="mb-6 flex items-center justify-end">
					<UserMenuDropdown />
				</header>
				{children}
			</main>
		</SidebarProvider>
	);
};
