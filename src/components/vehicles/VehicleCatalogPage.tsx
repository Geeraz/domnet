import { observer } from "mobx-react";
import { useState } from "react";
import { vehicleStore } from "../../stores/VehicleCatalogStore";
import type { CatalogItem, VehiclePage } from "../../types/vehicle";
import { Button } from "../ui/Button";
import { CatalogForm } from "./CatalogForm";
import { CatalogList } from "./CatalogList";
import { DeleteConfirmation } from "./DeleteConfirmation";
import { vehiclePageLabels } from "./vehiclePageLabels";

type VehicleCatalogPageProps = {
	page: VehiclePage;
};

type FormState = {
	item: CatalogItem | null;
};

export const VehicleCatalogPage = observer(function VehicleCatalogPage({
	page,
}: VehicleCatalogPageProps) {
	const labels = vehiclePageLabels[page];
	const [form, setForm] = useState<FormState | null>(null);
	const [deletingItem, setDeletingItem] = useState<CatalogItem | null>(null);

	const openForm = (item: CatalogItem | null) => {
		vehicleStore.clearError();
		setForm({ item });
	};

	const openDeleteDialog = (item: CatalogItem) => {
		vehicleStore.clearError();
		setDeletingItem(item);
	};

	const closeForm = () => setForm(null);

	return (
		<>
			<header className="page-head">
				<h1>{labels.title}</h1>
				<Button
					onClick={() => openForm(null)}
					disabled={page === "models" && vehicleStore.makeOptions.length === 0}
				>
					Add vehicle {labels.singular}
				</Button>
			</header>

			{vehicleStore.error && form === null && deletingItem === null ? (
				<p className="feedback">{vehicleStore.error}</p>
			) : null}

			<CatalogList
				page={page}
				onEdit={openForm}
				onDelete={openDeleteDialog}
			/>

			{form ? (
				<CatalogForm
					key={`${page}-${form.item?.id ?? "new"}`}
					page={page}
					item={form.item}
					onClose={closeForm}
				/>
			) : null}

			{deletingItem ? (
				<DeleteConfirmation
					page={page}
					item={deletingItem}
					onClose={() => setDeletingItem(null)}
				/>
			) : null}
		</>
	);
});
