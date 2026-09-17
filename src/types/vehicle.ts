export type VehiclePage = "makes" | "models";

export type SortDirection = "asc" | "desc";

export type VehicleSortField = "name" | "abrv";

export type VehicleListQuery = {
	page: number;
	pageSize: number;
	search: string;
	sortBy: VehicleSortField;
	sortDirection: SortDirection;
};

export type VehicleModelListQuery = VehicleListQuery & {
	makeId: number | "all";
};

export type VehicleMake = {
	id: number;
	name: string;
	abrv: string;
	modelCount: number;
};

export type VehicleModel = {
	id: number;
	makeId: number;
	name: string;
	abrv: string;
};

export type CatalogItem = VehicleMake | VehicleModel;

export type VehicleMakeInput = Pick<VehicleMake, "name" | "abrv">;

export type VehicleModelInput = Pick<VehicleModel, "makeId" | "name" | "abrv">;

export type PaginatedResponse<T> = {
	items: T[];
	total: number;
};
