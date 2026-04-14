export default function CardResult({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className="bg-gray-200 p-6 rounded-lg shadow-lg border text-center m-4">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
        {label}
      </p>
      <p className={`text-xl font-bold ${color}`}>
        R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
