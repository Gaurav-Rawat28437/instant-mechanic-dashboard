import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import toast from "react-hot-toast";
import { MapPin } from "lucide-react";
import { mechanicsApi } from "../services";
import StatusBadge from "../components/StatusBadge";
import { useSocketEvent } from "../useSocket";

const STATUS_COLORS = {
  AVAILABLE: "#10b981",
  BUSY: "#f59e0b",
  ON_THE_WAY: "#8b5cf6",
  OFFLINE: "#94a3b8"
};

const DEFAULT_CENTER = [20.5937, 78.9629]; // Geographic center of India

// Custom map marker icon creator
const createDotIcon = (status) => {
  const color = STATUS_COLORS[status] || "#334155";
  return L.divIcon({
    className: "",
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,.35)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8]
  });
};

export default function MechanicMap() {
  const [mechanics, setMechanics] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch mechanic locations
  const fetchMechanics = () => {
    mechanicsApi()
      .then((res) => setMechanics(res.data.data))
      .catch(() => toast.error("Could not load mechanic locations"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMechanics();
  }, []);

  // Listen for socket events to refresh map
  useSocketEvent("mechanicUpdated", fetchMechanics);

  // Filter mechanics with valid coordinates
  const locatedMechanics = mechanics.filter((m) => m.location?.lat && m.location?.lng);

  // Calculate center of map automatically
  const center = locatedMechanics.length
    ? [
        locatedMechanics.reduce((sum, m) => sum + m.location.lat, 0) / locatedMechanics.length,
        locatedMechanics.reduce((sum, m) => sum + m.location.lng, 0) / locatedMechanics.length
      ]
    : DEFAULT_CENTER;

  return (
    <div>
      {/* Header & Legend */}
      <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm text-slate-400">Team</p>
          <h1 className="text-3xl font-bold">Live Mechanic Map</h1>
          <p className="mt-1 text-sm text-slate-500">
            {locatedMechanics.length} of {mechanics.length} mechanics reporting a location
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 text-xs font-medium">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <span key={status} className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
              {status.replaceAll("_", " ")}
            </span>
          ))}
        </div>
      </div>

      {/* Map Card */}
      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="grid h-[520px] place-items-center text-slate-400">Loading map...</div>
        ) : locatedMechanics.length === 0 ? (
          <div className="flex h-[520px] flex-col items-center justify-center gap-3 text-center text-slate-400">
            <MapPin size={28} />
            <p className="font-medium text-slate-500">No mechanic locations reported yet</p>
            <p className="max-w-sm text-sm">Mechanics will appear on the map once their location is tracked.</p>
          </div>
        ) : (
          <MapContainer
            center={center}
            zoom={locatedMechanics.length > 1 ? 6 : 12}
            style={{ height: 520, width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {locatedMechanics.map((mechanic) => (
              <Marker
                key={mechanic._id}
                position={[mechanic.location.lat, mechanic.location.lng]}
                icon={createDotIcon(mechanic.status)}
              >
                <Popup>
                  <div className="min-w-[160px]">
                    <p className="font-semibold">{mechanic.name}</p>
                    <p className="text-xs text-slate-500">{mechanic.specialization}</p>
                    <div className="mt-2">
                      <StatusBadge status={mechanic.status} />
                    </div>
                    <Link
                      to={`/mechanics/${mechanic._id}`}
                      className="mt-2 block text-xs font-semibold text-blue-600 hover:underline"
                    >
                      View profile →
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        )}
      </div>
    </div>
  );
}