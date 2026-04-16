import { useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../../context/AdminAuthContext";

export default function Dashboard() {
  const { adminUser, logoutAdmin } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin/login");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">General Admin Dashboard</h1>
            <p className="text-slate-400">
              Welcome, {adminUser?.title || "General Admin"}
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-xl bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
            <p className="text-slate-400 text-sm">Admins</p>
            <h2 className="mt-2 text-2xl font-bold">Manage Roles</h2>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
            <p className="text-slate-400 text-sm">Logs</p>
            <h2 className="mt-2 text-2xl font-bold">System Activity</h2>
          </div>

          <div className="rounded-2xl bg-white/10 p-5 border border-white/10">
            <p className="text-slate-400 text-sm">Security</p>
            <h2 className="mt-2 text-2xl font-bold">Full Control</h2>
          </div>
        </div>
      </div>
    </div>
  );
}