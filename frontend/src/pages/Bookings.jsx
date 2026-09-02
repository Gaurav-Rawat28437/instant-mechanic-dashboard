import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  Download,
  X,
  CalendarX2,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  bookingsApi,
  bookingsExportApi,
  bookingFilterOptionsApi,
  mechanicsApi,
} from "../services";
import StatusBadge from "../components/StatusBadge";
import EmptyState from "../components/EmptyState";
import { TableRowSkeleton } from "../components/Skeleton";

const STATUSES = [
  "ALL",
  "PENDING",
  "ASSIGNED",
  "MECHANIC_ON_THE_WAY",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
];

const DEFAULT_FILTERS = {
  search: "",
  status: "ALL",
  service: "ALL",
  mechanic: "ALL",
  dateFrom: "",
  dateTo: "",
  sortBy: "scheduledAt",
  sortOrder: "desc",
  page: 1,
  limit: 10,
};

// Helper: Format JSON records to downloadable CSV format
function convertToCSV(data) {
  const headers = [
    "Booking ID",
    "Customer",
    "Vehicle",
    "Registration",
    "Service",
    "Category",
    "Mechanic",
    "Status",
    "Amount",
    "Scheduled",
  ];

  const escapeVal = (val) => `"${String(val ?? "").replaceAll('"', '""')}"`;

  const rows = data.map((item) =>
    [
      item.bookingId,
      item.customer?.name || "",
      `${item.vehicle.brand} ${item.vehicle.model}`,
      item.vehicle.registrationNumber,
      item.service.name,
      item.service.category,
      item.mechanic?.name || "Unassigned",
      item.status,
      item.amount,
      new Date(item.scheduledAt).toISOString(),
    ]
      .map(escapeVal)
      .join(",")
  );

  return [headers.map(escapeVal).join(","), ...rows].join("\n");
}

