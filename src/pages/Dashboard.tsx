import React, { useState, useEffect } from 'react';
import { Users, DollarSign, TrendingUp, Activity } from 'lucide-react';
import Sidebar from '@/components/dashboard/Sidebar';
import Navbar from '@/components/dashboard/Navbar';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/common/Card';
import { dashboardService, DashboardStats, ActivityItem } from '@/services/api';
import { cn } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);

  useEffect(() => {
    // Fetch dashboard data
    const fetchData = async () => {
      try {
        const [statsData, activityData] = await Promise.all([
          dashboardService.getStats(),
          dashboardService.getRecentActivity(),
        ]);
        setStats(statsData);
        setActivities(activityData);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setIsLoadingStats(false);
        setIsLoadingActivities(false);
      }
    };

    fetchData();
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile unless menu is open */}
      <div className={cn(
        'lg:block',
        isMobileMenuOpen ? 'block' : 'hidden'
      )}>
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Main content */}
      <div
        className={cn(
          'transition-all duration-300 ease-out',
          isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
        )}
      >
        <Navbar onMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />

        <main className="p-4 lg:p-8">
          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {isLoadingStats ? (
              // Loading skeletons
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="stat-card animate-pulse">
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="h-4 w-24 bg-muted rounded" />
                      <div className="h-8 w-32 bg-muted rounded" />
                      <div className="h-4 w-40 bg-muted rounded" />
                    </div>
                    <div className="h-12 w-12 bg-muted rounded-xl" />
                  </div>
                </div>
              ))
            ) : stats ? (
              <>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  change={8.2}
                  icon={<Users className="h-6 w-6" />}
                />
                <StatCard
                  title="Active Users"
                  value={stats.activeUsers}
                  change={12.5}
                  icon={<Activity className="h-6 w-6" />}
                />
                <StatCard
                  title="Revenue"
                  value={stats.revenue}
                  prefix="$"
                  change={stats.growth}
                  icon={<DollarSign className="h-6 w-6" />}
                />
                <StatCard
                  title="Growth"
                  value={stats.growth}
                  suffix="%"
                  change={2.1}
                  icon={<TrendingUp className="h-6 w-6" />}
                />
              </>
            ) : null}
          </div>

          {/* Content grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Recent activity */}
            <Card variant="elevated" className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ActivityFeed activities={activities} isLoading={isLoadingActivities} />
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <button className="w-full p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                  <p className="font-medium text-foreground">Create New Project</p>
                  <p className="text-sm text-muted-foreground mt-1">Start a new project from scratch</p>
                </button>
                <button className="w-full p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                  <p className="font-medium text-foreground">Invite Team Member</p>
                  <p className="text-sm text-muted-foreground mt-1">Add someone to your team</p>
                </button>
                <button className="w-full p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left">
                  <p className="font-medium text-foreground">View Reports</p>
                  <p className="text-sm text-muted-foreground mt-1">Check your analytics</p>
                </button>
                <button className="w-full p-4 rounded-lg bg-accent/10 hover:bg-accent/20 transition-colors text-left border border-accent/20">
                  <p className="font-medium text-accent-foreground">Upgrade Plan</p>
                  <p className="text-sm text-muted-foreground mt-1">Unlock premium features</p>
                </button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
