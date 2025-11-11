import React from 'react';
import { Video, Loader2 } from 'lucide-react';

interface LoadingScreenProps {
	message?: string;
	fullScreen?: boolean;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...', fullScreen = true }) => {
	const containerClass = fullScreen 
		? 'fixed inset-0 bg-white dark:bg-gray-900 flex items-center justify-center z-50'
		: 'flex items-center justify-center py-12';

	return (
		<div className={containerClass}>
			<div className="text-center">
				{/* Logo */}
				<div className="flex items-center justify-center mb-6">
					<div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center relative">
						<Video className="w-8 h-8 text-white" />
						<div className="absolute inset-0 bg-blue-600 rounded-2xl animate-pulse opacity-50"></div>
					</div>
				</div>
        
				{/* Loading Spinner */}
				<div className="flex items-center justify-center mb-4">
					<Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
				</div>
        
				{/* Loading Text */}
				<p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
					{message}
				</p>
        
				{/* Sub Text */}
				<p className="text-sm text-gray-500 dark:text-gray-400">
					Please wait while we prepare everything for you
				</p>
        
				{/* Progress Bar */}
				<div className="mt-6 w-64 mx-auto">
					<div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
						<div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '60%' }}></div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoadingScreen;