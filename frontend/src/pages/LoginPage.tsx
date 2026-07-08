import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { Input, Checkbox } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { SocialLogin } from '../components/ui/SocialLogin';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid security email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // If already authenticated, redirect away
  useEffect(() => {
    if (token) {
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [token, navigate, location]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: localStorage.getItem('rememberedEmail') || 'admin@aegis.local',
      password: 'password123',
      rememberMe: localStorage.getItem('rememberMe') === 'true',
    },
  });

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const res = await authService.login({
        email: data.email,
        password: data.password,
      });

      // Save email to localStorage if rememberMe is selected
      if (data.rememberMe) {
        localStorage.setItem('rememberedEmail', data.email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('rememberedEmail');
        localStorage.setItem('rememberMe', 'false');
      }

      login(res.token, res.refreshToken, res.user, data.rememberMe);
      toast.success('Access validation complete. Session established.');
      
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: any) {
      setSubmitError(err.message || 'Access authorization check failed.');
      toast.error('Sign in failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {submitError && (
        <div className="p-3 text-xs font-semibold rounded-input border border-severity-critical/20 bg-severity-critical/10 text-severity-critical">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Clearance Identity (Email)"
          type="email"
          placeholder="operator@domain.com"
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          autoFocus
          {...register('email')}
        />

        <div className="relative">
          <Input
            label="Access Key (Password)"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock className="h-4 w-4" />}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] p-1 text-light-text-muted hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        <div className="flex items-center justify-between pt-1">
          <Checkbox
            label="Remember Identity"
            {...register('rememberMe')}
          />
          <Link
            to="/forgot-password"
            className="text-xs text-primary-blue hover:underline font-semibold"
          >
            Forgot Password?
          </Link>
        </div>

        <div className="pt-2">
          <Button type="submit" loading={loading} className="w-full">
            <LogIn className="h-4 w-4 shrink-0" />
            Verify & Sign In
          </Button>
        </div>
      </form>

      {/* Social Logins */}
      <SocialLogin
        onGoogleClick={() => toast.info('Google SSO verification pending.')}
        onMicrosoftClick={() => toast.info('Microsoft SSO verification pending.')}
        disabled={loading}
      />

      <div className="text-center pt-2">
        <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
          Need security credentials?{' '}
          <Link to="/register" className="text-primary-blue hover:underline font-semibold">
            Request Access
          </Link>
        </span>
      </div>
    </div>
  );
};
export default LoginPage;
