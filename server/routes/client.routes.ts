import { Router } from "express";
import { requireAuth } from "../auth.js";
import { UserModel } from "../models/index.js";
import { ServiceRequestModel, SR_STATUS_AR, SERVICE_TYPE_AR } from "../models/ServiceRequest.js";
import { SupportMessageModel } from "../models/SupportMessage.js";
import {
  sendServiceRequestAdminNotify,
  sendServiceRequestClientConfirm,
  sendServiceRequestStageUpdate,
  sendSupportReplyNotify,
} from "../email.js";

export const clientRouter = Router();

// ── Middleware: client-only ──────────────────────────────────────
function requireClient(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    const role = req.user?.role;
    if (role !== "client" && role !== "admin" && role !== "super_admin" && role !== "manager") {
      return res.status(403).json({ error: "غير مصرح" });
    }
    next();
  });
}

// ═══════════════════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════════════════

// POST /api/client/requests — create new request
clientRouter.post("/requests", requireClient, async (req: any, res) => {
  try {
    const userId   = req.user._id;
    const userEmail = req.user.email;

    const {
      companyName, commercialReg, businessActivity,
      contactEmail, contactPhone,
      serviceType, countryOfRecruitment, packageType, additionalNotes,
    } = req.body;

    if (!companyName || !businessActivity || !contactEmail || !contactPhone || !serviceType) {
      res.status(400).json({ error: "يرجى تعبئة جميع الحقول المطلوبة" });
      return;
    }

    const sr = await ServiceRequestModel.create({
      clientId:             userId,
      clientEmail:          userEmail,
      companyName,
      commercialReg,
      businessActivity,
      contactEmail,
      contactPhone,
      serviceType,
      countryOfRecruitment,
      packageType,
      additionalNotes,
      status:               "new",
      statusHistory: [{ status: "new", changedAt: new Date() }],
    });

    const serviceLabel = SERVICE_TYPE_AR[serviceType as keyof typeof SERVICE_TYPE_AR] || serviceType;

    // Notify admin at Info@ofooq.com
    sendServiceRequestAdminNotify({
      requestId:    String(sr._id),
      companyName,
      serviceLabel,
      contactEmail,
      contactPhone,
      additionalNotes,
    }).catch(() => {});

    // Confirm to client
    sendServiceRequestClientConfirm({
      toEmail:      contactEmail,
      clientName:   req.user.fullName || req.user.name || "العميل",
      requestId:    String(sr._id),
      companyName,
      serviceLabel,
    }).catch(() => {});

    res.status(201).json({ request: sr });
  } catch (err: any) {
    console.error("[Client] create request error:", err.message);
    res.status(500).json({ error: "خطأ في إنشاء الطلب" });
  }
});

// GET /api/client/requests — list current client's requests
clientRouter.get("/requests", requireClient, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const requests = await ServiceRequestModel.find({ clientId: userId })
      .sort({ createdAt: -1 })
      .select("-notes.isInternal -internalNote")
      .lean();
    res.json({ requests });
  } catch (err: any) {
    res.status(500).json({ error: "خطأ في جلب الطلبات" });
  }
});

// GET /api/client/requests/:id — single request details
clientRouter.get("/requests/:id", requireClient, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const sr = await ServiceRequestModel.findOne({
      _id: req.params.id,
      clientId: userId,
    }).lean() as any;

    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    // Filter out admin-internal notes from client view
    sr.notes = (sr.notes || []).filter((n: any) => !n.isInternal);

    res.json({ request: sr });
  } catch {
    res.status(500).json({ error: "خطأ في جلب تفاصيل الطلب" });
  }
});

// POST /api/client/requests/:id/notes — add client note
clientRouter.post("/requests/:id/notes", requireClient, async (req: any, res) => {
  try {
    const userId = req.user._id;
    const { text } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const sr = await ServiceRequestModel.findOne({ _id: req.params.id, clientId: userId });
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    sr.notes.push({
      from: "client",
      authorName: req.user.fullName || "العميل",
      text: text.trim(),
      isInternal: false,
      createdAt: new Date(),
    });
    await sr.save();

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في إضافة الملاحظة" });
  }
});

