import { useSelector } from "react-redux";
import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface BaseLayoutProps {
	children: ReactNode;
}

/**
 * BaseLayout: provides a reusable layout with sidebar and main content area.
 * Usage: Wrap any page content that should appear with the app layout.
 */
export default function BaseLayout({ children }: BaseLayoutProps) {
		const sidebarOpen = useSelector((state: any) => state.ui.sidebarOpen);
		return (
			<div className="min-h-screen flex bg-black relative overflow-hidden">
				{/* Animated Grid Background - Full Screen */}
				<div className="fixed inset-0 opacity-20 pointer-events-none z-0">
					<div className="absolute inset-0" style={{
						backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
														 linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
						backgroundSize: '50px 50px'
					}}></div>
				</div>

				{/* Ambient Light Effects - Full Screen */}
				<div className="fixed top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>
				<div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none z-0"></div>

				{/* Sidebar - fixed to the left */}
				<div className="sticky top-0 left-0 h-screen z-30">
					<Sidebar />
				</div>
				{/* Main Content */}
				<div className="flex-1 flex flex-col min-h-screen relative z-10">
					{/* Navbar - fixed to the top, ensure it's above sidebar and not covered */}
					<div className={`sticky top-0 left-0 right-0 z-40 backdrop-blur-xl bg-black/50 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
						<Navbar />
					</div>
					{/* Page Content */}
					<main className={`flex-1 overflow-y-auto p-6 transition-all duration-300 ease-in-out ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
						{children}
					</main>
				</div>
			</div>
		);
}