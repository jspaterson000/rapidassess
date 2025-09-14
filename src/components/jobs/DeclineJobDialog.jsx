import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Job } from '@/api/entities';
import { Loader2, X } from 'lucide-react';

export default function DeclineJobDialog({ open, onClose, job, onDeclineComplete }) {
  const [reason, setReason] = useState('');
  const [isDeclining, setIsDeclining] = useState(false);

  const handleDecline = async () => {
    setIsDeclining(true);
    try {
      await Job.update(job.id, { 
        assigned_to: null,
        status: 'new_job', // Reset to new job when declined
        time_assigned: null,
        decline_reason: reason || 'No reason provided',
        declined_date: new Date().toISOString()
      });
      onDeclineComplete();
      setReason('');
    } catch (error) {
      console.error("Error declining job:", error);
      alert("Failed to decline job.");
    } finally {
      setIsDeclining(false);
    }
  };
  
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <X className="w-5 h-5 text-red-500" />
            Decline Job Assignment
          </DialogTitle>
          <DialogDescription>
            Decline the assignment for claim {job.claim_number}. This will return the job to the unassigned pool.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="decline-reason">Reason for declining (optional)</Label>
            <Textarea
              id="decline-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Schedule conflict, outside expertise area..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isDeclining}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDecline} 
            disabled={isDeclining}
          >
            {isDeclining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Declining...
              </>
            ) : (
              <>
                <X className="w-4 h-4 mr-2" />
                Decline Job
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}