export default function Bookings() {
  // Main Data States
  const [bookings, setBookings] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  // Dropdown Option States
  const [serviceCategories, setServiceCategories] = useState([]);
  const [mechanics, setMechanics] = useState([]);

  // UI / Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Helper: Update filter state and reset back to page 1 on search/filter changes
  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key !== "page" ? { page: 1 } : {}),
    }));
  };

  // Fetch Filter Dropdown Data (Services & Mechanics) on mount
  useEffect(() => {
    bookingFilterOptionsApi()
      .then((res) => setServiceCategories(res.data.data.serviceCategories || []))
      .catch(() => {});

    mechanicsApi()
      .then((res) => setMechanics(res.data.data || []))
      .catch(() => {});
  }, []);

  // Fetch Bookings list based on current active filters
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await bookingsApi(filters);
      setBookings(response.data.data || []);
      setPagination(
        response.data.pagination || { page: 1, pages: 1, total: 0 }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load bookings");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Debounce API calls on quick search keypresses
  useEffect(() => {
    const timer = setTimeout(fetchBookings, 300);
    return () => clearTimeout(timer);
  }, [fetchBookings]);

  // Active state indicator for advanced filter panel
  const isAdvancedFiltered =
    filters.service !== "ALL" ||
    filters.mechanic !== "ALL" ||
    Boolean(filters.dateFrom) ||
    Boolean(filters.dateTo);

  const handleClearAdvancedFilters = () => {
    setFilters((prev) => ({
      ...prev,
      service: "ALL",
      mechanic: "ALL",
      dateFrom: "",
      dateTo: "",
      page: 1,
    }));
  };

  // Handle Export CSV Process
  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const response = await bookingsExportApi(filters);
      const csvData = convertToCSV(response.data.data || []);

      const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = `bookings-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      URL.revokeObjectURL(url);

      const count = response.data.data.length;
      toast.success(`Exported ${count} record${count === 1 ? "" : "s"}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* --- Page Header --- */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Operations
          </span>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            Bookings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {pagination.total} total records found
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={isExporting || pagination.total === 0}
          className="flex items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          <Download size={16} />
          {isExporting ? "Exporting..." : "Export CSV"}
        </button>
      </div>

      {/* --- Search & Control Toolbar --- */}
      <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-3 md:flex-row">
          {/* Search Bar */}
          <div className="flex flex-1 items-center gap-2 rounded-xl border px-3 py-1 dark:border-slate-700">
            <Search size={18} className="text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              placeholder="Search booking ID, vehicle, or customer..."
              className="w-full bg-transparent py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Status Select */}
          <select
            value={filters.status}
            onChange={(e) => updateFilter("status", e.target.value)}
            className="rounded-xl border bg-transparent px-3 py-2 text-sm text-slate-800 outline-none dark:border-slate-700 dark:text-slate-100 dark:[color-scheme:dark]"
          >
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          {/* Sort Order Toggle */}
          <button
            onClick={() =>
              updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")
            }
            className="flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            <ArrowUpDown size={16} /> Sort ({filters.sortOrder.toUpperCase()})
          </button>

          {/* Toggle Advanced Filters */}
          <button
            onClick={() => setShowAdvancedFilters((prev) => !prev)}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition ${
              isAdvancedFiltered
                ? "border-slate-900 bg-slate-900 text-white dark:border-white dark:bg-white dark:text-slate-900"
                : "hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            }`}
          >
            <SlidersHorizontal size={16} />
            Filters {isAdvancedFiltered && "•"}
          </button>
        </div>

        {/* Expandable Advanced Filters Grid */}
        {showAdvancedFilters && (
          <div className="mt-4 grid gap-4 border-t pt-4 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Service Category
              </label>
              <select
                value={filters.service}
                onChange={(e) => updateFilter("service", e.target.value)}
                className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                <option value="ALL">All Categories</option>
                {serviceCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                Assigned Mechanic
              </label>
              <select
                value={filters.mechanic}
                onChange={(e) => updateFilter("mechanic", e.target.value)}
                className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700 dark:text-slate-100 dark:[color-scheme:dark]"
              >
                <option value="ALL">All Mechanics</option>
                {mechanics.map((mech) => (
                  <option key={mech._id} value={mech._id}>
                    {mech.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter("dateFrom", e.target.value)}
                className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700 dark:text-slate-100 dark:[color-scheme:dark]"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500 dark:text-slate-400">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter("dateTo", e.target.value)}
                className="w-full rounded-xl border bg-transparent px-3 py-2 text-sm outline-none dark:border-slate-700 dark:text-slate-100 dark:[color-scheme:dark]"
              />
            </div>

            {isAdvancedFiltered && (
              <div className="sm:col-span-2 lg:col-span-4">
                <button
                  onClick={handleClearAdvancedFilters}
                  className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-red-500 dark:text-slate-400"
                >
                  <X size={14} /> Clear active filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- Bookings Table --- */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4">Booking ID</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Service</th>
                <th>Mechanic</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody className="divide-y text-slate-700 dark:divide-slate-800 dark:text-slate-200">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRowSkeleton key={i} columns={8} />
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center">
                    <EmptyState
                      icon={CalendarX2}
                      title="No bookings found"
                      description="Try clearing or adjusting your search parameters."
                    />
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking._id}
                    className="transition hover:bg-slate-50/80 dark:hover:bg-slate-800/60"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900 dark:text-slate-100">
                      <Link
                        to={`/bookings/${booking._id}`}
                        className="hover:underline"
                      >
                        {booking.bookingId}
                      </Link>
                    </td>
                    <td>{booking.customer?.name || "—"}</td>
                    <td>
                      <div>{`${booking.vehicle.brand} ${booking.vehicle.model}`}</div>
                      <div className="text-xs text-slate-400">
                        {booking.vehicle.registrationNumber}
                      </div>
                    </td>
                    <td>
                      <div>{booking.service.name}</div>
                      <div className="text-xs text-slate-400">
                        {booking.service.category}
                      </div>
                    </td>
                    <td>
                      {booking.mechanic ? (
                        <Link
                          to={`/mechanics/${booking.mechanic._id}`}
                          className="hover:underline"
                        >
                          {booking.mechanic.name}
                        </Link>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={booking.status} />
                    </td>
                    <td className="font-medium">
                      ₹{booking.amount?.toLocaleString("en-IN")}
                    </td>
                    <td>
                      {new Date(booking.scheduledAt).toLocaleString("en-IN", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* --- Pagination Footer --- */}
        <div className="flex items-center justify-between border-t px-5 py-4 text-sm dark:border-slate-800">
          <span className="text-slate-500 dark:text-slate-400">
            Page {pagination.page} of {Math.max(pagination.pages, 1)}
          </span>
          <div className="flex gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => updateFilter("page", pagination.page - 1)}
              className="rounded-lg border p-2 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              disabled={pagination.page >= pagination.pages}
              onClick={() => updateFilter("page", pagination.page + 1)}
              className="rounded-lg border p-2 transition hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}