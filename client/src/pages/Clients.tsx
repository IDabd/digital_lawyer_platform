import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
  User, 
  Mail, 
  Phone, 
  Building,
  MapPin,
  FileText,
  DollarSign,
  Users
} from "lucide-react";

export default function Clients() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form state for new client
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    nationalId: "",
    companyName: "",
    companyRegistration: "",
    notes: ""
  });

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading, refetch } = trpc.clients.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Create client mutation
  const createMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewClient({
        name: "",
        email: "",
        phone: "",
        address: "",
        nationalId: "",
        companyName: "",
        companyRegistration: "",
        notes: ""
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating client:', error);
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

  // Filter clients
  const filteredClients = clients.filter((client: any) => {
    const matchesSearch = 
      client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      client.companyName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate statistics
  const totalClients = clients.length;
  const activeClients = clients.filter((c: any) => c.status === 'active').length;
  const inactiveClients = clients.filter((c: any) => c.status === 'inactive').length;

  const handleCreateClient = () => {
    createMutation.mutate({
      name: newClient.name,
      email: newClient.email || null,
      phone: newClient.phone || null,
      address: newClient.address || null,
      nationalId: newClient.nationalId || null,
      companyName: newClient.companyName || null,
      companyRegistration: newClient.companyRegistration || null,
      notes: newClient.notes || null,
      status: "active",
    });
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'العملاء' : 'Clients'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'إدارة معلومات العملاء والتواصل معهم'
                : 'Manage client information and communications'}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 me-2" />
                {language === 'ar' ? 'عميل جديد' : 'New Client'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إضافة عميل جديد' : 'Add New Client'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'الاسم *' : 'Name *'}</Label>
                    <Input
                      value={newClient.name}
                      onChange={(e) => setNewClient({...newClient, name: e.target.value})}
                      placeholder={language === 'ar' ? 'اسم العميل' : 'Client name'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'البريد الإلكتروني' : 'Email'}</Label>
                    <Input
                      type="email"
                      value={newClient.email}
                      onChange={(e) => setNewClient({...newClient, email: e.target.value})}
                      placeholder={language === 'ar' ? 'email@example.com' : 'email@example.com'}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'رقم الهاتف' : 'Phone'}</Label>
                    <Input
                      value={newClient.phone}
                      onChange={(e) => setNewClient({...newClient, phone: e.target.value})}
                      placeholder={language === 'ar' ? '+966 5X XXX XXXX' : '+966 5X XXX XXXX'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'رقم الهوية الوطنية' : 'National ID'}</Label>
                    <Input
                      value={newClient.nationalId}
                      onChange={(e) => setNewClient({...newClient, nationalId: e.target.value})}
                      placeholder={language === 'ar' ? 'رقم الهوية' : 'National ID number'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان' : 'Address'}</Label>
                  <Textarea
                    value={newClient.address}
                    onChange={(e) => setNewClient({...newClient, address: e.target.value})}
                    placeholder={language === 'ar' ? 'عنوان العميل' : 'Client address'}
                    rows={2}
                  />
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold mb-3">
                    {language === 'ar' ? 'معلومات الشركة (اختياري)' : 'Company Information (Optional)'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'اسم الشركة' : 'Company Name'}</Label>
                      <Input
                        value={newClient.companyName}
                        onChange={(e) => setNewClient({...newClient, companyName: e.target.value})}
                        placeholder={language === 'ar' ? 'اسم الشركة' : 'Company name'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>{language === 'ar' ? 'السجل التجاري' : 'Commercial Registration'}</Label>
                      <Input
                        value={newClient.companyRegistration}
                        onChange={(e) => setNewClient({...newClient, companyRegistration: e.target.value})}
                        placeholder={language === 'ar' ? 'رقم السجل التجاري' : 'CR number'}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'ملاحظات' : 'Notes'}</Label>
                  <Textarea
                    value={newClient.notes}
                    onChange={(e) => setNewClient({...newClient, notes: e.target.value})}
                    placeholder={language === 'ar' ? 'ملاحظات إضافية عن العميل' : 'Additional notes about the client'}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleCreateClient}
                    disabled={!newClient.name || createMutation.isPending}
                  >
                    {createMutation.isPending 
                      ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                      : (language === 'ar' ? 'إضافة العميل' : 'Add Client')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'إجمالي العملاء' : 'Total Clients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold">{totalClients}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'عملاء نشطون' : 'Active Clients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                <span className="text-2xl font-bold">{activeClients}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {language === 'ar' ? 'عملاء غير نشطين' : 'Inactive Clients'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-2xl font-bold">{inactiveClients}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder={language === 'ar' ? 'بحث في العملاء...' : 'Search clients...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Clients List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {language === 'ar' ? 'قائمة العملاء' : 'Clients List'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {clientsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredClients.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {language === 'ar' ? 'لا يوجد عملاء' : 'No clients found'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredClients.map((client: any) => (
                  <Link key={client.id} href={`/clients/${client.id}`}>
                    <Card className="hover:bg-accent/50 transition-colors cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{client.name}</h3>
                                {client.companyName && (
                                  <p className="text-xs text-muted-foreground">{client.companyName}</p>
                                )}
                              </div>
                            </div>
                            <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                              {client.status === 'active' 
                                ? (language === 'ar' ? 'نشط' : 'Active')
                                : (language === 'ar' ? 'غير نشط' : 'Inactive')}
                            </Badge>
                          </div>

                          <div className="space-y-2">
                            {client.email && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{client.email}</span>
                              </div>
                            )}
                            
                            {client.phone && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Phone className="w-3 h-3" />
                                <span>{client.phone}</span>
                              </div>
                            )}

                            {client.address && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{client.address}</span>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <FileText className="w-3 h-3" />
                              <span>{language === 'ar' ? 'تاريخ الإضافة:' : 'Added:'}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(client.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                            </span>
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
