import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, Appdispatch } from "../app/Store";
import { setCredentials } from "../features/Authslice";
import { updateProfileService } from "../api/services";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Building2, Globe, Save, Loader2, FileText, Mail, BadgeCheck } from "lucide-react";

const RecruiterProfile = () => {
  const dispatch = useDispatch<Appdispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(auth.name);
  const [companyName, setCompanyName] = useState(auth.companyName);
  const [companyWebsite, setCompanyWebsite] = useState(auth.companyWebsite);
  const [companyDescription, setCompanyDescription] = useState(auth.companyDescription);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setName(auth.name);
    setCompanyName(auth.companyName);
    setCompanyWebsite(auth.companyWebsite);
    setCompanyDescription(auth.companyDescription);
  }, [auth]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("companyName", companyName);
      formData.append("companyWebsite", companyWebsite);
      formData.append("companyDescription", companyDescription);

      const response = await updateProfileService(formData);
      if (response.success && response.user) {
        dispatch(setCredentials(response.user));
        toast.success("Company profile saved!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Recruiter Profile</h1>
          <p className="text-gray-500 mt-1">Set up your company profile to attract the best candidates.</p>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Company Logo Placeholder / Initials */}
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-3xl shrink-0 shadow-lg shadow-primary-500/30">
              {(companyName || name)?.charAt(0)?.toUpperCase() || <Building2 size={32} />}
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">{companyName || "Your Company"}</p>
              <p className="text-sm text-gray-500">{auth.email}</p>
            </div>
          </div>

          {/* Recruiter Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              Your Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="E.g. Rohan Sharma"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all placeholder-gray-400"
            />
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <Mail size={12} className="inline mr-1" /> Email
            </label>
            <p className="text-sm text-gray-600 bg-gray-50 px-4 py-2.5 rounded-xl border border-gray-100 flex items-center gap-2">
              {auth.email}
              <BadgeCheck size={14} className="text-emerald-500 ml-auto" />
            </p>
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <Building2 size={12} className="inline mr-1" /> Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="E.g. Google, TCS, Infosys..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all placeholder-gray-400"
            />
          </div>

          {/* Company Website */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <Globe size={12} className="inline mr-1" /> Company Website
            </label>
            <div className="relative">
              <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="url"
                value={companyWebsite}
                onChange={(e) => setCompanyWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all placeholder-gray-400"
              />
            </div>
          </div>

          {/* Company Description */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <FileText size={12} className="inline mr-1" /> Company Description
            </label>
            <textarea
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              rows={4}
              placeholder="Tell candidates about your company, culture, mission, and what makes you unique..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white resize-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSaving ? "Saving..." : "Save Company Profile"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RecruiterProfile;
