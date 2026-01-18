import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { Upload, Search, FileText, Download, Trash2, Eye } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function Documents() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [caseFilter, setCaseFilter] = useState("all");
  const [uploading, setUploading] = useState(false);

  const { data: documents, isLoading: docsLoading, refetch } = trpc.documents.getAll.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: cases } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم رفع الملف بنجاح' : 'File uploaded successfully');
      refetch();
      setUploading(false);
    },
    onError: (error) => {
      toast.error(language === 'ar' ? 'فشل رفع الملف' : 'Failed to upload file');
      setUploading(false);
    },
  });

  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast.success(language === 'ar' ? 'تم حذف الملف' : 'File deleted');
      refetch();
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

  const filteredDocs = documents?.filter((doc: any) => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCase = caseFilter === "all" || doc.caseId?.toString() === caseFilter;
    return matchesSearch && matchesCase;
  }) || [];

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      try {
        await uploadMutation.mutateAsync({
          caseId: 0,
          title: file.name,
          fileName: file.name,
          fileData: base64,
          mimeType: file.type,
        });
      } catch (error) {
        console.error('Upload error:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'الوثائق' : 'Documents'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة جميع الوثائق والملفات' : 'Manage all documents and files'}
            </p>
          </div>
          <div>
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <Button asChild disabled={uploading}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploading 
                  ? (language === 'ar' ? 'جاري الرفع...' : 'Uploading...') 
                  : (language === 'ar' ? 'رفع ملف' : 'Upload File')
                }
              </label>
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={caseFilter} onValueChange={setCaseFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'القضية' : 'Case'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع القضايا' : 'All Cases'}</SelectItem>
                  {cases?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {docsLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredDocs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc: any) => (
              <Card key={doc.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <FileText className="h-10 w-10 text-primary flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{doc.filename}</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {(doc.fileSize / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(doc.uploadedAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-1" />
                      {language === 'ar' ? 'عرض' : 'View'}
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Download className="h-4 w-4 mr-1" />
                      {language === 'ar' ? 'تحميل' : 'Download'}
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm(language === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) {
                          deleteMutation.mutate({ id: doc.id });
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                {language === 'ar' ? 'لا توجد وثائق' : 'No documents found'}
              </p>
              <input
                type="file"
                id="file-upload-empty"
                className="hidden"
                onChange={handleFileUpload}
                disabled={uploading}
              />
              <Button asChild disabled={uploading}>
                <label htmlFor="file-upload-empty" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'رفع ملف جديد' : 'Upload New File'}
                </label>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
