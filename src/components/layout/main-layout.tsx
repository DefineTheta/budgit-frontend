import { Sidebar } from "./sidebar";

type MainLayoutProps = {
	children: React.ReactNode;
};

export const MainLayout = ({ children }: MainLayoutProps) => {
	return (
		<div className="flex h-screen">
			<Sidebar />
			<main className="flex-1 overflow-y-auto p-8">{children}</main>
		</div>
	);
};
