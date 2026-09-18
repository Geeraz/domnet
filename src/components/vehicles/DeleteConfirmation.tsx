import { observer } from "mobx-react";
import { vehicleStore } from "../../stores/VehicleCatalogStore";
import type { CatalogItem, VehiclePage } from "../../types/vehicle";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { vehiclePageLabels } from "./vehiclePageLabels";

type DeleteConfirmationProps = {
	page: VehiclePage;
	item: CatalogItem;
	onClose: () => void;
};

export const DeleteConfirmation = observer(function DeleteConfirmation({
	page,
	item,
	onClose,
}: DeleteConfirmationProps) {
	const labels = vehiclePageLabels[page];

	const confirmDelete = async () => {
		try {
			if (page === "makes") {
				await vehicleStore.removeMake(item.id);
			} else {
				await vehicleStore.removeModel(item.id);
			}
			onClose();
		} catch {
			// The store keeps the error so the dialog can show it below.
		}
	};

	return (
		<Dialog
			onClose={onClose}
			title={`Delete vehicle ${labels.singular}`}
			size="small"
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						variant="danger"
						loading={vehicleStore.saving}
						onClick={() => void confirmDelete()}
					>
						Delete
					</Button>
				</>
			}
		>
			<p className="confirm">
				Delete <strong>{item.name}</strong>? {labels.deleteWarning}
			</p>
			{vehicleStore.error ? (
				<p className="feedback">{vehicleStore.error}</p>
			) : null}
		</Dialog>
	);
});
