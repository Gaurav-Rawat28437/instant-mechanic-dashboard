import api from "./api";

// Authentication
export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me")
};

// Dashboard
export const dashboardApi = () => api.get("/dashboard");

// Bookings
export const bookingsApi = (params) => api.get("/bookings", { params });
export const bookingsExportApi = (params) => api.get("/bookings", { params: { ...params, export: "true", page: 1 } });
export const bookingFilterOptionsApi = () => api.get("/bookings/filters/meta");
export const bookingApi = (id) => api.get(`/bookings/${id}`);
export const updateBookingStatusApi = (id, status) => api.patch(`/bookings/${id}/status`, { status });

// Mechanics
export const mechanicsApi = () => api.get("/mechanics");
export const mechanicApi = (id) => api.get(`/mechanics/${id}`);
export const updateMechanicStatusApi = (id, status) => api.patch(`/mechanics/${id}/status`, { status });

// Customers
export const customersApi = () => api.get("/customers");