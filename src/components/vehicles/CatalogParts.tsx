import type {
	CatalogItem,
	VehicleListQuery,
	VehicleSortField,
} from "../../types/vehicle";

type SortHeaderProps = {
	label: string;
	field: VehicleSortField;
	query: VehicleListQuery;
	onSort: (field: VehicleSortField) => void;
};

export function SortHeader({
	label,
	field,
	query,
	onSort,
}: SortHeaderProps) {
	const direction = getSortIcon(query, field);
	return (
		<th>
			<button className="sort" type="button" onClick={() => onSort(field)}>
				{label} {direction}
			</button>
		</th>
	);
}

function getSortIcon(query: VehicleListQuery, field: VehicleSortField) {
	if (query.sortBy !== field) return "↕";
	return query.sortDirection === "asc" ? "↑" : "↓";
}

type CatalogRowProps = {
	item: CatalogItem;
	makeName?: string;
	onEdit: (item: CatalogItem) => void;
	onDelete: (item: CatalogItem) => void;
};

export function CatalogRow({
	item,
	makeName,
	onEdit,
	onDelete,
}: CatalogRowProps) {
	const relatedValue = "modelCount" in item
		? item.modelCount
		: (makeName ?? "Unknown");

	return (
		<tr>
			<td>
				<strong>{item.name}</strong>
			</td>
			<td>
				<span className="mono">{item.abrv}</span>
			</td>
			<td>{relatedValue}</td>
			<td>
				<span className="mono">#{String(item.id).padStart(4, "0")}</span>
			</td>
			<td>
				<RowActions item={item} onEdit={onEdit} onDelete={onDelete} />
			</td>
		</tr>
	);
}

type RowActionsProps = {
	item: CatalogItem;
	onEdit: (item: CatalogItem) => void;
	onDelete: (item: CatalogItem) => void;
};

function RowActions({
	item,
	onEdit,
	onDelete,
}: RowActionsProps) {
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
