import type {
	CatalogItem,
	VehicleListQuery,
	VehicleSortField,
} from "../../types/vehicle";

export function SortHeader({
	label,
	field,
	query,
	onSort,
}: {
	label: string;
	field: VehicleSortField;
	query: VehicleListQuery;
	onSort: (field: VehicleSortField) => void;
}) {
	const direction =
		query.sortBy === field ? (query.sortDirection === "asc" ? "↑" : "↓") : "↕";
	return (
		<th>
			<button className="sort" type="button" onClick={() => onSort(field)}>
				{label} {direction}
			</button>
		</th>
	);
}

export function CatalogRow({
	item,
	makeName,
	onEdit,
	onDelete,
}: {
	item: CatalogItem;
	makeName?: string;
	onEdit: (item: CatalogItem) => void;
	onDelete: (item: CatalogItem) => void;
}) {
	const isMake = "modelCount" in item;

	return (
		<tr>
			<td>
				<strong>{item.name}</strong>
			</td>
			<td>
				<span className="mono">{item.abrv}</span>
			</td>
			<td>{isMake ? item.modelCount : (makeName ?? "Unknown")}</td>
			<td>
				<span className="mono">#{String(item.id).padStart(4, "0")}</span>
			</td>
			<td>
				<RowActions item={item} onEdit={onEdit} onDelete={onDelete} />
			</td>
		</tr>
	);
}

function RowActions({
	item,
	onEdit,
	onDelete,
}: {
	item: CatalogItem;
	onEdit: (item: CatalogItem) => void;
	onDelete: (item: CatalogItem) => void;
}) {
	return (
		<div className="actions">
			<button
				className="action"
				type="button"
				onClick={() => onEdit(item)}
				aria-label={`Edit ${item.name}`}
			>
				Edit
			</button>
			<button
				className="action delete"
				type="button"
				onClick={() => onDelete(item)}
				aria-label={`Delete ${item.name}`}
			>
				Delete
			</button>
		</div>
	);
}
