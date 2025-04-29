import { Entity } from "@prisma/client";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface OrganizationStore {
  entity: Entity | null;
  setEntity: (entity: Entity) => void;
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
