import { observer } from "mobx-react";
import { vehicleStore } from "../../stores/VehicleCatalogStore";
import type { CatalogItem, VehiclePage } from "../../types/vehicle";
import { Button } from "../ui/Button";
import { Pagination } from "../ui/Pagination";
import { CatalogRow, SortHeader } from "./CatalogParts";
import { vehiclePageLabels } from "./vehiclePageLabels";

type CatalogListProps = {
	page: VehiclePage;
	onEdit: (item: CatalogItem) => void;
	onDelete: (item: CatalogItem) => void;
};

export const CatalogList = observer(function CatalogList({
	page,
	onEdit,
	onDelete,
}: CatalogListProps) {
	const isMakesPage = page === "makes";
	const labels = vehiclePageLabels[page];
	const state = isMakesPage ? vehicleStore.makes : vehicleStore.models;
	const makeNames = new Map(
		vehicleStore.makeOptions.map((make) => [make.id, make.name]),
	);

	const refresh = () => void vehicleStore.loadPage(page);
	const firstResult = state.items.length
		? (state.query.page - 1) * state.query.pageSize + 1
		: 0;
	const lastResult = Math.min(
		state.query.page * state.query.pageSize,
		state.total,
	);

	return (
		<section className="card" aria-label={labels.title}>
			<div className="card-header">
				<strong className="card-title">
					All {labels.title.toLowerCase()} <span>{state.total} records</span>
				</strong>
				<div className="controls">
					<input
						className="input search-input"
						placeholder={`Search ${labels.plural}...`}
						value={state.query.search}
						onChange={(event) =>
							vehicleStore.setSearch(page, event.target.value)
						}
						aria-label={`Search vehicle ${labels.plural}`}
					/>
					{isMakesPage ? null : (
						<select
							className="select"
							value={String(vehicleStore.models.query.makeId)}
							onChange={(event) => {
								const value = event.target.value;
								vehicleStore.setModelMakeFilter(
									value === "all" ? "all" : Number(value),
								);
							}}
							aria-label="Filter by vehicle make"
						>
							<option value="all">All makes</option>
							{vehicleStore.makeOptions.map((make) => (
								<option key={make.id} value={make.id}>
									{make.name}
								</option>
							))}
						</select>
					)}
					<Button variant="secondary" size="small" onClick={refresh}>
						Refresh
					</Button>
				</div>
			</div>

			<div className="table-wrap">
				<table className="table">
					<thead>
						<tr>
							<SortHeader
								label={`${labels.label} name`}
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
						{renderTableBody({
							page,
							items: state.items,
							loading: state.loading,
							makeNames,
							onEdit,
							onDelete,
						})}
					</tbody>
				</table>
			</div>

			<div className="card-footer">
				<span className="results">
					Showing {firstResult}–{lastResult} of {state.total}
				</span>
				<Pagination
					page={state.query.page}
					pageSize={state.query.pageSize}
					total={state.total}
					onPageChange={(value) => vehicleStore.setPage(page, value)}
				/>
			</div>
		</section>
	);
});

type TableBodyData = {
	page: VehiclePage;
	items: CatalogItem[];
	loading: boolean;
	makeNames: Map<number, string>;
	onEdit: (item: CatalogItem) => void;
	onDelete: (item: CatalogItem) => void;
};

function renderTableBody({
	page,
	items,
	loading,
	makeNames,
	onEdit,
	onDelete,
}: TableBodyData) {
	if (loading) {
		return (
			<tr>
				<td colSpan={5}>
					<div className="table-loading">Loading...</div>
				</td>
			</tr>
		);
	}

	if (items.length === 0) {
		return (
			<tr>
				<td colSpan={5}>
					<div className="empty">No records found</div>
				</td>
			</tr>
		);
	}

	return items.map((item) => (
		<CatalogRow
			key={item.id}
			item={item}
			makeName={
				page === "models" && "makeId" in item
					? makeNames.get(item.makeId)
					: undefined
			}
			onEdit={onEdit}
			onDelete={onDelete}
		/>
	));
}
