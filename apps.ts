
'use server';

/**
 * @fileoverview App Registry (The "Menu")
 * This file defines all user-facing applications as first-class objects.
 * The AI reasons over this registry to understand what it can open and for whom.
 * This is the core of the "GPT-style canvas" functionality.
 */

import { z } from 'zod';

// Defines the structure for a single application in the registry.
export const AppSchema = z.object({
  id: z.string().describe('The unique identifier for the app.'),
  title: z.string().describe('The human-readable title of the app.'),
  description: z.string().describe('A brief description of what the app does.'),
  route: z.string().describe('The internal route/URL to load the app.'),
  permissions: z.array(z.enum(['adult', 'kid', 'admin'])).describe('Which user roles can access this app.'),
  iframeSafe: z.boolean().default(false).describe('Whether this app is designed to be safely rendered within an iframe canvas.'),
});
export type App = z.infer<typeof AppSchema>;

// The canonical list of all applications in the Sovereign OS.
export const AppRegistry: Record<string, App> = {
  "work-helper": {
    id: "work-helper",
    title: "Work Helper",
    description: "A GPT-style chat interface for long-form thinking, coding, and memory recall.",
    route: "/adult-app/work-helper",
    permissions: ["adult", "admin"],
    iframeSafe: true,
  },
  "my-pebbles": {
    id: "my-pebbles",
    title: "My Pebbles",
    description: "The primary control surface for a user's personal AI, including identity, security, and voice configuration.",
    route: "/adult-app/my-adult-pebble",
    permissions: ["adult", "kid", "admin"],
    iframeSafe: true,
  },
  "family-clock": {
    id: "family-clock",
    title: "Family Clock",
    description: "The invisible OS node for the home. Manages ignition, power, journal sync, and wake/sleep cycles.",
    route: "/Family-Shared/clock-setting",
    permissions: ["adult", "admin"],
    iframeSafe: true,
  },
  "family-map": {
    id: "family-map",
    title: "Family Anchor Map",
    description: "The authority and ownership graph. Defines family members, devices, and their relationships.",
    route: "/shared-app/family-anchor-map",
    permissions: ["adult", "admin"],
    iframeSafe: true,
  },
  "family-chat": {
    id: "family-chat",
    title: "Family Chat",
    description: "A secure communication channel for all family members.",
    route: "/family-shared/family-chat",
    permissions: ["adult", "kid", "admin"],
    iframeSafe: true,
  }
};
