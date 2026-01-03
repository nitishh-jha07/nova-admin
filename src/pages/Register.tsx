import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, GraduationCap, BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { registerSchema, UserRole } from '@/services/api';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as UserRole,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    setGeneralError('');
  };

  const handleRoleChange = (role: UserRole) => {
    setFormData(prev => ({ ...prev, role }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneralError('');

    const validation = registerSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      setSuccess('Account created! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 500);
    } catch (error) {
      setGeneralError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
              <GraduationCap className="h-7 w-7 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground">Create Account</h1>
            <p className="mt-2 text-muted-foreground">
              Join the Document Repository
            </p>
          </div>

          {/* Error Alert */}
          {generalError && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive animate-fade-in" role="alert">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{generalError}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="flex items-center gap-3 rounded-lg bg-green-500/10 border border-green-500/20 p-4 text-green-600 animate-fade-in" role="alert">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Input */}
            <Input
              id="name"
              name="name"
              type="text"
              label="Full Name"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User className="h-5 w-5" />}
              autoComplete="name"
            />

            {/* Email Input */}
            <Input
              id="email"
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail className="h-5 w-5" />}
              autoComplete="email"
            />

            {/* Password Input */}
            <Input
              id="password"
              name="password"
              type="password"
              label="Password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock className="h-5 w-5" />}
              showPasswordToggle
              autoComplete="new-password"
            />

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">
                I am a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleRoleChange('student')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'student'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <GraduationCap className="h-5 w-5" />
                  <span className="font-medium">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange('professor')}
                  className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.role === 'professor'
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <BookOpen className="h-5 w-5" />
                  <span className="font-medium">Professor</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Create Account
            </Button>
          </form>

          {/* Login Link */}
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              to="/login"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary-foreground/10 mb-6">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Join Our Community
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Create an account to start uploading and managing your academic documents securely.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
