import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[ErrorBoundary] Caught error:', error, info);
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-lg bg-[#1a1a24] border border-white/10">
            <span className="text-sm text-red-400">Something went wrong</span>
            <span className="text-xs text-gray-400 max-w-xs text-center">
              {this.state.error?.message ?? 'Unknown error'}
            </span>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="mt-2 px-3 py-1 text-xs rounded-md bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
