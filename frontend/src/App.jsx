import { useEffect, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { authApi } from "./services";
import { clearUser, setUser } from "./store";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import BookingDetails from "./pages/BookingDetails";
import Mechanics from "./pages/Mechanics";
import Customers from "./pages/Customers";
import Layout from "./components/Layout";

function Protected({ children }) {
  const { user, checked } = useSelector(s => s.auth);
  if (!checked) return <div className="min-h-screen grid place-items-center">Loading...</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authApi.me()
      .then(r => dispatch(setUser(r.data.user)))
      .catch(() => dispatch(clearUser()))
      .finally(() => setLoading(false));
  }, [dispatch]);

  if (loading) return <div className="min-h-screen grid place-items-center text-slate-500">Loading dashboard...</div>;

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Layout /></Protected>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="bookings" element={<Bookings />} />
        <Route path="bookings/:id" element={<BookingDetails />} />
        <Route path="mechanics" element={<Mechanics />} />
        <Route path="customers" element={<Customers />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