// ═══════════════════════════════════════════════════════════════════
// SUPPORT MESSAGES
// ═══════════════════════════════════════════════════════════════════

// GET /api/client/support — get messages for current client
clientRouter.get("/support", requireClient, async (req: any, res) => {
  try {
    const msgs = await SupportMessageModel.find({ clientId: req.user._id })
      .sort({ createdAt: 1 })
      .lean();

    // Mark admin messages as read
    await SupportMessageModel.updateMany(
      { clientId: req.user._id, from: "admin", read: false },
      { read: true }
    );

    res.json({ messages: msgs });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الرسائل" });
  }
});

// POST /api/client/support — send message
clientRouter.post("/support", requireClient, async (req: any, res) => {
  try {
    const { text, requestId } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const msg = await SupportMessageModel.create({
      clientId:   req.user._id,
      requestId:  requestId || undefined,
      from:       "client",
      senderName: req.user.fullName || "العميل",
      text:       text.trim(),
    });

    res.status(201).json({ message: msg });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال الرسالة" });
  }
});

// GET /api/client/support/unread-count
clientRouter.get("/support/unread", requireClient, async (req: any, res) => {
  try {
    const count = await SupportMessageModel.countDocuments({
      clientId: req.user._id,
      from: "admin",
      read: false,
    });
    res.json({ count });
  } catch {
    res.json({ count: 0 });
  }
});

// ═══════════════════════════════════════════════════════════════════
// ADMIN — SERVICE REQUESTS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════

function requireAdmin(req: any, res: any, next: any) {
  requireAuth(req, res, () => {
    const role = req.user?.role;
    if (!["admin", "super_admin", "manager"].includes(role)) {
      return res.status(403).json({ error: "غير مصرح — مسؤولون فقط" });
    }
    next();
  });
}

// GET /api/client/admin/requests
clientRouter.get("/admin/requests", requireAdmin, async (req: any, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter: any = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [requests, total] = await Promise.all([
      ServiceRequestModel.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      ServiceRequestModel.countDocuments(filter),
    ]);

    res.json({ requests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) });
  } catch {
    res.status(500).json({ error: "خطأ في جلب الطلبات" });
  }
});

// GET /api/client/admin/requests/:id
clientRouter.get("/admin/requests/:id", requireAdmin, async (_req, res) => {
  try {
    const sr = await ServiceRequestModel.findById(_req.params.id)
      .populate("clientId", "fullName email phone")
      .lean();
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
    res.json({ request: sr });
  } catch {
    res.status(500).json({ error: "خطأ في جلب تفاصيل الطلب" });
  }
});

// PATCH /api/client/admin/requests/:id/status — update stage
clientRouter.patch("/admin/requests/:id/status", requireAdmin, async (req: any, res) => {
  try {
    const { status, note } = req.body;
    const sr = await ServiceRequestModel.findById(req.params.id);
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    const prevStatus = sr.status;
    sr.status = status;
    sr.statusHistory.push({
      status,
      changedAt: new Date(),
      changedBy: req.user?.fullName || "Admin",
      note,
    });
    await sr.save();

    // Email client about stage change
    sendServiceRequestStageUpdate({
      toEmail:       sr.clientEmail,
      requestId:     String(sr._id),
      companyName:   sr.companyName,
      prevStatusAr:  SR_STATUS_AR[prevStatus] || prevStatus,
      newStatusAr:   SR_STATUS_AR[status] || status,
      adminNote:     note,
    }).catch(() => {});

    res.json({ ok: true, status: sr.status });
  } catch {
    res.status(500).json({ error: "خطأ في تحديث الحالة" });
  }
});

