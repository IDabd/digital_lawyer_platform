import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";

export default function Invoices() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold">{language === 'ar' ? 'الفواتير' : 'Invoices'}</h1>
        <Card className="mt-6">
          <CardContent className="p-6">
            <p>{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
