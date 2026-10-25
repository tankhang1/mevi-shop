import { useState } from "react";
import { Search, X } from "lucide-react";

interface OrderLookupProps {
  query: string;
  onQueryChange: (q: string) => void;
}

export function OrderLookup({ query, onQueryChange }: OrderLookupProps) {
  const [localVal, setLocalVal] = useState(query);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onQueryChange(localVal);
  };

  const handleClear = () => {
    setLocalVal("");
    onQueryChange("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <Search
        size={17}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#728379]"
      />
      <input
        type="search"
        value={localVal}
        onChange={(e) => {
          setLocalVal(e.target.value);
          onQueryChange(e.target.value);
        }}
        placeholder="Tra cứu theo mã đơn (#MV1001) hoặc Số điện thoại..."
        className="w-full h-11 pl-10 pr-9 rounded-2xl border border-[#deddd2] bg-[#fffefa] text-xs text-[#214c3a] placeholder:text-[#959d96] focus:outline-none focus:border-[#285e45] focus:ring-2 focus:ring-[#285e45]/10 transition"
        data-testid="input-order-lookup"
      />
      {localVal && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xóa tìm kiếm"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#728379] hover:text-[#214c3a]"
        >
          <X size={15} />
        </button>
      )}
    </form>
  );
}
