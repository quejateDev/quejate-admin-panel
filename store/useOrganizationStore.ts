import type { AdminEntityListItem } from "@/types/api";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OrganizationStore {
  entity: AdminEntityListItem | null;
  setEntity: (entity: AdminEntityListItem) => void;
}

const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      entity: null,
      setEntity: (entity) => {
        set({ entity });
      },
    }),
    {
      name: "organization-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useOrganizationStore;
