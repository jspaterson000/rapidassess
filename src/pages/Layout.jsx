

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  Home, 
  Briefcase, 
  ClipboardCheck, 
  FileText, 
  Building2, 
  Users, 
  Settings,
  Menu,
  X,
  Repeat,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import NotificationBell from "../components/layout/NotificationBell";


const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: Home,
  },
  {
    title: "Jobs",
    url: createPageUrl("Jobs"),
    icon: Briefcase,
  },
  // Assessments item is removed as per the request
  {
    title: "Manage Team",
    url: createPageUrl("ManageTeam"),
    icon: Users,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FileText,
  },
  {
    title: "Company",
    url: createPageUrl("Company"),
    icon: Building2,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        setUser(null);
      }
    };
    fetchUser();
  }, [location]);

  const handleRoleSwitch = async (newRole) => {
    if (!user) return;
    try {
      await User.updateMyUserData({ user_role: newRole });
      window.location.reload();
    } catch (error) {
      console.error("Failed to switch role:", error);
    }
  };

  const UserProfile = () => {
    if (!user) {
      return (
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-9 h-9 bg-slate-200 rounded-full animate-pulse"></div>
          <div className="flex-1 min-w-0">
            <div className="h-4 bg-slate-200 rounded w-2/3 animate-pulse"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2 mt-1 animate-pulse"></div>
          </div>
        </div>
      );
    }

    // Show role switcher for demo purposes - check if user has platform admin capabilities
    // This allows switching between roles for demonstration
    const showRoleSwitcher = user.user_role === 'platform_admin' || user.email === 'jacob.paterson000@gmail.com';

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-3 p-2 rounded-lg">
          <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-500 font-medium text-sm">
              {user.full_name ? user.full_name.charAt(0).toUpperCase() : '?'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-slate-700 text-sm truncate">{user.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
          <NotificationBell />
        </div>
        {showRoleSwitcher && (
          <div className="px-2">
            <label className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1">
              <Repeat className="w-3 h-3"/> Demo Role Switch
            </label>
            <Select value={user.user_role} onValueChange={handleRoleSwitch}>
              <SelectTrigger className="w-full h-8 text-xs">
                <SelectValue placeholder="Switch role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="platform_admin">Platform Admin</SelectItem>
                <SelectItem value="company_admin">Company Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="assessor">Assessor</SelectItem>
                <SelectItem value="user">Standard User</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div 
      className="min-h-screen bg-slate-50"
    >
      <style>
        {`
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
            --card: 0 0% 100%;
            --card-foreground: 222.2 84% 4.9%;
            --popover: 0 0% 100%;
            --popover-foreground: 222.2 84% 4.9%;
            --primary: 222 28% 28%; /* Charcoal Blue */
            --primary-foreground: 0 0% 100%;
            --secondary: 210 40% 96.1%;
            --secondary-foreground: 215.4 16.3% 46.9%;
            --muted: 210 40% 96.1%;
            --muted-foreground: 215.4 16.3% 46.9%;
            --accent: 210 40% 96.1%;
            --accent-foreground: 222.2 47.4% 11.2%;
            --destructive: 0 84.2% 60.2%;
            --destructive-foreground: 210 40% 98%;
            --border: 214.3 31.8% 91.4%;
            --input: 214.3 31.8% 91.4%;
            --ring: 222 28% 28%; /* Charcoal Blue */
            --radius: 0.75rem;
          }
          
          body {
            font-family: 'Inter', sans-serif;
            overflow-x: hidden;
          }

          /* Subtle Page Animations */
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInScale {
            from {
              opacity: 0;
              transform: scale(0.98);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes shimmer {
            0% {
              background-position: -468px 0;
            }
            100% {
              background-position: 468px 0;
            }
          }

          /* Animation Classes */
          .animate-fade-in-up {
            animation: fadeInUp 0.6s ease-out forwards;
          }

          .animate-fade-in-scale {
            animation: fadeInScale 0.5s ease-out forwards;
          }

          .animate-slide-in-right {
            animation: slideInRight 0.5s ease-out forwards;
          }

          .animate-slide-in-left {
            animation: slideInLeft 0.5s ease-out forwards;
          }

          /* Staggered Animation Delays */
          .animate-stagger-1 {
            animation: fadeInUp 0.6s ease-out 0.1s both;
          }

          .animate-stagger-2 {
            animation: fadeInUp 0.6s ease-out 0.15s both;
          }

          .animate-stagger-3 {
            animation: fadeInUp 0.6s ease-out 0.2s both;
          }

          .animate-stagger-4 {
            animation: fadeInUp 0.6s ease-out 0.25s both;
          }

          .animate-stagger-5 {
            animation: fadeInUp 0.6s ease-out 0.3s both;
          }

          .animate-stagger-6 {
            animation: fadeInUp 0.6s ease-out 0.35s both;
          }

          /* Loading Animation */
          .loading-shimmer {
            background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.8s infinite;
          }

          /* Subtle Interactive Elements */
          .interactive-card {
            transition: all 0.2s ease-out;
          }

          .interactive-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }

          .interactive-button {
            transition: all 0.15s ease-out;
          }

          .interactive-button:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }

          .interactive-button:active {
            transform: translateY(0);
          }

          /* Sidebar */
          .sidebar-item {
            transition: all 0.2s ease-out;
            position: relative;
          }

          .sidebar-item::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0;
            height: 100%;
            width: 3px;
            background: linear-gradient(180deg, #334155, #1e293b); /* Charcoal Blue Gradient */
            transform: scaleY(0);
            transition: transform 0.2s ease-out;
            border-radius: 0 2px 2px 0;
          }

          .sidebar-item.active::before {
            transform: scaleY(1);
          }

          .sidebar-item:hover {
            transform: translateX(2px);
          }

          /* Badges */
          .animated-badge {
            transition: all 0.15s ease-out;
          }

          .animated-badge:hover {
            transform: scale(1.02);
          }

          /* Focus States */
          .focus-glow:focus {
            outline: 2px solid #6366f1;
            outline-offset: 2px;
          }

          /* Reduced Motion Support */
          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          }
        `}
      </style>
      
      <SidebarProvider>
        <div className="flex w-full">
          <Sidebar className="bg-white border-r border-slate-200/80 w-64 p-4">
            <SidebarHeader className="p-4 border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center shadow-lg">
                  <ClipboardCheck className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-slate-800">RapidAssess</h2>
                  <p className="text-xs text-slate-500">AI Insurance Platform</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="px-2">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item, index) => (
                      <SidebarMenuItem key={item.title} className={`animate-stagger-${index + 1}`}>
                        <SidebarMenuButton 
                          asChild 
                          className={`sidebar-item w-full justify-start rounded-lg py-2.5 px-3 ${
                            location.pathname === item.url 
                              ? 'active bg-slate-100 text-slate-800' 
                              : 'hover:bg-slate-100 text-slate-600 hover:text-slate-800'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium text-sm">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-0 p-4">
              <UserProfile />
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 bg-slate-50">
            {/* Mobile header */}
            <header className="md:hidden p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold text-slate-800">RapidAssess</h1>
                <SidebarTrigger className="p-2 rounded-lg bg-slate-100 shadow-sm" />
              </div>
            </header>

            {/* Main content */}
            <div className="flex-1">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}

