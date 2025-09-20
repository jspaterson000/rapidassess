
import React, { useState, useEffect } from 'react';
import { Company } from '@/api/entities';
import { User } from '@/api/entities';
import { PdsDocument } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadPrivateFile, CreateFileSignedUrl } from '@/api/integrations';
import {
  File,
  UploadCloud,
  Download,
  Plus,
  Building,
  FileText,
  Users,
  Search,
  Shield, // New import for Assessor icon
  TrendingUp // New import for Analytics icon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from '@/components/ui/switch'; // New import for Assessor privilege
import { Label } from '@/components/ui/label'; // New import for Assessor privilege label
import CompanyAnalytics from './CompanyAnalytics'; // New import for CompanyAnalytics component


function PdsUploadForm({ onUploadComplete }) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_uri } = await UploadPrivateFile({ file });

      // For now, let's use prompt to get metadata. A form would be better.
      const insurer = prompt("Enter insurer name for this PDS:", "Default Insurer");
      const version = prompt("Enter PDS version:", "1.0");

      if (insurer && version) {
        await PdsDocument.create({
          name: file.name,
          insurer,
          version,
          effective_date: new Date().toISOString().split('T')[0],
          file_uri,
        });
        onUploadComplete();
      }
    } catch (error) {
      console.error("Error uploading PDS:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-slate-50 border-dashed">
      <CardContent className="p-6 text-center">
        <label htmlFor="pds-upload" className="cursor-pointer">
          <UploadCloud className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-2 text-sm font-medium text-slate-900">
            {isUploading ? 'Uploading...' : 'Upload a PDS document'}
          </h3>
          <p className="mt-1 text-xs text-slate-500">PDF, DOCX up to 20MB</p>
          <input id="pds-upload" type="file" className="sr-only" onChange={handleFileChange} disabled={isUploading} />
        </label>
      </CardContent>
    </Card>
  );
}

function UserManagement({ companies }) {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const usersData = await User.list();
      // Filter out any invalid user records
      const validUsers = usersData.filter(user =>
        user && user.id && user.full_name && user.email
      );
      setUsers(validUsers);
      setFilteredUsers(validUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  useEffect(() => {
    const lowercasedTerm = searchTerm.toLowerCase();
    const filtered = users.filter(u => {
      const fullName = u.full_name || '';
      const email = u.email || '';
      return fullName.toLowerCase().includes(lowercasedTerm) ||
             email.toLowerCase().includes(lowercasedTerm);
    });
    setFilteredUsers(filtered);
  }, [searchTerm, users]);

  const handleUserUpdate = async (userId, field, value) => {
    try {
      console.log(`Updating user ${userId} field ${field} to:`, value);
      await User.update(userId, { [field]: value });
      // Optimistically update UI
      setUsers(users.map(u => u.id === userId ? { ...u, [field]: value } : u));
      console.log("User updated successfully");
    } catch (error) {
      console.error(`Failed to update user ${userId}:`, error);
      alert('Failed to update user.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Users ({filteredUsers.length})</CardTitle>
        <div className="relative pt-2">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200/90"
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {filteredUsers.map(user => (
            <div key={user.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center p-3 bg-slate-50 rounded-lg">
              <div className="md:col-span-1">
                <p className="font-medium text-slate-800 truncate">{user.full_name || 'Unknown Name'}</p>
                <p className="text-sm text-slate-500 truncate">{user.email || 'No Email'}</p>
              </div>
              <div className="md:col-span-1">
                <Select
                  value={user.user_role || 'user'}
                  onValueChange={(value) => handleUserUpdate(user.id, 'user_role', value)}
                >
                  <SelectTrigger className="bg-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="platform_admin">Platform Admin</SelectItem>
                    <SelectItem value="company_admin">Company Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="user">Standard User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1">
                <Select
                  value={user.company_id || ''}
                  onValueChange={(value) => handleUserUpdate(user.id, 'company_id', value)}
                >
                  <SelectTrigger className="bg-white text-sm">
                    <SelectValue placeholder="Assign company..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={null}>No Company</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.company_name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-1 flex items-center justify-center">
                <div className="flex items-center space-x-2">
                  <Switch
                    id={`assessor-${user.id}`}
                    checked={user.is_assessor || false}
                    onCheckedChange={(checked) => handleUserUpdate(user.id, 'is_assessor', checked)}
                  />
                  <Label htmlFor={`assessor-${user.id}`} className="flex items-center gap-1 text-sm">
                    <Shield className="w-3 h-3 text-green-600" />
                    Assessor
                  </Label>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


export default function PlatformAdminView({ user }) {
  const [companies, setCompanies] = useState([]);
  const [pdsDocs, setPdsDocs] = useState([]);

  const loadData = async () => {
    const [companiesData, pdsData] = await Promise.all([
      Company.list(),
      PdsDocument.list('-created_date')
    ]);
    setCompanies(companiesData);
    setPdsDocs(pdsData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDownloadPds = async (doc) => {
    try {
      const { signed_url } = await CreateFileSignedUrl({ file_uri: doc.file_uri });
      window.open(signed_url, '_blank');
    } catch (error) {
      console.error("Error creating signed URL", error);
      alert("Could not download file.");
    }
  };

  return (
    <Tabs defaultValue="analytics" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="analytics"><TrendingUp className="w-4 h-4 mr-2" />Analytics</TabsTrigger>
        <TabsTrigger value="companies"><Building className="w-4 h-4 mr-2" />Companies</TabsTrigger>
        <TabsTrigger value="pds"><FileText className="w-4 h-4 mr-2" />PDS Documents</TabsTrigger>
        <TabsTrigger value="users"><Users className="w-4 h-4 mr-2" />Users</TabsTrigger>
      </TabsList>

      <TabsContent value="analytics" className="mt-6">
        <CompanyAnalytics user={user} />
      </TabsContent>

      <TabsContent value="companies" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>All Companies ({companies.length})</span>
              <Button size="sm"><Plus className="w-4 h-4 mr-2" />Add Company</Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {companies.map(company => (
                <div key={company.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-800">{company.company_name}</p>
                    <p className="text-sm text-slate-500">{company.email}</p>
                  </div>
                  <Button variant="ghost" size="sm">Manage</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="pds" className="mt-4">
        <div className="grid gap-6">
          <PdsUploadForm onUploadComplete={loadData} />
          <Card>
            <CardHeader>
              <CardTitle>Uploaded PDS Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {pdsDocs.map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <File className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="font-medium text-slate-800">{doc.name}</p>
                        <p className="text-sm text-slate-500">{doc.insurer} - v{doc.version}</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handleDownloadPds(doc)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="users" className="mt-4">
        <UserManagement companies={companies} />
      </TabsContent>
    </Tabs>
  );
}
