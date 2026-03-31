
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getMeService } from "./api/services";
import { setCredentials, logout } from "./features/Authslice";
import Navbar from "./Components/Navbar/Navbar";
import "./App.css";

function App() {
  const dispatch = useDispatch();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const res = await getMeService();
        if (res.success && res.user) {
          dispatch(setCredentials(res.user));
        } else {
          dispatch(logout());
        }
      } catch (error) {
        // Automatically handled by interceptor if completely failed
        dispatch(logout());
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, [dispatch]);

  if (isInitializing) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-10 w-10 animate-spin rounded-full border-t-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col w-full h-screen bg-gray-50 font-sans text-gray-900 overflow-hidden">
      <Navbar />
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <Outlet />
      </div>
      <ToastContainer position="bottom-right" theme="colored" autoClose={3000} />
    </div>
  );
}

export default App;
