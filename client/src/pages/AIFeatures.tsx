import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { FileText, Search, Sparkles, Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function AIFeatures() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  
  // State for document extraction
  const [extractFile, setExtractFile] = useState<File | null>(null);
  const [extractionResult, setExtractionResult] = useState<any>(null);
  
  // State for legal search
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any>(null);
  
  // State for document drafting
  const [draftType, setDraftType] = useState("");
  const [draftParams, setDraftParams] = useState("");
  const [draftedDocument, setDraftedDocument] = useState("");

  const extractMutation = trpc.ai.extractData.useMutation({
    onSuccess: (data: any) => {
      setExtractionResult(data);
      toast.success(language === 'ar' ? 'تم استخراج البيانات بنجاح' : 'Data extracted successfully');
    },
    onError: (error: any) => {
      toast.error(language === 'ar' ? 'فشل استخراج البيانات' : 'Failed to extract data');
    },
  });

  const searchMutation = trpc.ai.legalSearch.useMutation({
    onSuccess: (data: any) => {
      setSearchResults(data);
    },
    onError: (error: any) => {
      toast.error(language === 'ar' ? 'فشل البحث' : 'Search failed');
    },
  });

  const generateMutation = trpc.ai.generateDraft.useMutation({
    onSuccess: (data: any) => {
      setDraftedDocument(data.content);
      toast.success(language === 'ar' ? 'تم إنشاء المسودة بنجاح' : 'Draft created successfully');
    },
    onError: (error: any) => {
      toast.error(language === 'ar' ? 'فشل إنشاء المسودة' : 'Failed to create draft');
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

  const handleExtractFile = async () => {
    if (!extractFile) {
      toast.error(language === 'ar' ? 'الرجاء اختيار ملف' : 'Please select a file');
      return;
    }

    // For demo purposes, use a mock document ID
    // In production, you would upload the file first and get its ID
    extractMutation.mutate({
      documentId: 1,
      extractionType: "entities",
    });
  };

  const handleLegalSearch = () => {
    if (!searchQuery.trim()) {
      toast.error(language === 'ar' ? 'الرجاء إدخال استعلام البحث' : 'Please enter a search query');
      return;
    }
    searchMutation.mutate({ query: searchQuery });
  };

  const handleDraftDocument = () => {
    if (!draftType.trim() || !draftParams.trim()) {
      toast.error(language === 'ar' ? 'الرجاء ملء جميع الحقول' : 'Please fill all fields');
      return;
    }
    try {
      const params = JSON.parse(draftParams);
      generateMutation.mutate({
        templateId: 1,
        variables: params,
      });
    } catch (e) {
      toast.error(language === 'ar' ? 'خطأ في صيغة JSON' : 'Invalid JSON format');
    }
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            {language === 'ar' ? 'الذكاء الاصطناعي' : 'AI Features'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {language === 'ar' ? 'استخدم قوة الذكاء الاصطناعي لتحسين عملك القانوني' : 'Leverage AI to enhance your legal work'}
          </p>
        </div>

        <Tabs defaultValue="extract" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="extract">
              <FileText className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'استخراج البيانات' : 'Data Extraction'}
            </TabsTrigger>
            <TabsTrigger value="search">
              <Search className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'البحث القانوني' : 'Legal Search'}
            </TabsTrigger>
            <TabsTrigger value="draft">
              <Sparkles className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'صياغة المستندات' : 'Document Drafting'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="extract" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'استخراج البيانات من العقود' : 'Extract Data from Contracts'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'قم برفع عقد أو مستند قانوني لاستخراج التواريخ والأسماء والبنود تلقائياً' 
                    : 'Upload a contract or legal document to automatically extract dates, names, and clauses'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'اختر ملف' : 'Select File'}</Label>
                  <Input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt"
                    onChange={(e) => setExtractFile(e.target.files?.[0] || null)}
                  />
                </div>

                <Button 
                  onClick={handleExtractFile} 
                  disabled={!extractFile || extractMutation.isPending}
                  className="w-full"
                >
                  {extractMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري الاستخراج...' : 'Extracting...'}
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'استخراج البيانات' : 'Extract Data'}
                    </>
                  )}
                </Button>

                {extractionResult && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        {language === 'ar' ? 'نتائج الاستخراج' : 'Extraction Results'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {extractionResult.dates && extractionResult.dates.length > 0 && (
                        <div>
                          <p className="font-semibold mb-2">{language === 'ar' ? 'التواريخ:' : 'Dates:'}</p>
                          <ul className="list-disc list-inside space-y-1">
                            {extractionResult.dates.map((date: string, i: number) => (
                              <li key={i} className="text-sm">{date}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {extractionResult.parties && extractionResult.parties.length > 0 && (
                        <div>
                          <p className="font-semibold mb-2">{language === 'ar' ? 'الأطراف:' : 'Parties:'}</p>
                          <ul className="list-disc list-inside space-y-1">
                            {extractionResult.parties.map((party: string, i: number) => (
                              <li key={i} className="text-sm">{party}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {extractionResult.clauses && extractionResult.clauses.length > 0 && (
                        <div>
                          <p className="font-semibold mb-2">{language === 'ar' ? 'البنود الرئيسية:' : 'Key Clauses:'}</p>
                          <ul className="list-disc list-inside space-y-1">
                            {extractionResult.clauses.map((clause: string, i: number) => (
                              <li key={i} className="text-sm">{clause}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="pt-3 border-t">
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'الدقة:' : 'Accuracy:'} {extractionResult.confidence || 85}%
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'البحث القانوني الدلالي' : 'Semantic Legal Search'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'ابحث في قاعدة بيانات الأنظمة والأحكام السعودية بذكاء اصطناعي' 
                    : 'Search Saudi laws and regulations database with AI'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'استعلام البحث' : 'Search Query'}</Label>
                  <Textarea
                    placeholder={language === 'ar' ? 'مثال: ما هي شروط صحة العقد في النظام السعودي؟' : 'Example: What are the conditions for a valid contract in Saudi law?'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleLegalSearch} 
                  disabled={!searchQuery.trim() || searchMutation.isPending}
                  className="w-full"
                >
                  {searchMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري البحث...' : 'Searching...'}
                    </>
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'بحث' : 'Search'}
                    </>
                  )}
                </Button>

                {searchResults && (
                  <div className="space-y-3">
                    {searchResults.results?.map((result: any, i: number) => (
                      <Card key={i} className="bg-muted/50">
                        <CardHeader>
                          <CardTitle className="text-base">{result.title}</CardTitle>
                          <CardDescription>{result.source}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm">{result.excerpt}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">
                              {language === 'ar' ? 'الصلة:' : 'Relevance:'} {result.relevance}%
                            </span>
                            <Button variant="link" size="sm">
                              {language === 'ar' ? 'عرض المزيد' : 'View More'}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="draft" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{language === 'ar' ? 'أتمتة صياغة المستندات' : 'Automated Document Drafting'}</CardTitle>
                <CardDescription>
                  {language === 'ar' 
                    ? 'قم بإنشاء مسودات قانونية تلقائياً باستخدام الذكاء الاصطناعي' 
                    : 'Generate legal drafts automatically using AI'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'نوع المستند' : 'Document Type'}</Label>
                  <Input
                    placeholder={language === 'ar' ? 'مثال: عقد عمل، اتفاقية سرية، عقد بيع' : 'Example: Employment contract, NDA, Sales agreement'}
                    value={draftType}
                    onChange={(e) => setDraftType(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'المعلومات المطلوبة (JSON)' : 'Required Information (JSON)'}</Label>
                  <Textarea
                    placeholder={`{"partyA": "شركة ABC", "partyB": "أحمد محمد", "position": "مهندس برمجيات", "salary": "15000"}`}
                    value={draftParams}
                    onChange={(e) => setDraftParams(e.target.value)}
                    rows={5}
                  />
                </div>

                <Button 
                  onClick={handleDraftDocument} 
                  disabled={!draftType.trim() || !draftParams.trim() || generateMutation.isPending}
                  className="w-full"
                >
                  {generateMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {language === 'ar' ? 'جاري الإنشاء...' : 'Generating...'}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {language === 'ar' ? 'إنشاء المسودة' : 'Generate Draft'}
                    </>
                  )}
                </Button>

                {draftedDocument && (
                  <Card className="bg-muted/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        {language === 'ar' ? 'المسودة المُنشأة' : 'Generated Draft'}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-background p-4 rounded-md border max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm">{draftedDocument}</pre>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" className="flex-1">
                          {language === 'ar' ? 'نسخ' : 'Copy'}
                        </Button>
                        <Button variant="outline" className="flex-1">
                          {language === 'ar' ? 'تحميل' : 'Download'}
                        </Button>
                        <Button className="flex-1">
                          {language === 'ar' ? 'حفظ في القضية' : 'Save to Case'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-primary mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">{language === 'ar' ? 'ملاحظة مهمة' : 'Important Note'}</p>
                <p className="text-sm text-muted-foreground">
                  {language === 'ar' 
                    ? 'جميع نتائج الذكاء الاصطناعي هي مساعدة فقط ويجب مراجعتها من قبل محامٍ مؤهل قبل الاستخدام الرسمي.' 
                    : 'All AI results are assistive only and must be reviewed by a qualified lawyer before official use.'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
