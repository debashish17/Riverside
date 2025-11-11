import React, { ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
	children: ReactNode;
}

interface ErrorBoundaryState {
	hasError: boolean;
	error: Error | null;
	errorInfo: { componentStack: string } | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
	constructor(props: ErrorBoundaryProps) {
		super(props);
		this.state = { 
			hasError: false, 
			error: null,
			errorInfo: null
		};
	}

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		// Update state so the next render will show the fallback UI
		return { hasError: true, error, errorInfo: null };
	}

	componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
		// Log error details
		console.error('Error boundary caught an error:', error, errorInfo);
		this.setState({
			error: error,
			errorInfo: errorInfo
		});
	}

	handleReload = () => {
		window.location.reload();
	};

	handleGoHome = () => {
		window.location.href = '/';
	};

	render() {
		if (this.state.hasError) {
			return (
				<div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
					<div className="max-w-md w-full text-center">
						{/* Error Icon */}
						<div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mb-6">
							<AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
						</div>
            
						{/* Error Title */}
						<h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
							Oops! Something went wrong
						</h1>
            
						{/* Error Description */}
						<p className="text-gray-600 dark:text-gray-400 mb-8">
							We encountered an unexpected error. This has been logged and our team will investigate.
						</p>
            
						{/* Error Details (Development only) */}
						{process.env.NODE_ENV === 'development' && this.state.error && (
							<div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-left">
								<h3 className="text-sm font-semibold text-red-800 dark:text-red-400 mb-2">
									Error Details (Development)
								</h3>
								<pre className="text-xs text-red-700 dark:text-red-300 overflow-auto">
									{this.state.error?.toString()}
								</pre>
								{this.state.errorInfo && (
									<pre className="text-xs text-red-600 dark:text-red-400 mt-2 overflow-auto">
										{this.state.errorInfo.componentStack}
									</pre>
								)}
							</div>
						)}
            
						{/* Action Buttons */}
						<div className="space-y-3">
							<button
								onClick={this.handleReload}
								className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
							>
								<RefreshCw className="w-4 h-4" />
								<span>Reload Page</span>
							</button>
              
							<button
								onClick={this.handleGoHome}
								className="w-full flex items-center justify-center space-x-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
							>
								<Home className="w-4 h-4" />
								<span>Go to Homepage</span>
							</button>
						</div>
            
						{/* Help Text */}
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
							If this problem persists, please contact our support team.
						</p>
					</div>
				</div>
			);
		}

		return this.props.children;
	}
}

export default ErrorBoundary;