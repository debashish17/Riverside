import React from "react";
import { Video, Users, Shield, Zap } from 'lucide-react';

export default function LoginPreview() {
	const features = [
		{
			icon: Video,
			title: "HD Recording",
			description: "Crystal clear video and audio"
		},
		{
			icon: Users,
			title: "Team Collaboration", 
			description: "Real-time multi-user sessions"
		},
		{
			icon: Shield,
			title: "Secure & Private",
			description: "Enterprise-grade security"
		},
		{
			icon: Zap,
			title: "Lightning Fast",
			description: "Optimized for performance"
		}
	];

	return (
		<div className="flex flex-col items-center justify-center h-full w-full bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-8 text-white">
			{/* Hero Section */}
			<div className="text-center mb-8">
				<div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
					<Video className="w-12 h-12 text-white" />
				</div>
				<h1 className="text-3xl font-bold mb-4">
					Professional Video Sessions
				</h1>
				<p className="text-lg text-white/80 max-w-md">
					Record, collaborate, and share high-quality video content with your team
				</p>
			</div>

			{/* Features Grid */}
			<div className="grid grid-cols-2 gap-4 max-w-md w-full">
				{features.map((feature, index) => {
					const IconComponent = feature.icon;
					return (
						<div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
							<IconComponent className="w-6 h-6 mx-auto mb-2" />
							<h3 className="font-semibold text-sm mb-1">{feature.title}</h3>
							<p className="text-xs text-white/70">{feature.description}</p>
						</div>
					);
				})}
			</div>

			{/* Bottom CTA */}
			<div className="mt-8 text-center">
				<p className="text-sm text-white/60">
					Join thousands of creators worldwide
				</p>
			</div>
		</div>
	);
}
// ...existing code from components/auth/LoginPreview.ts...