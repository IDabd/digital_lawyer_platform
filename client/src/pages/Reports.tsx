import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Download, TrendingUp, DollarSign, Clock, FileText } from "lucide-react";
import { toast } from "sonner";

export default function Reports() {
  const { t, language } = useLanguage();

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = trpc.reports.dashboard.useQuery();

  const handleExportPDF = () => {
    toast.success(language === 'ar' ? 'جاري تصدير التقرير...' : 'Exporting report...');
  };

  const handleExportExcel = () => {
    toast.success(language === 'ar' ? 'جاري تصدير البيانات...' : 'Exporting data...');
  };

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{language === 'ar' ? 'جاري التحميل...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{language === 'ar' ? 'التقارير والتحليلات' : 'Reports & Analytics'}</h1>
          <p className="text-muted-foreground">{language === 'ar' ? 'تقارير وتحليلات شاملة للأداء' : 'Comprehensive performance reports and analytics'}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExportExcel} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصدير Excel' : 'Export Excel'}
          </Button>
          <Button onClick={handleExportPDF}>
            <Download className="h-4 w-4 mr-2" />
            {language === 'ar' ? 'تصدير PDF' : 'Export PDF'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي القضايا' : 'Total Cases'}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalCases || 0}</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'نشط' : 'Active'}: {dashboardData?.activeCases || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardData?.totalRevenue?.toLocaleString() || 0} {language === 'ar' ? 'ريال' : 'SAR'}
            </div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'معلق' : 'Pending'}: {dashboardData?.unpaidAmount?.toLocaleString() || 0}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'ساعات العمل' : 'Billable Hours'}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'هذا الشهر' : 'This month'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {language === 'ar' ? 'معدل النمو' : 'Growth Rate'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+0%</div>
            <p className="text-xs text-muted-foreground">
              {language === 'ar' ? 'مقارنة بالشهر الماضي' : 'vs last month'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Reports */}
      <Tabs defaultValue="cases" className="space-y-4">
        <TabsList>
          <TabsTrigger value="cases">{language === 'ar' ? 'تقارير القضايا' : 'Case Reports'}</TabsTrigger>
          <TabsTrigger value="financial">{language === 'ar' ? 'التقارير المالية' : 'Financial Reports'}</TabsTrigger>
          <TabsTrigger value="productivity">{language === 'ar' ? 'الإنتاجية' : 'Productivity'}</TabsTrigger>
          <TabsTrigger value="clients">{language === 'ar' ? 'العملاء' : 'Clients'}</TabsTrigger>
        </TabsList>

        <TabsContent value="cases" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'القضايا حسب الحالة' : 'Cases by Status'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'توزيع القضايا حسب حالتها الحالية' : 'Distribution of cases by current status'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData as any)?.casesByStatus?.map((item: any) => (
                  <div key={item.status} className="flex items-center">
                    <div className="w-32 text-sm font-medium">
                      {language === 'ar' ? 
                        (item.status === 'active' ? 'نشط' : item.status === 'pending' ? 'معلق' : item.status === 'closed' ? 'مغلق' : item.status) 
                        : item.status}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary" 
                          style={{ width: `${(item.count / (dashboardData?.totalCases || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'القضايا حسب الأولوية' : 'Cases by Priority'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'توزيع القضايا حسب مستوى الأولوية' : 'Distribution of cases by priority level'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(dashboardData as any)?.casesByPriority?.map((item: any) => (
                  <div key={item.priority} className="flex items-center">
                    <div className="w-32 text-sm font-medium">
                      {language === 'ar' ? 
                        (item.priority === 'high' ? 'عالية' : item.priority === 'medium' ? 'متوسطة' : item.priority === 'low' ? 'منخفضة' : item.priority) 
                        : item.priority}
                    </div>
                    <div className="flex-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            item.priority === 'high' ? 'bg-red-500' : 
                            item.priority === 'medium' ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{ width: `${(item.count / (dashboardData?.totalCases || 1)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-medium">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'الإيرادات الشهرية' : 'Monthly Revenue'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'إجمالي الإيرادات والمدفوعات المعلقة' : 'Total revenue and pending payments'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الإيرادات المحصلة' : 'Collected Revenue'}</p>
                    <p className="text-2xl font-bold">{dashboardData?.totalRevenue?.toLocaleString() || 0} {language === 'ar' ? 'ريال' : 'SAR'}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'الإيرادات المعلقة' : 'Pending Revenue'}</p>
                    <p className="text-2xl font-bold">{dashboardData?.unpaidAmount?.toLocaleString() || 0} {language === 'ar' ? 'ريال' : 'SAR'}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="productivity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'إنتاجية الفريق' : 'Team Productivity'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'ساعات العمل والمهام المنجزة' : 'Working hours and completed tasks'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي ساعات العمل' : 'Total Hours Worked'}</p>
                    <p className="text-2xl font-bold">0 {language === 'ar' ? 'ساعة' : 'hours'}</p>
                  </div>
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'المهام المكتملة' : 'Completed Tasks'}</p>
                    <p className="text-2xl font-bold">{dashboardData?.totalTasks || 0}</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{language === 'ar' ? 'تحليل العملاء' : 'Client Analysis'}</CardTitle>
              <CardDescription>
                {language === 'ar' ? 'إحصائيات العملاء والقضايا' : 'Client statistics and cases'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'إجمالي العملاء' : 'Total Clients'}</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <div className="flex justify-between items-center p-4 bg-secondary rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">{language === 'ar' ? 'العملاء النشطون' : 'Active Clients'}</p>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
