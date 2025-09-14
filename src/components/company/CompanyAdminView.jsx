
import React, { useState, useEffect } from 'react';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, UserPlus, Users, Shield, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import CompanyAnalytics from './CompanyAnalytics';

export default function CompanyAdminView({ user }) {
  const [company, setCompany] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userInputs, setUserInputs] = useState({}); // Local state for input values

  useEffect(() => {
    const loadData = async () => {
      try {
        if (user.company_id) {
          const [companyData, usersData] = await Promise.all([
            Company.get(user.company_id),
            User.filter({ company_id: user.company_id })
          ]);
          setCompany(companyData);
          setUsers(usersData);
          
          // Initialize local input state
          const inputs = {};
          usersData.forEach(u => {
            inputs[u.id] = {
              base_location: u.base_location || '',
              work_start_time: u.work_start_time || '08:00',
              work_end_time: u.work_end_time || '17:00'
            };
          });
          setUserInputs(inputs);
        }
      } catch (error) {
        console.error("Error loading company data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.company_id]);

  const handleCompanyChange = (field, value) => {
    setCompany(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveChanges = async () => {
    if (!company) return;
    setIsSaving(true);
    try {
      await Company.update(company.id, {
        company_name: company.company_name,
        abn: company.abn,
        address: company.address,
        phone: company.phone,
        email: company.email,
        job_reminder_threshold_hours: company.job_reminder_threshold_hours,
        assessment_overdue_threshold_hours: company.assessment_overdue_threshold_hours,
        max_assessments_per_day: company.max_assessments_per_day,
        break_time_minutes: company.break_time_minutes,
      });
      alert("Company details saved!");
    } catch (error) {
      console.error("Error saving company details:", error);
      alert("Failed to save company details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUserInputChange = (userId, field, value) => {
    setUserInputs(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value
      }
    }));
  };

  const handleUserInputBlur = async (userId, field, value) => {
    try {
      await User.update(userId, { [field]: value });
      // Update the users state to reflect the saved change
      setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Failed to update user ${field}.`);
      // Revert the input to the original value on error
      setUserInputs(prev => ({
        ...prev,
        [userId]: {
          ...prev[userId],
          [field]: users.find(u => u.id === userId)?.[field] || ''
        }
      }));
    }
  };

  const handleUserUpdate = async (userId, field, value) => {
    try {
      await User.update(userId, { [field]: value });
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
    } catch (error) {
      console.error("Error updating user:", error);
      alert(`Failed to update user ${field}.`);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;
  }
  
  if (!company) {
    return <p>Company not found. Please contact support.</p>
  }

  return (
    <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analytics"><TrendingUp className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
            <TabsTrigger value="details">Company Details</TabsTrigger>
            <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />User Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="analytics" className="mt-6">
            <CompanyAnalytics user={user} companyFilter={user.company_id} />
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle>Your Company Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="company_name">Company Name</Label>
                            <Input id="company_name" value={company.company_name || ''} onChange={e => handleCompanyChange('company_name', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="abn">ABN</Label>
                            <Input id="abn" value={company.abn || ''} onChange={e => handleCompanyChange('abn', e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="address">Address</Label>
                        <Input id="address" value={company.address || ''} onChange={e => handleCompanyChange('address', e.target.value)} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" value={company.phone || ''} onChange={e => handleCompanyChange('phone', e.target.value)} />
                        </div>
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={company.email || ''} onChange={e => handleCompanyChange('email', e.target.value)} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="job_reminder_threshold_hours">Job Reminder Threshold (hours)</Label>
                            <Input 
                              id="job_reminder_threshold_hours" 
                              type="number" 
                              value={company.job_reminder_threshold_hours || ''} 
                              placeholder="e.g., 24"
                              onChange={e => handleCompanyChange('job_reminder_threshold_hours', e.target.value ? parseInt(e.target.value, 10) : null)} 
                            />
                             <p className="text-sm text-slate-500 mt-1">Set how many hours after assignment a reminder appears on the dashboard.</p>
                        </div>
                        <div>
                            <Label htmlFor="assessment_overdue_threshold_hours">Assessment Overdue Threshold (hours)</Label>
                            <Input 
                              id="assessment_overdue_threshold_hours" 
                              type="number" 
                              value={company.assessment_overdue_threshold_hours || ''} 
                              placeholder="e.g., 48"
                              onChange={e => handleCompanyChange('assessment_overdue_threshold_hours', e.target.value ? parseInt(e.target.value, 10) : null)} 
                            />
                            <p className="text-sm text-slate-500 mt-1">Hours after a booking time that an assessment is considered overdue.</p>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="max_assessments_per_day">Max Assessments per Day</Label>
                            <Input 
                              id="max_assessments_per_day" 
                              type="number" 
                              value={company.max_assessments_per_day || ''} 
                              placeholder="e.g., 4"
                              onChange={e => handleCompanyChange('max_assessments_per_day', e.target.value ? parseInt(e.target.value, 10) : null)} 
                            />
                             <p className="text-sm text-slate-500 mt-1">Maximum number of assessments an assessor can do in one day.</p>
                        </div>
                        <div>
                            <Label htmlFor="break_time_minutes">Post-Assessment Break (minutes)</Label>
                            <Input 
                              id="break_time_minutes" 
                              type="number" 
                              value={company.break_time_minutes || ''} 
                              placeholder="e.g., 30"
                              onChange={e => handleCompanyChange('break_time_minutes', e.target.value ? parseInt(e.target.value, 10) : null)} 
                            />
                            <p className="text-sm text-slate-500 mt-1">Mandatory break time for assessors after each assessment.</p>
                        </div>
                    </div>
                </CardContent>
                <CardContent>
                    <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2"/> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </CardContent>
            </Card>
        </TabsContent>
        
        <TabsContent value="users" className="mt-4">
            <Card>
                <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                        <span>Users ({users.length})</span>
                        <Button size="sm"><UserPlus className="w-4 h-4 mr-2" />Invite User</Button>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        {users.map(u => (
                            <div key={u.id} className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center p-4 bg-slate-50 rounded-lg">
                                <div className="lg:col-span-1">
                                    <p className="font-medium text-slate-800">{u.full_name}</p>
                                    <p className="text-sm text-slate-500">{u.email}</p>
                                </div>
                                <div className="lg:col-span-1">
                                    <Select
                                        value={u.user_role || 'user'}
                                        onValueChange={(value) => handleUserUpdate(u.id, 'user_role', value)}
                                    >
                                        <SelectTrigger className="bg-white text-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="company_admin">Company Admin</SelectItem>
                                            <SelectItem value="manager">Manager</SelectItem>
                                            <SelectItem value="user">Standard User</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="lg:col-span-1">
                                    <Input
                                        placeholder="Base location"
                                        value={userInputs[u.id]?.base_location || ''}
                                        onChange={(e) => handleUserInputChange(u.id, 'base_location', e.target.value)}
                                        onBlur={(e) => handleUserInputBlur(u.id, 'base_location', e.target.value)}
                                        className="bg-white text-sm"
                                    />
                                    <p className="text-xs text-slate-400 mt-1">For travel calculations</p>
                                </div>
                                <div className="lg:col-span-1 flex gap-2">
                                    <Input
                                        placeholder="09:00"
                                        value={userInputs[u.id]?.work_start_time || ''}
                                        onChange={(e) => handleUserInputChange(u.id, 'work_start_time', e.target.value)}
                                        onBlur={(e) => handleUserInputBlur(u.id, 'work_start_time', e.target.value)}
                                        className="bg-white text-sm"
                                    />
                                    <Input
                                        placeholder="17:00"
                                        value={userInputs[u.id]?.work_end_time || ''}
                                        onChange={(e) => handleUserInputChange(u.id, 'work_end_time', e.target.value)}
                                        onBlur={(e) => handleUserInputBlur(u.id, 'work_end_time', e.target.value)}
                                        className="bg-white text-sm"
                                    />
                                </div>
                                <div className="lg:col-span-1 flex items-center justify-center">
                                    <div className="flex items-center space-x-2">
                                        <Switch
                                            id={`assessor-${u.id}`}
                                            checked={u.is_assessor || false}
                                            onCheckedChange={(checked) => handleUserUpdate(u.id, 'is_assessor', checked)}
                                        />
                                        <Label htmlFor={`assessor-${u.id}`} className="flex items-center gap-1 text-sm">
                                            <Shield className="w-3 h-3 text-green-600" />
                                            Assessor
                                        </Label>
                                    </div>
                                </div>
                                <div className="lg:col-span-1 text-sm text-slate-500">
                                    {u.is_assessor && (
                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                            <Shield className="w-3 h-3" />
                                            Can assess
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </TabsContent>
    </Tabs>
  );
}
