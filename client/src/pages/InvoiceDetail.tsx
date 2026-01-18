import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { 
  ArrowLeft, 
  Download, 
  Send, 
  Edit, 
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  User,
  Building,
  Mail,
  Phone
} from "lucide-react";

export default function InvoiceDetail() {
  const [, params] = useRoute("/invoices/:id");
  const invoiceId = params?.id ? parseInt(params.id) : 0;
  
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedStatus, setEditedStatus] = useState("");

  // Fetch invoice details
  const { data: invoice, isLoading: invoiceLoading, refetch } = trpc.invoices.getById.useQuery(
    { id: invoiceId },
    { enabled: isAuthenticated && invoiceId > 0 }
  );

  // Fetch case details
  const { data: caseData } = trpc.cases.getById.useQuery(
    { id: invoice?.caseId || 0 },
    { enabled: !!invoice?.caseId }
  );

  // Fetch client details
  const { data: client } = trpc.clients.getById.useQuery(
    { id: invoice?.clientId || 0 },
    { enabled: !!invoice?.clientId }
  );

  // Update invoice mutation
  const updateMutation = trpc.invoices.update.useMutation({
    onSuccess: () => {
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating invoice:', error);
    },
  });

  if (loading || invoiceLoading) {
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

  if (!invoice) {
    return (
      <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {language === 'ar' ? 'الفاتورة غير موجودة' : 'Invoice Not Found'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'ar' 
                  ? 'الفاتورة المطلوبة غير موجودة أو تم حذفها'
                  : 'The requested invoice does not exist or has been deleted'}
              </p>
              <Link href="/invoices">
                <Button>
                  <ArrowLeft className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'العودة للفواتير' : 'Back to Invoices'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { 
        label: language === 'ar' ? 'مسودة' : 'Draft', 
        variant: 'secondary' as const,
        icon: FileText,
        color: 'text-gray-500'
      },
      pending: { 
        label: language === 'ar' ? 'معلقة' : 'Pending', 
        variant: 'default' as const,
        icon: Clock,
        color: 'text-blue-500'
      },
      sent: { 
        label: language === 'ar' ? 'مرسلة' : 'Sent', 
        variant: 'default' as const,
        icon: Send,
        color: 'text-purple-500'
      },
      paid: { 
        label: language === 'ar' ? 'مدفوعة' : 'Paid', 
        variant: 'default' as const,
        icon: CheckCircle,
        color: 'text-green-500',
        className: 'bg-green-500 hover:bg-green-600'
      },
      overdue: { 
        label: language === 'ar' ? 'متأخرة' : 'Overdue', 
        variant: 'destructive' as const,
        icon: AlertCircle,
        color: 'text-red-500'
      },
      cancelled: { 
        label: language === 'ar' ? 'ملغاة' : 'Cancelled', 
        variant: 'outline' as const,
        icon: Trash2,
        color: 'text-gray-500'
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;
    const className = 'className' in config ? config.className : '';

    return (
      <Badge variant={config.variant} className={className}>
        <Icon className="w-3 h-3 me-1" />
        {config.label}
      </Badge>
    );
  };

  const handleUpdateStatus = () => {
    if (!editedStatus) return;
    
    updateMutation.mutate({
      id: invoiceId,
      status: editedStatus as any,
      paidDate: editedStatus === 'paid' ? new Date() : undefined,
    });
  };

  const handleDownloadPDF = () => {
    console.log('Download PDF for invoice:', invoiceId);
  };

  const handleSendEmail = () => {
    console.log('Send email for invoice:', invoiceId);
  };

  const subtotal = parseFloat(invoice.subtotal);
  const taxAmount = parseFloat(invoice.taxAmount);
  const discount = parseFloat(invoice.discount);
  const total = parseFloat(invoice.total);

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/invoices">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">
                {invoice.invoiceNumber}
              </h1>
              <p className="text-muted-foreground mt-1">
                {language === 'ar' ? 'تفاصيل الفاتورة' : 'Invoice Details'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge(invoice.status)}
            
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" onClick={() => setEditedStatus(invoice.status)}>
                  <Edit className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'تعديل الحالة' : 'Edit Status'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {language === 'ar' ? 'تعديل حالة الفاتورة' : 'Edit Invoice Status'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الحالة' : 'Status'}</Label>
                    <Select value={editedStatus} onValueChange={setEditedStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                        <SelectItem value="pending">{language === 'ar' ? 'معلقة' : 'Pending'}</SelectItem>
                        <SelectItem value="sent">{language === 'ar' ? 'مرسلة' : 'Sent'}</SelectItem>
                        <SelectItem value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</SelectItem>
                        <SelectItem value="overdue">{language === 'ar' ? 'متأخرة' : 'Overdue'}</SelectItem>
                        <SelectItem value="cancelled">{language === 'ar' ? 'ملغاة' : 'Cancelled'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleUpdateStatus} disabled={updateMutation.isPending}>
                      {updateMutation.isPending 
                        ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                        : (language === 'ar' ? 'حفظ' : 'Save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleDownloadPDF}>
              <Download className="w-4 h-4 me-2" />
              {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
            </Button>
            
            <Button onClick={handleSendEmail}>
              <Send className="w-4 h-4 me-2" />
              {language === 'ar' ? 'إرسال' : 'Send'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Invoice Card */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Invoice Information */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'معلومات الفاتورة' : 'Invoice Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'ar' ? 'رقم الفاتورة' : 'Invoice Number'}
                    </p>
                    <p className="font-medium">{invoice.invoiceNumber}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'ar' ? 'تاريخ الإنشاء' : 'Created Date'}
                    </p>
                    <p className="font-medium">
                      {new Date(invoice.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>

                  {invoice.dueDate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}
                      </p>
                      <p className="font-medium">
                        {new Date(invoice.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  )}

                  {invoice.paidDate && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {language === 'ar' ? 'تاريخ الدفع' : 'Paid Date'}
                      </p>
                      <p className="font-medium">
                        {new Date(invoice.paidDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  )}
                </div>

                {invoice.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {language === 'ar' ? 'ملاحظات' : 'Notes'}
                    </p>
                    <p className="text-sm">{invoice.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amount Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'تفاصيل المبلغ' : 'Amount Breakdown'}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'المبلغ الأساسي' : 'Subtotal'}
                    </span>
                    <span className="font-medium">
                      {subtotal.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                    </span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center pb-2">
                      <span className="text-muted-foreground">
                        {language === 'ar' ? 'الخصم' : 'Discount'}
                      </span>
                      <span className="font-medium text-green-600">
                        -{discount.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center pb-2">
                    <span className="text-muted-foreground">
                      {language === 'ar' ? 'ضريبة القيمة المضافة (15%)' : 'VAT (15%)'}
                    </span>
                    <span className="font-medium">
                      {taxAmount.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t-2 border-border">
                    <span className="text-lg font-bold">
                      {language === 'ar' ? 'المجموع الكلي' : 'Total Amount'}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      {total.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Case Information */}
            {caseData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {language === 'ar' ? 'القضية' : 'Case'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/cases/${caseData.id}`}>
                    <div className="space-y-2 hover:bg-accent/50 p-3 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-primary" />
                        <span className="font-medium">{caseData.caseNumber}</span>
                      </div>
                      <p className="text-sm line-clamp-2">{caseData.title}</p>
                      <Badge variant="outline">{caseData.status}</Badge>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Client Information */}
            {client && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    {language === 'ar' ? 'العميل' : 'Client'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Link href={`/clients/${client.id}`}>
                    <div className="space-y-3 hover:bg-accent/50 p-3 rounded-lg transition-colors cursor-pointer">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-primary" />
                        <span className="font-medium">{client.name}</span>
                      </div>
                      
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span>{client.email}</span>
                        </div>
                      )}
                      
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{client.phone}</span>
                        </div>
                      )}

                      {client.companyName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Building className="w-3 h-3" />
                          <span>{client.companyName}</span>
                        </div>
                      )}
                    </div>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  {language === 'ar' ? 'إجراءات سريعة' : 'Quick Actions'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={handleDownloadPDF}>
                  <Download className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'تحميل PDF' : 'Download PDF'}
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={handleSendEmail}>
                  <Send className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'إرسال للعميل' : 'Send to Client'}
                </Button>
                <Button variant="outline" className="w-full justify-start text-destructive">
                  <Trash2 className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'حذف الفاتورة' : 'Delete Invoice'}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
