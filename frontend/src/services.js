import api from "./api";

export const authApi = {
  login: (data) => api.post("/auth/login", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me")
};

export const dashboardApi = () => api.get("/dashboard");
export const bookingsApi = (params) => api.get("/bookings", { params });
export const bookingApi = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatusApi = (id, status) => api.patch(`/bookings/${id}/status`, { status });
export const mechanicsApi = () => api.get("/mechanics");
export const updateMechanicStatusApi = (id, status) => api.patch(`/mechanics/${id}/status`, { status });
export const customersApi = () => api.get("/customers");
