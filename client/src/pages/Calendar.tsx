import { useState, useMemo, useCallback } from "react";
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
import { Calendar as BigCalendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addHours } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { 
  Plus, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  FileText,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export default function Calendar() {
  const { user, loading, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Form state for new event
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    eventType: "hearing",
    startDate: "",
    endDate: "",
    location: "",
    caseId: "",
    attendees: ""
  });

  // Setup localizer for react-big-calendar
  const locales = {
    'ar': ar,
    'en': enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  // Fetch events
  const { data: events = [], isLoading: eventsLoading, refetch } = trpc.calendar.list.useQuery(undefined, {
    enabled: isAuthenticated
  });

  // Fetch cases for dropdown
  const { data: cases = [] } = trpc.cases.list.useQuery(undefined, {
    enabled: isAuthenticated && isCreateDialogOpen
  });

  // Create event mutation
  const createMutation = trpc.calendar.create.useMutation({
    onSuccess: () => {
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: "",
        description: "",
        eventType: "hearing",
        startDate: "",
        endDate: "",
        location: "",
        caseId: "",
        attendees: ""
      });
      refetch();
    },
    onError: (error) => {
      console.error('Error creating event:', error);
    },
  });

  // Update event mutation
  const updateMutation = trpc.calendar.update.useMutation({
    onSuccess: () => {
      setSelectedEvent(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error updating event:', error);
    },
  });

  // Delete event mutation
  const deleteMutation = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      setSelectedEvent(null);
      refetch();
    },
    onError: (error) => {
      console.error('Error deleting event:', error);
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

  // Transform events for calendar
  const calendarEvents = useMemo(() => {
    return events.map((event: any) => ({
      ...event,
      start: new Date(event.startDate),
      end: new Date(event.endDate),
      title: event.title,
    }));
  }, [events]);

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.startDate || !newEvent.endDate) return;

    createMutation.mutate({
      title: newEvent.title,
      description: newEvent.description || null,
      eventType: newEvent.eventType as any,
      startDate: new Date(newEvent.startDate),
      endDate: new Date(newEvent.endDate),
      location: newEvent.location || null,
      caseId: newEvent.caseId ? parseInt(newEvent.caseId) : null,
      attendees: newEvent.attendees || null,
      status: "scheduled",
    });
  };

  const handleSelectEvent = useCallback((event: any) => {
    setSelectedEvent(event);
  }, []);

  const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({
      ...newEvent,
      startDate: format(start, "yyyy-MM-dd'T'HH:mm"),
      endDate: format(end, "yyyy-MM-dd'T'HH:mm"),
    });
    setIsCreateDialogOpen(true);
  }, [newEvent]);

  const getEventStyle = (event: any) => {
    const colors = {
      hearing: { bg: '#3b82f6', border: '#2563eb' },
      meeting: { bg: '#8b5cf6', border: '#7c3aed' },
      deadline: { bg: '#ef4444', border: '#dc2626' },
      consultation: { bg: '#10b981', border: '#059669' },
      other: { bg: '#6b7280', border: '#4b5563' },
    };

    const color = colors[event.eventType as keyof typeof colors] || colors.other;

    return {
      style: {
        backgroundColor: color.bg,
        borderColor: color.border,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '4px',
        color: 'white',
        fontSize: '0.875rem',
        padding: '2px 4px',
      }
    };
  };

  const messages = {
    ar: {
      today: 'اليوم',
      previous: 'السابق',
      next: 'التالي',
      month: 'شهر',
      week: 'أسبوع',
      day: 'يوم',
      agenda: 'جدول الأعمال',
      date: 'التاريخ',
      time: 'الوقت',
      event: 'حدث',
      noEventsInRange: 'لا توجد أحداث في هذا النطاق',
      showMore: (total: number) => `+${total} المزيد`,
    },
    en: {
      today: 'Today',
      previous: 'Back',
      next: 'Next',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda',
      date: 'Date',
      time: 'Time',
      event: 'Event',
      noEventsInRange: 'No events in this range',
      showMore: (total: number) => `+${total} more`,
    }
  };

  const eventTypeLabels = {
    hearing: language === 'ar' ? 'جلسة' : 'Hearing',
    meeting: language === 'ar' ? 'اجتماع' : 'Meeting',
    deadline: language === 'ar' ? 'موعد نهائي' : 'Deadline',
    consultation: language === 'ar' ? 'استشارة' : 'Consultation',
    other: language === 'ar' ? 'أخرى' : 'Other',
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">
              {language === 'ar' ? 'التقويم' : 'Calendar'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {language === 'ar' 
                ? 'إدارة المواعيد والجلسات والمهام'
                : 'Manage appointments, hearings, and tasks'}
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 me-2" />
                {language === 'ar' ? 'حدث جديد' : 'New Event'}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {language === 'ar' ? 'إضافة حدث جديد' : 'Add New Event'}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'العنوان *' : 'Title *'}</Label>
                  <Input
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    placeholder={language === 'ar' ? 'عنوان الحدث' : 'Event title'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'النوع' : 'Type'}</Label>
                  <Select value={newEvent.eventType} onValueChange={(value) => setNewEvent({...newEvent, eventType: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hearing">{language === 'ar' ? 'جلسة' : 'Hearing'}</SelectItem>
                      <SelectItem value="meeting">{language === 'ar' ? 'اجتماع' : 'Meeting'}</SelectItem>
                      <SelectItem value="deadline">{language === 'ar' ? 'موعد نهائي' : 'Deadline'}</SelectItem>
                      <SelectItem value="consultation">{language === 'ar' ? 'استشارة' : 'Consultation'}</SelectItem>
                      <SelectItem value="other">{language === 'ar' ? 'أخرى' : 'Other'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'تاريخ البداية *' : 'Start Date *'}</Label>
                    <Input
                      type="datetime-local"
                      value={newEvent.startDate}
                      onChange={(e) => setNewEvent({...newEvent, startDate: e.target.value})}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{language === 'ar' ? 'تاريخ النهاية *' : 'End Date *'}</Label>
                    <Input
                      type="datetime-local"
                      value={newEvent.endDate}
                      onChange={(e) => setNewEvent({...newEvent, endDate: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الموقع' : 'Location'}</Label>
                  <Input
                    value={newEvent.location}
                    onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                    placeholder={language === 'ar' ? 'موقع الحدث' : 'Event location'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'القضية المرتبطة' : 'Related Case'}</Label>
                  <Select value={newEvent.caseId} onValueChange={(value) => setNewEvent({...newEvent, caseId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder={language === 'ar' ? 'اختر قضية' : 'Select case'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{language === 'ar' ? 'بدون قضية' : 'No case'}</SelectItem>
                      {cases.map((c: any) => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.caseNumber} - {c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الحضور' : 'Attendees'}</Label>
                  <Input
                    value={newEvent.attendees}
                    onChange={(e) => setNewEvent({...newEvent, attendees: e.target.value})}
                    placeholder={language === 'ar' ? 'أسماء الحضور' : 'Attendee names'}
                  />
                </div>

                <div className="space-y-2">
                  <Label>{language === 'ar' ? 'الوصف' : 'Description'}</Label>
                  <Textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                    placeholder={language === 'ar' ? 'تفاصيل الحدث' : 'Event details'}
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    {language === 'ar' ? 'إلغاء' : 'Cancel'}
                  </Button>
                  <Button 
                    onClick={handleCreateEvent}
                    disabled={!newEvent.title || !newEvent.startDate || !newEvent.endDate || createMutation.isPending}
                  >
                    {createMutation.isPending 
                      ? (language === 'ar' ? 'جاري الإضافة...' : 'Adding...') 
                      : (language === 'ar' ? 'إضافة الحدث' : 'Add Event')}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Calendar Card */}
        <Card>
          <CardContent className="p-6">
            {eventsLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div style={{ height: '700px', direction: language === 'ar' ? 'rtl' : 'ltr' }}>
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectEvent={handleSelectEvent}
                  onSelectSlot={handleSelectSlot}
                  selectable
                  culture={language}
                  messages={messages[language as keyof typeof messages]}
                  eventPropGetter={getEventStyle}
                  style={{ 
                    fontFamily: language === 'ar' ? 'Cairo, sans-serif' : 'Inter, sans-serif',
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Event Detail Dialog */}
        {selectedEvent && (
          <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{selectedEvent.title}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge>{eventTypeLabels[selectedEvent.eventType as keyof typeof eventTypeLabels]}</Badge>
                  <Badge variant="outline">{selectedEvent.status}</Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground mt-1" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'الوقت' : 'Time'}
                      </p>
                      <p className="font-medium">
                        {format(new Date(selectedEvent.startDate), 'PPp', { locale: language === 'ar' ? ar : enUS })}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {language === 'ar' ? 'إلى' : 'to'} {format(new Date(selectedEvent.endDate), 'PPp', { locale: language === 'ar' ? ar : enUS })}
                      </p>
                    </div>
                  </div>

                  {selectedEvent.location && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'الموقع' : 'Location'}
                        </p>
                        <p className="font-medium">{selectedEvent.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.attendees && (
                    <div className="flex items-start gap-3">
                      <Users className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'الحضور' : 'Attendees'}
                        </p>
                        <p className="font-medium">{selectedEvent.attendees}</p>
                      </div>
                    </div>
                  )}

                  {selectedEvent.description && (
                    <div className="flex items-start gap-3">
                      <FileText className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          {language === 'ar' ? 'الوصف' : 'Description'}
                        </p>
                        <p className="text-sm">{selectedEvent.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setSelectedEvent(null)}>
                    {language === 'ar' ? 'إغلاق' : 'Close'}
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={() => {
                      if (confirm(language === 'ar' ? 'هل تريد حذف هذا الحدث؟' : 'Delete this event?')) {
                        deleteMutation.mutate({ id: selectedEvent.id });
                      }
                    }}
                    disabled={deleteMutation.isPending}
                  >
                    {deleteMutation.isPending 
                      ? (language === 'ar' ? 'جاري الحذف...' : 'Deleting...') 
                      : (language === 'ar' ? 'حذف' : 'Delete')}
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
