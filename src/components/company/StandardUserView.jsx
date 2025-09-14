import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import CompanyAnalytics from './CompanyAnalytics';
import { TrendingUp, Building2, Users } from 'lucide-react';

export default function StandardUserView({ user }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-slate-700" />
            Company Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-6">
            View key metrics and insights about your company's assessment performance.
          </p>
          <CompanyAnalytics user={user} companyFilter={user.company_id} />
        </CardContent>
      </Card>
    </div>
  );
}