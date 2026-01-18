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
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Cases() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const { data: cases, isLoading: casesLoading } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated,
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

  const filteredCases = cases?.filter((c: any) => {
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.caseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || c.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || c.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  }) || [];

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'القضايا' : 'Cases'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' ? 'إدارة جميع القضايا القانونية' : 'Manage all legal cases'}
            </p>
          </div>
          <Button asChild>
            <Link href="/cases/new">
              <Plus className="h-4 w-4 mr-2" />
              {language === 'ar' ? 'قضية جديدة' : 'New Case'}
            </Link>
          </Button>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'الحالة' : 'Status'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'جميع الحالات' : 'All'}</SelectItem>
                  <SelectItem value="active">{language === 'ar' ? 'نشط' : 'Active'}</SelectItem>
                  <SelectItem value="pending">{language === 'ar' ? 'معلق' : 'Pending'}</SelectItem>
                  <SelectItem value="closed">{language === 'ar' ? 'مغلق' : 'Closed'}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder={language === 'ar' ? 'الأولوية' : 'Priority'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{language === 'ar' ? 'الكل' : 'All'}</SelectItem>
                  <SelectItem value="urgent">{language === 'ar' ? 'عاجل' : 'Urgent'}</SelectItem>
                  <SelectItem value="high">{language === 'ar' ? 'عالي' : 'High'}</SelectItem>
                  <SelectItem value="medium">{language === 'ar' ? 'متوسط' : 'Medium'}</SelectItem>
                  <SelectItem value="low">{language === 'ar' ? 'منخفض' : 'Low'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {casesLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        ) : filteredCases.length > 0 ? (
          <div className="grid gap-4">
            {filteredCases.map((caseItem: any) => (
              <Link key={caseItem.id} href={`/cases/${caseItem.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold">{caseItem.title}</h3>
                          <span className={`text-xs px-3 py-1 rounded-full ${
                            caseItem.priority === 'urgent' ? 'bg-destructive/10 text-destructive' :
                            caseItem.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                            caseItem.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {language === 'ar' 
                              ? caseItem.priority === 'urgent' ? 'عاجل' :
                                caseItem.priority === 'high' ? 'عالي' :
                                caseItem.priority === 'medium' ? 'متوسط' : 'منخفض'
                              : caseItem.priority
                            }
                          </span>
                        </div>
                        <p className="text-muted-foreground mb-3">{caseItem.caseNumber}</p>
                        {caseItem.description && (
                          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                            {caseItem.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className={`px-3 py-1 rounded-full ${
                            caseItem.status === 'active' ? 'bg-green-100 text-green-700' :
                            caseItem.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {language === 'ar' 
                              ? caseItem.status === 'active' ? 'نشط' :
                                caseItem.status === 'pending' ? 'معلق' :
                                caseItem.status === 'closed' ? 'مغلق' : 'مؤرشف'
                              : caseItem.status
                            }
                          </span>
                          <span className="text-muted-foreground">
                            {new Date(caseItem.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                {language === 'ar' ? 'لا توجد قضايا' : 'No cases found'}
              </p>
              <Button asChild>
                <Link href="/cases/new">
                  <Plus className="h-4 w-4 mr-2" />
                  {language === 'ar' ? 'إضافة قضية جديدة' : 'Add New Case'}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
