import { lazy, Suspense, useEffect, useState, useCallback } from "react";
import { useDispatch } from "react-redux";
import { setJobs } from "../features/Jobslice";
import { Appdispatch } from "../app/Store";
import HomeLoader from "../Components/HomeLoader";
import { JobcardProps } from "../utils/types";
import { getJobsService, getCategoriesService } from "../api/services";
import { Search, MapPin, Filter } from "lucide-react";

const Jobcard = lazy(() => import("../Components/JobCard/Jobcard"));

const Jobs: React.FC = () => {
  const dispatch = useDispatch<Appdispatch>();
  const [jobs, setJobsList] = useState<JobcardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

  const [filters, setFilters] = useState({
    category: "All Categories",
    location: "",
    jobtypes: [] as string[],
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const activeJobtypes = filters.jobtypes.length > 0 ? filters.jobtypes.join(",") : undefined;
      const response = await getJobsService({
        category: filters.category,
        location: filters.location,
        ...(activeJobtypes && { jobtype: activeJobtypes }),
      });
      if (response.success) {
        setJobsList(response.jobs);
        dispatch(setJobs(response.jobs));
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await getCategoriesService();
        if (response.success && response.categories) {
          // Merge fetched categories with defaults and remove duplicates
          const merged = Array.from(new Set([...response.categories, "Software", "Marketing", "Finance"]));
          setCategories(merged);
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

  return (
    <div className="flex-1 w-full bg-[#fafafa] min-h-screen pt-8 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR FILTERS */}
        <aside className="w-full md:w-1/4 flex flex-col gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-gray-900 border-b border-gray-100 pb-4">
              <Filter size={20} className="text-primary-600" />
              <h2 className="text-lg font-bold tracking-tight">Filters</h2>
            </div>
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Category</label>
                <div className="relative">
                  <select
                    className="form-select appearance-none pl-4"
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
                    className="form-input pl-10"
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
            </div>
          </div>
        </aside>

        {/* MAIN FEED */}
        <main className="w-full md:w-3/4 flex flex-col gap-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold text-gray-900">
              Recommended Jobs <span className="text-primary-600 ml-2 bg-primary-50 px-3 py-1 text-sm rounded-full">{jobs.length}</span>
            </h1>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="w-full flex justify-center py-12">
                <HomeLoader />
              </div>
            ) : jobs.length > 0 ? (
              jobs.map((job) => (
                <Suspense key={job._id} fallback={<div className="h-40 bg-white rounded-2xl animate-pulse"></div>}>
                  <Jobcard {...job} />
                </Suspense>
              ))
            ) : (
              <div className="bg-white py-16 px-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Search size={24} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No jobs found</h3>
                <p className="text-gray-500 max-w-sm">Try adjusting your filters or search terms to find what you're looking for.</p>
                <button 
                  onClick={() => setFilters({ category: "All Categories", location: "", jobtypes: [] })}
                  className="mt-6 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Jobs;
