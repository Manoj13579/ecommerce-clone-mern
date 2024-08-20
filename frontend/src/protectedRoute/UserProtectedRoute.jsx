import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

const UserProtectedRoute = () => {
    const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
    

    // useEfect only used for displaying toast
    useEffect(() => {
        if (!userinfo) {
            toast.warn('You must login first');
        }
    }, []);

    if (userinfo?.role === 'user') {
        return <Outlet />;
    } else {
        return <Navigate to='/login' />;
    }
};

export default UserProtectedRoute;