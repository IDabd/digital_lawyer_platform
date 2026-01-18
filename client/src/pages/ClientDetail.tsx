import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { useRoute, Link } from "wouter";
import { 
  ArrowLeft, 
  Edit, 
  Trash2,
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  FileText,
  DollarSign,
  Calendar,
  CreditCard,
  Briefcase
} from "lucide-react";

export default function ClientDetail() {
  const [, params] = useRoute("/clients/:id");
  const clientId = params?.id ? parseInt(params.id) : 0;
  
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedClient, setEditedClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nationalId: "",
    companyName: "",
    companyRegistration: "",
    notes: "",
    status: "active"
  });

  // Fetch client details
  const { data: client, isLoading: clientLoading, refetch } = trpc.clients.getById.useQuery(
    { id: clientId },
    { enabled: isAuthenticated && clientId > 0 }
  );

  // Fetch client's cases
  const { data: clientCases = [] } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated && !!client
  });

  const filteredCases = clientCases.filter((c: any) => c.clientId === clientId);

  // Fetch client's invoices
  const { data: clientInvoices = [] } = trpc.invoices.getAll.useQuery(undefined, {
    enabled: isAuthenticated && !!client
  });

  const filteredInvoices = clientInvoices.filter((inv: any) => inv.clientId === clientId);

  // Update client mutation
  const updateMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      setIsEditDialogOpen(false);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating client:', error);
    },
  });

  if (loading || clientLoading) {
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

  if (!client) {
    return (
      <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        <div className="max-w-7xl mx-auto">
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">
                {language === 'ar' ? 'العميل غير موجود' : 'Client Not Found'}
              </h2>
              <p className="text-muted-foreground mb-6">
                {language === 'ar' 
                  ? 'العميل المطلوب غير موجود أو تم حذفه'
                  : 'The requested client does not exist or has been deleted'}
              </p>
              <Link href="/clients">
                <Button>
                  <ArrowLeft className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'العودة للعملاء' : 'Back to Clients'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const handleUpdateClient = () => {
    updateMutation.mutate({
      id: clientId,
      name: editedClient.name,
      email: editedClient.email || null,
      phone: editedClient.phone || null,
      address: editedClient.address || null,
      nationalId: editedClient.nationalId || null,
      companyName: editedClient.companyName || null,
      companyRegistration: editedClient.companyRegistration || null,
      notes: editedClient.notes || null,
    });
  };

  // Calculate statistics
  const totalCases = filteredCases.length;
  const activeCases = filteredCases.filter((c: any) => c.status === 'active').length;
  const totalInvoices = filteredInvoices.length;
  const paidInvoices = filteredInvoices.filter((inv: any) => inv.status === 'paid').length;
  const totalRevenue = filteredInvoices
    .filter((inv: any) => inv.status === 'paid')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || 0), 0);
  const pendingPayments = filteredInvoices
    .filter((inv: any) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum: number, inv: any) => sum + parseFloat(inv.total || 0), 0);

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/clients">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold">{client.name}</h1>
              <p className="text-muted-foreground mt-1">
                {client.companyName || (language === 'ar' ? 'عميل فردي' : 'Individual Client')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
              {client.status === 'active' 
                ? (language === 'ar' ? 'نشط' : 'Active')
                : (language === 'ar' ? 'غير نشط' : 'Inactive')}
            </Badge>
            
            <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
              setIsEditDialogOpen(open);
              if (open) {
                setEditedClient({
                  name: client.name,
                  email: client.email || "",
                  phone: client.phone || "",
                  address: client.address || "",
                  nationalId: client.nationalId || "",
                  companyName: client.companyName || "",
                  companyRegistration: client.companyRegistration || "",
                  notes: client.notes || "",
                  status: client.status
                });
              }
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Edit className="w-4 h-4 me-2" />
                  {language === 'ar' ? 'تعديل' : 'Edit'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {language === 'ar' ? 'تعديل بيانات العميل' : 'Edit Client Information'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'الاسم' : 'Name'}</Label>
                      <Input
                        value={editedClient.name}
                        onChange={(e) => setEditedClient({...editedClient, name: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                      <Input
                        type="email"
                        value={editedClient.email}
                        onChange={(e) => setEditedClient({...editedClient, email: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                      <Input
                        value={editedClient.phone}
                        onChange={(e) => setEditedClient({...editedClient, phone: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'رقم الهوية الوطنية' : 'National ID'}</Label>
                      <Input
                        value={editedClient.nationalId}
                        onChange={(e) => setEditedClient({...editedClient, nationalId: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                    <Textarea
                      value={editedClient.address}
                      onChange={(e) => setEditedClient({...editedClient, address: e.target.value})}
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</Label>
                      <Input
                        value={editedClient.companyName}
                        onChange={(e) => setEditedClient({...editedClient, companyName: e.target.value})}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'السجل التجاري' : 'Commercial Registration'}</Label>
                      <Input
                        value={editedClient.companyRegistration}
                        onChange={(e) => setEditedClient({...editedClient, companyRegistration: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                    <Textarea
                      value={editedClient.notes}
                      onChange={(e) => setEditedClient({...editedClient, notes: e.target.value})}
                      rows={3}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                      {language === 'ar' ? 'إلغاء' : 'Cancel'}
                    </Button>
                    <Button onClick={handleUpdateClient} disabled={updateMutation.isPending}>
                      {updateMutation.isPending 
                        ? (language === 'ar' ? 'جاري الحفظ...' : 'Saving...') 
                        : (language === 'ar' ? 'حفظ' : 'Save')}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="text-destructive">
              <Trash2 className="w-4 h-4 me-2" />
              {language === 'ar' ? 'حذف' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'القضايا' : 'Cases'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{totalCases}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {activeCases} {language === 'ar' ? 'نشطة' : 'active'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'الفواتير' : 'Invoices'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-2xl font-bold">{totalInvoices}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {paidInvoices} {language === 'ar' ? 'مدفوعة' : 'paid'}
              </p>
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

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'المدفوعات المعلقة' : 'Pending Payments'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-orange-500" />
                <span className="text-2xl font-bold">{pendingPayments.toFixed(0)}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {language === 'ar' ? 'ر.س' : 'SAR'}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Client Information */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'معلومات العميل' : 'Client Information'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {client.email && (
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'البريد الإلكتروني' : 'Email'}
                      </p>
                      <p className="font-medium">{client.email}</p>
                    </div>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'رقم الهاتف' : 'Phone'}
                      </p>
                      <p className="font-medium">{client.phone}</p>
                    </div>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'العنوان' : 'Address'}
                      </p>
                      <p className="font-medium">{client.address}</p>
                    </div>
                  </div>
                )}

                {client.nationalId && (
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'رقم الهوية' : 'National ID'}
                      </p>
                      <p className="font-medium">{client.nationalId}</p>
                    </div>
                  </div>
                )}

                {client.companyName && (
                  <div className="flex items-start gap-3">
                    <Building className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الشركة' : 'Company'}
                      </p>
                      <p className="font-medium">{client.companyName}</p>
                      {client.companyRegistration && (
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'س.ت:' : 'CR:'} {client.companyRegistration}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {client.notes && (
                  <div className="flex items-start gap-3">
                    <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'ملاحظات' : 'Notes'}
                      </p>
                      <p className="text-sm">{client.notes}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 pt-4 border-t">
                  <Calendar className="w-4 h-4 text-muted-foreground mt-1" />
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' ? 'تاريخ الإضافة' : 'Added On'}
                    </p>
                    <p className="font-medium">
                      {new Date(client.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cases and Invoices */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cases */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'القضايا' : 'Cases'}</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredCases.length === 0 ? (
                  <div className="text-center py-8">
                    <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد قضايا' : 'No cases found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredCases.slice(0, 5).map((c: any) => (
                      <Link key={c.id} href={`/cases/${c.id}`}>
                        <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <Briefcase className="w-4 h-4 text-primary" />
                            <div>
                              <p className="font-medium">{c.caseNumber}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{c.title}</p>
                            </div>
                          </div>
                          <Badge variant="outline">{c.status}</Badge>
                        </div>
                      </Link>
                    ))}
                    {filteredCases.length > 5 && (
                      <Link href="/cases">
                        <Button variant="outline" className="w-full">
                          {language === 'ar' ? 'عرض جميع القضايا' : 'View All Cases'}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'الفواتير' : 'Invoices'}</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {language === 'ar' ? 'لا توجد فواتير' : 'No invoices found'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredInvoices.slice(0, 5).map((inv: any) => (
                      <Link key={inv.id} href={`/invoices/${inv.id}`}>
                        <div className="flex items-center justify-between p-3 hover:bg-accent/50 rounded-lg transition-colors cursor-pointer">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4 text-primary" />
                            <div>
                              <p className="font-medium">{inv.invoiceNumber}</p>
                              <p className="text-sm text-muted-foreground">
                                {new Date(inv.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                              </p>
                            </div>
                          </div>
                          <div className="text-end">
                            <p className="font-bold">{parseFloat(inv.total).toFixed(2)} {language === 'ar' ? 'ر.س' : 'SAR'}</p>
                            <Badge variant={inv.status === 'paid' ? 'default' : 'secondary'} className={inv.status === 'paid' ? 'bg-green-500' : ''}>
                              {inv.status}
                            </Badge>
                          </div>
                        </div>
                      </Link>
                    ))}
                    {filteredInvoices.length > 5 && (
                      <Link href="/invoices">
                        <Button variant="outline" className="w-full">
                          {language === 'ar' ? 'عرض جميع الفواتير' : 'View All Invoices'}
                        </Button>
                      </Link>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
