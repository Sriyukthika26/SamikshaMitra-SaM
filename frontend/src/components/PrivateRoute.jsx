import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

import React from 'react'

const PrivateRoute = () => {
  const { userInfo } = useSelector((state) => state.auth); // gives user info
  return userInfo ? <Outlet /> : <Navigate to='/login' replace />
}

export default PrivateRoute