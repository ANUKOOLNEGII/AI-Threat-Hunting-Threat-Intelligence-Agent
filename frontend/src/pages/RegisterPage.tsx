import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Input, Checkbox } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/auth.service';
import { useToast } from '../contexts/ToastContext';
import { UserPlus } from 'lucide-react';
import { SocialLogin } from '../components/ui/SocialLogin';

// Define password validation rules
const passwordRules = z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'One uppercase character required')
  .regex(/[a-z]/, 'One lowercase character required')
  .regex(/[0-9]/, 'One numeric character required')
  .regex(/[^A-Za-z0-9]/, 'One special character required');

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required (min 2 chars)'),
  lastName: z.string().min(2, 'Last name is required (min 2 chars)'),
  organization: z.string().min(2, 'Organization is required'),
  country: z.string().min(2, 'Country is required'),
  email: z.string().email('Please enter a valid email address'),
  password: passwordRules,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  acceptTerms: z.boolean().refine((val) => val === true, 'Clearance access terms must be accepted'),
  newsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterFormInputs = z.infer<typeof registerSchema>;

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
  });

  const passwordVal = watch('password', '');

  // Calculate password policy strength score (0 to 4)
  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (!pw) return score;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const strengthScore = getPasswordStrength(passwordVal);

  const strengthDetails = [
    { label: 'Too Weak', color: 'bg-severity-critical' },
    { label: 'Weak', color: 'bg-severity-high' },
    { label: 'Fair', color: 'bg-severity-medium' },
    { label: 'Good', color: 'bg-primary-blue' },
    { label: 'Strong', color: 'bg-severity-low' },
  ];

  const onSubmit = async (data: RegisterFormInputs) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const res = await authService.register(data);
      toast.success(res.message || 'Access account created.');
      
      // Auto sign in user after registration
      login('mock-jwt-token-string', 'mock-jwt-refresh-token', res.user, false);
      navigate('/dashboard');
    } catch (err: any) {
      setSubmitError(err.message || 'Registration failed. Try again.');
      toast.error('Registration failed.');
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
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            type="text"
            placeholder="John"
            error={errors.firstName?.message}
            {...register('firstName')}
          />
          <Input
            label="Last Name"
            type="text"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName')}
          />
        </div>

        <Input
          label="Organization"
          type="text"
          placeholder="Aegis Labs"
          error={errors.organization?.message}
          {...register('organization')}
        />

        <Input
          label="Country"
          type="text"
          placeholder="United States"
          error={errors.country?.message}
          {...register('country')}
        />

        <Input
          label="Security Email"
          type="email"
          placeholder="analyst@aegis.local"
          error={errors.email?.message}
          {...register('email')}
        />

        <div>
          <Input
            label="Access Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Real-time Password Strength feedback */}
          {passwordVal && (
            <div className="mt-2 space-y-1.5">
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                <span className="text-light-text-muted dark:text-dark-text-muted">Password Strength:</span>
                <span className={
                  strengthScore === 4 
                    ? 'text-severity-low' 
                    : strengthScore >= 2 
                    ? 'text-severity-medium' 
                    : 'text-severity-critical'
                }>
                  {strengthDetails[strengthScore].label}
                </span>
              </div>
              <div className="flex h-1.5 gap-1 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full flex-1 rounded-full transition-all duration-300 ${
                      i < strengthScore ? strengthDetails[strengthScore].color : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

        <div className="space-y-2 pt-1">
          <Checkbox
            label="I accept the clearance access terms and conditions"
            error={errors.acceptTerms?.message}
            {...register('acceptTerms')}
          />
          <Checkbox
            label="Subscribe to emergency security alerts"
            {...register('newsletter')}
          />
        </div>

        <div className="pt-2">
          <Button type="submit" loading={loading} className="w-full">
            <UserPlus className="h-4 w-4 shrink-0" />
            Request Clearance
          </Button>
        </div>
      </form>

      {/* Social SSO Logins wrapper */}
      <SocialLogin
        onGoogleClick={() => toast.info('Google SSO validation requested.')}
        onMicrosoftClick={() => toast.info('Microsoft Azure SSO validation requested.')}
        disabled={loading}
      />

      <div className="text-center pt-2">
        <span className="text-xs text-light-text-muted dark:text-dark-text-muted">
          Clearance holder already?{' '}
          <Link to="/login" className="text-primary-blue hover:underline font-semibold">
            Sign In
          </Link>
        </span>
      </div>
    </div>
  );
};
export default RegisterPage;
