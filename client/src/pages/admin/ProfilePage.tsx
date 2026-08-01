import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  User, Lock, Shield, Camera, Fingerprint, Trash2, Plus,
  CheckCircle, QrCode, AlertCircle, CreditCard, Eye, EyeOff,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { startRegistration } from "@simplewebauthn/browser";
import { useAuthStore } from "../../store/authStore";
import { usersApi, webauthnApi, authApi } from "../../api/client";

type TotpState = "idle" | "setting_up" | "verifying" | "enabled" | "disabling";

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const queryClient = useQueryClient();

  // ── Profile form ────────────────────────────────────────────
  const { register, handleSubmit } = useForm({
    defaultValues: {
      fullName: user?.name,
      fullNameAr: (user as any)?.fullNameAr,
      phone: user?.phone,
      department: user?.department,
      position: user?.position,
    },
  });

  // ── Password form ───────────────────────────────────────────
  const { register: regPwd, handleSubmit: handlePwd, reset: resetPwd, watch: watchPwd } = useForm<{
    currentPassword: string; newPassword: string; confirmPassword: string;
  }>();
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});
  const newPwd = watchPwd("newPassword");

  // ── 2FA state ──────────────────────────────────────────────
  const [totpState, setTotpState] = useState<TotpState>(
    user?.twoFactorEnabled ? "enabled" : "idle"
  );
  const [totpQr, setTotpQr] = useState("");
  const [totpSecret, setTotpSecret] = useState("");
  const [totpCode, setTotpCode] = useState("");

  // ── Passkeys ───────────────────────────────────────────────
  const { data: passkeysData } = useQuery({
    queryKey: ["webauthn-credentials"],
    queryFn: () => webauthnApi.credentials(),
  });
  const passkeys = passkeysData?.data?.credentials || [];

  // ── Avatar upload ──────────────────────────────────────────
  const avatarMut = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("avatar", file);
      return usersApi.update(user!._id, fd as any);
    },
    onSuccess: (res) => { updateUser(res.data.data?.user || res.data.user || res.data); toast.success("تم تحديث الصورة"); },
    onError: () => toast.error("تعذّر رفع الصورة"),
  });

  const updateMut = useMutation({
    mutationFn: (data: object) => usersApi.update(user!._id, data),
    onSuccess: (res) => { updateUser(res.data.data?.user || res.data.user || res.data); toast.success("تم تحديث الملف الشخصي"); },
    onError: (e: any) => toast.error(e?.response?.data?.error || "خطأ في التحديث"),
  });

  const pwdMut = useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      usersApi.changePassword(data),
    onSuccess: () => { resetPwd(); toast.success("تم تغيير كلمة المرور بنجاح"); },
    onError: (e: any) => toast.error(e?.response?.data?.error || "تعذّر تغيير كلمة المرور"),
  });

  const totpSetupMut = useMutation({
    mutationFn: () => authApi.totpSetup(),
    onSuccess: (res) => {
      setTotpQr(res.data.qrCode);
      setTotpSecret(res.data.secret);
      setTotpState("verifying");
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || "خطأ في إعداد المصادقة"),
  });

  const totpVerifyMut = useMutation({
    mutationFn: (code: string) => authApi.totpVerify(code),
    onSuccess: () => {
      setTotpState("enabled");
      setTotpQr(""); setTotpCode("");
      updateUser({ ...user!, twoFactorEnabled: true } as any);
      toast.success("تم تفعيل المصادقة الثنائية 🎉");
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || "الرمز غير صحيح"),
  });

  const totpDisableMut = useMutation({
    mutationFn: (code: string) => authApi.totpDisable(code),
    onSuccess: () => {
      setTotpState("idle");
      setTotpCode("");
      updateUser({ ...user!, twoFactorEnabled: false } as any);
      toast.success("تم تعطيل المصادقة الثنائية");
    },
    onError: (e: any) => toast.error(e?.response?.data?.error || "الرمز غير صحيح"),
  });

  const addPasskeyMut = useMutation({
    mutationFn: async () => {
      const optRes = await webauthnApi.registerOptions();
      const attResp = await startRegistration({ optionsJSON: optRes.data });
      const deviceName = navigator.userAgent.split(") ")[0].split(" (").join(" · ").slice(0, 60);
      return webauthnApi.registerVerify(attResp, deviceName);
    },
    onSuccess: () => { toast.success("تم إضافة مفتاح المرور"); queryClient.invalidateQueries({ queryKey: ["webauthn-credentials"] }); },
    onError: (e: any) => { if (e?.name !== "NotAllowedError") toast.error(e?.response?.data?.error || "تعذّرت الإضافة"); },
  });

  const deletePasskeyMut = useMutation({
    mutationFn: (id: string) => webauthnApi.deleteCredential(id),
    onSuccess: () => { toast.success("تم الحذف"); queryClient.invalidateQueries({ queryKey: ["webauthn-credentials"] }); },
  });

  const togglePwd = (key: string) => setShowPwd((p) => ({ ...p, [key]: !p[key] }));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="page-title">الملف الشخصي</h1>
        <p className="page-subtitle">إدارة معلوماتك وإعدادات الأمان</p>
      </div>

      {/* ── Avatar ──────────────────────────────────────────── */}
      <div className="card flex items-center gap-5">
        <div className="relative">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-ofoq-green/30" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1C2B6E] to-[#33B27C] flex items-center justify-center text-white text-3xl font-bold">
              {user?.name?.charAt(0)}
            </div>
          )}
          <label className="absolute -bottom-1 -left-1 w-7 h-7 bg-ofoq-green rounded-full flex items-center justify-center text-white shadow-lg hover:scale-110 transition-transform cursor-pointer">
            <Camera size={13} />
            <input type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && avatarMut.mutate(e.target.files[0])} />
          </label>
        </div>
        <div>
          <p className="font-bold text-xl text-navy-700">{user?.name}</p>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          <span className="badge-green mt-1 inline-block">
            {user?.role === "super_admin" ? "مدير عام" : user?.role === "admin" ? "مدير" : user?.role === "manager" ? "مشرف" : "موظف"}
          </span>
        </div>
      </div>

      {/* ── Profile form ─────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <User size={18} className="text-ofoq-green" />
          <h3 className="font-bold text-navy-700">المعلومات الشخصية</h3>
        </div>
        <form onSubmit={handleSubmit((d) => updateMut.mutate(d))} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">الاسم (إنجليزي)</label>
              <input {...register("fullName")} className="input-field" dir="ltr" />
            </div>
            <div>
              <label className="label">الاسم (عربي)</label>
              <input {...register("fullNameAr")} className="input-field" />
            </div>
            <div>
              <label className="label">رقم الهاتف</label>
              <input {...register("phone")} className="input-field" dir="ltr" placeholder="+966..." />
            </div>
            <div>
              <label className="label">القسم</label>
              <input {...register("department")} className="input-field" placeholder="التسويق، التقنية..." />
            </div>
            <div className="col-span-2">
              <label className="label">المسمى الوظيفي</label>
              <input {...register("position")} className="input-field" placeholder="مدير مشروع..." />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={updateMut.isPending} className="btn-primary">
              {updateMut.isPending ? "جاري الحفظ..." : "حفظ التغييرات"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Change Password ───────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-6">
          <Lock size={18} className="text-ofoq-green" />
          <h3 className="font-bold text-navy-700">تغيير كلمة المرور</h3>
        </div>
        <form onSubmit={handlePwd((d) => {
          if (d.newPassword !== d.confirmPassword) { toast.error("كلمتا المرور غير متطابقتين"); return; }
          pwdMut.mutate({ currentPassword: d.currentPassword, newPassword: d.newPassword });
        })} className="space-y-4">
          <div className="relative">
            <label className="label">كلمة المرور الحالية</label>
            <input {...regPwd("currentPassword", { required: true })}
              type={showPwd.current ? "text" : "password"} className="input-field pl-10" />
            <button type="button" onClick={() => togglePwd("current")}
              className="absolute left-3 top-9 text-gray-400 hover:text-gray-600">
              {showPwd.current ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <label className="label">كلمة المرور الجديدة</label>
            <input {...regPwd("newPassword", { required: true, minLength: 8 })}
              type={showPwd.new ? "text" : "password"} className="input-field pl-10" />
            <button type="button" onClick={() => togglePwd("new")}
              className="absolute left-3 top-9 text-gray-400 hover:text-gray-600">
              {showPwd.new ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="relative">
            <label className="label">تأكيد كلمة المرور الجديدة</label>
            <input {...regPwd("confirmPassword", { required: true,
              validate: (v) => v === newPwd || "كلمتا المرور غير متطابقتين" })}
              type={showPwd.confirm ? "text" : "password"} className="input-field pl-10" />
            <button type="button" onClick={() => togglePwd("confirm")}
              className="absolute left-3 top-9 text-gray-400 hover:text-gray-600">
              {showPwd.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={pwdMut.isPending} className="btn-secondary">
              {pwdMut.isPending ? "..." : "تحديث كلمة المرور"}
            </button>
          </div>
        </form>
      </div>

      {/* ── 2FA TOTP ─────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Shield size={18} className="text-ofoq-green" />
          <h3 className="font-bold text-navy-700">المصادقة الثنائية (2FA)</h3>
          {(totpState === "enabled") && (
            <span className="badge-green mr-auto">مفعّلة</span>
          )}
        </div>

        <AnimatePresence mode="wait">
          {/* ── IDLE: not set up yet ─────────── */}
          {totpState === "idle" && (
            <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="text-sm text-gray-500 mb-4">
                أضف طبقة حماية إضافية باستخدام تطبيق المصادقة (Google Authenticator، Authy، إلخ).
              </p>
              <button onClick={() => { setTotpState("setting_up"); totpSetupMut.mutate(); }}
                disabled={totpSetupMut.isPending}
                className="btn-primary">
                <Shield size={16} />
                {totpSetupMut.isPending ? "جاري الإعداد..." : "تفعيل المصادقة الثنائية"}
              </button>
            </motion.div>
          )}

          {/* ── SETTING UP: loading ──────────── */}
          {totpState === "setting_up" && (
            <motion.div key="setting_up" className="flex justify-center py-6">
              <div className="w-8 h-8 border-4 border-ofoq-green border-t-transparent rounded-full animate-spin" />
            </motion.div>
          )}

          {/* ── VERIFYING: show QR ───────────── */}
          {totpState === "verifying" && (
            <motion.div key="verifying" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <p className="text-sm text-gray-600">
                افتح تطبيق <strong>Google Authenticator</strong> أو <strong>Authy</strong> وامسح الكود:
              </p>
              {totpQr && (
                <div className="flex justify-center">
                  <div className="bg-white p-3 rounded-2xl shadow-md border border-gray-100">
                    <img src={totpQr} alt="TOTP QR" className="w-44 h-44" />
                  </div>
                </div>
              )}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-500 mb-1">أو أدخل الكود يدوياً:</p>
                <p className="font-mono text-sm text-navy-700 tracking-widest break-all">{totpSecret}</p>
              </div>
              <div>
                <label className="label">أدخل الرمز من التطبيق للتحقق</label>
                <input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-field text-center text-2xl font-mono tracking-widest" maxLength={6}
                  placeholder="000000" dir="ltr" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setTotpState("idle"); setTotpQr(""); setTotpCode(""); }}
                  className="btn-secondary flex-1">إلغاء</button>
                <button onClick={() => totpVerifyMut.mutate(totpCode)}
                  disabled={totpCode.length !== 6 || totpVerifyMut.isPending}
                  className="btn-primary flex-1">
                  {totpVerifyMut.isPending ? "جاري التحقق..." : "تأكيد وتفعيل"}
                </button>
              </div>
            </motion.div>
          )}

          {/* ── ENABLED: working ─────────────── */}
          {totpState === "enabled" && (
            <motion.div key="enabled" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <CheckCircle size={20} className="text-emerald-600 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-700">المصادقة الثنائية مفعّلة</p>
                  <p className="text-xs text-emerald-600">حسابك محمي بطبقة أمان إضافية</p>
                </div>
              </div>
              <button onClick={() => { setTotpState("disabling"); setTotpCode(""); }}
                className="btn-danger">
                <Shield size={16} />
                تعطيل المصادقة الثنائية
              </button>
            </motion.div>
          )}

          {/* ── DISABLING: confirm with OTP ──── */}
          {totpState === "disabling" && (
            <motion.div key="disabling" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="space-y-4">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                <AlertCircle size={16} className="text-amber-600 flex-shrink-0" />
                <p className="text-xs text-amber-700">لتعطيل الحماية، أدخل الرمز الحالي من تطبيق المصادقة:</p>
              </div>
              <div>
                <label className="label">رمز التطبيق</label>
                <input value={totpCode} onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="input-field text-center text-2xl font-mono tracking-widest" maxLength={6}
                  placeholder="000000" dir="ltr" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setTotpState("enabled"); setTotpCode(""); }}
                  className="btn-secondary flex-1">إلغاء</button>
                <button onClick={() => totpDisableMut.mutate(totpCode)}
                  disabled={totpCode.length !== 6 || totpDisableMut.isPending}
                  className="btn-danger flex-1">
                  {totpDisableMut.isPending ? "..." : "تأكيد التعطيل"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Passkeys ─────────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Fingerprint size={18} className="text-ofoq-green" />
            <h3 className="font-bold text-navy-700">مفاتيح المرور (Passkeys)</h3>
          </div>
          <button onClick={() => addPasskeyMut.mutate()} disabled={addPasskeyMut.isPending}
            className="btn-secondary text-sm">
            <Plus size={15} />
            {addPasskeyMut.isPending ? "جاري الإضافة..." : "إضافة مفتاح"}
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          سجّل دخولك بدون كلمة مرور باستخدام بصمتك أو وجهك أو مفتاح أمان الجهاز.
        </p>
        {passkeys.length === 0 ? (
          <p className="text-sm text-gray-400 py-2">لا توجد مفاتيح مرور مسجّلة بعد.</p>
        ) : (
          <div className="space-y-2">
            {passkeys.map((c: any) => (
              <div key={c._id} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-navy-700">{c.deviceName}</p>
                  <p className="text-xs text-gray-400">
                    أُضيف {new Date(c.createdAt).toLocaleDateString("ar-SA")}
                    {c.lastUsed ? ` · آخر استخدام ${new Date(c.lastUsed).toLocaleDateString("ar-SA")}` : ""}
                  </p>
                </div>
                <button onClick={() => deletePasskeyMut.mutate(c._id)}
                  className="text-red-400 hover:text-red-600 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Employee Card link ───────────────────────────────── */}
      <div className="card bg-gradient-to-r from-[#1C2B6E] to-[#0C1338] text-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#33B27C]/20 border border-[#33B27C]/30 flex items-center justify-center">
            <CreditCard size={22} className="text-[#33B27C]" />
          </div>
          <div className="flex-1">
            <p className="font-bold">بطاقة الموظف</p>
            <p className="text-white/50 text-sm">اعرض بطاقتك الرسمية وباركود الدخول إلى النظام</p>
          </div>
          <Link to="/admin/employee/card" className="btn-primary text-sm flex-shrink-0">
            <QrCode size={15} />
            عرض البطاقة
          </Link>
        </div>
      </div>
    </div>
  );
}
