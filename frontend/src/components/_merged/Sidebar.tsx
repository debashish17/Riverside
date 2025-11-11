import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home,
  Video,
  PlayCircle,
  FolderOpen,
  Settings,
  HelpCircle,
  LogOut,
  Zap
} from 'lucide-react';
import { toggleSidebar, setSidebarOpen, openModal } from '../../store/slices/uiSlice';
import { logoutUser } from '../../store/slices/authSlice';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { sidebarOpen } = useSelector((state: any) => state.ui);
  const { userSessions } = useSelector((state: any) => state.session);
  const { user } = useSelector((state: any) => state.auth);
  // Hamburger icon for toggle
  const Hamburger = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      badge: null
    },
    {
      id: 'sessions',
      label: 'Sessions',
      icon: Video,
      path: '/sessions',
      badge: userSessions.length > 0 ? userSessions.length : null
    },
    {
      id: 'recordings',
      label: 'Recordings',
      icon: PlayCircle,
      path: '/recordings',
      badge: null
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: FolderOpen,
      path: '/projects',
      badge: null
    }
  ];

  const handleMenuClick = (path: string) => {
    navigate(path);
  };

  const handleLogout = () => {
  dispatch(logoutUser() as any);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || (path !== '/dashboard' && location.pathname.startsWith(path));
  };

  return (
    <aside className={`
      fixed left-0 top-0 z-40 h-screen flex-shrink-0 bg-black border-r border-zinc-800/50
      transition-all duration-300 ease-in-out
      ${sidebarOpen ? 'w-64' : 'w-20'}
    `}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/20 via-transparent to-zinc-900/20 pointer-events-none"></div>
      
      <div className="flex flex-col h-full relative z-10">
        {/* Header section */}
  <div className={`p-4 flex items-center ${!sidebarOpen ? 'justify-center' : ''}`}> 
          {sidebarOpen ? (
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-700/50 flex items-center justify-center relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <Video className="w-5 h-5 text-zinc-400 relative z-10" strokeWidth={1.5} />
                </div>
                <div>
                  <h1 className="text-lg font-light text-white tracking-tight">Riverside</h1>
                  <p className="text-xs text-zinc-600">Studio Platform</p>
                </div>
              </div>
              {/* Hamburger toggle button on the right */}
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="rounded-lg p-1.5 hover:bg-zinc-800/50 transition-colors flex items-center justify-center"
                aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
              >
                <Hamburger className="w-6 h-6 text-zinc-400" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => dispatch(toggleSidebar())}
              className="mx-auto rounded-lg p-1.5 hover:bg-zinc-800/50 transition-colors flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <Hamburger className="w-6 h-6 text-zinc-400" />
            </button>
          )}
        </div>

        {/* Main Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = isActivePath(item.path);
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleMenuClick(item.path)}
                    className={`
                      group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all
                      ${!sidebarOpen ? 'justify-center' : 'justify-start'}
                      ${isActive 
                        ? 'bg-white text-black' 
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                      }
                    `}
                    title={!sidebarOpen ? item.label : ''}
                  >
                    {/* Active indicator glow */}
                    {isActive && (
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl blur"></div>
                    )}
                    
                    <item.icon className={`w-5 h-5 flex-shrink-0 relative z-10 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} strokeWidth={isActive ? 2 : 1.5} />
                    
                    {sidebarOpen && (
                      <>
                        <span className={`text-sm font-medium flex-1 text-left relative z-10 ${isActive ? 'font-semibold' : ''}`}>
                          {item.label}
                        </span>
                        {item.badge && (
                          <span className="relative z-10 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-blue-500 rounded-md">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Divider */}

          {/* Secondary Actions */}
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => navigate('/settings')}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all
                  ${!sidebarOpen ? 'justify-center' : 'justify-start'}
                `}
                title={!sidebarOpen ? 'Settings' : ''}
              >
                <Settings className="w-5 h-5 flex-shrink-0 group-hover:rotate-90 transition-transform duration-300" strokeWidth={1.5} />
                {sidebarOpen && (
                  <span className="text-sm font-medium">Settings</span>
                )}
              </button>
            </li>
            
            <li>
              <button
                onClick={() => dispatch(openModal('help'))}
                className={`
                  group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all
                  ${!sidebarOpen ? 'justify-center' : 'justify-start'}
                `}
                title={!sidebarOpen ? 'Help' : ''}
              >
                <HelpCircle className="w-5 h-5 flex-shrink-0 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                {sidebarOpen && (
                  <span className="text-sm font-medium">Help</span>
                )}
              </button>
            </li>
          </ul>
        </nav>

        {/* Bottom Section - User Profile */}
  <div className="p-4">
          {/* User Profile */}
          <div className="mb-3">
            <button
              onClick={() => navigate('/profile')}
              className={`
                group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-all
                ${!sidebarOpen ? 'justify-center' : 'justify-start'}
              `}
              title={!sidebarOpen ? user?.username || 'Profile' : ''}
            >
              {/* Gradient background on hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-purple-500/0 group-hover:from-blue-500/10 group-hover:to-purple-500/10 rounded-xl transition-all"></div>
              
              <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm font-semibold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </span>
              </div>
              
              {sidebarOpen && (
                <div className="flex-1 text-left relative z-10">
                  <div className="text-sm font-medium text-white group-hover:text-white transition-colors">
                    {user?.username || 'User'}
                  </div>
                  <div className="text-xs text-zinc-600 group-hover:text-zinc-500 transition-colors truncate">
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
              )}
            </button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className={`
              group w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all
              ${!sidebarOpen ? 'justify-center' : 'justify-start'}
            `}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0 group-hover:translate-x-0.5 transition-transform" strokeWidth={1.5} />
            {sidebarOpen && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </button>

          {/* Upgrade Banner (Only when expanded) */}
          {sidebarOpen && (
            <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-zinc-700/50 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-blue-400" strokeWidth={2} />
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">Pro</span>
                </div>
                <p className="text-xs text-zinc-400 mb-3">Unlock premium features</p>
                <button className="w-full py-1.5 bg-white text-black rounded-lg text-xs font-medium hover:bg-zinc-100 transition-all">
                  Upgrade Now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;