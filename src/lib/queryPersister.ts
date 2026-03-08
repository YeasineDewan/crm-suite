import { createSyncStoragePersister } from "@tanstack/react-query-persist-client";

export const localStoragePersister = createSyncStoragePersister({
  storage: window.localStorage,
  key: "crm-query-cache",
});
