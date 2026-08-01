/**
 * OFOQ Seed Script
 * Run once: npm run seed
 * Creates: initial super_admin + default services + CMS pages + system settings
 */

import mongoose from "mongoose";
import { hashPassword } from "./auth.js";
import {
  UserModel, ServiceModel, PageModel, SystemSettingsModel, BlogPostModel, TestimonialModel,
} from "./models/index.js";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set. Add it as a Replit Secret first.");
  process.exit(1);
}

async function seed() {
  console.log("🌱 بدء تهيئة قاعدة البيانات...\n");
  await mongoose.connect(MONGODB_URI!);
  console.log("✅ اتصال بـ MongoDB ناجح\n");

  // ── 1. Super Admin ──────────────────────────────────────────────
  const existingAdmin = await UserModel.findOne({ role: "super_admin" });
  if (existingAdmin) {
    console.log(`⏭️  المدير الرئيسي موجود مسبقاً: ${existingAdmin.email}`);
  } else {
    const password = await hashPassword("OFOQ@2026#");
    const admin = await UserModel.create({
      fullName: "مدير النظام",
      email: "admin@ofoqhc.com",
      password,
      role: "super_admin",
      status: "active",
      twoFactorEnabled: false,
      emailVerified: true,
    });
    console.log("✅ تم إنشاء المدير الرئيسي:");
    console.log(`   📧 البريد: ${admin.email}`);
    console.log(`   🔑 كلمة المرور: OFOQ@2026#`);
    console.log(`   ⚠️  غيّر كلمة المرور فور الدخول!\n`);
  }

  // ── 2. System Settings ─────────────────────────────────────────
  const settingsToSeed = [
    { key: "app_name",           value: "أفق لحلول الأعمال",            group: "general" },
    { key: "app_name_en",        value: "OFOQ Business Solutions",       group: "general" },
    { key: "app_description",    value: "شريكك الاستراتيجي في التحول الرقمي", group: "general" },
    { key: "app_url",            value: process.env.APP_URL || "https://ofoq.sa", group: "general" },
    { key: "contact_email",      value: "info@ofoq.sa",                  group: "general" },
    { key: "contact_phone",      value: "+966 XX XXX XXXX",              group: "general" },
    { key: "contact_address",    value: "المملكة العربية السعودية",      group: "general" },
    { key: "email_from_name",    value: "أفق لحلول الأعمال",            group: "email" },
    { key: "notify_new_lead",    value: "true",                          group: "notifications" },
    { key: "notify_project_update", value: "true",                       group: "notifications" },
    { key: "notify_invoice_paid",   value: "true",                       group: "notifications" },
    { key: "notify_overdue_invoice", value: "true",                      group: "notifications" },
    { key: "notify_contact_request", value: "true",                      group: "notifications" },
    { key: "max_login_attempts", value: "5",                             group: "security" },
    { key: "session_timeout",    value: "24",                            group: "security" },
  ];

  let settingsCount = 0;
  for (const s of settingsToSeed) {
    await SystemSettingsModel.findOneAndUpdate(
      { key: s.key },
      s,
      { upsert: true, new: true }
    );
    settingsCount++;
  }
  console.log(`✅ إعدادات النظام: ${settingsCount} إعداد`);

  // ── 3. Default Services ────────────────────────────────────────
  const services = [
    {
      title: "Strategic Consulting",
      titleAr: "الاستشارات الاستراتيجية",
      slug: "strategic-consulting",
      shortDesc: "We help you chart a clear roadmap toward your big goals using data-driven methodologies.",
      shortDescAr: "نساعدك في رسم خارطة طريق واضحة نحو أهدافك الكبرى بأساليب مدروسة ومبنية على بيانات حقيقية.",
      category: "consulting",
      categoryAr: "الاستشارات",
      order: 1,
      isActive: true,
    },
    {
      title: "Digital Transformation",
      titleAr: "التحول الرقمي",
      slug: "digital-transformation",
      shortDesc: "We transform your traditional operations into a fully integrated digital ecosystem.",
      shortDescAr: "نُحوّل عملياتك التقليدية إلى منظومة رقمية متكاملة تزيد الكفاءة وتخفض التكاليف.",
      category: "digital",
      categoryAr: "التحول الرقمي",
      order: 2,
      isActive: true,
    },
    {
      title: "Data Analytics & AI",
      titleAr: "تحليل البيانات والذكاء الاصطناعي",
      slug: "data-analytics-ai",
      shortDesc: "We transform your raw data into strategic insights that give you a real competitive edge.",
      shortDescAr: "نحوّل بياناتك الخام إلى رؤى استراتيجية تمنحك ميزة تنافسية حقيقية.",
      category: "data",
      categoryAr: "البيانات والذكاء الاصطناعي",
      order: 3,
      isActive: true,
    },
    {
      title: "Custom Software Development",
      titleAr: "تطوير البرمجيات المخصصة",
      slug: "custom-software",
      shortDesc: "Fully custom software solutions for your business — fast, reliable, and scalable.",
      shortDescAr: "حلول برمجية مخصصة بالكامل لاحتياجات عملك — سرعة، موثوقية، وقابلية للتوسع.",
      category: "development",
      categoryAr: "تطوير البرمجيات",
      order: 4,
      isActive: true,
    },
    {
      title: "Digital Marketing",
      titleAr: "التسويق الرقمي",
      slug: "digital-marketing",
      shortDesc: "Integrated digital marketing strategies that put you in front of your customers at the right moment.",
      shortDescAr: "استراتيجيات تسويق رقمي متكاملة تضعك أمام عملائك في اللحظة المناسبة.",
      category: "marketing",
      categoryAr: "التسويق",
      order: 5,
      isActive: true,
    },
    {
      title: "Cybersecurity",
      titleAr: "الأمن السيبراني",
      slug: "cybersecurity",
      shortDesc: "We protect your digital assets from all modern threats with the latest tools and global best practices.",
      shortDescAr: "نحمي أصولك الرقمية من كل التهديدات الحديثة بأحدث الأدوات والممارسات العالمية.",
      category: "security",
      categoryAr: "الأمن السيبراني",
      order: 6,
      isActive: true,
    },
  ];

  let servicesCreated = 0;
  for (const svc of services) {
    const existing = await ServiceModel.findOne({ slug: svc.slug });
    if (!existing) {
      await ServiceModel.create(svc);
      servicesCreated++;
    }
  }
  console.log(`✅ الخدمات: ${servicesCreated} خدمة جديدة (${services.length - servicesCreated} موجودة مسبقاً)`);

  // ── 4. CMS Pages ───────────────────────────────────────────────
  const pages = [
    {
      key: "home",
      slug: "home",
      title: "Home",
      titleAr: "الصفحة الرئيسية",
      isPublished: true,
      sections: [
        { key: "hero", titleAr: "نبني مستقبل أعمالك معك", contentAr: "حلول رقمية متكاملة" },
        { key: "services", titleAr: "خدماتنا" },
        { key: "stats", titleAr: "أرقامنا تتحدث" },
        { key: "testimonials", titleAr: "شهادات عملائنا" },
        { key: "cta", titleAr: "ابدأ رحلتك الرقمية" },
      ],
    },
    {
      key: "about",
      slug: "about",
      title: "About Us",
      titleAr: "من نحن",
      isPublished: true,
      sections: [
        { key: "hero", titleAr: "رحلتنا نحو أفق أبعد" },
        { key: "story", titleAr: "قصتنا" },
        { key: "values", titleAr: "قيمنا الجوهرية" },
        { key: "team", titleAr: "فريق القيادة" },
      ],
    },
    {
      key: "services",
      slug: "services",
      title: "Our Services",
      titleAr: "خدماتنا",
      isPublished: true,
      sections: [
        { key: "hero", titleAr: "حلول شاملة لكل احتياجاتك" },
        { key: "services_list", titleAr: "قائمة الخدمات" },
      ],
    },
    {
      key: "contact",
      slug: "contact",
      title: "Contact Us",
      titleAr: "تواصل معنا",
      isPublished: true,
      sections: [
        { key: "hero", titleAr: "نحن هنا لمساعدتك" },
        { key: "contact_form", titleAr: "نموذج التواصل" },
        { key: "contact_info", titleAr: "معلومات التواصل" },
      ],
    },
  ];

  let pagesCreated = 0;
  for (const page of pages) {
    const existing = await PageModel.findOne({ key: page.key });
    if (!existing) {
      await PageModel.create(page);
      pagesCreated++;
    }
  }
  console.log(`✅ صفحات CMS: ${pagesCreated} صفحة جديدة`);

  // ── 5. Sample Testimonials ─────────────────────────────────────
  const existingTestimonials = await TestimonialModel.countDocuments();
  if (existingTestimonials === 0) {
    await TestimonialModel.insertMany([
      {
        clientName: "Mohammed Al-Ghamdi",
        clientNameAr: "محمد الغامدي",
        company: "Gulf Business Group",
        companyAr: "مجموعة الأعمال الخليجية",
        position: "CEO",
        positionAr: "المدير التنفيذي",
        text: "OFOQ completely changed our view of digital transformation. In just 6 months, our operational efficiency increased by 40%.",
        textAr: "أفق غيّرت نظرتنا للتحول الرقمي تماماً. خلال 6 أشهر فقط، ارتفعت كفاءة عملياتنا بنسبة 40% بفضل الحلول الذكية التي قدّموها.",
        rating: 5,
        isApproved: true,
        isFeatured: true,
      },
      {
        clientName: "Sara Al-Qahtani",
        clientNameAr: "سارة القحطاني",
        company: "Future Tech Company",
        companyAr: "شركة المستقبل للتقنية",
        position: "Operations Director",
        positionAr: "مديرة العمليات",
        text: "The team is very professional and truly listens to our needs. Results exceeded our expectations.",
        textAr: "الفريق محترف جداً ويستمع فعلاً لاحتياجاتنا. النتائج تجاوزت توقعاتنا والتواصل كان سلساً طوال فترة المشروع.",
        rating: 5,
        isApproved: true,
        isFeatured: true,
      },
      {
        clientName: "Khaled Al-Otaibi",
        clientNameAr: "خالد العتيبي",
        company: "Modern Construction Est.",
        companyAr: "مؤسسة البناء الحديث",
        position: "Owner",
        positionAr: "صاحب المؤسسة",
        text: "An excellent investment by all measures. The solutions OFOQ provided saved us time and money.",
        textAr: "استثمار ممتاز بكل المقاييس. الحلول التي قدّمتها أفق وفّرت علينا وقتاً ومالاً كنا نهدرهما في أساليب قديمة.",
        rating: 5,
        isApproved: true,
        isFeatured: false,
      },
    ]);
    console.log("✅ شهادات العملاء: 3 شهادات نموذجية");
  } else {
    console.log(`⏭️  الشهادات موجودة مسبقاً (${existingTestimonials})`);
  }

  // ── 6. Sample Blog Post ────────────────────────────────────────
  const existingPosts = await BlogPostModel.countDocuments();
  if (existingPosts === 0) {
    // Get admin user for author field
    const adminUser = await UserModel.findOne({ role: "super_admin" });
    await BlogPostModel.create({
      title: "The Future of Digital Transformation in Saudi Arabia",
      titleAr: "مستقبل التحول الرقمي في المملكة العربية السعودية",
      slug: "future-digital-transformation-saudi-arabia",
      excerptAr: "كيف تُعيد رؤية 2030 تشكيل ملامح الأعمال الرقمية في المملكة، وما الفرص الواعدة التي لا يجب أن تفوّتها.",
      content: "The Kingdom of Saudi Arabia is witnessing an unprecedented digital transformation...",
      contentAr: "تشهد المملكة العربية السعودية تحولاً رقمياً غير مسبوق في تاريخها الاقتصادي، مدفوعاً برؤية 2030 الطموحة التي تسعى إلى تنويع مصادر الدخل وبناء اقتصاد رقمي متطور.",
      category: "Digital Transformation",
      categoryAr: "التحول الرقمي",
      author: adminUser!._id,
      tags: ["رؤية 2030", "التحول الرقمي", "السعودية"],
      isPublished: true,
      publishedAt: new Date(),
    });
    console.log("✅ المدونة: مقالة نموذجية واحدة");
  } else {
    console.log(`⏭️  مقالات موجودة مسبقاً (${existingPosts})`);
  }

  console.log("\n🎉 اكتملت تهيئة قاعدة البيانات بنجاح!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🔑 بيانات الدخول للوحة التحكم:");
  console.log("   الرابط:  /admin/login");
  console.log("   البريد:  admin@ofoqhc.com");
  console.log("   المرور:  OFOQ@2026#");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("⚠️  غيّر كلمة المرور فور الدخول!\n");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ خطأ في الـ seed:", err.message);
  process.exit(1);
});
