import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Checkbox from '@/components/common/Checkbox';
import { z } from 'zod';

// Validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = () => {
    try {
      loginSchema.parse({ email, password });
      setFieldErrors({});
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        const errors: { email?: string; password?: string } = {};
        err.errors.forEach((e) => {
          const field = e.path[0] as 'email' | 'password';
          errors[field] = e.message;
        });
        setFieldErrors(errors);
      }
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      await login({ email, password, rememberMe });
      setSuccess('Login successful! Redirecting...');
      setTimeout(() => {
        const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      }, 500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mb-4">
              <span className="text-2xl font-bold text-primary-foreground">D</span>
            </div>
            <h1 className="text-3xl font-bold text-foreground">Welcome back</h1>
            <p className="mt-2 text-muted-foreground">
              Enter your credentials to access your dashboard
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="rounded-lg bg-muted/50 border border-border p-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Demo credentials:</span><br />
              Email: demo@example.com<br />
              Password: password123
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="flex items-center gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-destructive fade-in" role="alert">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Success message */}
          {success && (
            <div className="flex items-center gap-3 rounded-lg bg-success/10 border border-success/20 p-4 text-success fade-in" role="alert">
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{success}</p>
            </div>
          )}

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              id="email"
              type="email"
              label="Email address"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={<Mail className="h-5 w-5" />}
              error={fieldErrors.email}
              autoComplete="email"
              required
            />

            <Input
              id="password"
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock className="h-5 w-5" />}
              showPasswordToggle
              error={fieldErrors.password}
              autoComplete="current-password"
              required
            />

            <div className="flex items-center justify-between">
              <Checkbox
                id="remember-me"
                label="Remember me"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <button
                type="button"
                className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full"
            >
              Sign in
            </Button>
          </form>

          {/* Footer */}
          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{' '}
            <button
              type="button"
              className="font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>

      {/* Right side - Decorative */}
      <div className="hidden lg:flex lg:flex-1 bg-primary items-center justify-center p-12">
        <div className="max-w-lg text-center">
          <div className="mb-8">
            <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-accent mb-6">
              <span className="text-4xl font-bold text-accent-foreground">✦</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Manage your business with confidence
          </h2>
          <p className="text-lg text-primary-foreground/80">
            Get real-time insights, track performance, and make data-driven decisions all in one place.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
