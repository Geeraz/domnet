import { observer } from "mobx-react";
import { useState } from "react";
import { vehicleStore } from "../../stores/VehicleCatalogStore";
import type { CatalogItem, VehiclePage } from "../../types/vehicle";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";
import { Pagination } from "../ui/Pagination";
import { CatalogForm } from "./CatalogForm";
import { CatalogRow, SortHeader } from "./CatalogParts";

export const VehicleCatalogPage = observer(function VehicleCatalogPage({
	page,
}: {
	page: VehiclePage;
}) {
	const isMakesPage = page === "makes";
	const noun = isMakesPage ? "make" : "model";
	const plural = `${noun}s`;
	const title = `Vehicle ${plural}`;
	const nounTitle = noun[0].toUpperCase() + noun.slice(1);
	const state = isMakesPage ? vehicleStore.makes : vehicleStore.models;
	const makeNames = new Map(
		vehicleStore.makeOptions.map((make) => [make.id, make.name]),
	);
	const [editing, setEditing] = useState<CatalogItem | null>();
	const [deleting, setDeleting] = useState<CatalogItem | null>(null);
	const formOpen = editing !== undefined;

	const openForm = (item: CatalogItem | null) => {
		vehicleStore.clearError();
		setEditing(item);
	};

	const openDelete = (item: CatalogItem) => {
		vehicleStore.clearError();
		setDeleting(item);
	};

	const remove = async () => {
		if (!deleting) return;

		try {
			if (isMakesPage) await vehicleStore.removeMake(deleting.id);
			else await vehicleStore.removeModel(deleting.id);
			setDeleting(null);
		} catch {}
	};

	const loadPage = () => void vehicleStore.loadPage(page);

	return (
		<>
		<header className="page-head">
			<div>
				<h1>{title}</h1>
			</div>
				<Button
					onClick={() => openForm(null)}
					disabled={!isMakesPage && !vehicleStore.makeOptions.length}
				>
					Add vehicle {noun}
				</Button>
			</header>

			{vehicleStore.error && !formOpen && !deleting ? (
				<p className="feedback">{vehicleStore.error}</p>
			) : null}

			<section className="card" aria-label={title}>
				<div className="card-header">
					<strong className="card-title">
						All {title.toLowerCase()} <span>{state.total} records</span>
					</strong>
					<div className="controls">
						<input
							className="input search-input"
							placeholder={`Search ${plural}...`}
							value={state.query.search}
							onChange={(event) =>
								vehicleStore.setSearch(page, event.target.value)
							}
							aria-label={`Search vehicle ${plural}`}
						/>
						{!isMakesPage ? (
							<select
								className="select"
								value={String(vehicleStore.models.query.makeId)}
								onChange={(event) =>
									vehicleStore.setModelMake(
										event.target.value === "all"
											? "all"
											: Number(event.target.value),
									)
								}
								aria-label="Filter by vehicle make"
							>
								<option value="all">All makes</option>
								{vehicleStore.makeOptions.map((make) => (
									<option key={make.id} value={make.id}>
										{make.name}
									</option>
								))}
							</select>
						) : null}
						<Button variant="secondary" size="small" onClick={loadPage}>
							Refresh
						</Button>
					</div>
				</div>

				<div className="table-wrap">
					<table className="table">
						<thead>
							<tr>
								<SortHeader
									label={`${nounTitle} name`}
									field="name"
									query={state.query}
									onSort={(field) => vehicleStore.setSort(page, field)}
								/>
								<SortHeader
									label="Abbreviation"
									field="abrv"
									query={state.query}
									onSort={(field) => vehicleStore.setSort(page, field)}
								/>
								<th>{isMakesPage ? "Models" : "Vehicle make"}</th>
								<th>Record ID</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{state.loading ? (
								<tr>
									<td colSpan={5}>
										<div className="table-loading">Loading...</div>
									</td>
								</tr>
							) : state.items.length ? (
								state.items.map((item) => (
									<CatalogRow
										key={item.id}
										item={item}
										makeName={
											"makeId" in item ? makeNames.get(item.makeId) : undefined
										}
										onEdit={openForm}
										onDelete={openDelete}
									/>
								))
							) : (
								<tr>
									<td colSpan={5}>
						<div className="empty">
							No records found
						</div>
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>

				<div className="card-footer">
					<span className="results">
						Showing{" "}
						{state.items.length
							? (state.query.page - 1) * state.query.pageSize + 1
							: 0}
						–{Math.min(state.query.page * state.query.pageSize, state.total)} of{" "}
						{state.total}
					</span>
					<Pagination
						page={state.query.page}
						pageSize={state.query.pageSize}
						total={state.total}
						onPageChange={(value) => vehicleStore.setPage(page, value)}
					/>
				</div>
			</section>

			{formOpen ? (
				<CatalogForm
					key={`${page}-${editing?.id ?? "new"}`}
					page={page}
					item={editing ?? null}
					onClose={() => setEditing(undefined)}
				/>
			) : null}
			{deleting ? (
				<Dialog
					onClose={() => setDeleting(null)}
					title={`Delete vehicle ${noun}`}
					size="small"
					footer={
						<>
							<Button variant="secondary" onClick={() => setDeleting(null)}>
								Cancel
							</Button>
							<Button
								variant="danger"
								loading={vehicleStore.saving}
								onClick={() => void remove()}
							>
								Delete
							</Button>
						</>
					}
				>
					<p className="confirm">
						Delete{" "}
						<strong>{"name" in deleting ? deleting.name : ""}</strong>? {isMakesPage
							? "The make must have no models assigned."
							: ""}
					</p>
					{vehicleStore.error ? (
						<p className="feedback">{vehicleStore.error}</p>
					) : null}
				</Dialog>
			) : null}
		</>
	);
});
