import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit2, Shield, UserCheck, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { usersApi } from "../../../api/client";
import type { User } from "../../../types";
import { useAuthStore } from "../../../store/authStore";
import { useLang } from "../../../i18n/LangContext";
import PhoneInput from "../../../components/forms/PhoneInput";

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAuthStore();
  const { ui } = useLang();
  const copy = ui.adminPages.adminPortal;
  const roleConfig: Record<string, { label: string; color: string }> = {
    super_admin: { label: copy.roleSuperAdmin, color: "badge-red" },
    admin: { label: copy.roleAdmin, color: "badge-navy" },
    manager: { label: copy.roleManager, color: "badge-blue" },
    employee: { label: copy.roleEmployee, color: "badge-green" },
    client: { label: copy.roleClient, color: "badge-gray" },
  };
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () => usersApi.list({ search, limit: 50 }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success(copy.userDeleted || "Deleted"); },
  });

  const users: User[] = data?.users || data?.data?.users || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">{copy.usersTitle}</h1>
          <p className="page-subtitle">{users.length} {copy.usersCount}</p>
        </div>
        <button onClick={() => { setEditUser(null); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> {copy.addUser}
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={copy.searchUsers} className="input-field pr-10" />
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="skeleton h-16 w-full rounded-xl" />)}
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>{copy.userColumn}</th>
                  <th>{copy.roleColumn}</th>
                  <th>{copy.statusColumn}</th>
                  <th>{copy.departmentColumn}</th>
                  <th>{copy.twoFactorColumn}</th>
                  <th>{copy.actionsColumn}</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const role = roleConfig[u.role] || { label: u.role, color: "badge-gray" };
                  return (
                    <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }} className="group">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-ofoq-navy flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-navy-700">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td><span className={role.color}>{role.label}</span></td>
                      <td>
                        <span className={u.status === "active" ? "badge-green" : "badge-red"}>
                          {u.status === "active" ? copy.userActive : copy.userInactive}
                        </span>
                      </td>
                      <td className="text-gray-500 text-sm">{u.department || "—"}</td>
                      <td>
                        {u.twoFactorEnabled ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                            <Shield size={12} /> {copy.userEnabled}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">{copy.userDisabled}</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditUser(u); setModalOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700">
                            <Edit2 size={14} />
                          </button>
                          {u._id !== me?._id && (
                            <button onClick={() => { if (confirm(copy.deleteUserConfirm)) deleteMut.mutate(u._id); }}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <UserModal open={modalOpen} onClose={() => setModalOpen(false)} user={editUser}
        onSaved={() => { qc.invalidateQueries({ queryKey: ["users"] }); setModalOpen(false); }} />
    </div>
  );
}

function UserModal({ open, onClose, user, onSaved }: {
  open: boolean; onClose: () => void; user: User | null; onSaved: () => void;
}) {
  const { register, handleSubmit, reset, watch, control } = useForm();
  const isEdit = !!user;
  const { ui } = useLang();
  const copy = ui.adminPages.adminPortal;

  useEffect(() => {
    if (open) {
      if (user) reset(user);
      else reset({ role: "employee", status: "active" });
    }
  }, [open, user, reset]);

  const mut = useMutation({
    mutationFn: (data: object) =>
      user ? usersApi.update(user._id, data) : usersApi.create(data),
    onSuccess: () => { toast.success(user ? copy.editUser : copy.createUser); onSaved(); },
  });

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40" onClick={onClose} />
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="font-bold text-navy-700">{user ? copy.editUser : copy.createUser}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="label">{copy.fullName} *</label>
                <input {...register("name", { required: true })} className="input-field" placeholder={copy.fullName} />
              </div>
              <div>
                <label className="label">{copy.email} *</label>
                <input {...register("email", { required: true })} type="email" className="input-field" dir="ltr" />
              </div>
              {!isEdit && (
                <div>
                  <label className="label">{copy.password} *</label>
                  <input {...register("password", { required: !isEdit })} type="password" className="input-field" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{copy.roleLabel}</label>
                  <select {...register("role")} className="input-field">
                    <option value="employee">{copy.roleEmployee}</option>
                    <option value="manager">{copy.roleManager}</option>
                    <option value="admin">{copy.roleAdmin}</option>
                    <option value="super_admin">{copy.roleSuperAdmin}</option>
                    <option value="client">{copy.roleClient}</option>
                  </select>
                </div>
                <div>
                  <label className="label">{copy.statusLabel}</label>
                  <select {...register("status")} className="input-field">
                    <option value="active">{copy.userActive}</option>
                    <option value="inactive">{copy.userInactive}</option>
                    <option value="suspended">{copy.userSuspended}</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{copy.departmentColumn}</label>
                <input {...register("department")} className="input-field" placeholder={copy.departmentColumn} />
              </div>
              <div>
                <label className="label">{copy.position}</label>
                <input {...register("position")} className="input-field" placeholder={copy.position} />
              </div>
              <div>
                <label className="label">{copy.phone}</label>
                 <Controller
                   name="phone"
                   control={control}
                   render={({ field }) => (
                     <PhoneInput
                       value={field.value || ""}
                       onChange={field.onChange}
                       onBlur={field.onBlur}
                     />
                   )}
                 />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? "..." : user ? copy.editUser : copy.createUser}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">{ui.adminPages.contracts.cancel}</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
