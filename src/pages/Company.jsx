import React, { useState, useEffect } from 'react';
import { User } from '@/api/entities';
import PlatformAdminView from '../components/company/PlatformAdminView';
import CompanyAdminView from '../components/company/CompanyAdminView';
import StandardUserView from '../components/company/StandardUserView';
import { Loader2 } from 'lucide-react';

export default function CompanyPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="space-y-4">
          <div className="h-10 w-full bg-slate-200 rounded-lg loading-shimmer"></div>
          <div className="h-96 w-full bg-white rounded-2xl loading-shimmer"></div>
        </div>
      );
    }

    if (!user) {
      return <p className="text-center text-red-500">Could not load user data.</p>;
    }

    // Render appropriate view based on user role, with fallback to standard user view
    const userRole = user.user_role || 'user'; // Default to 'user' if no role set
    
    switch (userRole) {
      case 'platform_admin':
        return <PlatformAdminView user={user} />;
      case 'company_admin':
        return <CompanyAdminView user={user} />;
      case 'manager':
      case 'user':
      default:
        // Show standard user view for any authenticated user
        return <StandardUserView user={user} />;
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Company Management</h1>
          <p className="text-slate-500 mt-1">View and manage company settings and users.</p>
        </div>
      </div>
      <div className="animate-fade-in-up">
        {renderContent()}
      </div>
    </div>
  );
}