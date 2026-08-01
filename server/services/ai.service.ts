/**
 * OFOQ Intelligence Engine
 * ─────────────────────────────────────────────────────────────────
 * This module quietly enhances the system with AI-powered insights.
 * It operates invisibly — users see smart suggestions and accurate
 * predictions, but the AI layer is completely transparent to them.
 *
 * The system learns from patterns and improves over time.
 * When AI is unavailable, built-in heuristics take over seamlessly.
 * ─────────────────────────────────────────────────────────────────
 */

import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getClient(): OpenAI | null {
  if (!process.env.OPENAI_API_KEY) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
    });
  }
  return openaiClient;
}

async function callAI(prompt: string, system?: string): Promise<string | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system || "أنت محلل بيانات متخصص في شركات الأعمال. أجب بالعربية بشكل موجز ودقيق." },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.3,
    });
    return res.choices[0]?.message?.content || null;
  } catch {
    return null;
  }
}

// ── Lead Scoring ─────────────────────────────────────────────────
async function scoreLead(leadId: string): Promise<void> {
  try {
    const { LeadModel } = await import("../models/index.js");
    const lead = await LeadModel.findById(leadId).lean();
    if (!lead) return;

    // Heuristic scoring (always runs, AI enhances it)
    let score = 50;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    if (lead.company) score += 5;
    if (lead.estimatedValue && lead.estimatedValue > 10000) score += 15;
    if (lead.priority === "high" || lead.priority === "urgent") score += 10;
    if (lead.status === "qualified") score += 15;
    if (lead.interestedServices.length > 1) score += 5;
    score = Math.min(100, score);

    // AI enhancement
    const aiPrompt = `
بيانات عميل محتمل:
- الاسم: ${lead.name}
- الشركة: ${lead.company || "غير محدد"}
- مصدر الاستفسار: ${lead.source}
- الخدمات المطلوبة: ${lead.interestedServices.join(", ") || "غير محدد"}
- القيمة المقدرة: ${lead.estimatedValue || 0} ${lead.currency}
- الحالة: ${lead.status}
- ملاحظات: ${lead.notes || "لا يوجد"}

أعطني:
1. تقييم احتمالية الفوز (0-100)
2. توقعك (win/lose/maybe)
3. الإجراء المقترح التالي (جملة واحدة)

أجب بصيغة JSON: {"score": 0-100, "prediction": "win|lose|maybe", "nextAction": "..."}
    `.trim();

    const aiResult = await callAI(aiPrompt);
    let aiScore = score;
    let prediction = score > 60 ? "win" : score > 40 ? "maybe" : "lose";
    let nextAction: string | undefined;

    if (aiResult) {
      try {
        const parsed = JSON.parse(aiResult.replace(/```json?|```/g, "").trim());
        if (parsed.score) aiScore = Math.round((score + parsed.score) / 2);
        if (parsed.prediction) prediction = parsed.prediction;
        if (parsed.nextAction) nextAction = parsed.nextAction;
      } catch {}
    }

    await LeadModel.findByIdAndUpdate(leadId, {
      _aiScore: aiScore,
      _aiPrediction: prediction,
      _aiNextAction: nextAction,
    });
  } catch {}
}

