import type {
	PaginatedResponse,
	VehicleListQuery,
	VehicleMake,
	VehicleMakeInput,
	VehicleModel,
	VehicleModelInput,
	VehicleModelListQuery,
} from "../types/vehicle";

type MakeRecord = Omit<VehicleMake, "modelCount">;
type CatalogRecord = { name: string; abrv: string };

// Mock backend keeps catalog data in memory until the real API is ready
const makes: MakeRecord[] = [
	{ id: 1, name: "Audi", abrv: "AUD" },
	{ id: 2, name: "BMW", abrv: "BMW" },
	{ id: 3, name: "Ford", abrv: "FOR" },
	{ id: 4, name: "Honda", abrv: "HON" },
	{ id: 5, name: "Mercedes-Benz", abrv: "MB" },
	{ id: 6, name: "Tesla", abrv: "TSL" },
	{ id: 7, name: "Toyota", abrv: "TOY" },
	{ id: 8, name: "Volkswagen", abrv: "VW" },
];

const models: VehicleModel[] = [
	{ id: 101, makeId: 1, name: "A3", abrv: "A3" },
	{ id: 102, makeId: 1, name: "A4", abrv: "A4" },
	{ id: 103, makeId: 1, name: "Q5", abrv: "Q5" },
	{ id: 201, makeId: 2, name: "3 Series", abrv: "3ER" },
	{ id: 202, makeId: 2, name: "5 Series", abrv: "5ER" },
	{ id: 203, makeId: 2, name: "X5", abrv: "X5" },
	{ id: 301, makeId: 3, name: "Focus", abrv: "FOC" },
	{ id: 302, makeId: 3, name: "Mustang", abrv: "MUS" },
	{ id: 303, makeId: 3, name: "Ranger", abrv: "RNG" },
	{ id: 401, makeId: 4, name: "Civic", abrv: "CIV" },
	{ id: 402, makeId: 4, name: "CR-V", abrv: "CRV" },
	{ id: 403, makeId: 4, name: "Accord", abrv: "Acc" },
	{ id: 501, makeId: 5, name: "A-Class", abrv: "ACL" },
	{ id: 502, makeId: 5, name: "C-Class", abrv: "CCL" },
	{ id: 503, makeId: 5, name: "E-Class", abrv: "ECL" },
	{ id: 601, makeId: 6, name: "Model 3", abrv: "M3" },
	{ id: 602, makeId: 6, name: "Model Y", abrv: "MY" },
	{ id: 701, makeId: 7, name: "Corolla", abrv: "COR" },
	{ id: 702, makeId: 7, name: "RAV4", abrv: "RAV" },
	{ id: 801, makeId: 8, name: "Golf", abrv: "GOL" },
	{ id: 802, makeId: 8, name: "Passat", abrv: "PAS" },
	{ id: 803, makeId: 8, name: "Tiguan", abrv: "TIG" },
];

const simulateNetworkDelay = () =>
	new Promise<void>((resolve) => window.setTimeout(resolve, 500));

const getNextId = (items: Array<{ id: number }>) =>
	Math.max(0, ...items.map((item) => item.id)) + 1;

const getMakesWithModelCount = (): VehicleMake[] =>
	makes.map((make) => ({
		...make,
		modelCount: models.filter((model) => model.makeId === make.id).length,
	}));

function getCatalogPage<T extends CatalogRecord>(
	items: T[],
	query: VehicleListQuery,
): PaginatedResponse<T> {
	// Search first, then sort, then return one page of results
	const searchText = query.search.trim().toLocaleLowerCase();
	const matchingItems = items.filter((item) => {
		const searchableValues = [item.name, item.abrv];
		return searchableValues.some((value) =>
			value.toLocaleLowerCase().includes(searchText),
		);
	});

	matchingItems.sort((left, right) => {
		const leftValue = left[query.sortBy];
		const rightValue = right[query.sortBy];
		const comparison = leftValue.localeCompare(rightValue, undefined, {
			sensitivity: "base",
		});
		return query.sortDirection === "asc" ? comparison : -comparison;
	});

	const firstItem = (query.page - 1) * query.pageSize;
	const lastItem = firstItem + query.pageSize;
	return {
		items: matchingItems.slice(firstItem, lastItem),
		total: matchingItems.length,
	};
}

export class VehicleCatalogService {
	async listMakes(query: VehicleListQuery) {
		await simulateNetworkDelay();
		return getCatalogPage(getMakesWithModelCount(), query);
	}

	async listModels(query: VehicleModelListQuery) {
		await simulateNetworkDelay();
		return getCatalogPage(
			models.filter(
				(model) => query.makeId === "all" || model.makeId === query.makeId,
			),
			query,
		);
	}

	async listMakeOptions() {
		await simulateNetworkDelay();
		return getMakesWithModelCount().sort((left, right) =>
			left.name.localeCompare(right.name),
		);
	}

	async saveMake(input: VehicleMakeInput, id?: number) {
		await simulateNetworkDelay();
		if (id === undefined) {
			makes.push({ ...input, id: getNextId(makes) });
			return;
		}
		const make = makes.find((item) => item.id === id);
		if (!make) throw new Error("Vehicle make could not be found.");
		Object.assign(make, input);
	}

	async deleteMake(id: number) {
		await simulateNetworkDelay();
		if (models.some((model) => model.makeId === id)) {
			throw new Error(
				"Remove the vehicle models for this make before deleting it.",
			);
		}
		this.removeItem(makes, id, "Vehicle make");
	}

	async saveModel(input: VehicleModelInput, id?: number) {
		await simulateNetworkDelay();
		if (!makes.some((make) => make.id === input.makeId)) {
			throw new Error("Select a valid vehicle make.");
		}
		if (id === undefined) {
			models.push({ ...input, id: getNextId(models) });
			return;
		}
		const model = models.find((item) => item.id === id);
		if (!model) throw new Error("Vehicle model could not be found.");
		Object.assign(model, input);
	}

	async deleteModel(id: number) {
		await simulateNetworkDelay();
		this.removeItem(models, id, "Vehicle model");
	}

	private removeItem<T extends { id: number }>(
		items: T[],
		id: number,
		label: string,
	) {
		const index = items.findIndex((item) => item.id === id);
		if (index === -1) throw new Error(`${label} could not be found.`);
		items.splice(index, 1);
	}
}

export const vehicleCatalogService = new VehicleCatalogService();
