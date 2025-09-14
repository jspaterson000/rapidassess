
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function JobFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    eventType: 'all'
  });

  const handleFilterChangeInternal = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      status: 'all',
      priority: 'all',
      eventType: 'all'
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-white border-slate-200/90 relative">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" >
        <div className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-slate-800">Filter Jobs</h3>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-slate-600 hover:text-slate-800"
              >
                <X className="w-4 h-4 mr-1" />
                Clear
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChangeInternal('status', value)}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="new_job">New Job</SelectItem>
                  <SelectItem value="awaiting_booking">Awaiting Booking</SelectItem>
                  <SelectItem value="awaiting_attendance">Awaiting Attendance</SelectItem>
                  <SelectItem value="assessed">Assessed</SelectItem>
                  <SelectItem value="pending_completion">Pending Completion</SelectItem>
                  <SelectItem value="awaiting_insurer">Awaiting Insurer</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on_hold">On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Priority</label>
              <Select value={filters.priority} onValueChange={(value) => handleFilterChangeInternal('priority', value)}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-600">Event Type</label>
              <Select value={filters.eventType} onValueChange={(value) => handleFilterChangeInternal('eventType', value)}>
                <SelectTrigger className="w-full bg-slate-50 border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Event Types</SelectItem>
                  <SelectItem value="storm">Storm</SelectItem>
                  <SelectItem value="fire">Fire</SelectItem>
                  <SelectItem value="escape_of_liquid">Escape of Liquid</SelectItem>
                  <SelectItem value="impact">Impact</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
