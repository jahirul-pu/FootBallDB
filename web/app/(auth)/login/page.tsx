import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Sign in to your FootballDB account.',
};

export default function LoginPage() {
  return (
    <div className="flex flex-col space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
      <p className="text-muted-foreground text-sm">Enter your credentials to access FootballDB.</p>
      {/* Login form will be built in the Auth module */}
      <div className="text-muted-foreground rounded-md border border-dashed p-8 text-center text-sm">
        Login form — Auth module
      </div>
    </div>
  );
}
