import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { CarFront, Lock, Mail } from "lucide-react";
import { authApi } from "../services";
import { setUser } from "../store";

export default function Login() {
  const [form, setForm] = useState({ email: "admin@instantmechanic.com", password: "Admin@12345" });
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authApi.login(form);
      dispatch(setUser(r.data.user));
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-slate-950 p-5 text-white grid place-items-center">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl bg-white p-8 text-slate-900 shadow-2xl">
        <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-white"><CarFront/></div>
        <h1 className="text-center text-2xl font-bold">Operations Login</h1>
        <p className="mt-2 text-center text-sm text-slate-500">Sign in to manage vehicle service operations.</p>
        <label className="mt-7 block text-sm font-medium">Email</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border px-3"><Mail size={18} className="text-slate-400"/><input className="w-full py-3 outline-none" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
        <label className="mt-4 block text-sm font-medium">Password</label>
        <div className="mt-2 flex items-center gap-2 rounded-xl border px-3"><Lock size={18} className="text-slate-400"/><input type="password" className="w-full py-3 outline-none" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/></div>
        <button disabled={loading} className="mt-6 w-full rounded-xl bg-slate-900 py-3 font-semibold text-white disabled:opacity-50">{loading ? "Signing in..." : "Sign in"}</button>
      </form>
    </div>
  );
}
