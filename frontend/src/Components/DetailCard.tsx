interface DetailCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

export const DetailCard = ({ icon, label, value }: DetailCardProps) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2">
      {icon}
      <span className="text-sm text-gray-600">{label}</span>
    </div>
    <p className="font-semibold text-gray-900">{value}</p>
  </div>
); 