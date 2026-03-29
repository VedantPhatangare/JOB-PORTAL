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
import { ChevronLeft, FileText, CheckCircle, XCircle, Clock, Loader2, Users } from "lucide-react";
import { format } from "date-fns";

function Applications() {
  const navigate = useNavigate();
  const { job_id } = useParams();
  const [applicants, setApplicants] = useState<applicantData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const columnHelper = createColumnHelper<applicantData>();
  const auth = useSelector((state: RootState) => state.auth);

  const handleStatusChange = async (
    applicant_id: string,
    job_id_ref: string,
    status: "Accepted" | "Rejected" | "Pending"
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
      console.error("Error updating status:", error);
    } finally {
      setProcessingId(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("applicant_id.name", {
        header: "Candidate Info",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-bold text-gray-900">{row.original.applicant_id.name}</span>
            <span className="text-sm text-gray-500">{row.original.applicant_id.email}</span>
          </div>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Applied Date",
        cell: ({ getValue }) => (
          <span className="text-gray-600 font-medium">
            {format(new Date(getValue()), "MMM dd, yyyy")}
          </span>
        )
      }),
      columnHelper.accessor("status", {
        header: "Current Status",
        cell: ({ getValue }) => {
          const status = getValue();
          return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold leading-none ${
              status === "Rejected" ? "bg-red-50 text-red-600 border border-red-100" : 
              status === "Accepted" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
              "bg-amber-50 text-amber-600 border border-amber-100"
            }`}>
              {status === "Rejected" && <XCircle size={14} />}
              {status === "Accepted" && <CheckCircle size={14} />}
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
          
          const getResumeUrl = (resumePath: string) => {
            if (!resumePath) return "";
            if (resumePath.startsWith("http")) return resumePath;
            // Extract filename from full path (Windows or Unix)
            const filename = resumePath.split(/[\\/]/).pop();
            const baseUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace("/api", "") : "http://localhost:5000";
            return `${baseUrl}/getresume/${filename}`;
          };

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.open(getResumeUrl(row.original.resume), "_blank")}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg transition-colors border border-blue-200"
                title="View Resume"
              >
                <FileText size={14} /> Resume
              </button>

              {row.original.status === "Pending" ? (
                <>
                  <button
                    onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Accepted")}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Hire"}
                  </button>
                  <button
                    onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Rejected")}
                    disabled={isProcessing}
                    className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold text-xs rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Reject"}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleStatusChange(row.original.applicant_id._id, row.original.job_id, "Pending")}
                  disabled={isProcessing}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-lg transition-colors border border-gray-200 disabled:opacity-50"
                  title="Move back to pending review"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : "Undo Decision"}
                </button>
              )}
            </div>
          );
        },
      }),
    ],
    [processingId]
  );

  const table = useReactTable({
    columns,
    data: applicants,
    getCoreRowModel: getCoreRowModel(),
  });

  const getApplicants = async () => {
    if (!job_id) return;
    try {
      const response = await getApplicantsService(job_id);
      if (response.success) {
        setApplicants(response.applications || []);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to fetch applications.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getApplicants();
    // eslint-disable-next-line
  }, [job_id]);

  useEffect(() => {
    if (!auth.isAuthenticated || auth.role !== "Recruiter") {
      toast.warning("Unauthorized access. Please login as a Recruiter.");
      navigate("/login");
    }
  }, [auth.isAuthenticated, auth.role, navigate]);

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
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                <Users className="text-primary-600" size={24} /> Review Applicants
              </h1>
              <p className="text-gray-500 mt-1">Review and manage candidates that applied to this position.</p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100">
               <span className="text-gray-500 font-semibold text-sm">Total Applications:</span>
               <span className="text-xl font-black text-primary-600">{applicants.length}</span>
            </div>
          </div>

          <div className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 size={40} className="animate-spin text-primary-400" />
              </div>
            ) : applicants.length > 0 ? (
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    {table.getHeaderGroups().map((headerGroup) => (
                      <tr key={headerGroup.id} className="bg-gray-50/80 border-b border-gray-100">
                        {headerGroup.headers.map((header) => (
                          <th
                            key={header.id}
                            className="px-6 md:px-8 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider"
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(header.column.columnDef.header, header.getContext())}
                          </th>
                        ))}
                      </tr>
                    ))}
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {table.getRowModel().rows.map((row) => (
                      <tr key={row.id} className="hover:bg-primary-50/30 transition-colors">
                        {row.getVisibleCells().map((cell) => (
                          <td
                            key={cell.id}
                            className="px-6 md:px-8 py-5 whitespace-nowrap text-sm align-middle"
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
                <h3 className="text-lg font-bold text-gray-900 mb-2">No applicants yet</h3>
                <p className="text-gray-500 max-w-sm">When candidates apply for this position, they will appear here for you to review.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

export default Applications;
