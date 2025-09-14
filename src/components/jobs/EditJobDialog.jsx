import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { PdsDocument } from "@/api/entities";

export default function EditJobDialog({ open, onClose, onSubmit, job }) {
  const [formData, setFormData] = useState({
    claim_number: '',
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    property_address: '',
    event_type: '',
    date_of_loss: '',
    priority: 'medium',
    status: 'unassigned',
    insurer: '',
    policy_number: '',
    notes: '',
    pds_document_id: ''
  });

  const [pdsDocs, setPdsDocs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open && job) {
      // Pre-populate form with job data
      setFormData({
        claim_number: job.claim_number || '',
        customer_name: job.customer_name || '',
        customer_phone: job.customer_phone || '',
        customer_email: job.customer_email || '',
        property_address: job.property_address || '',
        event_type: job.event_type || '',
        date_of_loss: job.date_of_loss || '',
        priority: job.priority || 'medium',
        status: job.status || 'unassigned',
        insurer: job.insurer || '',
        policy_number: job.policy_number || '',
        notes: job.notes || '',
        pds_document_id: job.pds_document_id || ''
      });

      const loadPds = async () => {
        try {
          const docs = await PdsDocument.list();
          setPdsDocs(docs);
        } catch (error) {
          console.error("Failed to load PDS documents:", error);
          setPdsDocs([]);
        }
      };
      loadPds();
    }
  }, [open, job]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-bold text-slate-800">
            Edit Job Details
          </DialogTitle>
          <DialogDescription>
            Update the job information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 px-6 pb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Claim Information */}
            <Card className="border-slate-200/90 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-slate-700 mb-2">Claim Information</h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="edit_claim_number">
                    Claim Number *
                  </Label>
                  <Input
                    id="edit_claim_number"
                    value={formData.claim_number}
                    onChange={(e) => handleChange('claim_number', e.target.value)}
                    placeholder="e.g., CLM-2024-001"
                    required
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_insurer">
                    Insurer
                  </Label>
                  <Input
                    id="edit_insurer"
                    value={formData.insurer}
                    onChange={(e) => handleChange('insurer', e.target.value)}
                    placeholder="e.g., Global Insurance Co"
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_policy_number">
                    Policy Number
                  </Label>
                  <Input
                    id="edit_policy_number"
                    value={formData.policy_number}
                    onChange={(e) => handleChange('policy_number', e.target.value)}
                    placeholder="e.g., POL-123456789"
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_pds_document_id">
                    PDS Document
                  </Label>
                  <Select
                    value={formData.pds_document_id}
                    onValueChange={(value) => handleChange('pds_document_id', value)}
                  >
                    <SelectTrigger className="bg-slate-50 w-full">
                      <SelectValue placeholder="Select PDS..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>None</SelectItem>
                      {pdsDocs.map(doc => (
                        <SelectItem key={doc.id} value={doc.id}>
                          {doc.name} ({doc.insurer} v{doc.version})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card className="border-slate-200/90 shadow-sm">
              <CardContent className="p-4 space-y-4">
                <h3 className="font-semibold text-slate-700 mb-2">Customer Information</h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="edit_customer_name">
                    Customer Name *
                  </Label>
                  <Input
                    id="edit_customer_name"
                    value={formData.customer_name}
                    onChange={(e) => handleChange('customer_name', e.target.value)}
                    placeholder="e.g., Sarah Johnson"
                    required
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_customer_phone">
                    Phone Number
                  </Label>
                  <Input
                    id="edit_customer_phone"
                    value={formData.customer_phone}
                    onChange={(e) => handleChange('customer_phone', e.target.value)}
                    placeholder="e.g., +61 412 345 678"
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_customer_email">
                    Email Address
                  </Label>
                  <Input
                    id="edit_customer_email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => handleChange('customer_email', e.target.value)}
                    placeholder="e.g., sarah.j@email.com"
                    className="bg-slate-50"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Property & Event Details */}
          <Card className="border-slate-200/90 shadow-sm">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold text-slate-700 mb-3">Property & Event Details</h3>
              
              <div className="space-y-1.5">
                <Label htmlFor="edit_property_address">
                  Property Address *
                </Label>
                <Input
                  id="edit_property_address"
                  value={formData.property_address}
                  onChange={(e) => handleChange('property_address', e.target.value)}
                  placeholder="e.g., 45 Ocean View Drive, Bondi Beach NSW 2026"
                  required
                  className="bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="edit_event_type">
                    Event Type *
                  </Label>
                  <Select
                    value={formData.event_type}
                    onValueChange={(value) => handleChange('event_type', value)}
                    required
                  >
                    <SelectTrigger className="bg-slate-50 w-full">
                      <SelectValue placeholder="Select type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="storm">Storm</SelectItem>
                      <SelectItem value="fire">Fire</SelectItem>
                      <SelectItem value="escape_of_liquid">Escape of Liquid</SelectItem>
                      <SelectItem value="impact">Impact</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_date_of_loss">
                    Date of Loss *
                  </Label>
                  <Input
                    id="edit_date_of_loss"
                    type="date"
                    value={formData.date_of_loss}
                    onChange={(e) => handleChange('date_of_loss', e.target.value)}
                    required
                    className="bg-slate-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_priority">
                    Priority
                  </Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange('priority', value)}
                  >
                    <SelectTrigger className="bg-slate-50 w-full">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit_status">
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange('status', value)}
                  >
                    <SelectTrigger className="bg-slate-50 w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
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
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="edit_notes">
                  Additional Notes
                </Label>
                <Textarea
                  id="edit_notes"
                  value={formData.notes}
                  onChange={(e) => handleChange('notes', e.target.value)}
                  placeholder="Any extra information about the claim..."
                  rows={3}
                  className="bg-slate-50 resize-y"
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-slate-800 hover:bg-slate-900 text-white"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}