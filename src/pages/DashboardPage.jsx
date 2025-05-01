import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export const DashboardPage = () => {
  const { user, logout, refreshToken, sessionTimeout } = useAuth();

  // Simulate token refresh every 4 minutes (before 5 minute timeout)
  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(() => {
      refreshToken();
      console.log("Token refreshed");
    }, 4 * 60 * 1000); // 4 minutes

    return () => clearInterval(refreshInterval);
  }, [user, refreshToken]);

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">My App</h1>
              </div>
            </div>
            <div className="ml-6 flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                Session expires in:{" "}
                {Math.ceil(
                  (sessionTimeout -
                    (Date.now() -
                      parseInt(localStorage.getItem("lastActivity")))) /
                    60000
                )}{" "}
                minutes
              </div>
              <button
                onClick={logout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Dashboard
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>You're logged in as {user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
