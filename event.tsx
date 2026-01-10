'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sparkles } from 'lucide-react';
import { generateCalendarEventDetails } from '@/ai/flows/generate-calendar-event-details';
import type { CalendarEvent } from '@/lib/mock-data';

const formSchema = z.object({
  prompt: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  location: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
});

type EventFormValues = z.infer<typeof formSchema>;

export default function EventForm({ onEventAdd }: { onEventAdd: (event: CalendarEvent) => void }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      title: '',
      description: '',
      location: '',
      startTime: '',
      endTime: '',
    },
  });

  const handleGenerate = async () => {
    const prompt = form.getValues('prompt');
    if (!prompt) {
      toast({
        title: 'Prompt is empty',
        description: 'Please enter a prompt to generate event details.',
        variant: 'destructive',
      });
      return;
    }
    setIsGenerating(true);
    try {
      const result = await generateCalendarEventDetails({ prompt });
      form.setValue('title', result.title);
      form.setValue('description', result.description);
      form.setValue('location', result.location);
      
      const now = new Date();
      // This is a rough parsing, in a real app this would be more robust
      const tryParseTime = (timeStr: string, baseDate: Date) => {
        const parsed = new Date(`${baseDate.toDateString()} ${timeStr}`);
        return isNaN(parsed.getTime()) ? baseDate : parsed;
      }
      const start = tryParseTime(result.startTime, now);
      const end = tryParseTime(result.endTime, start);

      form.setValue('startTime', start.toISOString().substring(0, 16));
      form.setValue('endTime', end.toISOString().substring(0, 16));
      
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error Generating Details',
        description: 'Could not generate event details from the prompt.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: EventFormValues) => {
    const newEvent: CalendarEvent = {
        id: `evt-${Date.now()}`,
        title: data.title,
        description: data.description || '',
        location: data.location || '',
        start: new Date(data.startTime),
        end: new Date(data.endTime),
        participants: [], // In a real app, we would add a participant selector
        visibility: ['adult', 'kid'] // Default visibility
    }
    onEventAdd(newEvent);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>AI Prompt</FormLabel>
              <div className="flex gap-2">
                <FormControl>
                  <Input placeholder="e.g., 'Mia's birthday party next Saturday at 2pm'" {...field} />
                </FormControl>
                <Button type="button" onClick={handleGenerate} disabled={isGenerating}>
                  <Sparkles className="mr-2 size-4" />
                  {isGenerating ? 'Generating...' : 'Generate'}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full">
          Add Event
        </Button>
      </form>
    </Form>
  );
}
