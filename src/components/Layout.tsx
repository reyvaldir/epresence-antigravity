import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, MapPin, User, Menu, Calendar, FileText, 
  LayoutDashboard, Users, BarChart3, Clock, LogOut 
} from 'lucide-react';
import clsx from 'clsx';
import { useState } from 'react';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Get user role from localStorage
  const storedUser = localStorage.getItem('user');
  const user = storedUser ? JSON.parse(storedUser) : null;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const isActive = (path: string) => location.pathname === path;

  const employeeNavItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: MapPin, label: 'Attendance', path: '/attendance' },
    { icon: Calendar, label: 'My Schedule', path: '/schedule' },
    { icon: FileText, label: 'Leave Request', path: '/leave' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Employees', path: '/admin/employees' },
    { icon: Calendar, label: 'Schedules', path: '/admin/schedule' },
    { icon: FileText, label: 'Absence', path: '/admin/absence' },
    { icon: MapPin, label: 'Locations', path: '/admin/locations' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Clock, label: 'Pending', path: '/admin/pending' },
  ];

  const navItems = isAdmin ? adminNavItems : employeeNavItems;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Don't show layout on login page
  if (location.pathname === '/login') {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className={clsx(
        "flex-1 pb-20 transition-all duration-300",
        isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
      )}>
        <Outlet />
      </main>

      {/* Bottom Navigation for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-50 md:hidden">
        {navItems.slice(0, 4).map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={clsx(
              "flex flex-col items-center gap-1 transition-colors",
              isActive(item.path) ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            )}
          >
            <item.icon className={clsx("w-6 h-6", isActive(item.path) && "fill-current")} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button 
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="flex flex-col items-center gap-1 text-gray-400 hover:text-gray-600"
        >
          <Menu className="w-6 h-6" />
          <span className="text-[10px] font-medium">More</span>
        </button>
      </div>

      {/* Desktop Sidebar (Hidden on mobile) */}
      <div className={clsx(
        "hidden md:flex fixed left-0 top-0 bottom-0 bg-white border-r border-gray-200 flex-col transition-all duration-300 z-40",
        isSidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className={clsx(
          "h-16 flex items-center border-b border-gray-100 mb-4 transition-all duration-300",
          isSidebarCollapsed ? "justify-center px-2" : "justify-between px-4"
        )}>
          <div className={clsx(
            "font-bold text-xl text-blue-600 whitespace-nowrap overflow-hidden transition-all duration-300",
            isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
          )}>
            {isAdmin ? 'SmartHR Admin' : 'SmartHR'}
          </div>

          <button
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
        
        <nav className="space-y-2 flex-1 px-4 overflow-y-auto py-4">
          {isAdmin ? (
            <>
              {/* Admin Section */}
              <div className={clsx("text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 transition-all duration-300", isSidebarCollapsed ? "opacity-0" : "opacity-100")}>
                Admin Tools
              </div>
              {adminNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive(item.path) ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50",
                    isSidebarCollapsed && "justify-center px-2"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={clsx(
                    "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
                </button>
              ))}

              <div className="my-4 border-t border-gray-100" />

              {/* Employee Section */}
              <div className={clsx("text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2 transition-all duration-300", isSidebarCollapsed ? "opacity-0" : "opacity-100")}>
                Attendance Tools
              </div>
              {employeeNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={clsx(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                    isActive(item.path) ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50",
                    isSidebarCollapsed && "justify-center px-2"
                  )}
                  title={isSidebarCollapsed ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={clsx(
                    "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                    isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                  )}>
                    {item.label}
                  </span>
                </button>
              ))}
            </>
          ) : (
            // Regular Employee View
            employeeNavItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.path) ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50",
                  isSidebarCollapsed && "justify-center px-2"
                )}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className={clsx(
                  "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
                  isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}>
                  {item.label}
                </span>
              </button>
            ))
          )}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-red-600 hover:bg-red-50",
              isSidebarCollapsed && "justify-center px-2"
            )}
            title={isSidebarCollapsed ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className={clsx(
              "font-medium transition-all duration-300 whitespace-nowrap overflow-hidden",
              isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
            )}>
              Logout
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
