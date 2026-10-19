import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  Check,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  Eye,
  EyeOff,
  Globe2,
  LockKeyhole,
  LogOut,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Wrench,
} from "lucide-react";
import { qiroxOwnerApi, type MaintenanceSettings, type OwnerUser } from "../../api/qiroxOwnerApi";
import "./qiroxstudio.css";

type Overview = Awaited<ReturnType<typeof qiroxOwnerApi.overview>>;
type ActivityItem = Record<string, any>;
type Health = Awaited<ReturnType<typeof qiroxOwnerApi.qiroxHealth>>;
type StaffStatus = "active" | "inactive" | "suspended" | "pending";

const STATUS_LABELS: Record<StaffStatus, string> = {
  active: "نشط",
  inactive: "غير نشط",
  suspended: "موقوف",
  pending: "بانتظار التفعيل",
};
const ROLE_LABELS: Record<OwnerUser["role"], string> = {
  super_admin: "مدير المنصة",
  admin: "مدير",
  manager: "مشرف",
  employee: "موظف",
};

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("ar-SA", { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function formatDuration(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds || 0));
  const days = Math.floor(safe / 86400);
  const hours = Math.floor((safe % 86400) / 3600);
  const minutes = Math.floor((safe % 3600) / 60);
  return days ? `${days} يوم، ${hours} ساعة` : hours ? `${hours} ساعة، ${minutes} دقيقة` : `${minutes} دقيقة`;
}

function getActivityTitle(item: ActivityItem) {
  return item.description || item.action || item.event || "نشاط مسجل";
}

function getActivityDetail(item: ActivityItem) {
  const details = [item.entity, item.userName, item.email].filter(Boolean);
  return details.join(" / ") || item.severity || "سجل النظام";
}

function SkeletonRows() {
  return (
    <div className="qo-skeleton-list" aria-label="جار تحميل البيانات">
      {[0, 1, 2, 3].map((item) => <div className="qo-skeleton-row" key={item}><i /><span><b /><b /></span><i /></div>)}
    </div>
  );
}

