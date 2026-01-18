import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Search, 
  Plus, 
  FileText, 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Download,
  Send,
  Filter
} from "lucide-react";


export default function Invoices() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new invoice
  const [newInvoice, setNewInvoice] = useState({
    caseId: "",
    clientId: "",
    description: "",
    amount: "",
    taxAmount: "",
    dueDate: ""
  });

  // Fetch invoices
  const { data: invoices = [], isLoading: invoicesLoading, refetch } = trpc.invoices.getAll.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Fetch cases for dropdown
  const { data: cases = [] } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated && isCreateDialogOpen
  });

  // Fetch clients for dropdown
  const { data: clients = [] } = trpc.clients.list.useQuery(undefined, {
    enabled: isAuthenticated && isCreateDialogOpen
  });

  // Create invoice mutation
  const createMutation = trpc.invoices.create.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewInvoice({
        caseId: "",
        clientId: "",
        description: "",
        amount: "",
        taxAmount: "",
        dueDate: ""
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating invoice:', error);
    },
  });

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

  // Filter invoices
  const filteredInvoices = invoices.filter((invoice: any) => {
    const matchesSearch = 
      invoice.invoiceNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      invoice.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((inv: any) => inv.status === "paid").length;
  const pendingInvoices = invoices.filter((inv: any) => inv.status === "pending").length;
  const overdueInvoices = invoices.filter((inv: any) => inv.status === "overdue").length;
  const totalRevenue = invoices
    .filter((inv: any) => inv.status === "paid")
    .reduce((sum: number, inv: any) => sum + (inv.totalAmount || 0), 0);

  const handleCreateInvoice = () => {
    const amount = parseFloat(newInvoice.amount);
    const taxRate = 0.15; // VAT 15% for Saudi Arabia
    const taxAmount = amount * taxRate;
    const totalAmount = amount + taxAmount;

    createMutation.mutate({
      caseId: parseInt(newInvoice.caseId),
      clientId: parseInt(newInvoice.clientId),
      description: newInvoice.description,
      amount: amount,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      status: "pending",
      dueDate: new Date(newInvoice.dueDate),
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { 
        label: language === 'ar' ? 'مسودة' : 'Draft', 
        variant: 'secondary' as const,
        icon: FileText 
      },
      pending: { 
        label: language === 'ar' ? 'معلقة' : 'Pending', 
        variant: 'default' as const,
        icon: Clock 
      },
      paid: { 
        label: language === 'ar' ? 'مدفوعة' : 'Paid', 
        variant: 'default' as const,
        icon: CheckCircle,
        className: 'bg-green-500 hover:bg-green-600'
      },
      overdue: { 
        label: language === 'ar' ? 'متأخرة' : 'Overdue', 
        variant: 'destructive' as const,
        icon: AlertCircle 
      },
      cancelled: { 
        label: language === 'ar' ? 'ملغاة' : 'Cancelled', 
        variant: 'outline' as const,
        icon: XCircle 
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

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'الفواتير' : 'Invoices'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'إدارة الفواتير والمدفوعات'
                : 'Manage invoices and payments'}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 me-2" />
                {language === 'ar' ? 'فاتورة جديدة' : 'New Invoice'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إنشاء فاتورة جديدة' : 'Create New Invoice'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'القضية' : 'Case'}</Label>
                    <Select value={newInvoice.caseId} onValueChange={(value) => setNewInvoice({...newInvoice, caseId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر القضية' : 'Select case'} />
                      </SelectTrigger>
                      <SelectContent>
                        {cases.map((c: any) => (
                          <SelectItem key={c.id} value={c.id.toString()}>
                            {c.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'العميل' : 'Client'}</Label>
                    <Select value={newInvoice.clientId} onValueChange={(value) => setNewInvoice({...newInvoice, clientId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder={language === 'ar' ? 'اختر العميل' : 'Select client'} />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client: any) => (
                          <SelectItem key={client.id} value={client.id.toString()}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Textarea
                    value={newInvoice.description}
                    onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})}
                    placeholder={language === 'ar' ? 'وصف الخدمات المقدمة' : 'Description of services provided'}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'المبلغ (قبل الضريبة)' : 'Amount (before tax)'}</Label>
                    <Input
                      type="number"
                      value={newInvoice.amount}
                      onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'تاريخ الاستحقاق' : 'Due Date'}</Label>
                    <Input
                      type="date"
                      value={newInvoice.dueDate}
                      onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})}
                    />
                  </div>
                </div>

                {newInvoice.amount && (
                  <div className="bg-muted p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{language === 'ar' ? 'المبلغ الأساسي:' : 'Base Amount:'}</span>
                      <span className="font-medium">{parseFloat(newInvoice.amount).toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>{language === 'ar' ? 'ضريبة القيمة المضافة (15%):' : 'VAT (15%):'}</span>
                      <span className="font-medium">{(parseFloat(newInvoice.amount) * 0.15).toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold border-t pt-2">
                      <span>{language === 'ar' ? 'المجموع الكلي:' : 'Total Amount:'}</span>
                      <span>{(parseFloat(newInvoice.amount) * 1.15).toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleCreateInvoice}
                    disabled={!newInvoice.caseId || !newInvoice.clientId || !newInvoice.amount || !newInvoice.dueDate || createMutation.isPending}
                  >
                    {createMutation.isPending 
                      ? (language === 'ar' ? 'جاري الإنشاء...' : 'Creating...') 
                      : (language === 'ar' ? 'إنشاء الفاتورة' : 'Create Invoice')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'إجمالي الفواتير' : 'Total Invoices'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{totalInvoices}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'مدفوعة' : 'Paid'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{paidInvoices}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'معلقة' : 'Pending'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{pendingInvoices}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'متأخرة' : 'Overdue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span className="text-2xl font-bold">{overdueInvoices}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'إجمالي الإيرادات' : 'Total Revenue'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{totalRevenue.toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ar' ? 'ر.س' : 'SAR'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={language === 'ar' ? 'بحث في الفواتير...' : 'Search invoices...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <Filter className="w-4 h-4 me-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All Status'}</SelectItem>
                    <SelectItem value="draft">{language === 'ar' ? 'مسودة' : 'Draft'}</SelectItem>
                    <SelectItem value="pending">{language === 'ar' ? 'معلقة' : 'Pending'}</SelectItem>
                    <SelectItem value="paid">{language === 'ar' ? 'مدفوعة' : 'Paid'}</SelectItem>
                    <SelectItem value="overdue">{language === 'ar' ? 'متأخرة' : 'Overdue'}</SelectItem>
                    <SelectItem value="cancelled">{language === 'ar' ? 'ملغاة' : 'Cancelled'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoices List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ar' ? 'قائمة الفواتير' : 'Invoices List'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {invoicesLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredInvoices.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا توجد فواتير' : 'No invoices found'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInvoices.map((invoice: any) => (
                  <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="w-6 h-6 text-primary" />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold">
                                  {invoice.invoiceNumber || `INV-${invoice.id}`}
                                </h3>
                                {getStatusBadge(invoice.status)}
                              </div>
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {invoice.description}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span>
                                  {language === 'ar' ? 'تاريخ الإنشاء:' : 'Created:'} {new Date(invoice.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </span>
                                {invoice.dueDate && (
                                  <span>
                                    {language === 'ar' ? 'تاريخ الاستحقاق:' : 'Due:'} {new Date(invoice.dueDate).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="text-end">
                            <div className="text-2xl font-bold">
                              {invoice.totalAmount?.toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {language === 'ar' ? 'شامل الضريبة' : 'Including VAT'}
                            </div>
                            <div className="flex gap-2 mt-3">
                              <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); }}>
                                <Download className="w-3 h-3 me-1" />
                                {language === 'ar' ? 'تحميل' : 'Download'}
                              </Button>
                              <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); }}>
                                <Send className="w-3 h-3 me-1" />
                                {language === 'ar' ? 'إرسال' : 'Send'}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
