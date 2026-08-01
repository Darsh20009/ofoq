import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Edit2, Shield, UserCheck, UserX } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { X } from "lucide-react";
import { usersApi } from "../../../api/client";
import type { User } from "../../../types";
import { useAuthStore } from "../../../store/authStore";

const ROLE_CONFIG: Record<string, { label: string; color: string }> = {
  super_admin: { label: "مدير عام",    color: "badge-red"   },
  admin:       { label: "مدير",         color: "badge-navy"  },
  manager:     { label: "مشرف",         color: "badge-blue"  },
  employee:    { label: "موظف",         color: "badge-green" },
  client:      { label: "عميل",         color: "badge-gray"  },
};

export default function UsersPage() {
  const qc = useQueryClient();
  const { user: me } = useAuthStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["users", search],
    queryFn: () => usersApi.list({ search, limit: 50 }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => usersApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["users"] }); toast.success("تم حذف المستخدم"); },
  });

  const users: User[] = data?.data?.users || [];

  return (
    <div className="space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">المستخدمون</h1>
          <p className="page-subtitle">{users.length} مستخدم مسجّل</p>
        </div>
        <button onClick={() => { setEditUser(null); setModalOpen(true); }} className="btn-primary">
          <Plus size={16} /> إضافة مستخدم
        </button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..." className="input-field pr-10" />
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
                  <th>المستخدم</th>
                  <th>الصلاحية</th>
                  <th>الحالة</th>
                  <th>القسم</th>
                  <th>التحقق الثنائي</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const role = ROLE_CONFIG[u.role] || { label: u.role, color: "badge-gray" };
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
                          {u.status === "active" ? "نشط" : "معطّل"}
                        </span>
                      </td>
                      <td className="text-gray-500 text-sm">{u.department || "—"}</td>
                      <td>
                        {u.twoFactorEnabled ? (
                          <span className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
                            <Shield size={12} /> مفعّل
                          </span>
                        ) : (
                          <span className="text-gray-400 text-xs">غير مفعّل</span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditUser(u); setModalOpen(true); }}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-navy-700">
                            <Edit2 size={14} />
                          </button>
                          {u._id !== me?._id && (
                            <button onClick={() => { if (confirm("حذف المستخدم؟")) deleteMut.mutate(u._id); }}
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
  const { register, handleSubmit, reset, watch } = useForm();
  const isEdit = !!user;

  useState(() => { if (user) reset(user); else reset({ role: "employee", status: "active" }); });

  const mut = useMutation({
    mutationFn: (data: object) =>
      user ? usersApi.update(user._id, data) : usersApi.create(data),
    onSuccess: () => { toast.success(user ? "تم التحديث" : "تمت الإضافة"); onSaved(); },
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
              <h2 className="font-bold text-navy-700">{user ? "تعديل مستخدم" : "إضافة مستخدم"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit((d) => mut.mutate(d))} className="p-6 space-y-4">
              <div>
                <label className="label">الاسم الكامل *</label>
                <input {...register("name", { required: true })} className="input-field" placeholder="الاسم الكامل" />
              </div>
              <div>
                <label className="label">البريد الإلكتروني *</label>
                <input {...register("email", { required: true })} type="email" className="input-field" dir="ltr" />
              </div>
              {!isEdit && (
                <div>
                  <label className="label">كلمة المرور *</label>
                  <input {...register("password", { required: !isEdit })} type="password" className="input-field" />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">الصلاحية</label>
                  <select {...register("role")} className="input-field">
                    <option value="employee">موظف</option>
                    <option value="manager">مشرف</option>
                    <option value="admin">مدير</option>
                    <option value="super_admin">مدير عام</option>
                    <option value="client">عميل</option>
                  </select>
                </div>
                <div>
                  <label className="label">الحالة</label>
                  <select {...register("status")} className="input-field">
                    <option value="active">نشط</option>
                    <option value="inactive">غير نشط</option>
                    <option value="suspended">موقوف</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="label">القسم</label>
                <input {...register("department")} className="input-field" placeholder="التسويق، المبيعات، التقنية..." />
              </div>
              <div>
                <label className="label">المسمى الوظيفي</label>
                <input {...register("position")} className="input-field" placeholder="مدير مشروع، مطور..." />
              </div>
              <div>
                <label className="label">رقم الهاتف</label>
                <input {...register("phone")} className="input-field" dir="ltr" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={mut.isPending} className="btn-primary flex-1 justify-center">
                  {mut.isPending ? "..." : user ? "تحديث" : "إضافة"}
                </button>
                <button type="button" onClick={onClose} className="btn-ghost">إلغاء</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
