import React, { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { toast } from "react-toastify";

const AdminProtectedRoute = () => {
    const userinfo = JSON.parse(sessionStorage.getItem("userInfo"));
    

    // useEfect only used for displaying toast
    /* good to use !userinfo coz it checks for userinfo for null, falsy, 0 or other negative
    value wheras userinfo !== null only checks for null value */
    
    useEffect(() => {
        if (!userinfo) {
            toast.warn('You must login first');
        }
    }, []);

    if (userinfo?.role === 'admin') {
        return <Outlet />;
    } else {
        return <Navigate to='/login' />;
    }
};

export default AdminProtectedRoute;