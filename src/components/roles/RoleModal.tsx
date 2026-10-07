"use client";

import { X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { AVAILABLE_PERMISSIONS } from "@/lib/constants";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface RoleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: any;
}

export default function RoleModal({ isOpen, onClose, onSuccess, role }: RoleModalProps) {
  const [name, setName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (role) {
      setName(role.name);
      if (role.permissions) {
        setSelectedPermissions(role.permissions.split(",").map((p: string) => p.trim()));
      } else {
        setSelectedPermissions([]);
      }
    } else {
      setName("");
      setSelectedPermissions([]);
    }
    setError("");
  }, [role, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const togglePermission = (id: string) => {
    setSelectedPermissions((prev) => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = role ? `/api/roles/${role.id}` : "/api/roles";
      const method = role ? "PUT" : "POST";
      
      const permissionsString = selectedPermissions.join(",");

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, permissions: permissionsString }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Lỗi hệ thống");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40">
          <div>
            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
              Phân quyền truy cập
            </span>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {role ? "Cập nhật Cấu hình Vai trò" : "Khởi tạo Vai trò Mới"}
            </h2>
          </div>
          <button 
            type="button"
            onClick={onClose} 
            className="flex items-center gap-1 px-2.5 py-1 text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Thoát</span>
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1 text-xs">
          <form id="roleForm" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs">
                {error}
              </div>
            )}
            
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                Mã định danh vai trò (Role Key) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-mono text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-blue-600 uppercase transition-colors"
                placeholder="Ví dụ: AUDITOR_LEAD"
              />
              <p className="text-[11px] text-zinc-500">Định dạng chữ in hoa không khoảng trắng (Ví dụ: HR_LEAD, DIRECTOR, OPS).</p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300 block">
                Ma trận đặc quyền phân bổ
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {AVAILABLE_PERMISSIONS.map((perm) => {
                  const isSelected = selectedPermissions.includes(perm.id);
                  return (
                    <div 
                      key={perm.id}
                      onClick={() => togglePermission(perm.id)}
                      className={cn(
                        "flex items-start gap-2.5 p-3 rounded-lg border cursor-pointer transition-colors",
                        isSelected 
                          ? "bg-blue-50/60 dark:bg-blue-950/30 border-blue-500 text-blue-900 dark:text-blue-100" 
                          : "bg-white dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      )}
                    >
                      <div className={cn(
                        "w-4 h-4 rounded shrink-0 mt-0.5 flex items-center justify-center border transition-colors",
                        isSelected ? "bg-blue-600 border-blue-600 text-white" : "border-zinc-300 dark:border-zinc-600"
                      )}>
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <div className="flex-1">
                        <div className={cn("text-xs font-semibold", isSelected ? "text-blue-700 dark:text-blue-300" : "text-zinc-800 dark:text-zinc-200")}>
                          {perm.label}
                        </div>
                        <div className="text-[10px] font-mono text-zinc-400 mt-0.5">{perm.id}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </form>
        </div>
        
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5 bg-zinc-50/70 dark:bg-zinc-800/40">
          <button 
            type="button" 
            onClick={onClose} 
            className="flex items-center gap-1 px-3.5 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>Thoát</span>
          </button>
          <button 
            type="submit" 
            form="roleForm" 
            disabled={loading} 
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs font-medium rounded-lg disabled:opacity-70 flex items-center gap-2 transition-colors shadow-xs"
          >
            {loading && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white dark:border-zinc-900/30 dark:border-t-zinc-900 rounded-full animate-spin" />}
            {role ? "Cập nhật vai trò" : "Khởi tạo vai trò"}
          </button>
        </div>

      </div>
    </div>
  );
}
