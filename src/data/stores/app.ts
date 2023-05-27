import { create } from "zustand";

import { env } from "@/env.mjs";
import { createSelectors } from "@/utils";

interface State {
  isBetaPreview: boolean;
  isLoading: boolean;
  isServerDown: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Mutators {}

interface Store extends State, Mutators {}

const store = create<Store>()(
  // persist(
  () => ({
    isBetaPreview: env.NEXT_PUBLIC_BETA_PREVIEW === "true" ?? false,
    isLoading: false,
    isServerDown: false,
  })
  //   {
  //     name: "account",
  //     storage: createJSONStorage(() => sessionStorage),
  //     partialize: (state) =>
  //       Object.fromEntries(
  //         Object.entries(state).filter(([key]) => cachedStates.includes(key))
  //       ),
  //   }
  // )
);

export const useAppStore = createSelectors(store);
