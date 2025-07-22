'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const authStatus = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');
    
    if (authStatus === 'true' && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">Dashboard</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">
                  Welcome, {user.first_name} {user.last_name}
                </span>
              </div>
            )}
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {user ? `Welcome, ${user.first_name}!` : 'Welcome to the Home Page!'}
              </h2>
              <p className="text-gray-600">
                {user ? `Hello ${user.first_name} ${user.last_name}, you have successfully logged in.` : 'You are logged in.'}
              </p>
              {user && (
                <div className="mt-4 text-sm text-gray-500">
                  <p>Email: {user.email}</p>
                  <p>Username: {user.username}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}