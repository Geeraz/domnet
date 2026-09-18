import type { ReactNode } from "react";
import type { VehiclePage } from "../../types/vehicle";

type AppShellProps = {
	activePage: VehiclePage;
	onPageChange: (page: VehiclePage) => void;
	children: ReactNode;
};

// App navigation pages
const pages: Array<{ page: VehiclePage; label: string }> = [
	{ page: "makes", label: "Vehicle makes" },
	{ page: "models", label: "Vehicle models" },
];

export function AppShell({
	activePage,
	onPageChange,
	children,
}: AppShellProps) {
	return (
		<div className="app-shell">
			<aside className="sidebar">
				<nav className="nav" aria-label="Main navigation">
					{pages.map(({ page, label }) => (
						<button
							key={page}
							className={`nav-item ${activePage === page ? "active" : ""}`}
							type="button"
							onClick={() => onPageChange(page)}
						>
							{label}
						</button>
					))}
				</nav>
			</aside>
			<main className="main-panel">
				<div className="content">{children}</div>
			</main>
		</div>
	);
}
