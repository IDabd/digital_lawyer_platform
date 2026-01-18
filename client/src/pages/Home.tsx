import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { useLanguage } from "@/lib/i18n";
import { 
  Scale, 
  FileText, 
  Users, 
  BarChart3, 
  Shield, 
  Zap,
  Globe,
  Brain,
  CheckCircle2
} from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Hero Section */}
      <header className="container py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">
              {language === 'ar' ? 'منصة المحامي الرقمي' : 'Digital Lawyer Platform'}
            </span>
          </div>
          <Button asChild>
            <a href={getLoginUrl()}>
              {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
            </a>
          </Button>
        </nav>
      </header>

      {/* Hero Content */}
      <section className="container py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            {language === 'ar' ? (
              <>
                منصة إدارة شاملة<br />
                <span className="text-primary">لمكاتب المحاماة</span>
              </>
            ) : (
              <>
                Comprehensive Management Platform<br />
                <span className="text-primary">for Law Firms</span>
              </>
            )}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'نظام متكامل لإدارة القضايا، الوثائق، الفواتير مع قدرات ذكاء اصطناعي متقدمة'
              : 'Integrated system for managing cases, documents, invoices with advanced AI capabilities'
            }
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <a href={getLoginUrl()}>
                {language === 'ar' ? 'ابدأ الآن' : 'Get Started'}
              </a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#features">
                {language === 'ar' ? 'المزايا' : 'Features'}
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="container py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {language === 'ar' ? 'المزايا الرئيسية' : 'Key Features'}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {language === 'ar' 
              ? 'كل ما تحتاجه لإدارة مكتبك القانوني بكفاءة وفعالية'
              : 'Everything you need to manage your law office efficiently and effectively'
            }
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'إدارة القضايا' : 'Case Management'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تتبع شامل للقضايا مع المهام والمواعيد والنشاطات'
                  : 'Comprehensive case tracking with tasks, appointments, and activities'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'إدارة الوثائق' : 'Document Management'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تنظيم وبحث ذكي للمستندات مع التحكم بالإصدارات'
                  : 'Smart organization and search for documents with version control'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'الفواتير والتحصيل' : 'Invoicing & Billing'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'نظام فواتير احترافي مع تتبع الوقت والنفقات'
                  : 'Professional invoicing system with time and expense tracking'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'بوابة العملاء' : 'Client Portal'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'مشاركة آمنة للمستندات مع العملاء'
                  : 'Secure document sharing with clients'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Brain className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'الذكاء الاصطناعي' : 'AI Features'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'استخراج بيانات ذكي وبحث قانوني وأتمتة صياغة'
                  : 'Smart data extraction, legal search, and drafting automation'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'الأمان والامتثال' : 'Security & Compliance'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تشفير متقدم وامتثال كامل لقانون حماية البيانات'
                  : 'Advanced encryption and full PDPL compliance'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Globe className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'ثنائي اللغة' : 'Bilingual'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'دعم كامل للعربية والإنجليزية'
                  : 'Full support for Arabic and English'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Zap className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'تقارير متقدمة' : 'Advanced Reports'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'تحليلات شاملة للأداء والربحية'
                  : 'Comprehensive performance and profitability analytics'
                }
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
              <CardTitle>
                {language === 'ar' ? 'سهل الاستخدام' : 'Easy to Use'}
              </CardTitle>
              <CardDescription>
                {language === 'ar' 
                  ? 'واجهة بديهية وسهلة للجميع'
                  : 'Intuitive interface easy for everyone'
                }
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {language === 'ar' ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {language === 'ar' 
                ? 'انضم إلى مكاتب المحاماة الرائدة في استخدام التكنولوجيا'
                : 'Join leading law firms in using technology'
              }
            </p>
            <Button size="lg" variant="secondary" asChild>
              <a href={getLoginUrl()}>
                {language === 'ar' ? 'ابدأ الآن مجاناً' : 'Start Now for Free'}
              </a>
            </Button>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="container py-8 border-t">
        <div className="text-center text-muted-foreground">
          <p>
            {language === 'ar' 
              ? '© 2024 منصة المحامي الرقمي. جميع الحقوق محفوظة.'
              : '© 2024 Digital Lawyer Platform. All rights reserved.'
            }
          </p>
        </div>
      </footer>
    </div>
  );
}
