import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/FormControls';
import { Button } from '../components/ui/Button';
import { authService } from '../services/auth.service';
import { useToast } from '../contexts/ToastContext';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid security email address'),
});

type ForgotPasswordFormInputs = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormInputs>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormInputs) => {
    setLoading(true);
    setSubmitError(null);

    try {
      const res = await authService.forgotPassword(data.email);
      setSuccess(true);
      toast.success(res.message || 'Transmitted reset instructions.');
    } catch (err: any) {
      setSubmitError(err.message || 'Failed to submit password reset request.');
      toast.error('Submission failed.');
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
          Instructions Dispatched
        </h3>
        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
          A secure password recovery key has been transmitted to your designated security email address. Please follow the instructions to update your credentials.
        </p>
        <div className="pt-4">
          <Link to="/login">
            <Button className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              Return to Login
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
          Password Recovery
        </h3>
        <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
          Provide your registered security email below to request a password reset key.
        </p>
      </div>

      {submitError && (
        <div className="p-3 text-xs font-semibold rounded-input border border-severity-critical/20 bg-severity-critical/10 text-severity-critical">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Registered Security Email"
          type="email"
          placeholder="operator@domain.com"
          error={errors.email?.message}
          icon={<Mail className="h-4 w-4" />}
          autoFocus
          {...register('email')}
        />

        <div className="pt-2">
          <Button type="submit" loading={loading} className="w-full">
            Transmit Recovery Link
          </Button>
        </div>
      </form>

      <div className="text-center pt-2">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-primary-blue hover:underline font-semibold">
          <ArrowLeft className="h-3 w-3" />
          Back to Login
        </Link>
      </div>
    </div>
  );
};
export default ForgotPasswordPage;