// POST /api/client/admin/requests/:id/notes — admin adds note
clientRouter.post("/admin/requests/:id/notes", requireAdmin, async (req: any, res) => {
  try {
    const { text, isInternal = false } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const sr = await ServiceRequestModel.findById(req.params.id);
    if (!sr) { res.status(404).json({ error: "الطلب غير موجود" }); return; }

    sr.notes.push({
      from: "admin",
      authorName: req.user?.fullName || "الإدارة",
      text: text.trim(),
      isInternal,
      createdAt: new Date(),
    });
    await sr.save();

    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: "خطأ في إضافة الملاحظة" });
  }
});

// GET /api/client/admin/support — all conversations
clientRouter.get("/admin/support", requireAdmin, async (_req, res) => {
  try {
    // Get unique client IDs with latest message
    const conversations = await SupportMessageModel.aggregate([
      { $sort: { createdAt: -1 } },
      { $group: {
        _id: "$clientId",
        lastMessage: { $first: "$text" },
        lastDate: { $first: "$createdAt" },
        unreadCount: { $sum: { $cond: [{ $and: [{ $eq: ["$from", "client"] }, { $eq: ["$read", false] }] }, 1, 0] } },
      }},
      { $sort: { lastDate: -1 } },
      { $limit: 50 },
    ]);

    // Populate client info
    const clientIds = conversations.map((c) => c._id);
    const clients = await UserModel.find({ _id: { $in: clientIds } }).select("fullName email").lean();
    const clientMap: Record<string, any> = {};
    clients.forEach((c) => { clientMap[String(c._id)] = c; });

    const result = conversations.map((c) => ({
      clientId:    String(c._id),
      client:      clientMap[String(c._id)],
      lastMessage: c.lastMessage,
      lastDate:    c.lastDate,
      unreadCount: c.unreadCount,
    }));

    res.json({ conversations: result });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المحادثات" });
  }
});

// GET /api/client/admin/support/:clientId
clientRouter.get("/admin/support/:clientId", requireAdmin, async (req, res) => {
  try {
    const msgs = await SupportMessageModel.find({ clientId: req.params.clientId })
      .sort({ createdAt: 1 })
      .lean();

    // Mark client messages as read
    await SupportMessageModel.updateMany(
      { clientId: req.params.clientId, from: "client", read: false },
      { read: true }
    );

    res.json({ messages: msgs });
  } catch {
    res.status(500).json({ error: "خطأ في جلب المحادثة" });
  }
});

// POST /api/client/admin/support/:clientId — admin reply
clientRouter.post("/admin/support/:clientId", requireAdmin, async (req: any, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) { res.status(400).json({ error: "النص مطلوب" }); return; }

    const client = await UserModel.findById(req.params.clientId).select("email fullName").lean() as any;

    const msg = await SupportMessageModel.create({
      clientId:   req.params.clientId,
      from:       "admin",
      senderName: req.user?.fullName || "فريق أفق",
      text:       text.trim(),
    });

    // Notify client by email
    if (client?.email) {
      sendSupportReplyNotify({
        toEmail:    client.email,
        clientName: client.fullName || "العميل",
        adminName:  req.user?.fullName || "فريق أفق",
        replyText:  text.trim(),
      }).catch(() => {});
    }

    res.status(201).json({ message: msg });
  } catch {
    res.status(500).json({ error: "خطأ في إرسال الرد" });
  }
});

// GET /api/client/admin/stats
clientRouter.get("/admin/stats", requireAdmin, async (_req, res) => {
  try {
    const [total, newCount, inProgress, completed] = await Promise.all([
      ServiceRequestModel.countDocuments(),
      ServiceRequestModel.countDocuments({ status: "new" }),
      ServiceRequestModel.countDocuments({ status: { $in: ["reviewing", "approved", "in_progress"] } }),
      ServiceRequestModel.countDocuments({ status: "completed" }),
    ]);
    res.json({ total, new: newCount, inProgress, completed });
  } catch {
    res.json({ total: 0, new: 0, inProgress: 0, completed: 0 });
  }
});
