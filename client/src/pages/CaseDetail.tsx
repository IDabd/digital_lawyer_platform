import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { 
  ArrowLeft, 
  FileText, 
  Clock,
  Activity,
  Edit,
  Trash2
} from "lucide-react";
import { Link, useParams } from "wouter";
import { getLoginUrl } from "@/const";

export default function CaseDetail() {
  const { id } = useParams();
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();

  const { data: caseData, isLoading: caseLoading } = trpc.cases.getById.useQuery(
    { id: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

  const { data: documents } = trpc.documents.getByCase.useQuery(
    { caseId: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

  const { data: tasks } = trpc.tasks.getByCase.useQuery(
    { caseId: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

  const { data: activities } = trpc.cases.getActivities.useQuery(
    { caseId: parseInt(id!) },
    { enabled: isAuthenticated && !!id }
  );

  if (loading || caseLoading) {
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

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl font-bold">
            {language === 'ar' ? 'القضية غير موجودة' : 'Case not found'}
          </h1>
          <Button asChild className="mt-4">
            <Link href="/cases">
              {language === 'ar' ? 'العودة للقضايا' : 'Back to Cases'}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/cases">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">{caseData.title}</h1>
              <p className="text-muted-foreground mt-1">{caseData.caseNumber}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'تعديل' : 'Edit'}
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Badge variant={caseData.status === 'active' ? 'default' : 'secondary'}>
            {language === 'ar' 
              ? caseData.status === 'active' ? 'نشط' :
                caseData.status === 'pending' ? 'معلق' :
                caseData.status === 'closed' ? 'مغلق' : 'مؤرشف'
              : caseData.status
            }
          </Badge>
          <Badge variant={caseData.priority === 'urgent' ? 'destructive' : 'outline'}>
            {language === 'ar' 
              ? caseData.priority === 'urgent' ? 'عاجل' :
                caseData.priority === 'high' ? 'عالي' :
                caseData.priority === 'medium' ? 'متوسط' : 'منخفض'
              : caseData.priority
            }
          </Badge>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'الوصف' : 'Description'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {caseData.description || (language === 'ar' ? 'لا يوجد وصف' : 'No description')}
                </p>
              </CardContent>
            </Card>

            <Tabs defaultValue="documents">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="documents">
                  <FileText className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'الوثائق' : 'Documents'}
                </TabsTrigger>
                <TabsTrigger value="tasks">
                  <Clock className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'المهام' : 'Tasks'}
                </TabsTrigger>
                <TabsTrigger value="activity">
                  <Activity className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'النشاطات' : 'Activity'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="documents" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {documents && documents.length > 0 ? (
                      <div className="space-y-3">
                        {documents.map((doc: any) => (
                          <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border">
                            <div className="flex items-center gap-3">
                              <FileText className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <p className="font-medium">{doc.filename}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(doc.uploadedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </p>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm">
                              {language === 'ar' ? 'عرض' : 'View'}
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {language === 'ar' ? 'لا توجد وثائق' : 'No documents'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {tasks && tasks.length > 0 ? (
                      <div className="space-y-3">
                        {tasks.map((task: any) => (
                          <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border">
                            <input type="checkbox" checked={task.status === 'completed'} readOnly className="h-4 w-4" />
                            <div className="flex-1">
                              <p className="font-medium">{task.title}</p>
                              {task.dueDate && (
                                <p className="text-sm text-muted-foreground">
                                  {new Date(task.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </p>
                              )}
                            </div>
                            <Badge variant={task.priority === 'urgent' ? 'destructive' : 'outline'}>
                              {task.priority}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {language === 'ar' ? 'لا توجد مهام' : 'No tasks'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {activities && activities.length > 0 ? (
                      <div className="space-y-4">
                        {activities.map((activity: any) => (
                          <div key={activity.id} className="flex gap-3 p-3 rounded-lg border">
                            <Activity className="h-5 w-5 text-primary mt-0.5" />
                            <div>
                              <p className="font-medium">{activity.description}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        {language === 'ar' ? 'لا توجد نشاطات' : 'No activities'}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'معلومات القضية' : 'Case Information'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'نوع القضية' : 'Case Type'}
                  </p>
                  <p className="font-medium">{caseData.caseType || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}
                  </p>
                  <p className="font-medium">
                    {new Date(caseData.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </p>
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>
                  {language === 'ar' ? 'إحصائيات سريعة' : 'Quick Stats'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {language === 'ar' ? 'الوثائق' : 'Documents'}
                    </span>
                  </div>
                  <span className="font-bold">{documents?.length || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {language === 'ar' ? 'المهام' : 'Tasks'}
                    </span>
                  </div>
                  <span className="font-bold">{tasks?.length || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
