import { observer } from "mobx-react";
import type { SyntheticEvent } from "react";
import { vehicleStore } from "../../stores/VehicleCatalogStore";
import type { CatalogItem, VehiclePage } from "../../types/vehicle";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

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
	const entity = isModel ? "Model" : "Make";
	const noun = entity.toLowerCase();
	const makeId = item && "makeId" in item ? item.makeId : undefined;
	const submit = async (event: SyntheticEvent<HTMLFormElement>) => {
		event.preventDefault();
		const data = Object.fromEntries(new FormData(event.currentTarget));
		const input = {
			name: String(data.name ?? "").trim(),
			abrv: String(data.abrv ?? "").trim().toUpperCase(),
		};

		try {
			const save = isModel
				? vehicleStore.saveModel(
					{ ...input, makeId: Number(data.makeId) },
					item?.id,
				)
				: vehicleStore.saveMake(input, item?.id);
			await save;
			onClose();
		} catch {}
	};

	return (
		<Dialog
			onClose={onClose}
			title={`${item ? "Edit" : "Add"} vehicle ${noun}`}
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
							{entity} name
						</label>
						<input
							className="input"
							id="name"
							name="name"
							placeholder={isModel ? "e.g. Golf" : "e.g. Volkswagen"}
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
							placeholder={isModel ? "e.g. GOL" : "e.g. VW"}
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
