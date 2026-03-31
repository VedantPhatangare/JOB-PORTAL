import { useState, useRef, useEffect } from "react";
import { Info, CheckCircle, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { MatchingBreakdown } from "../utils/matchingBreakdown";

interface MatchBreakdownPopoverProps {
  matchScore: number;
  breakdown: MatchingBreakdown;
}

const MatchBreakdownPopover: React.FC<MatchBreakdownPopoverProps> = ({
  matchScore,
  breakdown,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !triggerRef.current) return;

    const rect = triggerRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      left: rect.left,
    });

    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        !triggerRef.current?.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const getScoreColor = () => {
    if (matchScore >= 80) return "emerald";
    if (matchScore >= 50) return "amber";
    return "red";
  };

  const color = getScoreColor();
  const colorMap = {
    emerald: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    amber: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
    red: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  };

  const colors = colorMap[color as keyof typeof colorMap];

  return (
    <>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg border font-bold text-xs ml-1 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${colors.bg} ${colors.text} ${colors.border} hover:opacity-80 focus:ring-${color}-300`}
        title="Click to see matching details"
      >
        <Info size={13} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30"
              onClick={() => setIsOpen(false)}
            />

            {/* Popover */}
            <motion.div
              ref={popoverRef}
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              style={{
                position: "fixed",
                top: `${position.top}px`,
                left: `${position.left}px`,
                zIndex: 40,
              }}
              className={`w-80 ${colors.bg} border ${colors.border} rounded-xl shadow-lg p-4`}
            >
              {/* Header */}
              <div className="mb-3">
                <h3 className={`font-bold text-sm ${colors.text} mb-1`}>
                  Matching Breakdown
                </h3>
                <p className={`text-xs text-gray-600 mb-2`}>
                  {breakdown.details}
                </p>
              </div>

              {/* Score Arc */}
              <div className="flex items-center justify-between mb-4 p-3 bg-white/50 rounded-lg border border-white">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Overall Score
                  </p>
                  <p className={`text-xl font-bold ${colors.text}`}>
                    {matchScore}%
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-semibold text-gray-500 uppercase">
                    Skills Match
                  </p>
                  <p className={`text-xl font-bold ${colors.text}`}>
                    {breakdown.skillMatchPercentage}%
                  </p>
                </div>
              </div>

              {/* Matched Skills */}
              {breakdown.matchedSkills.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <CheckCircle size={14} className="text-emerald-600" />
                    <p className="text-xs font-bold text-gray-700">Matched Skills</p>
                    <span className="text-xs font-bold ml-auto text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded">
                      {breakdown.matchedSkills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {breakdown.matchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 rounded-md font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Unmatched Skills */}
              {breakdown.unmatchedSkills.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <XCircle size={14} className="text-red-600" />
                    <p className="text-xs font-bold text-gray-700">Missing Skills</p>
                    <span className="text-xs font-bold ml-auto text-red-600 bg-red-100 px-2 py-0.5 rounded">
                      {breakdown.unmatchedSkills.length}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {breakdown.unmatchedSkills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-md font-medium line-through opacity-70"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {breakdown.totalJobSkills === 0 && (
                <p className="text-xs text-gray-500 text-center py-2">
                  No skills specified for this job
                </p>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default MatchBreakdownPopover;
