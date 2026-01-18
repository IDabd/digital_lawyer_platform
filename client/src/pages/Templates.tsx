import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { 
  Search, 
  Plus, 
  FileText, 
  Edit, 
  Trash2,
  Copy,
  Download,
  Eye,
  Filter
} from "lucide-react";

export default function Templates() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  
  // Form state for new template
  const [newTemplate, setNewTemplate] = useState({
    title: "",
    description: "",
    category: "contract",
    content: "",
    variables: ""
  });

  // Fetch templates
  const { data: templates = [], isLoading: templatesLoading, refetch } = trpc.templates.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Create template mutation
  const createMutation = trpc.templates.create.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewTemplate({
        title: "",
        description: "",
        category: "contract",
        content: "",
        variables: ""
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating template:', error);
    },
  });

  // Delete template mutation
  const deleteMutation = trpc.templates.delete.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting template:', error);
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

  // Filter templates
  const filteredTemplates = templates.filter((template: any) => {
    const matchesSearch = 
      template.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  const handleCreateTemplate = () => {
    if (!newTemplate.title || !newTemplate.content) return;

    createMutation.mutate({
      title: newTemplate.title,
      description: newTemplate.description || null,
      category: newTemplate.category,
      content: newTemplate.content,
      variables: newTemplate.variables || null,
    });
  };

  const handleDuplicateTemplate = (template: any) => {
    setNewTemplate({
      title: `${template.title} (نسخة)`,
      description: template.description || "",
      category: template.category,
      content: template.content,
      variables: template.variables || ""
    });
    setIsCreateDialogOpen(true);
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm(language === 'ar' ? 'هل تريد حذف هذا القالب؟' : 'Delete this template?')) {
      deleteMutation.mutate({ id });
    }
  };

  const categoryLabels = {
    contract: language === 'ar' ? 'عقد' : 'Contract',
    memo: language === 'ar' ? 'مذكرة' : 'Memo',
    letter: language === 'ar' ? 'خطاب' : 'Letter',
    pleading: language === 'ar' ? 'مرافعة' : 'Pleading',
    agreement: language === 'ar' ? 'اتفاقية' : 'Agreement',
    notice: language === 'ar' ? 'إشعار' : 'Notice',
    other: language === 'ar' ? 'أخرى' : 'Other',
  };

  const categoryColors = {
    contract: 'bg-blue-500',
    memo: 'bg-purple-500',
    letter: 'bg-green-500',
    pleading: 'bg-red-500',
    agreement: 'bg-yellow-500',
    notice: 'bg-orange-500',
    other: 'bg-gray-500',
  };

  // Calculate statistics
  const totalTemplates = templates.length;
  const categoryCounts = templates.reduce((acc: any, t: any) => {
    acc[t.category] = (acc[t.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'القوالب القانونية' : 'Legal Templates'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'إدارة القوالب والمستندات القانونية القياسية'
                : 'Manage standard legal templates and documents'}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 me-2" />
                {language === 'ar' ? 'قالب جديد' : 'New Template'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إضافة قالب جديد' : 'Add New Template'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'عنوان القالب *' : 'Template Title *'}</Label>
                    <Input
                      value={newTemplate.title}
                      onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                      placeholder={language === 'ar' ? 'مثال: عقد عمل' : 'Example: Employment Contract'}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'التصنيف' : 'Category'}</Label>
                    <Select value={newTemplate.category} onValueChange={(value) => setNewTemplate({...newTemplate, category: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="contract">{language === 'ar' ? 'عقد' : 'Contract'}</SelectItem>
                        <SelectItem value="memo">{language === 'ar' ? 'مذكرة' : 'Memo'}</SelectItem>
                        <SelectItem value="letter">{language === 'ar' ? 'خطاب' : 'Letter'}</SelectItem>
                        <SelectItem value="pleading">{language === 'ar' ? 'مرافعة' : 'Pleading'}</SelectItem>
                        <SelectItem value="agreement">{language === 'ar' ? 'اتفاقية' : 'Agreement'}</SelectItem>
                        <SelectItem value="notice">{language === 'ar' ? 'إشعار' : 'Notice'}</SelectItem>
                        <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Textarea
                    value={newTemplate.description}
                    onChange={(e) => setNewTemplate({...newTemplate, description: e.target.value})}
                    placeholder={language === 'ar' ? 'وصف مختصر للقالب' : 'Brief description of the template'}
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المتغيرات (اختياري)' : 'Variables (Optional)'}</Label>
                  <Input
                    value={newTemplate.variables}
                    onChange={(e) => setNewTemplate({...newTemplate, variables: e.target.value})}
                    placeholder={language === 'ar' ? 'مثال: {{اسم_العميل}}, {{التاريخ}}, {{المبلغ}}' : 'Example: {{client_name}}, {{date}}, {{amount}}'}
                  />
                  <p className="text-xs text-muted-foreground">
                    {language === 'ar' 
                      ? 'استخدم {{اسم_المتغير}} في المحتوى للإشارة إلى المتغيرات القابلة للاستبدال'
                      : 'Use {{variable_name}} in content to indicate replaceable variables'}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'محتوى القالب *' : 'Template Content *'}</Label>
                  <Textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
                    placeholder={language === 'ar' 
                      ? 'اكتب محتوى القالب هنا...\n\nمثال:\nعقد عمل\n\nبين {{اسم_الشركة}} و {{اسم_الموظف}}\n\nبتاريخ {{التاريخ}}'
                      : 'Write template content here...\n\nExample:\nEmployment Contract\n\nBetween {{company_name}} and {{employee_name}}\n\nDated {{date}}'}
                    rows={15}
                    className="font-mono"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleCreateTemplate}
                    disabled={!newTemplate.title || !newTemplate.content || createMutation.isPending}
                  >
                    {createMutation.isPending 
                      ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                      : (language === 'ar' ? 'إضافة القالب' : 'Add Template')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-center">
                <FileText className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold">{totalTemplates}</p>
                <p className="text-xs text-muted-foreground">
                  {language === 'ar' ? 'إجمالي' : 'Total'}
                </p>
              </div>
            </CardContent>
          </Card>

          {Object.entries(categoryLabels).slice(0, 7).map(([key, label]) => (
            <Card key={key} className="cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setCategoryFilter(key)}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className={`w-6 h-6 ${categoryColors[key as keyof typeof categoryColors]} rounded mx-auto mb-2`}></div>
                  <p className="text-2xl font-bold">{categoryCounts[key] || 0}</p>
                  <p className="text-xs text-muted-foreground truncate">{label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute start-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder={language === 'ar' ? 'بحث في القوالب...' : 'Search templates...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="ps-10"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <Filter className="w-4 h-4 me-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع التصنيفات' : 'All Categories'}</SelectItem>
                  <SelectItem value="contract">{language === 'ar' ? 'عقد' : 'Contract'}</SelectItem>
                  <SelectItem value="memo">{language === 'ar' ? 'مذكرة' : 'Memo'}</SelectItem>
                  <SelectItem value="letter">{language === 'ar' ? 'خطاب' : 'Letter'}</SelectItem>
                  <SelectItem value="pleading">{language === 'ar' ? 'مرافعة' : 'Pleading'}</SelectItem>
                  <SelectItem value="agreement">{language === 'ar' ? 'اتفاقية' : 'Agreement'}</SelectItem>
                  <SelectItem value="notice">{language === 'ar' ? 'إشعار' : 'Notice'}</SelectItem>
                  <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templatesLoading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {language === 'ar' ? 'لا توجد قوالب' : 'No templates found'}
              </p>
            </div>
          ) : (
            filteredTemplates.map((template: any) => (
              <Card key={template.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.title}</CardTitle>
                      <Badge className="mt-2" variant="outline">
                        {categoryLabels[template.category as keyof typeof categoryLabels]}
                      </Badge>
                    </div>
                    <div className={`w-3 h-3 ${categoryColors[template.category as keyof typeof categoryColors]} rounded-full`}></div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {template.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="w-3 h-3" />
                    <span>
                      {language === 'ar' ? 'تم الإنشاء:' : 'Created:'} {new Date(template.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => {
                        setSelectedTemplate(template);
                        setIsViewDialogOpen(true);
                      }}
                    >
                      <Eye className="w-3 h-3 me-1" />
                      {language === 'ar' ? 'عرض' : 'View'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* View Template Dialog */}
        {selectedTemplate && (
          <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{selectedTemplate.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>{categoryLabels[selectedTemplate.category as keyof typeof categoryLabels]}</Badge>
                  <span className="text-sm text-muted-foreground">
                    {new Date(selectedTemplate.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                  </span>
                </div>

                {selectedTemplate.description && (
                  <div>
                    <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                    <p className="text-sm text-muted-foreground mt-1">{selectedTemplate.description}</p>
                  </div>
                )}

                {selectedTemplate.variables && (
                  <div>
                    <Label>{language === 'ar' ? 'المتغيرات' : 'Variables'}</Label>
                    <p className="text-sm text-muted-foreground mt-1 font-mono">{selectedTemplate.variables}</p>
                  </div>
                )}

                <div>
                  <Label>{language === 'ar' ? 'المحتوى' : 'Content'}</Label>
                  <div className="mt-2 p-4 bg-muted rounded-lg">
                    <pre className="text-sm whitespace-pre-wrap font-mono">{selectedTemplate.content}</pre>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                  <Button onClick={() => {
                    handleDuplicateTemplate(selectedTemplate);
                    setIsViewDialogOpen(false);
                  }}>
                    <Copy className="w-4 h-4 me-2" />
                    {language === 'ar' ? 'نسخ' : 'Duplicate'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
