import { useLanguage } from "@/lib/i18n";

export default function Calendar() {
  const { language } = useLanguage();
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        {language === 'ar' ? 'التقويم' : 'Calendar'}
      </h1>
      <p className="text-muted-foreground">
        {language === 'ar' ? 'قريباً...' : 'Coming soon...'}
      </p>
    </div>
  );
}
