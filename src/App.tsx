import { useEffect, useState } from "react";
import { AppShell } from "./components/layout/AppShell";
import { VehicleCatalogPage } from "./components/vehicles/VehicleCatalogPage";
import { vehicleStore } from "./stores/VehicleCatalogStore";
import type { VehiclePage } from "./types/vehicle";

function App() {
	const [activePage, setActivePage] = useState<VehiclePage>("makes");

	useEffect(() => {
		void Promise.all([vehicleStore.refreshMakes(), vehicleStore.loadModels()]);
	}, []);

	return (
		<AppShell activePage={activePage} onPageChange={setActivePage}>
			<VehicleCatalogPage page={activePage} />
		</AppShell>
	);
}

export default App;
