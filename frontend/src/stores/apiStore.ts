import { PersistOptions, persist } from "zustand/middleware";

import { StateCreator } from "zustand";
import { UserResponse } from "../api/model/userResponse";
import { create } from "zustand";
import { mountStoreDevtool } from "simple-zustand-devtools";

export interface ApiState {
    user?: UserResponse;
    chatAuthenticated: boolean;
    setUser: (user: UserResponse | undefined) => void;
    setChatAuthenticated: (chatAuthenticated: boolean) => void;
}

type ApiStorePersist = (config: StateCreator<ApiState>, options: PersistOptions<ApiState>) => StateCreator<ApiState>;

export const useApiStore = create<ApiState>(
    ((persist as unknown) as ApiStorePersist)(
        (set) => ({
            user: undefined,
            chatAuthenticated: false,
            setUser: (user) => set((state) => ({ ...state, user })),
            setChatAuthenticated: (chatAuthenticated) => set((state) => ({ ...state, chatAuthenticated })),
        }),
        { name: "apiStore" }
    )
);

if (process.env.NODE_ENV === "development") {
    mountStoreDevtool("ApiStore", useApiStore);
}
