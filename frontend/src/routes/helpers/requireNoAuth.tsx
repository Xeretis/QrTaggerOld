import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useUser } from "../../hooks/useUser";

export const RequireNoAuth = ({ redirect }: { redirect?: string }) => {
    const user = useUser();
    const location = useLocation();

    return user ? <Navigate to={redirect ?? "/home"} state={{ from: location }} replace={true} /> : <Outlet />;
};