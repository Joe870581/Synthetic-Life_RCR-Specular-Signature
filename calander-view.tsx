'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlusCircle, User } from 'lucide-react';
import type { CalendarEvent, User as UserType } from '@/lib/mock-data';
import { format } from 'date-fns';
import { useRole } from '@/contexts/role-context';
import EventForm from './event-form';

export default function CalendarView({
  initialEvents,
  users,
  role,
}: {
  initialEvents: CalendarEvent[];
  users: UserType[];
  role: 'adult' | 'kid' | 'admin';
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [isFormOpen, setFormOpen] = useState(false);

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent].sort((a,b) => a.start.getTime() - b.start.getTime()));
    setFormOpen(false);
  };

  const upcomingEvents = events
    .filter(event => event.start >= new Date())
    .slice(0, 5);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <Card>
          <CardContent className="p-2">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md"
              components={{
                DayContent: ({ date }) => {
                  const dayEvents = events.filter(
                    event => format(event.start, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  );
                  return (
                    <div className="relative h-full w-full">
                      <p>{date.getDate()}</p>
                      {dayEvents.length > 0 && (
                        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                          {dayEvents.slice(0, 2).map(e => (
                             <div key={e.id} className="w-1.5 h-1.5 rounded-full bg-primary" />
                          ))}
                        </div>
                      )}
                    </div>
                  );
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>What's next for the family.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map(event => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-bold">
                      {format(event.start, 'MMM')}
                    </p>
                    <p className="text-2xl font-bold text-primary">
                      {format(event.start, 'd')}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location}
                    </p>
                    <div className="flex -space-x-2 mt-1">
                      {event.participants.map(pId => {
                        const user = users.find(u => u.id === pId);
                        return (
                          <Avatar key={pId} className="w-6 h-6 border-2 border-background">
                            <AvatarImage src={user?.avatar} />
                            <AvatarFallback>{user?.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming events.</p>
            )}

            {role === 'adult' && (
               <Dialog open={isFormOpen} onOpenChange={setFormOpen}>
                <DialogTrigger asChild>
                  <Button className="w-full mt-4">
                    <PlusCircle className="mr-2 size-4" />
                    Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                  </DialogHeader>
                  <EventForm onEventAdd={handleAddEvent} />
                </DialogContent>
              </Dialog>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
