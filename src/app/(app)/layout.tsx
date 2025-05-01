'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation'; // Import usePathname
import {
    Sidebar,
    SidebarContent,
    SidebarHeader,
    SidebarFooter,
    SidebarInset,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarProvider,
    SidebarTrigger,
} from '@/components/ui/sidebar';
import { HomeIcon, BarChart3, Landmark, Handshake, User, Settings, Link2, FileText, MessageSquare, HammerIcon } from 'lucide-react'; // Added HammerIcon, though we'll use SVG
import Link from 'next/link'; // Import Link for navigation

// Inline SVG Logo Component
const DebtCrusherLogo = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    xmlns="http://www.w3.org/2000/svg"
    className="text-primary" // Use primary color (green)
  >
    {/* Hammer */}
    <path d="M14.5 8.5L18 5l3 3-3.5 3.5" />
    <path d="M12 10l-1.5 1.5a4.24 4.24 0 0 0 0 6l4 4a4.24 4.24 0 0 0 6 0l1.5-1.5" />
    <path d="M4 14l-1.5 1.5a4.24 4.24 0 0 0 0 6l4 4a4.24 4.24 0 0 0 6 0l1.5-1.5" />
    <path d="M16 12l2 2" />

    {/* Broken Link */}
    <path d="M9.88 14.12a3 3 0 1 0-4.24 4.24l1.41-1.41" />
    <path d="M14.12 9.88a3 3 0 1 0-4.24-4.24l1.41 1.41" />
    {/* Break effect */}
     <path d="M11 13l-1 1" />
     <path d="M13 11l1-1" />
     {/* Optional sparks for breaking effect */}
      <path d="m8.5 15.5 1-1"/>
      <path d="m15.5 8.5-1 1"/>

  </svg>
);


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname(); // Get the current path

  // Helper function to determine if a path is active
  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar remains the same as before, but links are now dynamic */}
        <Sidebar variant="sidebar" collapsible="icon" className="border-r border-border/50">
          <SidebarHeader>
            {/* Updated logo */}
            <Link href="/" className="flex items-center gap-2 p-2 text-lg font-semibold text-primary hover:no-underline">
                 <DebtCrusherLogo />
                 <span className="group-data-[collapsible=icon]:hidden">DebtCrusher</span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {/* Use Link for navigation and check isActive state */}
              <SidebarMenuItem>
                 <Link href="/" legacyBehavior passHref>
                    <SidebarMenuButton tooltip="Dashboard" isActive={isActive('/')}>
                      <HomeIcon /> <span className="group-data-[collapsible=icon]:hidden">Dashboard</span>
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <Link href="/reports" legacyBehavior passHref>
                    <SidebarMenuButton tooltip="Reports" isActive={isActive('/reports')}>
                       <BarChart3 /> <span className="group-data-[collapsible=icon]:hidden">Reports</span>
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                 <Link href="/negotiation" legacyBehavior passHref>
                    <SidebarMenuButton tooltip="Negotiation Help" isActive={isActive('/negotiation')}>
                       <Handshake /> <span className="group-data-[collapsible=icon]:hidden">Negotiation</span>
                    </SidebarMenuButton>
                 </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="User Profile">
                    <User /> <span className="group-data-[collapsible=icon]:hidden">Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton tooltip="Settings">
                    <Settings /> <span className="group-data-[collapsible=icon]:hidden">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* The main content area, wrapped by SidebarInset */}
        <SidebarInset className="flex-1 overflow-y-auto">
            {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

