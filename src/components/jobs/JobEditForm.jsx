
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save } from 'lucide-react';
import { PdsDocument } from '@/api/entities';
import { User } from '@/api/entities';

export default function JobEditForm({ job, onSave, onCancel }) {
    const [formData, setFormData] = useState({ ...job });
    const [pdsDocs, setPdsDocs] = useState([]);
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const loadAuxData = async () => {
            const [pdsData, usersData] = await Promise.all([
                PdsDocument.list(),
                User.list()
            ]);
            setPdsDocs(pdsData);
            setUsers(usersData.filter(u => ['user', 'manager'].includes(u.user_role)));
        };
        loadAuxData();
    }, []); // Remove unnecessary dependencies

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Main Job Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Editing Claim #{job.claim_number}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="claim_number">Claim Number</Label>
                                    <Input id="claim_number" value={formData.claim_number} onChange={e => handleChange('claim_number', e.target.value)} />
                                </div>
                                <div>
                                    <Label htmlFor="date_of_loss">Date of Loss</Label>
                                    <Input id="date_of_loss" type="date" value={formData.date_of_loss.split('T')[0]} onChange={e => handleChange('date_of_loss', e.target.value)} />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="notes">Notes</Label>
                                <Textarea id="notes" value={formData.notes} onChange={e => handleChange('notes', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Information */}
                    <Card>
                        <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
                        <CardContent className="grid md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="customer_name">Customer Name</Label>
                                <Input id="customer_name" value={formData.customer_name} onChange={e => handleChange('customer_name', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="property_address">Property Address</Label>
                                <Input id="property_address" value={formData.property_address} onChange={e => handleChange('property_address', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="customer_phone">Customer Phone</Label>
                                <Input id="customer_phone" value={formData.customer_phone} onChange={e => handleChange('customer_phone', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="customer_email">Customer Email</Label>
                                <Input id="customer_email" type="email" value={formData.customer_email} onChange={e => handleChange('customer_email', e.target.value)} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Side Panel */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader><CardTitle>Assignment & Priority</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={v => handleChange('status', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unassigned">Unassigned</SelectItem>
                                        <SelectItem value="assigned">Assigned</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="assessment_complete">Assessment Complete</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="on_hold">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label>Priority</Label>
                                <Select value={formData.priority} onValueChange={v => handleChange('priority', v)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                        <SelectItem value="urgent">Urgent</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                             <div>
                                <Label>Assigned Assessor</Label>
                                <Select value={formData.assigned_to || ''} onValueChange={v => handleChange('assigned_to', v)}>
                                    <SelectTrigger><SelectValue placeholder="Assign an assessor..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>None</SelectItem>
                                        {users.map(user => (
                                            <SelectItem key={user.id} value={user.id}>{user.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader><CardTitle>Insurance Details</CardTitle></CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="insurer">Insurer</Label>
                                <Input id="insurer" value={formData.insurer} onChange={e => handleChange('insurer', e.target.value)} />
                            </div>
                            <div>
                                <Label htmlFor="policy_number">Policy Number</Label>
                                <Input id="policy_number" value={formData.policy_number} onChange={e => handleChange('policy_number', e.target.value)} />
                            </div>
                            <div>
                                <Label>PDS Document</Label>
                                <Select value={formData.pds_document_id || ''} onValueChange={v => handleChange('pds_document_id', v)}>
                                    <SelectTrigger><SelectValue placeholder="Select PDS..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={null}>None</SelectItem>
                                        {pdsDocs.map(doc => (
                                            <SelectItem key={doc.id} value={doc.id}>{doc.name} (v{doc.version})</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit">
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
