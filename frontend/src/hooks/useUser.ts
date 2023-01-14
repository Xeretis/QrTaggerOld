import { useApiStore } from "./../stores/apiStore";

export const useUser = () => {
    const user = useApiStore((state) => state.user);

    return user;
};