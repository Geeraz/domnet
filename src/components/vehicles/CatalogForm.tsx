import { observer } from "mobx-react";
import type { FormEvent } from "react";
import { vehicleStore } from "../../stores/VehicleCatalogStore";
import type { CatalogItem, VehiclePage } from "../../types/vehicle";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { vehiclePageLabels } from "./vehiclePageLabels";

// observer keeps store updates visible while the dialog is open
export const CatalogForm = observer(function CatalogForm({
	page,
	item,
	onClose,
}: {
	page: VehiclePage;
	item: CatalogItem | null;
	onClose: () => void;
}) {
	const isModel = page === "models";
	const labels = vehiclePageLabels[page];
	const makeId = item && "makeId" in item ? item.makeId : undefined;

	const submit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const formData = new FormData(event.currentTarget);
		const input = {
			name: String(formData.get("name") ?? "").trim(),
			abrv: String(formData.get("abrv") ?? "")
				.trim()
				.toUpperCase(),
		};

		try {
			if (isModel) {
				await vehicleStore.saveModel(
					{ ...input, makeId: Number(formData.get("makeId")) },
					item?.id,
				);
			} else {
				await vehicleStore.saveMake(input, item?.id);
			}
			onClose();
		} catch {
			// The store keeps the error so the form can show it below.
		}
	};

	return (
		<Dialog
			onClose={onClose}
			title={`${item ? "Edit" : "Add"} vehicle ${labels.singular}`}
			footer={
				<>
					<Button variant="secondary" onClick={onClose}>
						Cancel
					</Button>
					<Button
						type="submit"
						form="catalog-form"
						loading={vehicleStore.saving}
					>
						{item ? "Save changes" : "Add"}
					</Button>
				</>
			}
		>
			<form id="catalog-form" onSubmit={submit}>
				<div className="form-grid">
					{isModel ? (
						<div>
							<label className="label" htmlFor="makeId">
								Vehicle make
							</label>
							<select
								className="select"
								id="makeId"
								name="makeId"
								defaultValue={String(
									makeId ?? vehicleStore.makeOptions[0]?.id ?? "",
								)}
								required
							>
								<option value="">Select a make</option>
								{vehicleStore.makeOptions.map((make) => (
									<option value={make.id} key={make.id}>
										{make.name}
									</option>
								))}
							</select>
						</div>
					) : null}
					<div>
						<label className="label" htmlFor="name">
							{labels.label} name
						</label>
						<input
							className="input"
							id="name"
							name="name"
							placeholder={labels.namePlaceholder}
							defaultValue={item?.name}
							autoFocus
							required
						/>
					</div>
					<div>
						<label className="label" htmlFor="abrv">
							Abbreviation
						</label>
						<input
							className="input"
							id="abrv"
							name="abrv"
							placeholder={labels.abbreviationPlaceholder}
							defaultValue={item?.abrv}
							maxLength={6}
							required
						/>
					</div>
				</div>
				{vehicleStore.error ? (
					<p className="feedback">{vehicleStore.error}</p>
				) : null}
			</form>
		</Dialog>
	);
});
