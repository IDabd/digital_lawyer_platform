import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Building2, 
  FileText, 
  Bell, 
  Shield, 
  CreditCard,
  Save,
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Percent,
  DollarSign
} from "lucide-react";

export default function Settings() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState("office");

  // Office Settings State
  const [officeSettings, setOfficeSettings] = useState({
    name: "",
    licenseNumber: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    website: "",
    logo: "",
    description: ""
  });

  // Invoice Settings State
  const [invoiceSettings, setInvoiceSettings] = useState({
    taxRate: "15",
    taxNumber: "",
    currency: "SAR",
    invoicePrefix: "INV-",
    invoiceStartNumber: "1000",
    paymentTerms: "30",
    bankName: "",
    accountNumber: "",
    iban: "",
    notes: ""
  });

  // Notification Settings State
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    caseUpdates: true,
    deadlineReminders: true,
    invoiceReminders: true,
    clientMessages: true,
    reminderDays: "3"
  });

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: "30",
    passwordExpiry: "90",
    loginAttempts: "5",
    ipWhitelist: "",
    dataRetention: "365"
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

  const handleSaveOfficeSettings = () => {
    console.log('Saving office settings:', officeSettings);
    // TODO: Implement save functionality
  };

  const handleSaveInvoiceSettings = () => {
    console.log('Saving invoice settings:', invoiceSettings);
    // TODO: Implement save functionality
  };

  const handleSaveNotificationSettings = () => {
    console.log('Saving notification settings:', notificationSettings);
    // TODO: Implement save functionality
  };

  const handleSaveSecuritySettings = () => {
    console.log('Saving security settings:', securitySettings);
    // TODO: Implement save functionality
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">
            {language === 'ar' ? 'الإعدادات' : 'Settings'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' 
              ? 'إدارة إعدادات المكتب القانوني والنظام'
              : 'Manage law office and system settings'}
          </p>
        </div>

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="office" className="gap-2">
              <Building2 className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'المكتب' : 'Office'}</span>
            </TabsTrigger>
            <TabsTrigger value="invoice" className="gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الفواتير' : 'Invoices'}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الإشعارات' : 'Notifications'}</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">{language === 'ar' ? 'الأمان' : 'Security'}</span>
            </TabsTrigger>
          </TabsList>

          {/* Office Settings Tab */}
          <TabsContent value="office" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {language === 'ar' ? 'معلومات المكتب القانوني' : 'Law Office Information'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'قم بتحديث معلومات مكتبك القانوني التي ستظهر في الفواتير والمستندات'
                    : 'Update your law office information that will appear on invoices and documents'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="office-name">
                      {language === 'ar' ? 'اسم المكتب *' : 'Office Name *'}
                    </Label>
                    <Input
                      id="office-name"
                      value={officeSettings.name}
                      onChange={(e) => setOfficeSettings({...officeSettings, name: e.target.value})}
                      placeholder={language === 'ar' ? 'مكتب المحامي عبدالرحمن' : 'Abdulrahman Law Office'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="license-number">
                      {language === 'ar' ? 'رقم الترخيص' : 'License Number'}
                    </Label>
                    <Input
                      id="license-number"
                      value={officeSettings.licenseNumber}
                      onChange={(e) => setOfficeSettings({...officeSettings, licenseNumber: e.target.value})}
                      placeholder={language === 'ar' ? '12345' : '12345'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office-email">
                      <Mail className="w-4 h-4 inline me-1" />
                      {language === 'ar' ? 'البريد الإلكتروني *' : 'Email *'}
                    </Label>
                    <Input
                      id="office-email"
                      type="email"
                      value={officeSettings.email}
                      onChange={(e) => setOfficeSettings({...officeSettings, email: e.target.value})}
                      placeholder="office@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office-phone">
                      <Phone className="w-4 h-4 inline me-1" />
                      {language === 'ar' ? 'رقم الهاتف *' : 'Phone Number *'}
                    </Label>
                    <Input
                      id="office-phone"
                      value={officeSettings.phone}
                      onChange={(e) => setOfficeSettings({...officeSettings, phone: e.target.value})}
                      placeholder="+966 50 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office-city">
                      <MapPin className="w-4 h-4 inline me-1" />
                      {language === 'ar' ? 'المدينة' : 'City'}
                    </Label>
                    <Input
                      id="office-city"
                      value={officeSettings.city}
                      onChange={(e) => setOfficeSettings({...officeSettings, city: e.target.value})}
                      placeholder={language === 'ar' ? 'الرياض' : 'Riyadh'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="office-country">
                      <Globe className="w-4 h-4 inline me-1" />
                      {language === 'ar' ? 'الدولة' : 'Country'}
                    </Label>
                    <Input
                      id="office-country"
                      value={officeSettings.country}
                      onChange={(e) => setOfficeSettings({...officeSettings, country: e.target.value})}
                      placeholder={language === 'ar' ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office-address">
                    {language === 'ar' ? 'العنوان الكامل' : 'Full Address'}
                  </Label>
                  <Textarea
                    id="office-address"
                    value={officeSettings.address}
                    onChange={(e) => setOfficeSettings({...officeSettings, address: e.target.value})}
                    placeholder={language === 'ar' ? 'شارع الملك فهد، حي العليا، الرياض' : 'King Fahd Road, Al Olaya, Riyadh'}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office-website">
                    {language === 'ar' ? 'الموقع الإلكتروني' : 'Website'}
                  </Label>
                  <Input
                    id="office-website"
                    value={officeSettings.website}
                    onChange={(e) => setOfficeSettings({...officeSettings, website: e.target.value})}
                    placeholder="https://www.example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="office-description">
                    {language === 'ar' ? 'وصف المكتب' : 'Office Description'}
                  </Label>
                  <Textarea
                    id="office-description"
                    value={officeSettings.description}
                    onChange={(e) => setOfficeSettings({...officeSettings, description: e.target.value})}
                    placeholder={language === 'ar' 
                      ? 'مكتب قانوني متخصص في القضايا التجارية والعقارية...'
                      : 'Law office specializing in commercial and real estate cases...'}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveOfficeSettings}>
                    <Save className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Invoice Settings Tab */}
          <TabsContent value="invoice" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === 'ar' ? 'إعدادات الفواتير' : 'Invoice Settings'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'قم بتكوين إعدادات الفواتير والضرائب والدفع'
                    : 'Configure invoice, tax, and payment settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="tax-rate">
                      <Percent className="w-4 h-4 inline me-1" />
                      {language === 'ar' ? 'نسبة الضريبة (%)' : 'Tax Rate (%)'}
                    </Label>
                    <Input
                      id="tax-rate"
                      type="number"
                      value={invoiceSettings.taxRate}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, taxRate: e.target.value})}
                      placeholder="15"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tax-number">
                      {language === 'ar' ? 'الرقم الضريبي' : 'Tax Number'}
                    </Label>
                    <Input
                      id="tax-number"
                      value={invoiceSettings.taxNumber}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, taxNumber: e.target.value})}
                      placeholder="300000000000003"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="currency">
                      <DollarSign className="w-4 h-4 inline me-1" />
                      {language === 'ar' ? 'العملة' : 'Currency'}
                    </Label>
                    <Input
                      id="currency"
                      value={invoiceSettings.currency}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, currency: e.target.value})}
                      placeholder="SAR"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-prefix">
                      {language === 'ar' ? 'بادئة رقم الفاتورة' : 'Invoice Number Prefix'}
                    </Label>
                    <Input
                      id="invoice-prefix"
                      value={invoiceSettings.invoicePrefix}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, invoicePrefix: e.target.value})}
                      placeholder="INV-"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="invoice-start">
                      {language === 'ar' ? 'رقم البداية للفواتير' : 'Invoice Start Number'}
                    </Label>
                    <Input
                      id="invoice-start"
                      type="number"
                      value={invoiceSettings.invoiceStartNumber}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, invoiceStartNumber: e.target.value})}
                      placeholder="1000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment-terms">
                      {language === 'ar' ? 'مدة الدفع (أيام)' : 'Payment Terms (Days)'}
                    </Label>
                    <Input
                      id="payment-terms"
                      type="number"
                      value={invoiceSettings.paymentTerms}
                      onChange={(e) => setInvoiceSettings({...invoiceSettings, paymentTerms: e.target.value})}
                      placeholder="30"
                    />
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-4">
                    <CreditCard className="w-5 h-5 inline me-2" />
                    {language === 'ar' ? 'معلومات البنك' : 'Bank Information'}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank-name">
                        {language === 'ar' ? 'اسم البنك' : 'Bank Name'}
                      </Label>
                      <Input
                        id="bank-name"
                        value={invoiceSettings.bankName}
                        onChange={(e) => setInvoiceSettings({...invoiceSettings, bankName: e.target.value})}
                        placeholder={language === 'ar' ? 'البنك الأهلي السعودي' : 'National Commercial Bank'}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="account-number">
                        {language === 'ar' ? 'رقم الحساب' : 'Account Number'}
                      </Label>
                      <Input
                        id="account-number"
                        value={invoiceSettings.accountNumber}
                        onChange={(e) => setInvoiceSettings({...invoiceSettings, accountNumber: e.target.value})}
                        placeholder="1234567890"
                      />
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="iban">
                        {language === 'ar' ? 'رقم الآيبان (IBAN)' : 'IBAN'}
                      </Label>
                      <Input
                        id="iban"
                        value={invoiceSettings.iban}
                        onChange={(e) => setInvoiceSettings({...invoiceSettings, iban: e.target.value})}
                        placeholder="SA0000000000000000000000"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invoice-notes">
                    {language === 'ar' ? 'ملاحظات الفاتورة الافتراضية' : 'Default Invoice Notes'}
                  </Label>
                  <Textarea
                    id="invoice-notes"
                    value={invoiceSettings.notes}
                    onChange={(e) => setInvoiceSettings({...invoiceSettings, notes: e.target.value})}
                    placeholder={language === 'ar' 
                      ? 'شكراً لتعاملكم معنا. يرجى السداد خلال المدة المحددة.'
                      : 'Thank you for your business. Please pay within the specified period.'}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveInvoiceSettings}>
                    <Save className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications Settings Tab */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  {language === 'ar' ? 'إعدادات الإشعارات' : 'Notification Settings'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'تحكم في كيفية تلقي الإشعارات والتنبيهات'
                    : 'Control how you receive notifications and alerts'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'قنوات الإشعارات' : 'Notification Channels'}
                  </h3>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">
                        {language === 'ar' ? 'إشعارات البريد الإلكتروني' : 'Email Notifications'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تلقي الإشعارات عبر البريد الإلكتروني' : 'Receive notifications via email'}
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, emailNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">
                        {language === 'ar' ? 'إشعارات الرسائل النصية' : 'SMS Notifications'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تلقي الإشعارات عبر الرسائل النصية' : 'Receive notifications via SMS'}
                      </p>
                    </div>
                    <Switch
                      id="sms-notifications"
                      checked={notificationSettings.smsNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, smsNotifications: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="push-notifications">
                        {language === 'ar' ? 'الإشعارات الفورية' : 'Push Notifications'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تلقي الإشعارات الفورية داخل المنصة' : 'Receive push notifications within the platform'}
                      </p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, pushNotifications: checked})}
                    />
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'أنواع الإشعارات' : 'Notification Types'}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="case-updates">
                        {language === 'ar' ? 'تحديثات القضايا' : 'Case Updates'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'إشعارات عند تحديث حالة القضية' : 'Notifications when case status is updated'}
                      </p>
                    </div>
                    <Switch
                      id="case-updates"
                      checked={notificationSettings.caseUpdates}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, caseUpdates: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="deadline-reminders">
                        {language === 'ar' ? 'تذكيرات المواعيد النهائية' : 'Deadline Reminders'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تذكيرات قبل المواعيد النهائية' : 'Reminders before deadlines'}
                      </p>
                    </div>
                    <Switch
                      id="deadline-reminders"
                      checked={notificationSettings.deadlineReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, deadlineReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="invoice-reminders">
                        {language === 'ar' ? 'تذكيرات الفواتير' : 'Invoice Reminders'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تذكيرات للفواتير المعلقة والمتأخرة' : 'Reminders for pending and overdue invoices'}
                      </p>
                    </div>
                    <Switch
                      id="invoice-reminders"
                      checked={notificationSettings.invoiceReminders}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, invoiceReminders: checked})}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="client-messages">
                        {language === 'ar' ? 'رسائل العملاء' : 'Client Messages'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'إشعارات عند تلقي رسائل من العملاء' : 'Notifications when receiving messages from clients'}
                      </p>
                    </div>
                    <Switch
                      id="client-messages"
                      checked={notificationSettings.clientMessages}
                      onCheckedChange={(checked) => setNotificationSettings({...notificationSettings, clientMessages: checked})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reminder-days">
                      {language === 'ar' ? 'أيام التذكير المسبق' : 'Reminder Days in Advance'}
                    </Label>
                    <Input
                      id="reminder-days"
                      type="number"
                      value={notificationSettings.reminderDays}
                      onChange={(e) => setNotificationSettings({...notificationSettings, reminderDays: e.target.value})}
                      placeholder="3"
                    />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'عدد الأيام قبل الموعد لإرسال التذكير'
                        : 'Number of days before the deadline to send reminder'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveNotificationSettings}>
                    <Save className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {language === 'ar' ? 'إعدادات الأمان' : 'Security Settings'}
                </CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'قم بتكوين إعدادات الأمان وحماية البيانات'
                    : 'Configure security and data protection settings'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'المصادقة والوصول' : 'Authentication & Access'}
                  </h3>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="two-factor">
                        {language === 'ar' ? 'المصادقة الثنائية' : 'Two-Factor Authentication'}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'تفعيل المصادقة الثنائية لمزيد من الأمان' : 'Enable two-factor authentication for extra security'}
                      </p>
                    </div>
                    <Switch
                      id="two-factor"
                      checked={securitySettings.twoFactorAuth}
                      onCheckedChange={(checked) => setSecuritySettings({...securitySettings, twoFactorAuth: checked})}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="session-timeout">
                        {language === 'ar' ? 'مهلة الجلسة (دقيقة)' : 'Session Timeout (Minutes)'}
                      </Label>
                      <Input
                        id="session-timeout"
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({...securitySettings, sessionTimeout: e.target.value})}
                        placeholder="30"
                      />
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? 'المدة قبل تسجيل الخروج التلقائي'
                          : 'Duration before automatic logout'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="login-attempts">
                        {language === 'ar' ? 'محاولات تسجيل الدخول' : 'Login Attempts'}
                      </Label>
                      <Input
                        id="login-attempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={(e) => setSecuritySettings({...securitySettings, loginAttempts: e.target.value})}
                        placeholder="5"
                      />
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? 'عدد المحاولات قبل حظر الحساب'
                          : 'Number of attempts before account lockout'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password-expiry">
                        {language === 'ar' ? 'انتهاء كلمة المرور (يوم)' : 'Password Expiry (Days)'}
                      </Label>
                      <Input
                        id="password-expiry"
                        type="number"
                        value={securitySettings.passwordExpiry}
                        onChange={(e) => setSecuritySettings({...securitySettings, passwordExpiry: e.target.value})}
                        placeholder="90"
                      />
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? 'المدة قبل طلب تغيير كلمة المرور'
                          : 'Duration before password change is required'}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="data-retention">
                        {language === 'ar' ? 'الاحتفاظ بالبيانات (يوم)' : 'Data Retention (Days)'}
                      </Label>
                      <Input
                        id="data-retention"
                        type="number"
                        value={securitySettings.dataRetention}
                        onChange={(e) => setSecuritySettings({...securitySettings, dataRetention: e.target.value})}
                        placeholder="365"
                      />
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' 
                          ? 'مدة الاحتفاظ بالبيانات المحذوفة'
                          : 'Duration to retain deleted data'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 space-y-4">
                  <h3 className="text-lg font-semibold">
                    {language === 'ar' ? 'التحكم في الوصول' : 'Access Control'}
                  </h3>

                  <div className="space-y-2">
                    <Label htmlFor="ip-whitelist">
                      {language === 'ar' ? 'قائمة IP المسموحة' : 'IP Whitelist'}
                    </Label>
                    <Textarea
                      id="ip-whitelist"
                      value={securitySettings.ipWhitelist}
                      onChange={(e) => setSecuritySettings({...securitySettings, ipWhitelist: e.target.value})}
                      placeholder={language === 'ar' 
                        ? 'أدخل عناوين IP مفصولة بفواصل\n192.168.1.1, 10.0.0.1'
                        : 'Enter IP addresses separated by commas\n192.168.1.1, 10.0.0.1'}
                      rows={3}
                    />
                    <p className="text-sm text-muted-foreground">
                      {language === 'ar' 
                        ? 'السماح بالوصول فقط من عناوين IP المحددة (اتركه فارغاً للسماح للجميع)'
                        : 'Allow access only from specified IP addresses (leave empty to allow all)'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={handleSaveSecuritySettings}>
                    <Save className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'حفظ التغييرات' : 'Save Changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
