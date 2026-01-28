interface InputGroupProps {
  id: string;
  label: string;
  prefix?: string;
  onChange: (value: number) => void;
  hasSelect?: boolean;
  hasSelectPeriodo?: boolean;
  setTipo?: (value: string) => void;
}

export default function InputGroup({
  id,
  label,
  prefix,
  onChange,
  hasSelect,
  hasSelectPeriodo,
  setTipo,
}: InputGroupProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-[10px] font-bold text-gray-400 uppercase"
      >
        {label}
      </label>
      <div className="flex border rounded overflow-hidden focus-within:ring-1 focus-within:ring-slate-400">
        {prefix && (
          <span className="bg-gray-100 px-3 py-2 text-sm border-r text-gray-500">
            {prefix}
          </span>
        )}
        <input
          id={id}
          type="number"
          title={label} // Resolve erro de acessibilidade
          className="w-full p-2 outline-none text-sm"
          onChange={(e) => onChange(Number(e.target.value))}
        />
        {hasSelect && (
          <select
            className="bg-white border-l px-2 text-[10px] font-bold outline-none"
            title="Opção Taxa"
          >
            <option>ANUAL</option>
            <option>MENSAL</option>
          </select>
        )}
        {hasSelectPeriodo && (
          <select
            className="bg-white border-l px-2 text-[10px] font-bold outline-none"
            title="Opção Período"
            onChange={(e) => setTipo?.(e.target.value)}
          >
            <option value="ANOS">ANOS</option>
            <option value="MESES">MESES</option>
          </select>
        )}
      </div>
    </div>
  );
}
