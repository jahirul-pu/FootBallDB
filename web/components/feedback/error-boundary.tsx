'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-8">
            <div className="text-4xl">⚠️</div>
            <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
            <p className="max-w-md text-center text-sm text-neutral-400">
              {this.state.error?.message ?? 'An unexpected error occurred. Please try refreshing.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="rounded-md bg-red-500/10 px-4 py-2 text-sm text-red-400 hover:bg-red-500/20"
            >
              Try again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
