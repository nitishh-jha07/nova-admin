import React, { useState, useEffect } from 'react';
import { FileText, Users, CheckCircle, XCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { documentService, Analytics } from '@/services/api';

const AnalyticsSection: React.FC = () => {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const data = await documentService.getAnalytics();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-5 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-8 bg-muted rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  const statusStats = [
    {
      label: 'Total Uploads',
      value: analytics.totalUploads,
      icon: FileText,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Approved',
      value: analytics.statusWise.find(s => s.status === 'approved')?.count || 0,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      label: 'Pending',
      value: analytics.statusWise.find(s => s.status === 'submitted')?.count || 0,
      icon: AlertCircle,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Rejected',
      value: analytics.statusWise.find(s => s.status === 'rejected')?.count || 0,
      icon: XCircle,
      color: 'text-destructive',
      bgColor: 'bg-destructive/10',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statusStats.map((stat, index) => (
          <div
            key={index}
            className="bg-card rounded-xl border border-border p-5 animate-fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 text-foreground">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise Uploads */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Subject-wise Uploads
          </h3>
          <div className="space-y-3">
            {analytics.subjectWise.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              analytics.subjectWise.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.subject}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalUploads) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Student-wise Submissions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Student-wise Submissions
          </h3>
          <div className="space-y-3">
            {analytics.studentWise.length === 0 ? (
              <p className="text-sm text-muted-foreground">No data available</p>
            ) : (
              analytics.studentWise.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{item.studentName}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{
                          width: `${(item.count / analytics.totalUploads) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground w-8 text-right">
                      {item.count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Recent Activity
          </h3>
          <span className="text-sm text-muted-foreground">
            {analytics.recentUploads} uploads this month
          </span>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsSection;
