import { useState, useEffect, KeyboardEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, Appdispatch } from "../app/Store";
import { setCredentials } from "../features/Authslice";
import { updateProfileService } from "../api/services";
import { toast } from "react-toastify";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Mail, Briefcase, GraduationCap, FileText,
  X, Plus, Save, Loader2, Link, BadgeCheck
} from "lucide-react";

const CandidateProfile = () => {
  const dispatch = useDispatch<Appdispatch>();
  const auth = useSelector((state: RootState) => state.auth);

  const [name, setName] = useState(auth.name);
  const [bio, setBio] = useState(auth.bio);
  const [experience, setExperience] = useState(auth.experience);
  const [education, setEducation] = useState(auth.education);
  const [resumeUrl, setResumeUrl] = useState(auth.resumeUrl);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [skills, setSkills] = useState<string[]>(auth.skills || []);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync when auth updates (e.g., after a save)
  useEffect(() => {
    setName(auth.name);
    setBio(auth.bio);
    setExperience(auth.experience);
    setEducation(auth.education);
    setResumeUrl(auth.resumeUrl);
    setSkills(auth.skills || []);
  }, [auth]);

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput("");
  };

  const handleSkillKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addSkill();
    }
    if (e.key === "Backspace" && !skillInput && skills.length > 0) {
      setSkills(skills.slice(0, -1));
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("bio", bio);
      formData.append("experience", experience);
      formData.append("education", education);
      if (resumeFile) {
        formData.append("resume", resumeFile);
      } else if (resumeUrl) {
        formData.append("resumeUrl", resumeUrl); // Keep existing
      }
      skills.forEach((s) => formData.append("skills", s));

      const response = await updateProfileService(formData);
      if (response.success && response.user) {
        dispatch(setCredentials(response.user));
        toast.success("Profile saved successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const completionFields = [name, bio, experience, education, skills.length > 0];
  const completionPct = Math.round((completionFields.filter(Boolean).length / completionFields.length) * 100);

  return (
    <div className="min-h-[92vh] bg-[#fafafa] py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Profile</h1>
          <p className="text-gray-500 mt-1">Keep your profile updated to get better job matches.</p>
        </motion.div>

        {/* Profile Completion Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">Profile Completion</span>
            <span className={`text-sm font-bold ${completionPct === 100 ? "text-emerald-600" : "text-primary-600"}`}>{completionPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${completionPct === 100 ? "bg-emerald-500" : "bg-primary-600"}`}
              style={{ width: `${completionPct}%` }}
            />
          </div>
          {completionPct < 100 && (
            <p className="text-xs text-gray-400 mt-2">Fill in all fields to maximize your job recommendations.</p>
          )}
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-2xl shrink-0 shadow-lg shadow-primary-500/30">
              {name?.charAt(0)?.toUpperCase() || <User size={28} />}
            </div>
            <div className="flex-1">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Full Name</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-lg font-bold text-gray-900 bg-transparent border-b-2 border-gray-100 focus:border-primary-500 focus:outline-none pb-1 transition-colors"
              />
            </div>
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

          {/* Bio */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <User size={12} className="inline mr-1" /> About / Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              placeholder="Briefly describe yourself, your goals, or what you're looking for..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white resize-none transition-all placeholder-gray-400"
            />
          </div>

          {/* Skills Tag Input */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <Briefcase size={12} className="inline mr-1" /> Skills
            </label>
            <div className="w-full min-h-[3rem] px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl flex flex-wrap gap-2 items-center focus-within:ring-2 focus-within:ring-primary-400 focus-within:border-primary-400 focus-within:bg-white transition-all">
              <AnimatePresence>
                {skills.map((skill) => (
                  <motion.span
                    key={skill}
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full"
                  >
                    {skill}
                    <button onClick={() => removeSkill(skill)} className="hover:text-primary-900 transition-colors">
                      <X size={12} />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder={skills.length === 0 ? "Type a skill and press Enter..." : "Add more..."}
                className="flex-1 min-w-[120px] bg-transparent text-sm focus:outline-none placeholder-gray-400"
              />
              {skillInput && (
                <button
                  onClick={addSkill}
                  className="p-1 text-primary-600 hover:bg-primary-50 rounded-full transition-colors"
                >
                  <Plus size={16} />
                </button>
              )}
            </div>
            <p className="text-xs text-gray-400 mt-1.5">Press <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Enter</kbd> or <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">,</kbd> to add a skill</p>
          </div>

          {/* Experience */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <Briefcase size={12} className="inline mr-1" /> Experience Level
            </label>
            <select
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all"
            >
              <option value="">Select experience level</option>
              <option value="Fresher">Fresher (0–1 yrs)</option>
              <option value="1-3 Years">1–3 Years</option>
              <option value="3-5 Years">3–5 Years</option>
              <option value="5+ Years">5+ Years</option>
            </select>
          </div>

          {/* Education */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <GraduationCap size={12} className="inline mr-1" /> Education
            </label>
            <input
              type="text"
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              placeholder="E.g. B.Tech Computer Science, MIT"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:bg-white transition-all placeholder-gray-400"
            />
          </div>

          {/* Resume Upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
              <FileText size={12} className="inline mr-1" /> Resume <span className="text-gray-400 font-normal normal-case">(PDF, DOCX)</span>
            </label>
            <div className="w-full flex flex-col gap-3">
              {resumeUrl && (
                <div className="flex items-center gap-2 px-4 py-3 bg-primary-50 rounded-xl border border-primary-200">
                  <BadgeCheck size={18} className="text-emerald-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-900 truncate">Current Resume</p>
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline flex items-center gap-1 mt-0.5 truncate block">
                      <Link size={12} /> View Uploaded File
                    </a>
                  </div>
                </div>
              )}
              
              <div className="relative group w-full">
                <input
                  type="file"
                  id="resumeUploadProfile"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setResumeFile(e.target.files[0]);
                    }
                  }}
                />
                <label
                  htmlFor="resumeUploadProfile"
                  className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all text-sm font-medium ${
                    resumeFile 
                      ? "border-primary-500 bg-primary-50 text-primary-700" 
                      : "border-gray-200 hover:border-primary-400 hover:bg-gray-50 text-gray-600"
                  }`}
                >
                  <FileText size={18} className={resumeFile ? "text-primary-600" : "text-gray-400"} />
                  {resumeFile ? `Selected: ${resumeFile.name}` : "Upload New Resume"}
                </label>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-primary-500/25 hover:shadow-lg hover:shadow-primary-500/30 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
              {isSaving ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CandidateProfile;
