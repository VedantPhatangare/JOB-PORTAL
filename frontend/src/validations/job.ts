import { z } from "zod";

export const createJobSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  category: z.string().min(2, "Category is required"),
  company: z.string().min(2, "Company name is required"),
  location: z.string().min(2, "Location is required"),
  salary: z.string().min(1, "Salary is required"),
  experience: z.string().min(1, "Experience is required"),
  jobtype: z.string().min(1, "Job type is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export type CreateJobFormValues = z.infer<typeof createJobSchema>;
