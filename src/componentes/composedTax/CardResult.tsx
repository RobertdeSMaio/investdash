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
    <div className="bg-sky-200 p-6 rounded shadow border text-center">
      <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">
        {label}
      </p>
      <p className={`text-xl font-bold ${color}`}>
        R$ {value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
      </p>
    </div>
  );
}
