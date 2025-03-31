import axios from "axios";
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

function Applications() {
  const navigate = useNavigate()
  const { job_id } = useParams();
  const [applicants, setApplicants] = useState<applicantData[]>([]);
  const columnHelper = createColumnHelper<applicantData>();
  const isLoggedIn = useSelector((state:RootState)=>state.auth.isAuthenticated)
  const handleStatusChange = async (
    {applicant_id, job_id}:{applicant_id:string, job_id:string},
    status: "Accepted" | "Rejected" | "Pending"
  ) => {
    console.log(applicant_id);
    
    try {
      let response = await axios.post(
        `http://127.0.0.1:5000/api/application/${applicant_id}/decision`,
        { status,job_id },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      console.log(response.data.message);
      
      getApplicants();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("applicant_id._id", {
        header: "ID",
      }),
      columnHelper.accessor("applicant_id.name", {
        header: "Name",
      }),
      columnHelper.accessor("applicant_id.email", {
        header: "Email",
      }),
      columnHelper.accessor("createdAt", {
        header: "Applied Date",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: ({ getValue }) => (
          
          getValue()=="Rejected"? (<span className="tracking-wider font-semibold text-red-500">Rejected</span>) : getValue()=="Accepted" ?(<span className="tracking-wider font-semibold text-emerald-600">Accepted</span>) : (<span className="tracking-wider font-semibold ">Pending</span>)
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex space-x-2">
            <button
              onClick={() => window.open(row.original.resume, "_blank")}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors cursor-pointer"
            >
              {row.original.status == "Pending" ? "Review" : "View"}
            </button>
            {row.original.status == "Pending" && (
              <button
                onClick={() =>
                  handleStatusChange({applicant_id:row.original.applicant_id._id, job_id:row.original.job_id}, "Accepted")
                }
                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors cursor-pointer"
              >
                Hire
              </button>
            )}
            {row.original.status == "Pending" && (
              <button
                onClick={() =>
                  handleStatusChange({applicant_id:row.original.applicant_id._id, job_id:row.original.job_id}, "Rejected")
                }
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors cursor-pointer"
              >
                Reject
              </button>
            )}
            {row.original.status !== "Pending" && (
              <button
                onClick={() =>
                  handleStatusChange({applicant_id:row.original.applicant_id._id, job_id:row.original.job_id}, "Pending")
                }
                className="px-3 py-1 bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors cursor-pointer"
              >
                Undo
              </button>
            )}
          </div>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    columns,
    data: applicants,
    getCoreRowModel: getCoreRowModel(),
  });

  const getApplicants = async () => {
    try {
      let response = await axios.get(
        `http://127.0.0.1:5000/api/application/${job_id}/getApplicants`
      );
      console.log(response.data.applications);
      setApplicants(response.data.applications);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getApplicants();
  }, [job_id]);

  useEffect(() => {
    if(!isLoggedIn){
      navigate('/login')
    }

  }, [isLoggedIn])
  
  return (
    <div className="container mx-auto p-2">
      {applicants.length !== 0? (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-sm font-semibold text-gray-600 uppercase tracking-wider border-b"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ): (
        <div className="bg-white w-64 text-center mx-auto mt-4 rounded-lg p-4 font-semibold tracking-wide">No Application until Now</div>
      )
      }
    </div>
  );
}

export default Applications;
