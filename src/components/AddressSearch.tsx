import { useState, useRef, useEffect, useCallback } from "react";
import { Loader2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

interface SearchResult {
  display_name: string;
  lat: string;
  lon: string;
}

interface AddressSearchProps {
  placeholder: string;
  value: string;
  icon: React.ReactNode;
  onSelect: (lat: number, lng: number, address: string) => void;
  onClear?: () => void;
}

export function AddressSearch({ placeholder, value, icon, onSelect, onClear }: AddressSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const search = useCallback(async (q: string) => {
    if (q.length < 3) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q + ", Cabo de Santo Agostinho, PE")}&limit=5&countrycodes=br&accept-language=pt-BR`,
        { headers: { "Accept-Language": "pt-BR" } }
      );
      const data: SearchResult[] = await res.json();
      setResults(data);
      setOpen(data.length > 0);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleChange = (val: string) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 400);
  };

  const handleSelect = (r: SearchResult) => {
    setQuery("");
    setOpen(false);
    setResults([]);
    onSelect(parseFloat(r.lat), parseFloat(r.lon), r.display_name);
  };

  const handleClear = () => {
    setQuery("");
    setResults([]);
    setOpen(false);
    onClear?.();
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Input
          value={query || (value ? value.split(',')[0] : '')}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => { if (!query && value) setQuery(''); }}
          placeholder={placeholder}
          className="h-11 text-sm bg-secondary border-0 rounded-xl pl-4 pr-10 placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-foreground/20"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (query || value) ? (
            <button onClick={handleClear} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 top-full mt-1 w-full bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden"
          >
            {results.map((r, i) => (
              <button
                key={i}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-4 py-3 text-sm hover:bg-secondary transition-colors flex items-start gap-3 border-b border-border/20 last:border-0"
              >
                <div className="w-2 h-2 rounded-full bg-muted-foreground mt-1.5 flex-shrink-0" />
                <span className="line-clamp-2 text-foreground/80">{r.display_name}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
