import React, { useState } from 'react';
import { User, Mail, BookOpen, GraduationCap, Hash, Save, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { authService, YEARS, BRANCHES } from '@/services/api';
import Button from '@/components/common/Button';
import Input from '@/components/common/Input';

const ProfileSection: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    rollNumber: user?.rollNumber || '',
    branch: user?.branch || '',
    year: user?.year || '',
  });
  const [successMessage, setSuccessMessage] = useState('');

  if (!user) return null;

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await authService.updateProfile(formData);
      setSuccessMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header with Avatar */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-2xl font-bold">
            {getInitials(user.name)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">{user.name}</h2>
            <p className="text-muted-foreground capitalize">{user.role}</p>
          </div>
        </div>
      </div>

      {/* Profile Details */}
      <div className="p-6 space-y-4">
        {successMessage && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm">
            {successMessage}
          </div>
        )}

        {isEditing ? (
          <div className="space-y-4">
            <Input
              id="name"
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              icon={<User className="w-5 h-5" />}
            />

            {user.role === 'student' && (
              <>
                <Input
                  id="rollNumber"
                  label="Roll Number"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  icon={<Hash className="w-5 h-5" />}
                />

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Branch</label>
                  <select
                    value={formData.branch}
                    onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Select Branch</option>
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-foreground">Year</label>
                  <select
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className="flex gap-3">
              <Button
                variant="primary"
                onClick={handleSave}
                isLoading={isSaving}
                leftIcon={!isSaving ? <Save className="w-4 h-4" /> : undefined}
              >
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <Mail className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="text-sm font-medium text-foreground">{user.email}</p>
              </div>
            </div>

            {user.role === 'student' && (
              <>
                {user.rollNumber && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Hash className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Roll Number</p>
                      <p className="text-sm font-medium text-foreground">{user.rollNumber}</p>
                    </div>
                  </div>
                )}

                {user.branch && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Branch</p>
                      <p className="text-sm font-medium text-foreground">{user.branch}</p>
                    </div>
                  </div>
                )}

                {user.year && (
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Year</p>
                      <p className="text-sm font-medium text-foreground">{user.year}</p>
                    </div>
                  </div>
                )}
              </>
            )}

            <Button variant="secondary" onClick={() => setIsEditing(true)} className="w-full">
              Edit Profile
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSection;
