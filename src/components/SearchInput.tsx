interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="flex w-full flex-col gap-1">
      <span className="text-sm font-medium text-gray-700">Buscar editais</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        type="search"
        placeholder="Digite nome, agencia ou topico"
        className="h-11 w-full rounded-mdx border border-district-border bg-white px-3 text-sm outline-none transition focus:border-district-red focus:ring-2 focus:ring-red-200"
        aria-label="Campo de busca de editais"
      />
    </label>
  );
}
