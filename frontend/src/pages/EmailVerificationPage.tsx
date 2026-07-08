import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../services/auth.service';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/FormControls';
import { useToast } from '../contexts/ToastContext';
import { CheckCircle, XCircle, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';

type VerificationStatus = 'loading' | 'success' | 'failed' | 'expired' | 'resend-form';

export const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { toast } = useToast();

  const [status, setStatus] = useState<VerificationStatus>(token ? 'loading' : 'resend-form');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      try {
        await authService.verifyEmail(token);
        setStatus('success');
        toast.success('Email verified successfully.');
      } catch (err: any) {
        setErrorMessage(err.message || 'Verification failed.');
        
        if (err.status === 400 && err.message?.includes('expired')) {
          setStatus('expired');
        } else {
          setStatus('failed');
        }
      }
    };

    verifyToken();
  }, [token, toast]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setResending(true);
    try {
      const res = await authService.resendVerification(email);
      toast.success(res.message || 'Dispatched verification email.');
      setStatus('resend-form');
      setEmail('');
    } catch (err: any) {
      toast.error(err.message || 'Failed to dispatch verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Loading State */}
      {status === 'loading' && (
        <div className="text-center space-y-4 py-6">
          <Loader2 className="mx-auto h-10 w-10 text-primary-blue animate-spin" />
          <h3 className="text-sm font-bold">Verifying Credentials</h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
            Validating secure signature against corporate active directory records...
          </p>
        </div>
      )}

      {/* 2. Success State */}
      {status === 'success' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="h-12 w-12 text-severity-low" />
          </div>
          <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            Verification Successful
          </h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
            Your secure clearance email has been verified. You may now log in to the management console.
          </p>
          <div className="pt-4">
            <Link to="/login">
              <Button className="w-full">Proceed to Sign In</Button>
            </Link>
          </div>
        </div>
      )}

      {/* 3. Failed State */}
      {status === 'failed' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-severity-critical" />
          </div>
          <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            Verification Failure
          </h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
            {errorMessage || 'The verification token provided is invalid or tampered with.'}
          </p>
          <div className="pt-4 flex flex-col gap-2">
            <Button className="w-full" onClick={() => setStatus('resend-form')}>
              Request New Verification Key
            </Button>
            <Link to="/login" className="inline-flex items-center justify-center gap-1.5 text-xs text-primary-blue hover:underline font-semibold mt-2">
              <ArrowLeft className="h-3 w-3" />
              Return to Login
            </Link>
          </div>
        </div>
      )}

      {/* 4. Expired State */}
      {status === 'expired' && (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <AlertCircle className="h-12 w-12 text-severity-medium" />
          </div>
          <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
            Clearance Signature Expired
          </h3>
          <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
            The verification key has expired. Please enter your email below to request a fresh clearance key.
          </p>
          <div className="pt-2">
            <Button className="w-full" onClick={() => setStatus('resend-form')}>
              Request New Link
            </Button>
          </div>
        </div>
      )}

      {/* 5. Request Resend Form */}
      {status === 'resend-form' && (
        <div className="space-y-4">
          <div className="space-y-1 text-center">
            <h3 className="text-lg font-bold text-light-text-primary dark:text-dark-text-primary">
              Verify Account
            </h3>
            <p className="text-xs text-light-text-muted dark:text-dark-text-muted">
              Enter your registered email below to receive a new security verification link.
            </p>
          </div>

          <form onSubmit={handleResend} className="space-y-4">
            <Input
              label="Registered Email"
              type="email"
              placeholder="operator@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" loading={resending} className="w-full">
              Transmit Verification Code
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-primary-blue hover:underline font-semibold">
              <ArrowLeft className="h-3 w-3" />
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
export default EmailVerificationPage;
