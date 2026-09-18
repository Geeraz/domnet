import { makeAutoObservable, runInAction } from "mobx";
import { vehicleCatalogService } from "../services/VehicleCatalogService";
import type {
	SortDirection,
	VehicleListQuery,
	VehicleMake,
	VehicleMakeInput,
	VehicleModel,
	VehicleModelInput,
	VehicleModelListQuery,
	VehiclePage,
	VehicleSortField,
} from "../types/vehicle";

type CatalogListState<T, Q> = {
	items: T[];
	total: number;
	query: Q;
	loading: boolean;
};

const defaultMakeQuery: VehicleListQuery = {
	page: 1,
	pageSize: 6,
	search: "",
	sortBy: "name",
	sortDirection: "asc",
};
const defaultModelQuery: VehicleModelListQuery = {
	...defaultMakeQuery,
	makeId: "all",
};

function getErrorMessage(error: unknown, fallback: string) {
	return error instanceof Error ? error.message : fallback;
}

export class VehicleCatalogStore {
	makes: CatalogListState<VehicleMake, VehicleListQuery> = {
		items: [],
		total: 0,
		query: { ...defaultMakeQuery },
		loading: true,
	};
	models: CatalogListState<VehicleModel, VehicleModelListQuery> = {
		items: [],
		total: 0,
		query: { ...defaultModelQuery },
		loading: true,
	};
	makeOptions: VehicleMake[] = [];
	saving = false;
	error = "";

	constructor() {
		makeAutoObservable(this);
	}

	async loadInitialData() {
		await Promise.all([this.refreshMakes(), this.loadModels()]);
	}

	async loadMakes() {
		await this.loadCatalogList(this.makes, (query) =>
			vehicleCatalogService.listMakes(query),
		);
	}

	async loadModels() {
		await this.loadCatalogList(this.models, (query) =>
			vehicleCatalogService.listModels(query),
		);
	}

	loadPage(page: VehiclePage) {
		return page === "makes" ? this.loadMakes() : this.loadModels();
	}

	setSearch(page: VehiclePage, search: string) {
		const state = this.getListState(page);
		state.query = { ...state.query, search, page: 1 };
		void this.loadPage(page);
	}

	setSort(page: VehiclePage, sortBy: VehicleSortField) {
		const state = this.getListState(page);
		const sortDirection: SortDirection =
			state.query.sortBy === sortBy && state.query.sortDirection === "asc"
				? "desc"
				: "asc";
		state.query = { ...state.query, sortBy, sortDirection, page: 1 };
		void this.loadPage(page);
	}

	setPage(page: VehiclePage, value: number) {
		const state = this.getListState(page);
		state.query.page = value;
		void this.loadPage(page);
	}

	setModelMakeFilter(makeId: number | "all") {
		this.models.query = { ...this.models.query, makeId, page: 1 };
		void this.loadModels();
	}

	clearError() {
		this.error = "";
	}

	async saveMake(input: VehicleMakeInput, id?: number) {
		await this.saveAndRefresh(
			() => vehicleCatalogService.saveMake(input, id),
			() => this.refreshMakes(),
		);
	}

	async removeMake(id: number) {
		await this.saveAndRefresh(
			() => vehicleCatalogService.deleteMake(id),
			() => this.refreshMakes(),
		);
	}

	async saveModel(input: VehicleModelInput, id?: number) {
		await this.saveAndRefresh(
			() => vehicleCatalogService.saveModel(input, id),
			() => this.refreshModels(),
		);
	}

	async removeModel(id: number) {
		await this.saveAndRefresh(
			() => vehicleCatalogService.deleteModel(id),
			() => this.refreshModels(),
		);
	}

	async refreshMakes() {
		await Promise.all([this.loadMakes(), this.loadMakeOptions()]);
	}

	private async refreshModels() {
		await Promise.all([this.loadModels(), this.loadMakeOptions()]);
	}

	private getListState(page: VehiclePage) {
		return page === "makes" ? this.makes : this.models;
	}

	private async loadMakeOptions() {
		const options = await vehicleCatalogService.listMakeOptions();
		runInAction(() => {
			this.makeOptions = options;
		});
	}

	private async loadCatalogList<T, Q extends VehicleListQuery>(
		state: CatalogListState<T, Q>,
		request: (query: Q) => Promise<{ items: T[]; total: number }>,
	) {
		state.loading = true;
		this.error = "";
		try {
			const response = await request(state.query);
			runInAction(() => {
				state.items = response.items;
				state.total = response.total;
				state.loading = false;
			});
		} catch (error) {
			runInAction(() => {
				this.error = getErrorMessage(
					error,
					"Could not load catalog data.",
				);
				state.loading = false;
			});
		}
	}

	private async saveAndRefresh(
		saveItem: () => Promise<void>,
		refreshData: () => Promise<void>,
	) {
		this.saving = true;
		this.error = "";
		try {
			await saveItem();
			await refreshData();
		} catch (error) {
			runInAction(() => {
				this.error = getErrorMessage(
					error,
					"Could not save catalog data.",
				);
			});
			throw error;
		} finally {
			runInAction(() => {
				this.saving = false;
			});
		}
	}
}

export const vehicleStore = new VehicleCatalogStore();