// ── Project Risk Analysis ─────────────────────────────────────────
async function analyzeProjectRisk(projectId: string): Promise<void> {
  try {
    const { ProjectModel, TaskModel } = await import("../models/index.js");
    const project = await ProjectModel.findById(projectId).lean();
    if (!project) return;

    // Heuristic risk scoring
    let risk = 20;
    const now = new Date();
    if (project.dueDate) {
      const daysLeft = Math.ceil((project.dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysLeft < 7) risk += 40;
      else if (daysLeft < 14) risk += 20;
      else if (daysLeft < 30) risk += 10;
    }
    if (project.progress < 30 && project.dueDate && project.dueDate < now) risk += 30;
    if (!project.budget) risk += 10;

    const taskCount = await TaskModel.countDocuments({ projectId, status: { $ne: "done" }, dueDate: { $lt: now } });
    risk += taskCount * 5;
    risk = Math.min(100, risk);

    // Predict completion
    let eta: Date | undefined;
    if (project.progress > 0 && project.startDate) {
      const elapsed = now.getTime() - project.startDate.getTime();
      const estimated = (elapsed / project.progress) * 100;
      eta = new Date(project.startDate.getTime() + estimated);
    }

    await ProjectModel.findByIdAndUpdate(projectId, {
      _aiRiskScore: risk,
      _aiCompletionEta: eta,
      _aiBudgetRisk: risk > 70 ? risk : Math.max(10, risk - 20),
    });
  } catch {}
}

// ── Dashboard Insights ────────────────────────────────────────────
async function getDashboardInsights(data: {
  totalLeads: number;
  wonLeadsThisMonth: number;
  activeProjects: number;
  totalRevenue: number;
}): Promise<string[]> {
  const heuristics: string[] = [];

  // Always generate smart heuristic insights
  if (data.totalLeads > 0) {
    const convRate = Math.round((data.wonLeadsThisMonth / Math.max(data.totalLeads, 1)) * 100);
    if (convRate < 20) heuristics.push("معدل تحويل الفرص أقل من المتوسط — يُنصح بمراجعة استراتيجية المتابعة");
    else if (convRate > 50) heuristics.push("معدل تحويل ممتاز هذا الشهر — استمر في نهج المبيعات الحالي");
  }
  if (data.activeProjects > 10) heuristics.push("حمل العمل مرتفع — تأكد من توزيع الفريق بشكل متوازن");
  if (data.totalRevenue === 0) heuristics.push("لم يتم تسجيل أي فواتير مدفوعة بعد — ابدأ بإرسال الفواتير للعملاء");

  // AI enhancement (invisible)
  const prompt = `
إحصائيات نظام أعمال:
- إجمالي الفرص: ${data.totalLeads}
- الفرص المحوّلة هذا الشهر: ${data.wonLeadsThisMonth}
- المشاريع النشطة: ${data.activeProjects}
- إجمالي الإيرادات: ${data.totalRevenue} ريال

أعطني 2-3 توصيات استراتيجية قصيرة لتحسين الأداء.
أجب بقائمة JSON من النصوص: ["توصية 1", "توصية 2"]
  `.trim();

  const aiResult = await callAI(prompt);
  if (aiResult) {
    try {
      const parsed = JSON.parse(aiResult.replace(/```json?|```/g, "").trim());
      if (Array.isArray(parsed)) return [...heuristics, ...parsed].slice(0, 4);
    } catch {}
  }

  return heuristics;
}

// ── Auto-Classify Contact Requests ───────────────────────────────
async function classifyContactRequest(requestId: string): Promise<void> {
  try {
    const { ContactRequestModel } = await import("../models/index.js");
    const cr = await ContactRequestModel.findById(requestId).lean();
    if (!cr) return;

    const prompt = `
رسالة تواصل واردة:
"${cr.message}"
الشركة: ${cr.company || "غير محدد"}

هل هذه رسالة: spam أم genuine؟
الأولوية: low/medium/high؟
أجب بـ JSON: {"isSpam": false, "priority": "medium"}
    `.trim();

    const result = await callAI(prompt);
    if (result) {
      try {
        const parsed = JSON.parse(result.replace(/```json?|```/g, "").trim());
        if (parsed.isSpam) {
          await ContactRequestModel.findByIdAndUpdate(requestId, { status: "spam" });
        }
      } catch {}
    }
  } catch {}
}

// ── Customer Health Score ─────────────────────────────────────────
async function updateCustomerHealth(customerId: string): Promise<void> {
  try {
    const { CustomerModel, ProjectModel, InvoiceModel } = await import("../models/index.js");
    const customer = await CustomerModel.findById(customerId).lean();
    if (!customer) return;

    const [activeProjects, overdueInvoices, totalRevenue] = await Promise.all([
      ProjectModel.countDocuments({ customerId, status: "active" }),
      InvoiceModel.countDocuments({ customerId, status: "overdue" }),
      InvoiceModel.aggregate([
        { $match: { customerId: customer._id, status: "paid" } },
        { $group: { _id: null, total: { $sum: "$total" } } },
      ]),
    ]);

    let health = 70;
    if (overdueInvoices > 0) health -= overdueInvoices * 10;
    if (activeProjects > 0) health += 10;
    if ((totalRevenue[0]?.total || 0) > 50000) health += 15;
    health = Math.max(0, Math.min(100, health));

    const churnRisk = health < 40 ? 0.8 : health < 60 ? 0.4 : 0.1;

    await CustomerModel.findByIdAndUpdate(customerId, {
      _aiHealthScore: health,
      _aiChurnRisk: churnRisk,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch {}
}

export const aiService = {
  scoreLead,
  analyzeProjectRisk,
  getDashboardInsights,
  classifyContactRequest,
  updateCustomerHealth,
};
