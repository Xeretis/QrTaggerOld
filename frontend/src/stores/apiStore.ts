import { PersistOptions, persist } from "zustand/middleware";

import { StateCreator } from "zustand";
import { UserResponse } from "../api/model/userResponse";
import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

export interface ApiState {
    user?: UserResponse;
    setUser: (user: UserResponse | undefined) => void;
}

type ApiStorePersist = (config: StateCreator<ApiState>, options: PersistOptions<ApiState>) => StateCreator<ApiState>;

export const useApiStore = create<ApiState>(
    ((persist as unknown) as ApiStorePersist)(
        (set) => ({
            user: undefined,
            setUser: (user) => set({ user }),
        }),
        { name: "apiStore" }
    )
);

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("ApiStore", useApiStore);
}
