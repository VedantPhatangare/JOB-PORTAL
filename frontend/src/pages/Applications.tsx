import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { applicantData } from "../utils/types";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useSelector } from "react-redux";
import { RootState } from "../app/Store";
import { getApplicantsService, makeHiringDecisionService } from "../api/services";
import { toast } from "react-toastify";
import { ChevronLeft, FileText, CheckCircle, XCircle, Clock, Loader2, Users, ChevronDown, UserCircle, Star, Sparkles } from "lucide-react";
import { format } from "date-fns";
import MatchBreakdownPopover from "../Components/MatchBreakdownPopover";
import { calculateMatchingBreakdown } from "../utils/matchingBreakdown";

type StatusFilter = "All" | "Pending" | "Shortlisted" | "Accepted" | "Rejected";

function Applications() {
  const navigate = useNavigate();
  const { job_id } = useParams();
  const [applicants, setApplicants] = useState<applicantData[]>([]);
  const [jobTitle, setJobTitle] = useState<string>("");
  const [jobDetails, setJobDetails] = useState<{ title: string; description: string; skills: string[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("All");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const columnHelper = createColumnHelper<applicantData>();
  const auth = useSelector((state: RootState) => state.auth);

  const filteredApplicants = useMemo(() => {
    if (statusFilter === "All") return applicants;
    return applicants.filter((a) => a.status === statusFilter);
  }, [applicants, statusFilter]);

  const statusCounts = useMemo(() => ({
    All: applicants.length,
    Pending: applicants.filter(a => a.status === "Pending").length,
    Shortlisted: applicants.filter(a => a.status === "Shortlisted").length,
    Accepted: applicants.filter(a => a.status === "Accepted").length,
    Rejected: applicants.filter(a => a.status === "Rejected").length,
  }), [applicants]);

  const handleStatusChange = async (
    applicant_id: string,
    job_id_ref: string,
    status: "Accepted" | "Rejected" | "Pending" | "Shortlisted"
  ) => {
    setProcessingId(applicant_id);
    try {
      const response = await makeHiringDecisionService(applicant_id, job_id_ref, status);
      if (response.success) {
        toast.success(`Application marked as ${status.toLowerCase()}`);
        getApplicants();
      } else {
        toast.error(response.message || "Failed to update status");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const getResumeUrl = (resumePath: string) => {
    if (!resumePath) return "";
    if (resumePath.startsWith("http")) return resumePath;
    const filename = resumePath.split(/[\\\/]/).pop();
    const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
    return `${baseUrl}/getresume/${filename}`;
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("applicant_id.name", {
        header: "Candidate",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{row.original.applicant_id.name}</span>
            <span className="text-sm text-gray-500">{row.original.applicant_id.email}</span>
            {row.original.applicant_id.skills && row.original.applicant_id.skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1.5">
                {row.original.applicant_id.skills.slice(0, 3).map(skill => (
                  <span key={skill} className="text-xs px-1.5 py-0.5 bg-primary-50 text-primary-700 rounded font-medium">{skill}</span>
                ))}
                {row.original.applicant_id.skills.length > 3 && (
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded">+{row.original.applicant_id.skills.length - 3}</span>
                )}
              </div>
            )}
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Applied",
        cell: ({ getValue }) => (
          <span className="text-gray-600 font-medium">
            {format(new Date(getValue()), "MMM dd, yyyy")}
          </span>
        )
      }),
      columnHelper.accessor("matchScore", {
        header: "Match Score",
        cell: ({ getValue, row }) => {
          const score = getValue() || 0;
          const candidateSkills = row.original.applicant_id.skills || [];
          const breakdown = jobDetails 
            ? calculateMatchingBreakdown(candidateSkills, jobDetails)
            : { matchedSkills: [], unmatchedSkills: [], totalJobSkills: 0, skillMatchPercentage: 0, details: "" };

          let colorClass = "text-red-600 bg-red-50 border-red-100";
          if (score >= 80) colorClass = "text-emerald-600 bg-emerald-50 border-emerald-100";
          else if (score >= 50) colorClass = "text-amber-600 bg-amber-50 border-amber-100";

          return (
            <div className="flex items-center gap-0.5">
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border font-bold text-xs ${colorClass}`}>
                <Sparkles size={12} className={score >= 80 ? "animate-pulse" : ""} />
                {score}%
              </div>
              <MatchBreakdownPopover matchScore={score} breakdown={breakdown} />
            </div>
          );
        },
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold leading-none ${
              status === "Rejected" ? "bg-red-50 text-red-600 border border-red-100" : 
              status === "Accepted" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
              status === "Shortlisted" ? "bg-indigo-50 text-indigo-600 border border-indigo-100" : 
              "bg-amber-50 text-amber-600 border border-amber-100"
            }`}>
              {status === "Rejected" && <XCircle size={14} />}
              {status === "Accepted" && <CheckCircle size={14} />}
              {status === "Shortlisted" && <Star size={14} fill="currentColor" />}
              {status === "Pending" && <Clock size={14} />}
              {status}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const isProcessing = processingId === row.original.applicant_id._id;
          const isExpanded = expandedRow === row.original.applicant_id._id;

          return (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(getResumeUrl(row.original.resume), "_blank")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors border border-blue-200"
                >
                  <FileText size={14} /> Resume
                </button>

                {row.original.applicant_id.bio && (
                  <button
                    onClick={() => setExpandedRow(isExpanded ? null : row.original.applicant_id._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-50 text-gray-600 hover:bg-gray-100 font-semibold text-xs rounded-lg transition-colors border border-gray-200"
                  >
                    <UserCircle size={14} />
                    <ChevronDown size={12} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                )}

                {row.original.status === "Pending" ? (
                  <>
                    <button
                      onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Shortlisted")}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Shortlist"}
                    </button>
                    <button
                      onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Accepted")}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Hire"}
                    </button>
                    <button
                      onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Rejected")}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Reject"}
                    </button>
                  </>
                ) : row.original.status === "Shortlisted" ? (
                  <>
                    <button
                      onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Accepted")}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Hire"}
                    </button>
                    <button
                      onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Rejected")}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Reject"}
                    </button>
                    <button
                      onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Pending")}
                      disabled={isProcessing}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Undo"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Pending")}
                    disabled={isProcessing}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Undo"}
                  </button>
                )}
              </div>

              {/* Expanded bio */}
              {isExpanded && row.original.applicant_id.bio && (
                <div className="mt-1 text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 leading-relaxed max-w-xs">
                  {row.original.applicant_id.bio}
                </div>
              )}
            </div>
          );
        },
      }),
    ],
    [processingId, expandedRow]
  );

  const table = useReactTable({
    columns,
    data: filteredApplicants,
    getCoreRowModel: getCoreRowModel(),
  });

  const getApplicants = async () => {
    if (!job_id) return;
    try {
      const response = await getApplicantsService(job_id);
      if (response.success) {
        setApplicants(response.applications || []);
        if (response.jobTitle) setJobTitle(response.jobTitle);
        if (response.jobDetails) setJobDetails(response.jobDetails);
      }

    } catch (error) {
      toast.error("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getApplicants();
  }, [job_id]);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== "Recruiter") {
      toast.warning("Unauthorized access. Please login as a Recruiter.");
      navigate("/login");
    }
  }, [auth.isAuthenticated, auth.role, navigate]);

  const statusTabs: StatusFilter[] = ["All", "Pending", "Shortlisted", "Accepted", "Rejected"];

  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-8 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back to Dashboard
        </button>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-5 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                <Users className="text-primary-600" size={22} /> Review Applicants
              </h1>
              <p className="text-gray-500 mt-1 text-sm">
                Recruiting for: <span className="text-primary-600 font-bold">{jobTitle || "Loading job title..."}</span>
              </p>

            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 self-start sm:self-auto">
               <span className="text-gray-500 font-semibold text-sm">Total:</span>
               <span className="text-xl font-black text-primary-600">{applicants.length}</span>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="px-6 pt-4 pb-0 flex gap-2 border-b border-gray-100 overflow-x-auto">
            {statusTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
                  statusFilter === tab
                    ? "text-primary-600 border-primary-600 bg-primary-50/50"
                    : "text-gray-500 border-transparent hover:text-gray-700"
                }`}
              >
                {tab}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
                  statusFilter === tab ? "bg-primary-100 text-primary-700" : "bg-gray-100 text-gray-500"
                }`}>
                  {statusCounts[tab]}
                </span>
              </button>
            ))}
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="animate-spin text-primary-400" />
              </div>
            ) : filteredApplicants.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full min-w-[640px] text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-gray-50/80 border-b border-gray-100">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 md:px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
                          >
                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-primary-50/20 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 md:px-8 py-5 text-sm align-top"
                          >
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-16 text-center">
                <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                  <Users size={32} />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  {statusFilter === "All" ? "No applicants yet" : `No ${statusFilter.toLowerCase()} applicants`}
                </h3>
                <p className="text-gray-500 max-w-sm">
                  {statusFilter === "All"
                    ? "When candidates apply for this position, they will appear here."
                    : `No applicants have been marked as ${statusFilter.toLowerCase()} yet.`}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Applications;
