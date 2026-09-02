import { useEffect, useState } from "react";
import { Search, Users } from "lucide-react";
import toast from "react-hot-toast";
import { customersApi } from "../services";
import EmptyState from "../components/EmptyState";
import { CardSkeleton } from "../components/Skeleton";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Fetch customers on load
  useEffect(() => {
    customersApi()
      .then((res) => setCustomers(res.data.data))
      .catch(() => toast.error("Could not load customers"))
      .finally(() => setLoading(false));
  }, []);

  // Filter list directly
  const filtered = customers.filter((c) =>
    `${c.name} ${c.email} ${c.phone}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-slate-400">Customers</p>
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-2 rounded-2xl border bg-white px-4">
        <Search size={18} className="text-slate-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers..."
          className="w-full bg-transparent py-3 outline-none"
        />
      </div>

      {/* Content Area */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-white">
          <EmptyState
            icon={Users}
            title="No customers found"
            description={search ? "Try a different search term." : "New customers will appear here."}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((customer) => (
            <div key={customer._id} className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-slate-100">
                  <Users size={19} />
                </div>
                <div>
                  <p className="font-semibold">{customer.name}</p>
                  <p className="text-xs text-slate-400">{customer.email}</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-500">
                <p>{customer.phone}</p>
                <p>{customer.address}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}