import React, { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, Clock, MapPin } from 'lucide-react'
import { format, isSameDay, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

export default function EnhancedCalendar({ 
  appointments = [], 
  onDateSelect, 
  onAppointmentClick,
  selectedDate,
  className 
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [view, setView] = useState('month') // 'month', 'week', 'day'

  const getAppointmentsForDate = (date) => {
    return appointments.filter(apt => isSameDay(new Date(apt.appointment_date), date))
  }

  const getDayContent = (date) => {
    const dayAppointments = getAppointmentsForDate(date)
    if (dayAppointments.length === 0) return null

    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center">
        <div className="flex gap-1">
          {dayAppointments.slice(0, 3).map((apt, index) => (
            <div
              key={index}
              className={`w-1.5 h-1.5 rounded-full ${
                apt.priority === 'urgent' ? 'bg-red-500' :
                apt.priority === 'high' ? 'bg-orange-500' :
                apt.priority === 'medium' ? 'bg-yellow-500' :
                'bg-blue-500'
              }`}
            />
          ))}
          {dayAppointments.length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
          )}
        </div>
      </div>
    )
  }

  const WeekView = () => {
    const weekStart = startOfWeek(currentMonth)
    const weekEnd = endOfWeek(currentMonth)
    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd })

    return (
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayAppointments = getAppointmentsForDate(day)
          return (
            <div key={day.toISOString()} className="min-h-32 p-2 border rounded-lg">
              <div className="font-semibold text-sm mb-2">
                {format(day, 'EEE d')}
              </div>
              <div className="space-y-1">
                {dayAppointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick?.(apt)}
                    className="p-1 text-xs bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200"
                  >
                    <div className="font-medium truncate">{apt.claim_number}</div>
                    <div className="text-xs opacity-75">
                      {format(new Date(apt.appointment_date), 'HH:mm')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const DayView = () => {
    const dayAppointments = getAppointmentsForDate(selectedDate || currentMonth)
    const hours = Array.from({ length: 24 }, (_, i) => i)

    return (
      <div className="space-y-2">
        {hours.map(hour => {
          const hourAppointments = dayAppointments.filter(apt => {
            const aptHour = new Date(apt.appointment_date).getHours()
            return aptHour === hour
          })

          return (
            <div key={hour} className="flex gap-4 min-h-12 border-b border-slate-100">
              <div className="w-16 text-sm text-slate-500 pt-2">
                {format(new Date().setHours(hour, 0), 'HH:mm')}
              </div>
              <div className="flex-1 space-y-1">
                {hourAppointments.map(apt => (
                  <div
                    key={apt.id}
                    onClick={() => onAppointmentClick?.(apt)}
                    className="p-2 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100"
                  >
                    <div className="font-medium text-sm">{apt.claim_number}</div>
                    <div className="text-xs text-slate-600 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {format(new Date(apt.appointment_date), 'HH:mm')}
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{apt.property_address}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <Card className={`w-full ${className || ''}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Schedule Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 p-1">
              <Button
                variant={view === 'month' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('month')}
              >
                Month
              </Button>
              <Button
                variant={view === 'week' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('week')}
              >
                Week
              </Button>
              <Button
                variant={view === 'day' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setView('day')}
              >
                Day
              </Button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {view === 'month' && (
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
            components={{
              DayContent: ({ date }) => (
                <div className="relative w-full h-full">
                  <span>{date.getDate()}</span>
                  {getDayContent(date)}
                </div>
              )
            }}
            className="w-full [&_.rdp-table]:w-full [&_.rdp-head_row]:grid [&_.rdp-head_row]:grid-cols-7 [&_.rdp-row]:grid [&_.rdp-row]:grid-cols-7 [&_.rdp-cell]:aspect-square [&_.rdp-cell]:flex [&_.rdp-cell]:items-center [&_.rdp-cell]:justify-center"
          />
        )}
        {view === 'week' && <WeekView />}
        {view === 'day' && <DayView />}
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-red-500 rounded-full" />
            <span>Urgent</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Low</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}