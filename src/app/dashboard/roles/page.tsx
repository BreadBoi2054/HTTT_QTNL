"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Search, ShieldCheck } from "lucide-react";
import RoleModal from "@/components/roles/RoleModal";
import { useConfirm, TableSkeleton } from "@/components/providers/ToastProvider";
import { AVAILABLE_PERMISSIONS } from "@/lib/constants";

export default function RolesPage() {
  const confirm = useConfirm();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roles");
      const data = await res.json();
      setRoles(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const CORE_ROLES = ["SYSTEM_ADMIN", "BOD", "HR", "MANAGER", "ACCOUNTANT", "USER"];

  const handleDelete = async (id: string, name: string) => {
    if (CORE_ROLES.includes(name)) {
      alert("Không thể xóa vai trò lõi của hệ thống (" + name + ").");
      return;
    }
    if (!(await confirm("Bạn có chắc chắn muốn xóa vai trò này?"))) return;
    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const errText = await res.text();
        alert(errText || "Không thể xóa vai trò này.");
        return;
      }
      fetchRoles();
    } catch (error) {
      console.error(error);
    }
  };

  const openAddModal = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: any) => {
    if (role.name === "SYSTEM_ADMIN" || role.name === "BOD") {
      alert("Không thể chỉnh sửa vai trò quản trị hệ thống hoặc Ban Giám Đốc gốc.");
      return;
    }
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const filteredData = roles.filter((r) => 
    r.name.toLowerCase().includes(search.toLowerCase())
  );
  const getPermissionLabels = (role: { permissions?: string | null }) => {
    const ids = String(role.permissions || "").split(",").map((permission) => permission.trim()).filter(Boolean);
    return ids.map((id) => AVAILABLE_PERMISSIONS.find((permission) => permission.id === id)?.label || id);
  };

  return (
    <div className="space-y-6 animate-swiss-in pb-12 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100">
            Quản Lý Vai Trò & Phân Quyền
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Thiết lập danh mục vai trò người dùng và phân bổ ma trận quyền hạn hệ thống
          </p>
        </div>
        <button 
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm vai trò</span>
        </button>
      </div>

      {/* TABLE CONTAINER */}
      <div className="bento-card rounded-2xl overflow-hidden shadow-xs">
        <div className="p-3.5 border-b border-zinc-100 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/40">
          <div className="relative w-full max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700/80 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-blue-600 transition-colors"
              placeholder="Tìm theo tên vai trò..."
            />
          </div>
          <span className="text-xs text-zinc-500 font-medium">
            Tổng cộng: <strong className="font-bold font-mono text-zinc-900 dark:text-zinc-100">{roles.length}</strong> vai trò
          </span>
        </div>

        <div className="hidden lg:block overflow-x-auto">
          <table className="min-w-[760px] w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50/50 dark:bg-zinc-800/40 text-zinc-500 dark:text-zinc-400 text-xs font-semibold border-b border-zinc-100 dark:border-zinc-800 uppercase tracking-wider">
                <th className="px-5 py-3.5">Tên vai trò</th>
                <th className="px-5 py-3.5">Danh sách quyền</th>
                <th className="px-5 py-3.5 text-center">Tài khoản</th>
                <th className="px-5 py-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-4">
                    <TableSkeleton rows={5} cols={4} />
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-zinc-500 text-xs">
                    Không tìm thấy vai trò phù hợp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredData.map((role) => (
                  <tr key={role.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-all">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                            {role.name}
                          </div>
                          {role.name === "SYSTEM_ADMIN" && (
                            <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold border border-blue-200/60 dark:border-blue-800/60 mt-0.5">
                              Quản trị gốc
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-600 dark:text-zinc-400 max-w-xl">
                      <div className="flex flex-wrap gap-1.5">
                        {getPermissionLabels(role).length ? getPermissionLabels(role).map((permission) => (
                          <span key={permission} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[11px] leading-snug">{permission}</span>
                        )) : <span className="text-zinc-400">Quyền mặc định</span>}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs font-bold font-mono text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-700/60">
                        {role._count?.users || 0}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {role.name !== "SYSTEM_ADMIN" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => openEditModal(role)} 
                            className="p-1.5 text-zinc-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl transition-all shadow-2xs"
                            title="Sửa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          {!CORE_ROLES.includes(role.name) && (
                            <button 
                              onClick={() => handleDelete(role.id, role.name)} 
                              className="p-1.5 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-all shadow-2xs"
                              title="Xóa"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400 font-medium">
                          Cố định
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 gap-3 p-3 lg:hidden">
          {loading ? <TableSkeleton rows={4} cols={2} /> : filteredData.length === 0 ? (
            <p className="py-8 text-center text-sm text-zinc-500">Không tìm thấy vai trò phù hợp với điều kiện tìm kiếm.</p>
          ) : filteredData.map((role) => (
            <article key={role.id} className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="squircle w-9 h-9 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400"><ShieldCheck className="w-4 h-4" /></div>
                  <div><h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{role.name}</h2><p className="text-xs text-zinc-500 mt-1">{role._count?.users || 0} tài khoản</p></div>
                </div>
                <div className="flex gap-1">
                  {role.name !== "SYSTEM_ADMIN" && <button onClick={() => openEditModal(role)} className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40" aria-label={`Sửa vai trò ${role.name}`}><Edit2 className="w-4 h-4" /></button>}
                  {!CORE_ROLES.includes(role.name) && <button onClick={() => handleDelete(role.id, role.name)} className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40" aria-label={`Xóa vai trò ${role.name}`}><Trash2 className="w-4 h-4" /></button>}
                </div>
              </div>
              <details className="mt-3 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                <summary className="cursor-pointer text-xs font-medium text-zinc-600 dark:text-zinc-300">Xem {getPermissionLabels(role).length || "quyền mặc định"} quyền</summary>
                <div className="flex flex-wrap gap-1.5 mt-3">{getPermissionLabels(role).length ? getPermissionLabels(role).map((permission) => <span key={permission} className="rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[11px]">{permission}</span>) : <span className="text-xs text-zinc-400">Quyền mặc định</span>}</div>
              </details>
            </article>
          ))}
        </div>
      </div>

      <RoleModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchRoles} 
        role={selectedRole} 
      />
    </div>
  );
}
