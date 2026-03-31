import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../app/Store";
import { logout } from "../../features/Authslice";
import { logoutService } from "../../api/services";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Briefcase, LogOut, User, Menu, X, UserCircle, Heart } from "lucide-react";
import { toast } from "react-toastify";
import ConfirmationModal from "../ConfirmationModal";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
 
  const isAuthPage = location.pathname.includes("login") || location.pathname.includes("signup");
  const auth = useSelector((state: RootState) => state.auth);
  const profilePath = auth.role === "Recruiter" ? "/profile/recruiter" : "/profile/candidate";


  const [scrolled, setScrolled] = useState(false);
  const [loginDropdownOpen, setLoginDropdownOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const userInfo = useSelector((state: RootState) => state.auth);

  // Sync search input with URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchFromUrl = params.get("search") || "";
    if (searchQuery !== searchFromUrl) {
      setSearchQuery(searchFromUrl);
    }
  }, [location.search]);

  // Real-time debounced search
  useEffect(() => {
    // Skip if we are on auth pages
    if (isAuthPage) return;

    const timer = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const currentUrlSearch = params.get("search") || "";
      const trimmedQuery = searchQuery.trim();

      // Only navigate if the local state actually differs from URL
      if (trimmedQuery !== currentUrlSearch) {
        if (trimmedQuery) {
          navigate(`/?search=${encodeURIComponent(trimmedQuery)}`, { replace: true });
        } else if (currentUrlSearch !== "") {
          navigate("/", { replace: true });
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, navigate, location.search, isAuthPage]);


  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  useEffect(() => {
    setMobileMenuOpen(false);
    setLoginDropdownOpen(false);
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    setLogoutModalOpen(true);
    setProfileDropdownOpen(false);
    setMobileMenuOpen(false);
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutService();
      dispatch(logout());
      toast.success("Logged out successfully");
      setLogoutModalOpen(false);
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed");
      setIsLoggingOut(false);
    }
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/?search=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/");
    }
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-white shadow-md border-b border-gray-100" : "bg-white py-0"
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

        {/* SEARCH BAR (desktop, non-auth pages) */}
        {!isAuthPage && (
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-8 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for jobs, roles, companies..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100/80 border border-gray-200/50 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); navigate("/"); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </form>
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
                  Dashboard
                </button>
              )}
              {userInfo.role === "Candidate" && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => navigate("/jobs/saved")}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-full ${location.pathname === "/jobs/saved" ? "bg-red-50 text-red-600 shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Heart size={16} fill={location.pathname === "/jobs/saved" ? "currentColor" : "none"} /> Saved
                  </button>
                  <button
                    onClick={() => navigate("/candidate/applied")}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors px-4 py-2 rounded-full ${location.pathname === "/candidate/applied" ? "bg-primary-50 text-primary-700 shadow-sm" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    My Applications
                  </button>
                </div>
              )}

              {/* Profile Dropdown */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <div className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-md">
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
                      className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-gray-50">
                        <p className="text-sm font-semibold text-gray-900 truncate">{userInfo.name}</p>
                        <p className="text-xs text-gray-400 truncate">{userInfo.email}</p>
                        <span className="inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary-50 text-primary-700">{userInfo.role}</span>
                      </div>
                      <button
                        onClick={() => { navigate(profilePath); setProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors text-left"
                      >
                        <UserCircle size={16} className="text-gray-400" /> My Profile
                      </button>
                      <button
                        onClick={() => { handleLogout(); setProfileDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors text-left border-t border-gray-50"
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
              {/* Login Dropdown */}
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
                <form onSubmit={handleSearch} className="relative mb-3">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={16} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search jobs..."
                    className="w-full pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                  />
                </form>
              )}

              {userInfo.isAuthenticated ? (
                <>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-2 py-3 border-b border-gray-100 mb-2">
                    <div className="w-10 h-10 bg-primary-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow">
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
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => navigate("/jobs/saved")}
                        className={`w-full text-left px-3 py-3 text-sm font-medium rounded-xl transition-colors flex items-center gap-2 ${location.pathname === "/jobs/saved" ? "bg-red-50 text-red-600" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <Heart size={16} fill={location.pathname === "/jobs/saved" ? "currentColor" : "none"} /> Saved Jobs
                      </button>
                      <button
                        onClick={() => navigate("/candidate/applied")}
                        className={`w-full text-left px-3 py-3 text-sm font-medium rounded-xl transition-colors ${location.pathname === "/candidate/applied" ? "bg-primary-50 text-primary-700" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        My Applications
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => { navigate(profilePath); setMobileMenuOpen(false); }}
                    className="w-full flex items-center gap-2 px-3 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-xl transition-colors"
                  >
                    <UserCircle size={16} className="text-gray-400" /> My Profile
                  </button>
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

      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={logoutModalOpen}
        title="Logout"
        message={`Are you sure you want to logout? You'll need to log in again to access your account.`}
        confirmText={isLoggingOut ? "Logging out..." : "Logout"}
        cancelText="Cancel"
        variant="warning"
        isDangerous={true}
        isLoading={isLoggingOut}
        onConfirm={confirmLogout}
        onCancel={cancelLogout}
      />
    </nav>
  );
};

export default Navbar;
