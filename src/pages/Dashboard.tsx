import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/Navbar';
import StudentDashboard from '@/components/StudentDashboard';
import ProfessorDashboard from '@/components/ProfessorDashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isSidebarOpen={isMobileMenuOpen}
      />
      
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        {user.role === 'student' ? (
          <StudentDashboard />
        ) : (
          <ProfessorDashboard />
        )}
      </main>
    </div>
  );
};

export default Dashboard;
