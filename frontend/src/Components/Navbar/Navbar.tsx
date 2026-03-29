import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/Store";
import { logout } from "../../features/Authslice";
import { logoutService } from "../../api/services";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Briefcase, LogOut, User, Menu, X } from "lucide-react";
import { toast } from "react-toastify";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const userInfo = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(e.target as Node)) {
        setLoginDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setLoginDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logoutService();
      dispatch(logout());
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const isAuthPage = location.pathname.includes("login") || location.pathname.includes("signup");

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "glass-morphism py-3" : "bg-transparent py-4"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">

        {/* LOGO */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="bg-primary-600 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform shadow-md shadow-primary-500/30">
            <Briefcase size={22} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            Get<span className="text-primary-600">Hired</span>
          </span>
        </div>

        {/* SEARCH BAR (desktop only, non-auth pages) */}
        {!isAuthPage && (
          <div className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for jobs, roles, companies..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200/50 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-inner"
            />
          </div>
        )}

        {/* DESKTOP AUTH ACTIONS */}
        <div className="hidden md:flex items-center gap-3">
          {userInfo.isAuthenticated ? (
            <div className="flex items-center gap-3">
              {userInfo.role === "Recruiter" && (
                <button
                  onClick={() => navigate("/recruiterhome")}
                  className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors"
                >
                  Recruiter Dashboard
                </button>
              )}
              {userInfo.role === "Candidate" && (
                <button
                  onClick={() => navigate("/candidate/applied")}
                  className="flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-full transition-colors"
                >
                  My Applications
                </button>
              )}

              {/* Profile Dropdown - click-based */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
                    {userInfo.name?.charAt(0).toUpperCase() || <User size={18} />}
                  </div>
                  <ChevronDown size={14} className={`text-gray-500 transition-transform ${profileDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {profileDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 4, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                        <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
                      </div>
                      <button
                        onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                      >
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {/* Login Dropdown - click-based */}
              <div className="relative" ref={loginDropdownRef}>
                <button
                  onClick={() => setLoginDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900 px-3 py-2 transition-colors"
                >
                  Log in <ChevronDown size={16} className={`transition-transform ${loginDropdownOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {loginDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-44 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                    >
                      <button
                        onClick={() => { navigate("/login"); setLoginDropdownOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors"
                      >
                        As Candidate
                      </button>
                      <button
                        onClick={() => { navigate("/login?role=Recruiter"); setLoginDropdownOpen(false); }}
                        className="w-full text-left px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-primary-600 transition-colors border-t border-gray-50"
                      >
                        As Recruiter
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => navigate("/signup")}
                className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-full text-sm font-medium shadow-md transition-all hover:-translate-y-0.5"
              >
                Sign up
              </button>
            </div>
          )}
        </div>

        {/* MOBILE HAMBURGER */}
        <button
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-700"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-md"
          >
            <div className="px-4 py-4 space-y-1">

              {/* Mobile Search */}
              {!isAuthPage && (
                <div className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search jobs..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </div>
              )}

              {userInfo.isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-2 py-3 border-b border-gray-100 mb-2">
                    <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
                      {userInfo.name?.charAt(0).toUpperCase() || <User size={16} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                      <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
                    </div>
                  </div>

                  {userInfo.role === "Recruiter" && (
                    <button
                      onClick={() => navigate("/recruiterhome")}
                      className="w-full text-left px-3 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
                    >
                      Recruiter Dashboard
                    </button>
                  )}
                  {userInfo.role === "Candidate" && (
                    <button
                      onClick={() => navigate("/candidate/applied")}
                      className="w-full text-left px-3 py-3 text-sm font-medium text-gray-700 hover:bg-primary-50 hover:text-primary-700 rounded-xl transition-colors"
                    >
                      My Applications
                    </button>
                  )}
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                  >
                    <LogOut size={16} /> Logout
                  </button>
                </>
              ) : (
                <>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">Log in as</p>
                  <button
                    onClick={() => { navigate("/login"); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Candidate
                  </button>
                  <button
                    onClick={() => { navigate("/login?role=Recruiter"); setMobileMenuOpen(false); }}
                    className="w-full text-left px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    Recruiter
                  </button>
                  <div className="pt-2">
                    <button
                      onClick={() => { navigate("/signup"); setMobileMenuOpen(false); }}
                      className="w-full bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-semibold shadow-md transition-all"
                    >
                      Sign up
                    </button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
