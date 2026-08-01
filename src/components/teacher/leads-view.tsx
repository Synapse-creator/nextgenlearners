"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, NotebookIcon, Eye, Mail, Phone, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

interface Lead {
  id: string;
  parentName: string;
  email: string;
  phone: string;
  childName: string;
  childAge: string;
  desiredClass: string;
  communicationMode: string;
  status: 'new' | 'contacted' | 'enrolled' | 'archived';
  submittedAt?: string;
}

const statusOptions: Lead['status'][] = ['new', 'contacted', 'enrolled', 'archived'];

export default function LeadsView() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { toast } = useToast();

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;
      if (data) {
        setLeads(data.map((l: any) => ({
          id: l.id,
          parentName: l.parent_name || l.parentName,
          email: l.email,
          phone: l.phone,
          childName: l.child_name || l.childName,
          childAge: l.child_age || l.childAge,
          desiredClass: l.desired_class || 'General',
          communicationMode: l.communication_mode || 'email',
          status: l.status || 'new',
          submittedAt: l.created_at,
        })));
      }
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();

    const subscription = supabase
      .channel('public:leads')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchLeads();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const handleStatusChange = async (id: string, newStatus: Lead['status']) => {
    try {
      const { error } = await supabase.from('leads').update({ status: newStatus }).eq('id', id);
      if (error) throw error;

      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
      toast({ title: 'Status updated', description: `Lead status changed to ${newStatus}.` });
    } catch (error) {
      console.error("Error updating lead status:", error);
      toast({ variant: 'destructive', title: 'Update failed' });
    }
  };

  const filteredLeads = activeTab === 'all'
    ? leads
    : leads.filter(l => l.status === activeTab);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-headline text-2xl font-bold flex items-center gap-2">
            <NotebookIcon /> Enrollment Leads ({leads.length})
          </h2>
          <p className="text-sm text-muted-foreground">Manage and track student enrollment inquiries.</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 w-full sm:w-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="new">New</TabsTrigger>
          <TabsTrigger value="contacted">Contacted</TabsTrigger>
          <TabsTrigger value="enrolled">Enrolled</TabsTrigger>
          <TabsTrigger value="archived">Archived</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          {filteredLeads.length === 0 ? (
            <div className="text-center py-10 border rounded-lg border-dashed">
              <p className="text-muted-foreground">No leads found in this section.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLeads.map((lead) => (
                <Card key={lead.id} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback>{lead.childName?.[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-base">{lead.childName}</CardTitle>
                          <CardDescription className="text-xs">Parent: {lead.parentName}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={lead.status === 'enrolled' ? 'default' : 'outline'}>{lead.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs">
                    <div className="flex items-center gap-2"><Mail className="w-3 h-3 text-muted-foreground" /> {lead.email}</div>
                    <div className="flex items-center gap-2"><Phone className="w-3 h-3 text-muted-foreground" /> {lead.phone}</div>
                  </CardContent>
                  <CardFooter className="pt-2 flex justify-between">
                    <Select value={lead.status} onValueChange={(val) => handleStatusChange(lead.id, val as Lead['status'])}>
                      <SelectTrigger className="w-28 text-xs h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statusOptions.map(opt => (
                          <SelectItem key={opt} value={opt} className="text-xs">{opt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