export default function QiroxStudioPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [overview, setOverview] = useState<Overview | null>(null);
  const [users, setUsers] = useState<OwnerUser[]>([]);
  const [userTotal, setUserTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [userError, setUserError] = useState("");
  const [activityError, setActivityError] = useState("");
  const [healthError, setHealthError] = useState("");
  const [busyUser, setBusyUser] = useState<string | null>(null);
  const [maintenance, setMaintenance] = useState<MaintenanceSettings>({
    enabled: false, messageAr: "", messageEn: "", updatedAt: null,
  });
  const [maintenanceBusy, setMaintenanceBusy] = useState(false);
  const [maintenanceFeedback, setMaintenanceFeedback] = useState("");
  const [maintenanceError, setMaintenanceError] = useState("");
  const [logoutBusy, setLogoutBusy] = useState(false);

  useEffect(() => {
    let current = true;
    qiroxOwnerApi.session()
      .then((session) => { if (current) setAuthenticated(session.authenticated); })
      .catch(() => { if (current) setAuthenticated(false); })
      .finally(() => { if (current) setCheckingSession(false); });
    return () => { current = false; };
  }, []);

  const loadUsers = useCallback(async (targetPage = 1, query = "", role = "", status = "") => {
    setUserError("");
    try {
      const result = await qiroxOwnerApi.users({
        page: targetPage, limit: 8, search: query || undefined,
        role: role || undefined, status: status || undefined,
      });
      setUsers(result.items);
      setUserTotal(result.total);
      setPage(result.page);
      setPages(Math.max(1, result.pages));
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "تعذر تحميل حسابات الفريق.");
    }
  }, []);

  const loadDashboard = useCallback(async (initial = false) => {
    if (initial) setLoading(true);
    else setRefreshing(true);
    setLoadError("");
    setUserError("");
    setActivityError("");
    setHealthError("");
    const results = await Promise.allSettled([
      qiroxOwnerApi.overview(),
      qiroxOwnerApi.users({ page: 1, limit: 8 }),
      qiroxOwnerApi.activity(12),
      qiroxOwnerApi.qiroxHealth(),
    ]);
    const [overviewResult, usersResult, activityResult, healthResult] = results;
    if (overviewResult.status === "fulfilled") {
      setOverview(overviewResult.value);
      setMaintenance((current) => ({
        ...overviewResult.value.maintenance,
        messageAr: current.enabled !== overviewResult.value.maintenance.enabled ||
          (!current.messageAr && !current.messageEn) ? overviewResult.value.maintenance.messageAr : current.messageAr,
        messageEn: current.enabled !== overviewResult.value.maintenance.enabled ||
          (!current.messageAr && !current.messageEn) ? overviewResult.value.maintenance.messageEn : current.messageEn,
      }));
    } else setLoadError(overviewResult.reason instanceof Error ? overviewResult.reason.message : "تعذر تحميل ملخص المنصة.");
    if (usersResult.status === "fulfilled") {
      setUsers(usersResult.value.items);
      setUserTotal(usersResult.value.total);
      setPage(usersResult.value.page);
      setPages(Math.max(1, usersResult.value.pages));
    } else setUserError(usersResult.reason instanceof Error ? usersResult.reason.message : "تعذر تحميل حسابات الفريق.");
    if (activityResult.status === "fulfilled") setActivity(activityResult.value.items);
    else setActivityError(activityResult.reason instanceof Error ? activityResult.reason.message : "تعذر تحميل سجل النشاط.");
    if (healthResult.status === "fulfilled") setHealth(healthResult.value);
    else setHealthError(healthResult.reason instanceof Error ? healthResult.reason.message : "تعذر التحقق من الخدمة.");
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    if (authenticated) void loadDashboard(true);
  }, [authenticated, loadDashboard]);

  const submitLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError("");
    if (!password.trim()) {
      setLoginError("أدخل كلمة مرور المالك للمتابعة.");
      return;
    }
    setLoginBusy(true);
    try {
      await qiroxOwnerApi.session();
      const session = await qiroxOwnerApi.login(password);
      if (!session.authenticated) throw new Error("لم يتم قبول جلسة المالك.");
      setPassword("");
      setAuthenticated(true);
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : "تعذر تسجيل الدخول. تحقق من كلمة المرور.");
    } finally {
      setLoginBusy(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!authenticated) return;
      setPage(1);
      void loadUsers(1, searchInput.trim(), roleFilter, statusFilter);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [authenticated, searchInput, roleFilter, statusFilter, loadUsers]);

  useEffect(() => {
    setSearch(searchInput.trim());
  }, [searchInput]);

  const applyStatus = async (user: OwnerUser) => {
    const nextStatus = user.status === "suspended" ? "active" : "suspended";
    setBusyUser(user._id);
    setUserError("");
    try {
      await qiroxOwnerApi.setUserStatus(user._id, nextStatus);
      await Promise.all([loadUsers(page, search, roleFilter, statusFilter), loadDashboard(false)]);
    } catch (error) {
      setUserError(error instanceof Error ? error.message : "تعذر تحديث حالة الحساب.");
    } finally {
      setBusyUser(null);
    }
  };

  const saveMaintenance = async (enabled: boolean) => {
    if (enabled && !window.confirm("سيظهر إشعار الصيانة للزوار وسيُمنع الوصول إلى الموقع وواجهاته. هل تريد المتابعة؟")) return;
    setMaintenanceBusy(true);
    setMaintenanceError("");
    setMaintenanceFeedback("");
    const settings: MaintenanceSettings = { ...maintenance, enabled };
    try {
      const result = await qiroxOwnerApi.setMaintenance(settings);
      setMaintenance(result.maintenance);
      setOverview((current) => current ? { ...current, maintenance: result.maintenance } : current);
      setMaintenanceFeedback(enabled ? "تم تفعيل وضع الصيانة للموقع." : "تم إيقاف وضع الصيانة.");
    } catch (error) {
      setMaintenanceError(error instanceof Error ? error.message : "تعذر حفظ إعدادات الصيانة.");
    } finally {
      setMaintenanceBusy(false);
    }
  };

  const refreshHealth = async () => {
    setHealthError("");
    try {
      setHealth(await qiroxOwnerApi.qiroxHealth());
    } catch (error) {
      setHealthError(error instanceof Error ? error.message : "تعذر التحقق من الموقع.");
    }
  };

  const logout = async () => {
    setLogoutBusy(true);
    try {
      await qiroxOwnerApi.logout();
      setAuthenticated(false);
      setOverview(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "تعذر إنهاء الجلسة.");
    } finally {
      setLogoutBusy(false);
    }
  };

  const staffCounts = useMemo(() => {
    if (!overview) return [];
    return [
      { label: "المديرون", value: Object.values(overview.roles.admin || {}).reduce((sum, count) => sum + count, 0) },
      { label: "مديرو المنصة", value: Object.values(overview.roles.super_admin || {}).reduce((sum, count) => sum + count, 0) },
      { label: "المشرفون", value: Object.values(overview.roles.manager || {}).reduce((sum, count) => sum + count, 0) },
      { label: "الموظفون", value: Object.values(overview.roles.employee || {}).reduce((sum, count) => sum + count, 0) },
    ];
  }, [overview]);

  if (checkingSession) {
    return <main className="qo-page"><div className="qo-auth-loading"><span className="qo-loader" /><p>جار التحقق من جلسة المالك</p></div></main>;
  }

  if (!authenticated) {
    return (
      <main className="qo-page qo-login-page" dir="rtl">
        <div className="qo-login-shell">
          <header className="qo-brand">
            <div className="qo-brand-mark">ق</div>
            <div><strong>أفق</strong><span>منصة المالك</span></div>
          </header>
          <section className="qo-login-card">
            <div className="qo-eyebrow"><LockKeyhole size={15} /> دخول خاص</div>
            <h1>مساحة تشغيل المنصة</h1>
            <p className="qo-login-copy">هذه المساحة مخصصة لمالك المنصة لإدارة الوصول ومراجعة الحالة التشغيلية.</p>
            <form onSubmit={submitLogin} className="qo-login-form">
              <label htmlFor="owner-password">كلمة مرور المالك</label>
              <div className="qo-password-wrap">
                <input
                  id="owner-password" autoComplete="current-password" type={passwordVisible ? "text" : "password"}
                  value={password} onChange={(event) => setPassword(event.target.value)}
                  placeholder="أدخل كلمة المرور" disabled={loginBusy}
                />
                <button type="button" className="qo-password-toggle" onClick={() => setPasswordVisible((visible) => !visible)} aria-label={passwordVisible ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}>
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {loginError && <div className="qo-alert qo-alert-error" role="alert"><AlertCircle size={17} />{loginError}</div>}
              <button type="submit" className="qo-button qo-button-primary qo-login-submit" disabled={loginBusy}>
                {loginBusy ? <><span className="qo-loader qo-loader-light" /> جار التحقق</> : <>دخول إلى لوحة المالك <ChevronLeft size={17} /></>}
              </button>
            </form>
            <div className="qo-login-note"><ShieldCheck size={16} /><span>جلسة مستقلة عن حسابات فريق أفق</span></div>
          </section>
          <footer className="qo-login-footer"><span>OFOQ | Qirox Studio</span><span>وصول محمي</span></footer>
        </div>
      </main>
    );
  }

  return (
    <main className="qo-page" dir="rtl">
      <div className="qo-app">
        <header className="qo-topbar">
          <div className="qo-brand qo-brand-compact">
            <div className="qo-brand-mark">ق</div>
            <div><strong>أفق</strong><span>منصة المالك</span></div>
          </div>
          <div className="qo-topbar-actions">
            <span className="qo-session-indicator"><i /> جلسة مالك نشطة</span>
            <button className="qo-button qo-button-quiet" type="button" onClick={() => void loadDashboard(false)} disabled={refreshing} aria-label="تحديث البيانات">
              <RefreshCw size={16} className={refreshing ? "qo-spin" : ""} /> <span>تحديث</span>
            </button>
            <button className="qo-button qo-button-quiet qo-logout" type="button" onClick={() => void logout()} disabled={logoutBusy}>
              <LogOut size={16} /><span>{logoutBusy ? "جار الخروج" : "إنهاء الجلسة"}</span>
            </button>
          </div>
        </header>

        <div className="qo-content">
          <section className="qo-page-heading">
            <div>
              <div className="qo-eyebrow">مركز العمليات <span className="qo-heading-dot" /></div>
              <h1>لوحة المالك</h1>
              <p>إدارة حسابات الفريق، مراجعة النشاط، والتحقق من توفر الخدمات.</p>
            </div>
            <div className="qo-heading-meta"><span>بيئة التشغيل</span><strong>{overview?.environment || "-"}</strong></div>
          </section>

          {loadError && <div className="qo-alert qo-alert-error qo-page-alert" role="alert"><AlertCircle size={17} />{loadError}<button type="button" onClick={() => void loadDashboard(true)}>إعادة المحاولة</button></div>}

          <section className="qo-overview-grid" aria-label="ملخص المنصة">
            <article className="qo-stat qo-stat-main">
              <div className="qo-stat-icon"><Users size={19} /></div>
              <div><span>إجمالي حسابات الفريق</span><strong>{loading && !overview ? "-" : overview?.totalStaff ?? "-"}</strong><small>{staffCounts.map((item) => `${item.value} ${item.label}`).join(" | ") || "الحسابات المسجلة"}</small></div>
            </article>
            <article className="qo-stat">
              <div className="qo-stat-icon qo-icon-muted"><Clock3 size={18} /></div>
              <div><span>مدة تشغيل المنصة</span><strong className="qo-stat-duration">{overview ? formatDuration(overview.uptimeSeconds) : "-"}</strong><small>منذ آخر إعادة تشغيل</small></div>
            </article>
            <article className="qo-stat">
              <div className={`qo-stat-icon ${maintenance.enabled ? "qo-icon-alert" : "qo-icon-ok"}`}><Wrench size={18} /></div>
              <div><span>حالة الموقع</span><strong className="qo-stat-duration">{maintenance.enabled ? "صيانة مفعّلة" : "متاح للزوار"}</strong><small>{maintenance.updatedAt ? `آخر تحديث ${formatDate(maintenance.updatedAt)}` : "حالة الموقع العامة"}</small></div>
            </article>
          </section>

          <section className="qo-main-grid">
            <article className="qo-panel qo-staff-panel" id="staff">
              <div className="qo-panel-header">
                <div><div className="qo-section-kicker">إدارة الوصول</div><h2>حسابات الفريق</h2><p>{userTotal} حسابًا مسجلًا</p></div>
                <div className="qo-panel-header-icon"><Users size={19} /></div>
              </div>
              <div className="qo-filters">
                <label className="qo-search"><Search size={16} /><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="ابحث بالاسم أو البريد" aria-label="بحث عن حساب" /><kbd>بحث</kbd></label>
                <label className="qo-select-wrap"><SlidersHorizontal size={15} /><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="تصفية حسب الدور"><option value="">كل الأدوار</option><option value="super_admin">مدير المنصة</option><option value="admin">مدير</option><option value="manager">مشرف</option><option value="employee">موظف</option></select></label>
                <label className="qo-select-wrap"><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="تصفية حسب الحالة"><option value="">كل الحالات</option><option value="active">نشط</option><option value="inactive">غير نشط</option><option value="suspended">موقوف</option><option value="pending">بانتظار التفعيل</option></select></label>
              </div>
              {userError && <div className="qo-inline-error"><AlertCircle size={15} />{userError}<button type="button" onClick={() => void loadUsers(page, search, roleFilter, statusFilter)}>إعادة المحاولة</button></div>}
              {loading && users.length === 0 ? <SkeletonRows /> : users.length === 0 ? (
                <div className="qo-empty"><Search size={22} /><strong>لا توجد حسابات مطابقة</strong><span>جرّب تعديل البحث أو خيارات التصفية.</span></div>
              ) : (
                <div className="qo-table-wrap">
                  <table className="qo-table">
                    <thead><tr><th>الحساب</th><th>الدور</th><th>الحالة</th><th>آخر دخول</th><th><span className="qo-sr-only">إجراء</span></th></tr></thead>
                    <tbody>{users.map((user) => (
                      <tr key={user._id}>
                        <td><div className="qo-user-cell"><span className="qo-avatar">{(user.fullNameAr || user.fullName || "؟").trim().charAt(0)}</span><div><strong>{user.fullNameAr || user.fullName}</strong><span dir="ltr">{user.email}</span></div></div></td>
                        <td><span className="qo-role">{ROLE_LABELS[user.role] || user.role}</span></td>
                        <td><span className={`qo-status qo-status-${user.status}`}><i />{STATUS_LABELS[user.status] || user.status}</span></td>
                        <td className="qo-date">{formatDate(user.lastLogin)}</td>
                        <td><button className={`qo-row-action ${user.status === "suspended" ? "qo-row-action-enable" : ""}`} type="button" onClick={() => void applyStatus(user)} disabled={busyUser === user._id} aria-label={user.status === "suspended" ? `إعادة تفعيل ${user.fullName}` : `إيقاف ${user.fullName}`}>
                          {busyUser === user._id ? <span className="qo-loader qo-loader-small" /> : user.status === "suspended" ? "إعادة تفعيل" : "إيقاف"}
                        </button></td>
                      </tr>
                    ))}</tbody>
                  </table>
                </div>
              )}
              <div className="qo-table-footer"><span>عرض {users.length ? (page - 1) * 8 + 1 : 0}-{Math.min(page * 8, userTotal)} من {userTotal}</span>
                <div className="qo-pagination"><button type="button" onClick={() => { const next = Math.max(1, page - 1); setPage(next); void loadUsers(next, search, roleFilter, statusFilter); }} disabled={page <= 1} aria-label="الصفحة السابقة"><ChevronRight size={16} /></button><span>{page} / {pages}</span><button type="button" onClick={() => { const next = Math.min(pages, page + 1); setPage(next); void loadUsers(next, search, roleFilter, statusFilter); }} disabled={page >= pages} aria-label="الصفحة التالية"><ChevronLeft size={16} /></button></div>
              </div>
            </article>

            <aside className="qo-side-column">
              <article className="qo-panel qo-health-panel">
                <div className="qo-panel-header qo-panel-header-tight">
                  <div><div className="qo-section-kicker">الخدمة العامة</div><h2>Qirox Studio</h2></div>
                  <div className="qo-health-mark"><Globe2 size={18} /></div>
                </div>
                <div className="qo-health-state">
                  <span className={`qo-health-indicator ${health?.reachable ? "is-up" : health ? "is-down" : ""}`} />
                  <div><strong>{health ? (health.reachable ? "متاح" : "غير متاح") : "غير متحقق"}</strong><span>{health?.status || "حالة الاتصال بالخدمة العامة"}</span></div>
                </div>
                <dl className="qo-health-details">
                  <div><dt>الخدمة</dt><dd>{health?.service || "Qirox Studio"}</dd></div>
                  <div><dt>رمز الاستجابة</dt><dd>{health?.statusCode ?? "-"}</dd></div>
                  <div><dt>آخر فحص</dt><dd>{formatDate(health?.checkedAt)}</dd></div>
                </dl>
                {healthError && <div className="qo-inline-error"><AlertCircle size={14} />{healthError}</div>}
                <button className="qo-button qo-button-secondary qo-check-button" type="button" onClick={() => void refreshHealth()}><RefreshCw size={15} /> فحص التوفر</button>
                <div className="qo-api-note"><CircleHelp size={15} /><span>التحكم عن بُعد غير متاح. فحص التوفر هو العملية المعتمدة.</span></div>
              </article>

              <article className="qo-panel qo-maintenance-panel">
                <div className="qo-panel-header qo-panel-header-tight">
                  <div><div className="qo-section-kicker">تحكم الموقع</div><h2>وضع الصيانة</h2></div>
                  <div className={`qo-maintenance-indicator ${maintenance.enabled ? "is-enabled" : ""}`}><Wrench size={17} /></div>
                </div>
                <p className="qo-panel-intro">إيقاف الموقع العام مؤقتًا مع عرض رسالة للزوار.</p>
                <label className="qo-field-label" htmlFor="maintenance-ar">رسالة الزوار بالعربية</label>
                <textarea id="maintenance-ar" rows={2} value={maintenance.messageAr} onChange={(event) => setMaintenance((current) => ({ ...current, messageAr: event.target.value }))} placeholder="نعود إليكم قريبًا..." />
                <label className="qo-field-label" htmlFor="maintenance-en">رسالة الزوار بالإنجليزية</label>
                <textarea id="maintenance-en" rows={2} dir="ltr" value={maintenance.messageEn} onChange={(event) => setMaintenance((current) => ({ ...current, messageEn: event.target.value }))} placeholder="We'll be back soon..." />
                {maintenanceError && <div className="qo-inline-error"><AlertCircle size={15} />{maintenanceError}</div>}
                {maintenanceFeedback && <div className="qo-inline-success"><Check size={15} />{maintenanceFeedback}</div>}
                <div className="qo-maintenance-actions">
                  {maintenance.enabled ? (
                    <button type="button" className="qo-button qo-button-primary" disabled={maintenanceBusy} onClick={() => void saveMaintenance(false)}>{maintenanceBusy ? "جار الحفظ" : "إيقاف الصيانة"}</button>
                  ) : (
                    <button type="button" className="qo-button qo-button-danger" disabled={maintenanceBusy} onClick={() => void saveMaintenance(true)}>{maintenanceBusy ? "جار الحفظ" : "تفعيل وضع الصيانة"}</button>
                  )}
                  <span>{maintenance.enabled ? "الموقع العام متوقف" : "الموقع متاح للزوار"}</span>
                </div>
              </article>
            </aside>
          </section>

          <section className="qo-panel qo-activity-panel" id="activity">
            <div className="qo-panel-header">
              <div><div className="qo-section-kicker">سجل التدقيق</div><h2>النشاط الأخير</h2><p>آخر العمليات المسجلة في المنصة</p></div>
              <div className="qo-panel-header-icon"><Activity size={19} /></div>
            </div>
            {activityError && <div className="qo-inline-error"><AlertCircle size={15} />{activityError}<button type="button" onClick={() => void loadDashboard(false)}>إعادة المحاولة</button></div>}
            {loading && activity.length === 0 ? <SkeletonRows /> : activity.length === 0 ? (
              <div className="qo-empty qo-empty-activity"><Activity size={21} /><strong>لا يوجد نشاط مسجل بعد</strong><span>ستظهر هنا أحدث العمليات عند توفرها.</span></div>
            ) : <div className="qo-activity-list">{activity.slice(0, 12).map((item, index) => {
              const kind = String(item.severity || "").toLowerCase();
              return <div className="qo-activity-row" key={String(item._id || item.id || `${item.createdAt || ""}-${index}`)}>
                <span className={`qo-activity-marker ${kind === "critical" || kind === "error" ? "is-alert" : ""}`}><Activity size={15} /></span>
                <div className="qo-activity-copy"><strong>{getActivityTitle(item)}</strong><span>{getActivityDetail(item)}</span></div>
                <time>{formatDate(item.createdAt || item.timestamp)}</time>
                <span className={`qo-severity qo-severity-${kind}`}>{item.severity || "معلومات"}</span>
              </div>;
            })}</div>}
            <div className="qo-activity-footer"><span><Shield size={14} /> السجل للقراءة فقط</span><span>{activity.length} عملية معروضة</span></div>
          </section>

        </div>
      </div>
    </main>
  );
}
