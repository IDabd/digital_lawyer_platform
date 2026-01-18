import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";

export default function Settings() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  if (!isAuthenticated) { window.location.href = getLoginUrl(); return null; }

  return <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}><h1>{language === 'ar' ? 'الإعدادات' : 'Settings'}</h1></div>;
}
