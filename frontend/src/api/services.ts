import apiClient from "./axiosClient";
import { RegisterPayload, LoginPayload, AuthResponse } from "../utils/types"; // Need to check if these exist, else will create

// --- Auth Services ---
export const registerService = async (data: RegisterPayload) => {
  const response = await apiClient.post<AuthResponse>("/auth/register", data);
  return response.data;
};

export const loginService = async (data: LoginPayload) => {
  const response = await apiClient.post<AuthResponse>("/auth/login", data);
  return response.data;
};

export const logoutService = async () => {
  const response = await apiClient.post("/auth/logout");
  return response.data;
};

export const getMeService = async () => {
  const response = await apiClient.get<AuthResponse>("/auth/me");
  return response.data;
};

// --- Job Services ---
export const getJobsService = async (filters?: { location?: string; jobtype?: string; category?: string }) => {
  try {
    const params = new URLSearchParams();
    if (filters?.location) params.append("location", filters.location);
    if (filters?.jobtype) params.append("jobtype", filters.jobtype);
    if (filters?.category) params.append("category", filters.category);

    const response = await apiClient.get(`/jobs/getjobs?${params.toString()}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategoriesService = async () => {
  try {
    const response = await apiClient.get('/jobs/categories');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createJobService = async (formData: FormData) => {
  const response = await apiClient.post("/jobs/createjob", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteJobService = async (id: string) => {
  const response = await apiClient.delete("/jobs/deletejob", { data: { id } });
  return response.data;
};

// --- Application Services ---
export const applyForJobService = async (jobId: string, formData: FormData) => {
  const response = await apiClient.post(`/application/${jobId}/apply`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getApplicantsService = async (jobId: string) => {
  const response = await apiClient.get(`/application/${jobId}/getApplicants`);
  return response.data;
};

export const getApplicantDetailsService = async (userId: string, jobId: string) => {
  const response = await apiClient.post("/application/getApplicant", { user_id: userId, job_id: jobId });
  return response.data;
};

export const makeHiringDecisionService = async (applicantId: string, jobId: string, status: string) => {
  const response = await apiClient.post(`/application/${applicantId}/decision`, { job_id: jobId, status });
  return response.data;
};

export const getCandidateAppliedJobsService = async () => {
  const response = await apiClient.get("/application/candidate/applied");
  return response.data;
};
