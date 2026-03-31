import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setJobs } from "../features/Jobslice";
import { Appdispatch, RootState } from "../app/Store";
import { JobcardProps } from "../utils/types";
import { getJobsService, getCategoriesService, getRecommendedJobsService } from "../api/services";
import { Search, MapPin, Filter, X, Sparkles, AlertCircle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Jobcard = lazy(() => import("../Components/JobCard/Jobcard"));
const CompactJobcard = lazy(() => import("../Components/JobCard/CompactJobcard"));

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl p-6 border border-gray-100 animate-pulse">
    <div className="flex gap-4 mb-4">
      <div className="w-12 h-12 bg-gray-200 rounded-xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-2 gap-3 mb-4">
      <div className="h-8 bg-gray-100 rounded-lg" />
      <div className="h-8 bg-gray-100 rounded-lg" />
    </div>
    <div className="border-t border-gray-100 pt-4 flex gap-2">
      <div className="h-6 bg-gray-100 rounded-full w-20" />
      <div className="h-6 bg-gray-100 rounded-full w-24" />
    </div>
  </div>
);

const Jobs: React.FC = () => {
  const dispatch = useDispatch<Appdispatch>();
  const location = useLocation();

  const auth = useSelector((state: RootState) => state.auth);
  const [jobs, setJobsList] = useState<JobcardProps[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobcardProps[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: "All Categories",
    location: "",
    jobtypes: [] as string[],
    minSalary: 0,
  });
  const [localSalary, setLocalSalary] = useState(0);

  // Debounce salary update to avoid API spam
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, minSalary: localSalary }));
    }, 400);
    return () => clearTimeout(timer);
  }, [localSalary]);

  const searchParam = new URLSearchParams(location.search).get("search") || "";

  // Fetch Recommended Jobs (Runs once for candidates with skills)
  const fetchRecommended = useCallback(async () => {
    if (auth.isAuthenticated && auth.role === "Candidate" && auth.skills && auth.skills.length > 0) {
      setLoadingRecommended(true);
      try {
        const res = await getRecommendedJobsService();
        if (res.success) {
          setRecommendedJobs(res.jobs);
        }
      } catch (err) {
        // fail silently
      } finally {
        setLoadingRecommended(false);
      }
    }
  }, [auth.isAuthenticated, auth.role, auth.skills]);

  useEffect(() => {
    fetchRecommended();
  }, [fetchRecommended]);

  // Fetch All Jobs
  const fetchJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const response = await getJobsService({
        search: searchParam || undefined,
        category: (filters.category && filters.category !== "All Categories") ? filters.category : undefined,
        location: filters.location || undefined,
        jobtype: filters.jobtypes.length > 0 ? filters.jobtypes.join(",") : undefined,
        minSalary: filters.minSalary > 0 ? String(filters.minSalary) : undefined
      });
      if (response && response.success) {
        setJobsList(response.jobs);
        dispatch(setJobs(response.jobs));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      setJobsList([]);
    } finally {
      setLoadingJobs(false);
    }
  }, [filters, searchParam, dispatch]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Fetch Categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesService();
        if (response.success && response.categories) {
          setCategories(response.categories);
        }
      } catch (error) {
        setCategories(["Software", "Marketing", "Finance"]);
      }
    };
    fetchCategories();
  }, []);

  const handleCheckboxChange = (type: string) => {
    setFilters((prev) => {
      const isSelected = prev.jobtypes.includes(type);
      return {
        ...prev,
        jobtypes: isSelected
          ? prev.jobtypes.filter((t) => t !== type)
          : [...prev.jobtypes, type],
      };
    });
  };

  const activeFilterCount =
    (filters.category !== "All Categories" ? 1 : 0) +
    (filters.location ? 1 : 0) +
    (filters.minSalary > 0 ? 1 : 0) +
    filters.jobtypes.length;

  const pageTitle = searchParam
    ? `Results for "${searchParam}"`
    : "All Jobs";

  const FilterPanel = () => (
    <div className="bg-white p-5 lg:p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-6 text-gray-900 border-b border-gray-100 pb-4">
        <Filter size={20} className="text-primary-600" />
        <h2 className="text-lg font-bold tracking-tight">Filters</h2>
        {activeFilterCount > 0 && (
          <span className="ml-auto text-xs bg-primary-100 text-primary-700 font-bold px-2 py-0.5 rounded-full">
            {activeFilterCount} active
          </span>
        )}
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Category</label>
          <div className="relative">
            <select
              className="form-select appearance-none pl-4 pr-8 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 w-full text-sm outline-none transition-colors"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            >
              <option value="All Categories">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-gray-700">Location</label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="E.g. Remote, New York"
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-colors"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-sm font-semibold text-gray-700">Job Type</label>
          <div className="flex flex-col gap-3">
            {["Full-time", "Part-time", "Contract", "Internship"].map((type) => (
              <label key={type} className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="peer appearance-none w-5 h-5 border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500/30 checked:bg-primary-600 checked:border-primary-600 transition-all cursor-pointer"
                    checked={filters.jobtypes.includes(type)}
                    onChange={() => handleCheckboxChange(type)}
                  />
                  <svg className="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-medium group-hover:text-gray-900 transition-colors">{type}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-2">
          <div className="flex justify-between items-center">
             <label className="text-sm font-semibold text-gray-700">Minimum Salary</label>
             <motion.span 
               key={localSalary}
               initial={{ opacity: 0, y: -5 }}
               animate={{ opacity: 1, y: 0 }}
               className="text-xs font-bold text-primary-600 bg-primary-50 px-2.5 py-1 rounded-md border border-primary-100 tracking-wide"
             >
               {localSalary > 0 ? `₹${localSalary} LPA+` : 'Any'}
             </motion.span>
          </div>
          <div className="relative pt-1 group">
            <input
              type="range"
              min="0"
              max="50"
              step="1"
              value={localSalary}
              onChange={(e) => setLocalSalary(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary-600 hover:accent-primary-700 focus:outline-none transition-all"
            />
            {/* Smooth progress bar overlay */}
            <div 
              className="absolute top-[13px] left-0 h-1.5 bg-primary-500 rounded-l-lg pointer-events-none transition-all duration-150 ease-out" 
              style={{ width: `${(localSalary / 50) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1">
            <span>₹0</span>
            <span>₹50L+</span>
          </div>
        </div>

        {activeFilterCount > 0 && (
          <button
            onClick={() => {
              setFilters({ category: "All Categories", location: "", jobtypes: [], minSalary: 0 });
              setLocalSalary(0);
            }}
            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors text-left flex items-center gap-1.5 mt-2"
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex-1 min-h-0 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-100">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {pageTitle}
                </h1>
                <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                  {jobs.length}
                </span>
              </div>

              {/* Mobile Filter Toggle */}
              <button
                onClick={() => setFiltersOpen((prev) => !prev)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg shadow-sm text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {filtersOpen ? <X size={18} /> : <Filter size={18} />}
                {activeFilterCount > 0 && (
                  <span className="bg-primary-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Filter Panel */}
        {filtersOpen && (
          <div className="lg:hidden bg-gray-50 border-b border-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <FilterPanel />
            </div>
          </div>
        )}

        {/* Desktop Title Bar - On the left side */}
        <div className="hidden lg:block bg-white border-b border-gray-50">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex gap-8">
              {/* Title on left aligned with filter sidebar */}
              <div className="w-[280px] shrink-0">
                <div className="py-4 flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {pageTitle}
                  </h1>
                  <span className="text-sm font-semibold text-primary-600 bg-primary-50 px-3 py-1 rounded-full border border-primary-100">
                    {jobs.length}
                  </span>
                </div>
              </div>
              
              {/* Spacer for jobs area */}
              <div className="flex-1 border-b border-gray-50"></div>

              {/* Spacer for recommended area */}
              <div className="w-[340px] shrink-0 border-b border-gray-50"></div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col lg:flex-row gap-8 items-stretch">
            
            {/* L: Filter Sidebar */}
            <aside className="hidden lg:block w-[280px] shrink-0 min-h-0 overflow-y-auto custom-scrollbar pt-6 pb-12">
              <div className="sticky top-6">
                <FilterPanel />
              </div>
            </aside>

            {/* M: Main Job Feed */}
            <main className="flex-1 min-w-0 min-h-0 flex flex-col gap-4 overflow-y-auto custom-scrollbar pt-6 pb-12 relative jobs-fade-mask">
              <div className="flex flex-col gap-4">
                {loadingJobs ? (
                  <>
                    {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
                  </>
                ) : jobs.length > 0 ? (
                  jobs.map((job, idx) => (
                    <Suspense key={job._id} fallback={<SkeletonCard />}>
                      <div 
                        style={{ animationDelay: `${idx * 40}ms` }} 
                        className="animate-fade-in transition-all duration-300"
                      >
                        <Jobcard {...job} />
                      </div>
                    </Suspense>
                  ))
                ) : (
                  <div className="bg-white py-16 px-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                      <Search size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs found</h3>
                    <p className="text-gray-500 max-w-sm">Try adjusting your filters or search terms.</p>
                    {activeFilterCount > 0 && (
                      <button
                        onClick={() => setFilters({ category: "All Categories", location: "", jobtypes: [], minSalary: 0 })}
                        className="mt-6 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                      >
                        Clear all filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            </main>

            {/* R: Recommended Jobs Sidebar */}
            {auth.isAuthenticated && auth.role === "Candidate" && auth.skills && auth.skills.length > 0 && (
              <aside className="w-full lg:w-[340px] shrink-0 min-h-0 overflow-y-auto custom-scrollbar pt-6 pb-12">
                <div className="sticky top-6 bg-gradient-to-br from-primary-50/80 to-primary-50/40 p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex items-center gap-2 mb-5">
                    <Sparkles size={22} className="text-primary-600" />
                    <h2 className="text-lg font-bold text-gray-900">Recommended For You</h2>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-5 font-medium leading-relaxed">
                    Matched based on your skills: <span className="text-gray-900 font-bold">{auth.skills.slice(0,3).join(", ")}{auth.skills.length > 3 ? "..." : ""}</span>
                  </p>

                  <div className="flex flex-col gap-3">
                    {loadingRecommended ? (
                      <>
                        <div className="h-24 bg-white/60 animate-pulse rounded-xl" />
                        <div className="h-24 bg-white/60 animate-pulse rounded-xl" />
                      </>
                    ) : recommendedJobs.length > 0 ? (
                      recommendedJobs.slice(0, 4).map((job, idx) => (
                        <Suspense key={job._id} fallback={<div className="h-24 bg-white/60 animate-pulse rounded-xl" />}>
                          <div style={{ animationDelay: `${idx * 80}ms` }} className="animate-fade-in">
                            <CompactJobcard {...job} />
                          </div>
                        </Suspense>
                      ))
                    ) : (
                      <div className="bg-white/80 rounded-2xl p-5 text-center border border-white">
                        <AlertCircle size={24} className="mx-auto text-primary-300 mb-2" />
                        <p className="text-sm font-semibold text-gray-700">No strong matches found.</p>
                        <p className="text-xs text-gray-500 mt-1">Try adding more specific skills to your profile.</p>
                      </div>
                    )}
                  </div>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs;
