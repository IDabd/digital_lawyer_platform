import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { 
  Scale, LogOut, Briefcase, FileText, DollarSign, MessageSquare,
  Calendar, Clock, CheckCircle2, AlertCircle, Loader2, Download,
  Eye
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function ClientDashboard() {
  const { language } = useLanguage();
  const [clientInfo, setClientInfo] = useState<any>(null);

  useEffect(() => {
    const stored = localStorage.getItem("clientAuth");
    if (!stored) {
      window.location.href = "/client-portal/login";
      return;
    }
    setClientInfo(JSON.parse(stored));
  }, []);

  const { data: dashboardData, isLoading } = trpc.clientAuth.getDashboard.useQuery(
    { clientId: clientInfo?.id || 0 },
    { enabled: !!clientInfo?.id }
  );

  const { data: messages } = trpc.clientAuth.getMessages.useQuery(
    { clientId: clientInfo?.id || 0 },
    { enabled: !!clientInfo?.id }
  );

  const sendMessageMutation = trpc.clientAuth.sendMessage.useMutation();
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("clientAuth");
    window.location.href = "/client-portal/login";
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !clientInfo) return;

    setSending(true);
    try {
      await sendMessageMutation.mutateAsync({
        clientId: clientInfo.id,
        message: newMessage,
      });
      setNewMessage("");
      // Refresh messages
      window.location.reload();
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getCaseStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      active: { label: language === 'ar' ? 'نشطة' : 'Active', variant: 'default' },
      pending: { label: language === 'ar' ? 'معلقة' : 'Pending', variant: 'secondary' },
      closed: { label: language === 'ar' ? 'مغلقة' : 'Closed', variant: 'outline' },
      archived: { label: language === 'ar' ? 'مؤرشفة' : 'Archived', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.active;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getInvoiceStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      draft: { label: language === 'ar' ? 'مسودة' : 'Draft', variant: 'secondary' },
      pending: { label: language === 'ar' ? 'معلقة' : 'Pending', variant: 'secondary' },
      sent: { label: language === 'ar' ? 'مرسلة' : 'Sent', variant: 'default' },
      paid: { label: language === 'ar' ? 'مدفوعة' : 'Paid', variant: 'outline' },
      overdue: { label: language === 'ar' ? 'متأخرة' : 'Overdue', variant: 'destructive' },
      cancelled: { label: language === 'ar' ? 'ملغاة' : 'Cancelled', variant: 'destructive' },
    };
    const config = statusMap[status] || statusMap.draft;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (isLoading || !clientInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">
                {language === 'ar' ? 'بوابة العملاء' : 'Client Portal'}
              </h1>
              <p className="text-sm text-muted-foreground">{clientInfo.name}</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 me-2" />
            {language === 'ar' ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'القضايا النشطة' : 'Active Cases'}
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.activeCases || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? `من ${dashboardData?.stats.totalCases || 0} إجمالي` : `of ${dashboardData?.stats.totalCases || 0} total`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'الفواتير المعلقة' : 'Pending Invoices'}
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.pendingInvoices || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? `من ${dashboardData?.stats.totalInvoices || 0} إجمالي` : `of ${dashboardData?.stats.totalInvoices || 0} total`}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'الوثائق المشتركة' : 'Shared Documents'}
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.sharedDocuments || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'متاحة للعرض' : 'Available to view'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {language === 'ar' ? 'رسائل جديدة' : 'New Messages'}
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData?.stats.unreadMessages || 0}</div>
              <p className="text-xs text-muted-foreground">
                {language === 'ar' ? 'غير مقروءة' : 'Unread'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="cases" className="space-y-4">
          <TabsList>
            <TabsTrigger value="cases">
              <Briefcase className="w-4 h-4 me-2" />
              {language === 'ar' ? 'القضايا' : 'Cases'}
            </TabsTrigger>
            <TabsTrigger value="invoices">
              <DollarSign className="w-4 h-4 me-2" />
              {language === 'ar' ? 'الفواتير' : 'Invoices'}
            </TabsTrigger>
            <TabsTrigger value="documents">
              <FileText className="w-4 h-4 me-2" />
              {language === 'ar' ? 'الوثائق' : 'Documents'}
            </TabsTrigger>
            <TabsTrigger value="messages">
              <MessageSquare className="w-4 h-4 me-2" />
              {language === 'ar' ? 'الرسائل' : 'Messages'}
              {(dashboardData?.stats.unreadMessages || 0) > 0 && (
                <Badge variant="destructive" className="ms-2">{dashboardData?.stats.unreadMessages}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Cases Tab */}
          <TabsContent value="cases" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'قضاياك' : 'Your Cases'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'عرض جميع القضايا الخاصة بك' : 'View all your cases'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentCases && dashboardData.recentCases.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentCases.map((caseItem: any) => (
                      <div key={caseItem.id} className="flex items-start justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{caseItem.title}</h3>
                            {getCaseStatusBadge(caseItem.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{caseItem.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(caseItem.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {formatDistanceToNow(new Date(caseItem.createdAt), {
                                addSuffix: true,
                                locale: language === 'ar' ? ar : enUS
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'ar' ? 'لا توجد قضايا حالياً' : 'No cases available'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoices Tab */}
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'فواتيرك' : 'Your Invoices'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'عرض جميع الفواتير الخاصة بك' : 'View all your invoices'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentInvoices && dashboardData.recentInvoices.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentInvoices.map((invoice: any) => (
                      <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                            {getInvoiceStatusBadge(invoice.status)}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {language === 'ar' ? 'تاريخ الإصدار:' : 'Issue Date:'} {new Date(invoice.issueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </p>
                          {invoice.dueDate && (
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'تاريخ الاستحقاق:' : 'Due Date:'} {new Date(invoice.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </p>
                          )}
                        </div>
                        <div className="text-end">
                          <p className="text-2xl font-bold">{invoice.totalAmount.toLocaleString()} {language === 'ar' ? 'ر.س' : 'SAR'}</p>
                          <Button variant="outline" size="sm" className="mt-2">
                            <Download className="w-4 h-4 me-2" />
                            {language === 'ar' ? 'تحميل' : 'Download'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'ar' ? 'لا توجد فواتير حالياً' : 'No invoices available'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'وثائقك' : 'Your Documents'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'عرض الوثائق المشتركة معك' : 'View documents shared with you'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {dashboardData?.recentDocuments && dashboardData.recentDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentDocuments.map((doc: any) => (
                      <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-primary/10 rounded flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold">Document #{doc.id}</h3>
                            <p className="text-sm text-muted-foreground">
                              {language === 'ar' ? 'شارك' : 'Shared'} {formatDistanceToNow(new Date(doc.createdAt), {
                                addSuffix: true,
                                locale: language === 'ar' ? ar : enUS
                              })}
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 me-2" />
                          {language === 'ar' ? 'عرض' : 'View'}
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    {language === 'ar' ? 'لا توجد وثائق مشتركة حالياً' : 'No shared documents available'}
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'الرسائل' : 'Messages'}</CardTitle>
                <CardDescription>
                  {language === 'ar' ? 'تواصل مع مكتبنا القانوني' : 'Communicate with our law office'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
                  {messages && messages.length > 0 ? (
                    messages.map((msg: any) => (
                      <div
                        key={msg.id}
                        className={`p-4 rounded-lg ${
                          msg.senderType === 'client'
                            ? 'bg-primary/10 ms-auto max-w-[80%]'
                            : 'bg-muted me-auto max-w-[80%]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold">
                            {msg.senderType === 'client' 
                              ? (language === 'ar' ? 'أنت' : 'You')
                              : (language === 'ar' ? 'المحامي' : 'Lawyer')}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(msg.createdAt), {
                              addSuffix: true,
                              locale: language === 'ar' ? ar : enUS
                            })}
                          </span>
                        </div>
                        <p className="text-sm">{msg.message}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-center text-muted-foreground py-8">
                      {language === 'ar' ? 'لا توجد رسائل حالياً' : 'No messages yet'}
                    </p>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder={language === 'ar' ? 'اكتب رسالتك...' : 'Type your message...'}
                    className="flex-1 px-4 py-2 border rounded-md"
                    disabled={sending}
                  />
                  <Button type="submit" disabled={sending || !newMessage.trim()}>
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : (language === 'ar' ? 'إرسال' : 'Send')}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
