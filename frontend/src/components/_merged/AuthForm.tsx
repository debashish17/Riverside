import React, { useState } from "react";
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../store/index';
import { loginUser, registerUser } from '../../store/slices/authSlice';
import { Eye, EyeOff, User, Lock, Mail } from 'lucide-react';

interface AuthFormProps {
	isSignup?: boolean;
	onToggleMode: () => void;
}

export default function AuthForm({ isSignup = false, onToggleMode }: AuthFormProps) {
	const dispatch = useDispatch<AppDispatch>();
	const { isLoading, error } = useSelector((state: RootState) => state.auth);
	const [formData, setFormData] = useState<{ username: string; email: string; password: string }>({
		username: "",
		email: "",
		password: ""
	});
	const [showPassword, setShowPassword] = useState(false);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value
		});
	};

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		try {
			if (isSignup) {
				await dispatch(registerUser(formData as { username: string; email: string; password: string })).unwrap();
			} else {
				await dispatch(loginUser({ 
					username: formData.username, 
					password: formData.password 
				} as { username: string; password: string })).unwrap();
			}
		} catch (err) {
			// Error is handled by Redux
		}
	};

		return (
			<div className="w-full max-w-md mx-auto">
				<div className="bg-white dark:bg-gray-800 shadow-2xl rounded-xl p-8">
					<div className="text-center mb-8">
						<h2 className="text-3xl font-bold text-gray-900 dark:text-white">
							{isSignup ? 'Create Account' : 'Welcome Back'}
						</h2>
						<p className="text-gray-600 dark:text-gray-400 mt-2">
							{isSignup 
								? 'Sign up to start your video sessions' 
								: 'Sign in to your account'
							}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Username Field */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Username
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type="text"
									name="username"
									value={formData.username}
									onChange={handleChange}
									className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your username"
									required
								/>
							</div>
						</div>

						{/* Email Field (only for signup) */}
						{isSignup && (
							<div>
								<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
									Email
								</label>
								<div className="relative">
									<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										placeholder="Enter your email"
										required
									/>
								</div>
							</div>
						)}

						{/* Password Field */}
						<div>
							<label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
								Password
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
								<input
									type={showPassword ? "text" : "password"}
									name="password"
									value={formData.password}
									onChange={handleChange}
									className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
									placeholder="Enter your password"
									required
								/>
								<button
									type="button"
									onClick={() => setShowPassword(!showPassword)}
									className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
								>
									{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
								</button>
							</div>
						</div>

						{/* Error Message */}
						{error && (
							<div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
								<p className="text-sm text-red-600 dark:text-red-400">{error}</p>
							</div>
						)}

						{/* Submit Button */}
						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
						>
							{isLoading ? (
								<div className="flex items-center justify-center">
									<div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
									{isSignup ? 'Creating Account...' : 'Signing In...'}
								</div>
							) : (
								isSignup ? 'Create Account' : 'Sign In'
							)}
						</button>
					</form>

					{/* Toggle Mode */}
					<div className="mt-6 text-center">
						<p className="text-sm text-gray-600 dark:text-gray-400">
							{isSignup ? 'Already have an account?' : "Don't have an account?"}
							<button
								onClick={onToggleMode}
								className="ml-1 font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
							>
								{isSignup ? 'Sign In' : 'Sign Up'}
							</button>
						</p>
					</div>
				</div>
			</div>
		);
}
// ...existing code from components/auth/AuthForm.ts...