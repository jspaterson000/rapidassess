import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Job } from '@/api/entities';
import { Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
const minutes = ['00', '15', '30', '45'];

export default function BookAppointmentDialog({ open, onClose, job, onBookingComplete }) {
  const [date, setDate] = useState(null);
  const [hour, setHour] = useState('09');
  const [minute, setMinute] = useState('00');
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (job?.appointment_date) {
      const apptDate = new Date(job.appointment_date);
      setDate(apptDate);
      setHour(apptDate.getHours().toString().padStart(2, '0'));
      setMinute(apptDate.getMinutes().toString().padStart(2, '0'));
    } else {
      setDate(new Date());
    }
  }, [job]);

  const handleBooking = async () => {
    if (!date) return;
    setIsBooking(true);
    try {
      const appointmentDate = new Date(date);
      appointmentDate.setHours(parseInt(hour, 10));
      appointmentDate.setMinutes(parseInt(minute, 10));
      
      await Job.update(job.id, { 
        appointment_date: appointmentDate.toISOString(),
        status: 'awaiting_attendance' // Always set to awaiting_attendance when appointment is booked
      });
      onBookingComplete();
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment.");
    } finally {
      setIsBooking(false);
    }
  };
  
  if (!job) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <style>
        {`
          @keyframes dialogSlideIn {
            from {
              opacity: 0;
              transform: translate(-50%, -48%) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes dialogSlideOut {
            from {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
            to {
              opacity: 0;
              transform: translate(-50%, -48%) scale(0.95);
            }
          }

          @keyframes overlayFadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes overlayFadeOut {
            from {
              opacity: 1;
            }
            to {
              opacity: 0;
            }
          }

          @keyframes buttonPulse {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
          }

          .dialog-animate-in {
            animation: dialogSlideIn 0.2s ease-out;
          }

          .dialog-animate-out {
            animation: dialogSlideOut 0.15s ease-in;
          }

          .overlay-animate-in {
            animation: overlayFadeIn 0.2s ease-out;
          }

          .overlay-animate-out {
            animation: overlayFadeOut 0.15s ease-in;
          }

          .confirm-button:hover {
            animation: buttonPulse 0.3s ease-in-out;
          }

          .time-selector {
            transition: all 0.15s ease-out;
          }

          .time-selector:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .date-preview {
            transition: all 0.2s ease-out;
          }

          .date-preview.updating {
            transform: scale(1.05);
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
          }
        `}
      </style>
      <DialogContent className="sm:max-w-2xl dialog-animate-in">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <CalendarIcon className="w-6 h-6 text-slate-600" />
            Book Appointment
          </DialogTitle>
          <DialogDescription className="text-slate-600">
            Schedule an assessment for claim {job.claim_number}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
          {/* Calendar Section */}
          <div className="lg:col-span-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
              classNames={{
                day_selected: "bg-slate-800 text-white hover:bg-slate-700",
                day_today: "bg-slate-100 text-slate-900",
                day: "hover:bg-slate-50 transition-colors"
              }}
            />
          </div>
          
          {/* Time Section */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-slate-800 mb-4 text-lg">Time</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Select value={hour} onValueChange={setHour}>
                    <SelectTrigger className="time-selector flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {hours.map(h => (
                        <SelectItem key={h} value={h}>{h}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span className="text-slate-500 font-medium">:</span>
                  <Select value={minute} onValueChange={setMinute}>
                    <SelectTrigger className="time-selector flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {minutes.map(m => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Booking Preview */}
            {date && (
              <div className={`date-preview p-4 bg-slate-50 rounded-lg border border-slate-200 ${
                date ? 'updating' : ''
              }`}>
                <p className="text-sm text-slate-600 mb-2">Booking for:</p>
                <p className="font-semibold text-slate-800 text-lg">
                  {format(new Date(date.setHours(parseInt(hour), parseInt(minute))), 'EEEE, MMMM do, yyyy')}
                </p>
                <p className="text-slate-600 text-base">
                  {format(new Date(date.setHours(parseInt(hour), parseInt(minute))), 'h:mm a')}
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-6 border-t border-slate-100">
          <div className="flex gap-3 w-full sm:w-auto">
            <Button 
              variant="outline" 
              onClick={onClose} 
              disabled={isBooking}
              className="flex-1 sm:flex-none transition-all hover:bg-slate-50"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleBooking} 
              disabled={isBooking || !date}
              className="confirm-button flex-1 sm:flex-none bg-slate-800 hover:bg-slate-900 text-white transition-all"
            >
              {isBooking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Booking...
                </>
              ) : (
                <>
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {job.appointment_date ? 'Update Booking' : 'Confirm Booking'}
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}