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

type ListState<T, Q> = {
	items: T[];
	total: number;
	query: Q;
	loading: boolean;
};

const makeQuery: VehicleListQuery = {
	page: 1,
	pageSize: 6,
	search: "",
	sortBy: "name",
	sortDirection: "asc",
};
const modelQuery: VehicleModelListQuery = { ...makeQuery, makeId: "all" };

export class VehicleCatalogStore {
	makes: ListState<VehicleMake, VehicleListQuery> = {
		items: [],
		total: 0,
		query: { ...makeQuery },
		loading: true,
	};
	models: ListState<VehicleModel, VehicleModelListQuery> = {
		items: [],
		total: 0,
		query: { ...modelQuery },
		loading: true,
	};
	makeOptions: VehicleMake[] = [];
	saving = false;
	error = "";

	constructor() {
		makeAutoObservable(this);
	}

	async loadMakes() {
		await this.loadList(this.makes, (query) =>
			vehicleCatalogService.listMakes(query),
		);
	}

	async loadModels() {
		await this.loadList(this.models, (query) =>
			vehicleCatalogService.listModels(query),
		);
	}

	loadPage(section: VehiclePage) {
		return section === "makes" ? this.loadMakes() : this.loadModels();
	}

	setSearch(section: VehiclePage, search: string) {
		const state = this.getList(section);
		state.query = { ...state.query, search, page: 1 };
		void this.loadPage(section);
	}

	setSort(section: VehiclePage, sortBy: VehicleSortField) {
		const state = this.getList(section);
		const sortDirection: SortDirection =
			state.query.sortBy === sortBy && state.query.sortDirection === "asc"
				? "desc"
				: "asc";
		state.query = { ...state.query, sortBy, sortDirection, page: 1 };
		void this.loadPage(section);
	}

	setPage(section: VehiclePage, value: number) {
		const state = this.getList(section);
		state.query.page = value;
		void this.loadPage(section);
	}

	setModelMake(makeId: number | "all") {
		this.models.query = { ...this.models.query, makeId, page: 1 };
		void this.loadModels();
	}

	clearError() {
		this.error = "";
	}

	async saveMake(input: VehicleMakeInput, id?: number) {
		await this.save(
			() => vehicleCatalogService.saveMake(input, id),
			() => this.refreshMakes(),
		);
	}

	async removeMake(id: number) {
		await this.save(
			() => vehicleCatalogService.deleteMake(id),
			() => this.refreshMakes(),
		);
	}

	async saveModel(input: VehicleModelInput, id?: number) {
		await this.save(
			() => vehicleCatalogService.saveModel(input, id),
			() => this.refreshModels(),
		);
	}

	async removeModel(id: number) {
		await this.save(
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

	private getList(section: VehiclePage) {
		return section === "makes" ? this.makes : this.models;
	}

	private async loadMakeOptions() {
		const options = await vehicleCatalogService.listMakeOptions();
		runInAction(() => {
			this.makeOptions = options;
		});
	}

	private async loadList<T, Q extends VehicleListQuery>(
		state: ListState<T, Q>,
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
				this.error =
					error instanceof Error
						? error.message
						: "Could not load catalog data.";
				state.loading = false;
			});
		}
	}

	private async save(
		action: () => Promise<void>,
		refresh: () => Promise<void>,
	) {
		this.saving = true;
		this.error = "";
		try {
			await action();
			await refresh();
		} catch (error) {
			runInAction(() => {
				this.error =
					error instanceof Error
						? error.message
						: "Could not save catalog data.";
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
