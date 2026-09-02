import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CarFront, Lock, Mail } from "lucide-react";
import { authApi } from "../services";
import { setUser } from "../store";

export default function Login() {
  const [email, setEmail] = useState("admin@instantmechanic.com");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    authApi
      .login({ email, password })
      .then((res) => {
        dispatch(setUser(res.data.user));
        toast.success("Welcome back");
        navigate("/dashboard");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Login failed");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen bg-slate-950 p-5 text-white grid place-items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
        
        {/* Header Icon & Title */}
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-white">
          <CarFront />
        </div>
        <h1 className="text-center text-2xl font-bold">Operations Login</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Sign in to manage vehicle service operations.</p>

        {/* Email Field */}
        <label className="mt-7 block text-sm font-medium">Email</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border px-3 focus-within:ring-2 focus-within:ring-slate-900">
          <Mail size={18} className="text-slate-400" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full py-3 outline-none"
          />
        </div>

        {/* Password Field */}
        <label className="mt-4 block text-sm font-medium">Password</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border px-3 focus-within:ring-2 focus-within:ring-slate-900">
          <Lock size={18} className="text-slate-400" />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-3 outline-none"
          />
        </div>

        {/* Submit Button */}
        <button
          disabled={loading}
          className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}