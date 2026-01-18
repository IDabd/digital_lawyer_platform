import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type Language = "ar" | "en";

export const translations = {
  ar: {
    dashboard: "لوحة التحكم",
    cases: "القضايا",
    documents: "الوثائق",
    invoices: "الفواتير",
    clients: "العملاء",
    calendar: "التقويم",
    reports: "التقارير",
    settings: "الإعدادات",
    logout: "تسجيل الخروج",
    caseManagement: "إدارة القضايا",
    newCase: "قضية جديدة",
    caseNumber: "رقم القضية",
    caseTitle: "عنوان القضية",
    caseType: "نوع القضية",
    caseStatus: "حالة القضية",
    casePriority: "أولوية القضية",
    client: "العميل",
    assignedTo: "مسند إلى",
    description: "الوصف",
    active: "نشطة",
    pending: "معلقة",
    closed: "مغلقة",
    archived: "مؤرشفة",
    low: "منخفضة",
    medium: "متوسطة",
    high: "عالية",
    urgent: "عاجلة",
    commercial: "تجاري",
    criminal: "جنائي",
    civil: "مدني",
    documentManagement: "إدارة الوثائق",
    uploadDocument: "رفع وثيقة",
    documentTitle: "عنوان الوثيقة",
    fileName: "اسم الملف",
    fileSize: "حجم الملف",
    uploadedBy: "رفع بواسطة",
    invoiceManagement: "إدارة الفواتير",
    newInvoice: "فاتورة جديدة",
    invoiceNumber: "رقم الفاتورة",
    total: "الإجمالي",
    paid: "مدفوعة",
    unpaid: "غير مدفوعة",
    clientManagement: "إدارة العملاء",
    newClient: "عميل جديد",
    clientName: "اسم العميل",
    clientEmail: "البريد الإلكتروني",
    clientPhone: "رقم الهاتف",
    tasks: "المهام",
    newTask: "مهمة جديدة",
    taskTitle: "عنوان المهمة",
    create: "إنشاء",
    edit: "تعديل",
    delete: "حذف",
    save: "حفظ",
    cancel: "إلغاء",
    search: "بحث",
    filter: "تصفية",
    view: "عرض",
    download: "تحميل",
    share: "مشاركة",
    loading: "جاري التحميل...",
    noData: "لا توجد بيانات",
    error: "حدث خطأ",
    success: "تمت العملية بنجاح",
    login: "تسجيل الدخول",
    welcome: "مرحباً",
    profile: "الملف الشخصي",
  },
  en: {
    dashboard: "Dashboard",
    cases: "Cases",
    documents: "Documents",
    invoices: "Invoices",
    clients: "Clients",
    calendar: "Calendar",
    reports: "Reports",
    settings: "Settings",
    logout: "Logout",
    caseManagement: "Case Management",
    newCase: "New Case",
    caseNumber: "Case Number",
    caseTitle: "Case Title",
    caseType: "Case Type",
    caseStatus: "Case Status",
    casePriority: "Case Priority",
    client: "Client",
    assignedTo: "Assigned To",
    description: "Description",
    active: "Active",
    pending: "Pending",
    closed: "Closed",
    archived: "Archived",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    commercial: "Commercial",
    criminal: "Criminal",
    civil: "Civil",
    documentManagement: "Document Management",
    uploadDocument: "Upload Document",
    documentTitle: "Document Title",
    fileName: "File Name",
    fileSize: "File Size",
    uploadedBy: "Uploaded By",
    invoiceManagement: "Invoice Management",
    newInvoice: "New Invoice",
    invoiceNumber: "Invoice Number",
    total: "Total",
    paid: "Paid",
    unpaid: "Unpaid",
    clientManagement: "Client Management",
    newClient: "New Client",
    clientName: "Client Name",
    clientEmail: "Client Email",
    clientPhone: "Client Phone",
    tasks: "Tasks",
    newTask: "New Task",
    taskTitle: "Task Title",
    create: "Create",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    search: "Search",
    filter: "Filter",
    view: "View",
    download: "Download",
    share: "Share",
    loading: "Loading...",
    noData: "No data available",
    error: "An error occurred",
    success: "Operation successful",
    login: "Login",
    welcome: "Welcome",
    profile: "Profile",
  },
};

export type TranslationKey = keyof typeof translations.ar;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider(props: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ar");

  const t = (key: TranslationKey): string => {
    return translations[language][key] || key;
  };

  const value = { language, setLanguage, t };

  return (
    <LanguageContext.Provider value={value}>
      {props.children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
