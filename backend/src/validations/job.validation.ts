import { z } from "zod";

export const createJobSchema = z.object({
  body: z.object({
    title: z.string().min(2, "Job title is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(2, "Category is required"),
    company: z.string().min(2, "Company name is required"),
    location: z.string().min(2, "Location is required"),
    salary: z.coerce.number().min(0, "Salary must be a positive number"),
    experience: z.string().min(1, "Experience is required"),
    jobtype: z.enum(["Full-time", "Part-time", "Contract", "Internship"]),
  }),
});
