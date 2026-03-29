import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerService } from "../api/services";
import { signupSchema, SignupFormValues } from "../validations/auth";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { UserPlus, Mail, Lock, Loader2 } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultRole = (searchParams.get("role") as "Candidate" | "Recruiter") || "Candidate";
  
  const [selectedRole, setSelectedRole] = useState<"Candidate" | "Recruiter">(defaultRole);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: defaultRole
    }
  });

  useEffect(() => {
    setValue("role", selectedRole);
  }, [selectedRole, setValue]);

  const onSubmit = async (data: SignupFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await registerService({ ...data, role: selectedRole });
      if (response.success) {
        toast.success("Account created successfully! Please login.");
        navigate(`/login?role=${selectedRole}`);
      } else {
        toast.error(response.message || "Failed to register");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[92vh] flex items-center justify-center bg-[#fafafa] p-4 relative overflow-hidden">
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary-200/40 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>
      <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-emerald-200/30 rounded-full blur-3xl -z-10 mix-blend-multiply"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white p-6 sm:p-8"
      >
        <div className="flex flex-col items-center mb-6">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-inner ${selectedRole === "Recruiter" ? "bg-purple-50 text-purple-600" : "bg-primary-50 text-primary-600"}`}>
            <UserPlus size={32} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Create Account</h2>
          <p className="text-sm text-gray-500 mt-2 text-center">
            Join GetHired to take the next step in your career.
          </p>
        </div>

        <div className="flex bg-gray-100 p-1 rounded-xl mb-6 shadow-inner">
           <button
             type="button"
             onClick={() => setSelectedRole("Candidate")}
             className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
               selectedRole === "Candidate" 
                 ? "bg-white text-primary-600 shadow-sm" 
                 : "text-gray-500 hover:text-gray-700"
             }`}
           >
             Candidate
           </button>
           <button
             type="button"
             onClick={() => setSelectedRole("Recruiter")}
             className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
               selectedRole === "Recruiter" 
                 ? "bg-white text-purple-600 shadow-sm" 
                 : "text-gray-500 hover:text-gray-700"
             }`}
           >
             Recruiter
           </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                {...register("name")}
                className={`w-full px-4 py-3 bg-gray-50/50 border ${errors.name ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'} rounded-xl text-sm transition-all focus:bg-white`}
                placeholder="John Doe"
              />
            </div>
            {errors.name && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail size={18} className="text-gray-400" />
              </div>
              <input
                type="email"
                {...register("email")}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border ${errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'} rounded-xl text-sm transition-all focus:bg-white`}
                placeholder="you@example.com"
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.email.message}</p>}
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-gray-400" />
              </div>
              <input
                type="password"
                {...register("password")}
                className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border ${errors.password ? 'border-red-300 focus:ring-red-500' : 'border-gray-200 focus:ring-primary-500'} rounded-xl text-sm transition-all focus:bg-white`}
                placeholder="••••••••"
              />
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-500 ml-1">{errors.password.message}</p>}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full flex items-center justify-center py-3 px-4 mt-8 rounded-xl text-white text-sm font-semibold shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed ${
              selectedRole === 'Recruiter' ? 'bg-purple-600 hover:bg-purple-700 hover:shadow-purple-500/25' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/25'
            }`}
          >
            {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : "Complete registration"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500 border-t border-gray-100 pt-6">
          Already have an account?{" "}
          <span
            className="font-semibold text-primary-600 hover:text-primary-700 cursor-pointer"
            onClick={() => navigate(`/login?role=${selectedRole}`)}
          >
            Sign in instead
          </span>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
