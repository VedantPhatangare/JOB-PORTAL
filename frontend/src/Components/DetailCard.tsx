import React from "react";

interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const DetailCard = ({ icon, label, value }: DetailCardProps) => (
  <div className="bg-gray-50/50 border border-gray-100 p-4 rounded-xl flex items-start gap-3 hover:shadow-md hover:bg-white transition-all duration-300">
    <div className="bg-white p-2.5 rounded-lg shadow-sm text-primary-600 border border-primary-50">
      {icon}
    </div>
    <div>
      <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</h4>
      <p className="font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);