# Vehicle catalog admin

Minimal React + MobX frontend for administering `VehicleMake` and `VehicleModel` records.

## Run

```bash
npm install
npm run dev
```

Checks:

```bash
npm run build
npm run lint
```

## Structure

- `src/components/ui` contains the small reusable control set: buttons, dialog, and pagination.
- `src/components/vehicles` contains one catalog screen with make/model views and their forms.
- `src/stores` contains the MobX state and query state for the catalog.
- `src/services` contains the mock backend methods. Replace these methods with HTTP calls when the backend is available.
- `src/types` contains shared catalog types.

The mock service already accepts backend-style parameters for search, sorting, page, page size, and model make filtering. Replacing the mock implementation does not require changing the screens.
