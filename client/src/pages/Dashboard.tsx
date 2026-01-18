import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { 
  Scale, 
  Users, 
  Clock,
  AlertCircle,
  Calendar,
  ArrowRight,
  Plus,
  FileText
} from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Dashboard() {
  const { user, loading, isAuthenticated } = useAuth();
  const { t, language } = useLanguage();
  
  const { data: cases } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: clients } = trpc.clients.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: tasks } = trpc.tasks.getByUser.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  
  const { data: events } = trpc.calendar.getEvents.useQuery(
    { 
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    },
    { enabled: isAuthenticated }
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  const activeCases = cases?.filter(c => c.status === 'active') || [];
  const pendingTasks = tasks?.filter(t => t.status === 'pending') || [];
  const urgentCases = cases?.filter(c => c.priority === 'urgent') || [];

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? `مرحباً، ${user?.name || 'المستخدم'}` : `Welcome, ${user?.name || 'User'}`}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إليك ملخص نشاطاتك اليوم' : 'Here\'s your activity summary'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/cases/new">
                <Plus className="h-4 w-4 mr-2" />
                {language === 'ar' ? 'قضية جديدة' : 'New Case'}
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'القضايا النشطة' : 'Active Cases'}
              </CardTitle>
              <Scale className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCases.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'العملاء' : 'Clients'}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clients?.length || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'المهام المعلقة' : 'Pending Tasks'}
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'قضايا عاجلة' : 'Urgent Cases'}
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{urgentCases.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Cases & Events */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{language === 'ar' ? 'القضايا الأخيرة' : 'Recent Cases'}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/cases">
                    {language === 'ar' ? 'عرض الكل' : 'View All'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {cases && cases.length > 0 ? (
                <div className="space-y-3">
                  {cases.slice(0, 5).map((c) => (
                    <Link key={c.id} href={`/cases/${c.id}`}>
                      <div className="p-3 rounded-lg border hover:bg-accent cursor-pointer">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium">{c.title}</h4>
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                            {c.status}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{c.caseNumber}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'ar' ? 'لا توجد قضايا' : 'No cases yet'}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{language === 'ar' ? 'المواعيد القادمة' : 'Upcoming Events'}</CardTitle>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/calendar">
                    {language === 'ar' ? 'التقويم' : 'Calendar'}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="space-y-3">
                  {events.map((e: any) => (
                    <div key={e.id} className="p-3 rounded-lg border">
                      <div className="flex gap-3">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <h4 className="font-medium">{e.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(e.startTime).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {language === 'ar' ? 'لا توجد مواعيد' : 'No events'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
