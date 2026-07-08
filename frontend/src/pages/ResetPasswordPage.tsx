import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth.service';
import { useToast } from '../contexts/ToastContext';
import { Lock, ArrowLeft, CheckCircle } from 'lucide-react';

const passwordRules = z.string()
  .min(8, 'Minimum 8 characters')
  .regex(/[A-Z]/, 'One uppercase character required')
  .regex(/[a-z]/, 'One lowercase character required')
  .regex(/[0-9]/, 'One numeric character required')
  .regex(/[^A-Za-z0-9]/, 'One special character required');

const resetPasswordSchema = z.object({
  password: passwordRules,
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ResetPasswordFormInputs = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || 'mock-token';

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormInputs>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onChange',
  });

  const passwordVal = watch('password', '');

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

  const onSubmit = async (data: ResetPasswordFormInputs) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const res = await authService.resetPassword({
        token,
        password: data.password,
      });
      setSuccess(true);
      toast.success(res.message || 'Password updated.');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to update credentials.');
      toast.error('Update failed.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-12 w-12 text-severity-low" />
        </div>
        <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
          Credentials Reset Complete
        </h3>
        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
          Your access password has been successfully updated. You may now proceed to log in with your new credentials.
        </p>
        <div className="pt-4">
          <Link to="/login">
            <Button className="w-full gap-2">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
          Reset Credentials
        </h3>
        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
          Specify a new access password that complies with our corporate security policies.
        </p>
      </div>

      {submitError && (
        <div className="p-3 text-xs font-semibold rounded-input border border-severity-critical/20 bg-severity-critical/10 text-severity-critical">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            label="New Access Password"
            type="password"
            placeholder="••••••••"
            error={errors.password?.message}
            icon={<Lock className="h-4 w-4" />}
            autoFocus
            {...register('password')}
          />

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
          icon={<Lock className="h-4 w-4" />}
          {...register('confirmPassword')}
        />

        <div className="pt-2">
          <Button type="submit" loading={loading} className="w-full">
            Update Credentials
          </Button>
        </div>
      </form>

      <div className="text-center pt-2">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-primary-blue hover:underline font-semibold">
          <ArrowLeft className="h-3 w-3" />
          Cancel
        </Link>
      </div>
    </div>
  );
};
export default ResetPasswordPage;
