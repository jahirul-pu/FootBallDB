import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password',
  description: 'Reset your FootballDB account password.',
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Forgot your password?</h1>
      <p className="text-muted-foreground text-sm">
        Enter your email address and we will send you a reset link.
      </p>
      <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
        Forgot password form — Auth module
      </div>
    </div>
  );
}
