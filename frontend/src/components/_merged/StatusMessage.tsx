import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-react';

type StatusType = 'success' | 'error' | 'warning' | 'info';

interface StatusMessageProps {
	type?: StatusType;
	message?: string;
	className?: string;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ type = 'info', message, className = '' }) => {
	const getConfig = () => {
		switch (type) {
			case 'success':
				return {
					icon: CheckCircle,
					bgColor: 'bg-green-50 dark:bg-green-900/20',
					borderColor: 'border-green-200 dark:border-green-800',
					textColor: 'text-green-700 dark:text-green-300',
					iconColor: 'text-green-600 dark:text-green-400'
				};
			case 'error':
				return {
					icon: XCircle,
					bgColor: 'bg-red-50 dark:bg-red-900/20',
					borderColor: 'border-red-200 dark:border-red-800',
					textColor: 'text-red-700 dark:text-red-300',
					iconColor: 'text-red-600 dark:text-red-400'
				};
			case 'warning':
				return {
					icon: AlertCircle,
					bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
					borderColor: 'border-yellow-200 dark:border-yellow-800',
					textColor: 'text-yellow-700 dark:text-yellow-300',
					iconColor: 'text-yellow-600 dark:text-yellow-400'
				};
			default:
				return {
					icon: Info,
					bgColor: 'bg-blue-50 dark:bg-blue-900/20',
					borderColor: 'border-blue-200 dark:border-blue-800',
					textColor: 'text-blue-700 dark:text-blue-300',
					iconColor: 'text-blue-600 dark:text-blue-400'
				};
		}
	};

	const config = getConfig();
	const IconComponent = config.icon;

	if (!message) return null;

	return (
		<div className={`
			flex items-center space-x-3 p-4 rounded-lg border
			${config.bgColor} ${config.borderColor} ${className}
		`}>
			<IconComponent className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
			<p className={`text-sm ${config.textColor}`}>{message}</p>
		</div>
	);
};

export default StatusMessage;