import { configureStore, createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: { user: null, checked: false },
  reducers: {
    setUser: (state, action) => { state.user = action.payload; state.checked = true; },
    clearUser: (state) => { state.user = null; state.checked = true; }
  }
});

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: { data: null, loading: false },
  reducers: {
    setDashboard: (state, action) => { state.data = action.payload; },
    setDashboardLoading: (state, action) => { state.loading = action.payload; }
  }
});

export const { setUser, clearUser } = authSlice.actions;
export const { setDashboard, setDashboardLoading } = dashboardSlice.actions;

export const store = configureStore({
  reducer: { auth: authSlice.reducer, dashboard: dashboardSlice.reducer }
});
