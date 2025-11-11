import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Search, Command } from "lucide-react";
import { toggleSidebar } from "../../store/slices/uiSlice";

const Navbar = () => {
  // const dispatch = useDispatch();
  // const sidebarOpen = useSelector((state) => state.ui.sidebarOpen);

  return (
    <nav className="h-16 flex items-center justify-between px-6 border-b border-zinc-800/50 flex-shrink-0 bg-black relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-zinc-900/20 via-transparent to-zinc-900/20 pointer-events-none"></div>
      
      <div className="relative z-10 flex items-center justify-between w-full">
        {/* Left Section - Menu Toggle */}
        <div className="flex items-center gap-4"></div>

        {/* Center Section - Search Bar */}
        <div className="flex-1 flex justify-center max-w-2xl mx-auto">
          <div className="relative w-full group">
            {/* Glow effect on focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-focus-within:from-blue-500/20 group-focus-within:to-purple-500/20 rounded-xl blur transition-all duration-300"></div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Search sessions, recordings..."
                className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-zinc-800/50 bg-zinc-900/40 backdrop-blur-xl text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-700 transition-all text-sm"
              />
              <span className="absolute left-3.5 top-3 text-zinc-600">
                <Search size={16} strokeWidth={1.5} />
              </span>
              
              {/* Keyboard shortcut hint */}
              <div className="absolute right-3 top-2 hidden md:flex items-center gap-1 px-2 py-1 bg-zinc-800/50 border border-zinc-700/50 rounded-md">
                <Command size={10} strokeWidth={2} className="text-zinc-500" />
                <span className="text-[10px] font-medium text-zinc-500">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Section - Placeholder for future features */}
        <div className="w-10"></div>
      </div>
    </nav>
  );
};

export default Navbar;