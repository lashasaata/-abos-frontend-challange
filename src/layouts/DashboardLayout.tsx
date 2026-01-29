import { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { 
  Building2, 
  Ticket, 
  MessageSquare, 
  LogOut, 
  Menu, 
  X,
  LayoutDashboard,
  Users
} from 'lucide-react';
import { cn } from '../lib/utils';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Buildings', href: '/dashboard/buildings', icon: Building2 },
    { name: 'Tickets', href: '/dashboard/tickets', icon: Ticket },
    { name: 'Community', href: '/dashboard/community', icon: MessageSquare },
  ];

  // Add Users link only for Super Admins
  if (user?.role === 'super_admin') {
    navigation.push({ name: 'Users', href: '/dashboard/users', icon: Users });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="lg:hidden bg-white dark:bg-gray-800 shadow-sm p-4 flex items-center justify-between">
        <span className="font-bold text-xl">ABOS</span>
        <button onClick={() => setSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X /> : <Menu />}
        </button>
      </div>

      <div className="flex">
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="h-full flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h1 className="text-2xl font-bold text-blue-600">ABOS</h1>
              <p className="text-sm text-gray-500 mt-1 capitalize">{user?.role?.replace('_', ' ')}</p>
            </div>

            <nav className="flex-1 p-4 space-y-1">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                      isActive
                        ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    )
                  }
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </NavLink>
              ))}
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={logout}
                className="flex w-full items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sign out
              </button>
            </div>
          </div>
        </aside>

        <main className="flex-1 p-6 lg:p-8 overflow-auto h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
