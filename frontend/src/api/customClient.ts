import { useApiStore } from "./../stores/apiStore";

type CustomClient<T> = (data: {
    url: string;
    method: "get" | "post" | "put" | "delete" | "patch";
    params?: Record<string, any>;
    headers?: Record<string, any>;
    data?: BodyType<unknown>;
    signal?: AbortSignal;
}) => Promise<T>;

export const useCustomClient = <T>(): CustomClient<T> => {
    return async ({ url, method, params, data }) => {
        try {
            const response = await fetch(url + new URLSearchParams(params), {
                method,
                headers: { ...data?.headers, "Content-Type": "application/json", Accept: "application/json" },
                ...(data ? { body: JSON.stringify(data) } : {}),
            });

            if (!response.ok) {
                const res = { status: response.status, data: await response.json() };
                throw res;
            }

            try {
                return await response.json();
            } catch (error) {
                return;
            }
        } catch (error) {
            if (error.status === 401) {
                useApiStore.setState({ user: undefined });
            }
            throw error;
        }
    };
};

export default useCustomClient;

export type ErrorType<ErrorData> = ErrorData;

export type BodyType<BodyData> = BodyData & { headers?: any };
