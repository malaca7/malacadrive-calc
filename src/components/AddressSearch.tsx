import { useState, useRef, useEffect, useCallback } from "react";
import { Search, Loader2, MapPin, X } from "lucide-react";
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
  const [focused, setFocused] = useState(false);
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
        setFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <motion.div
        className={`relative rounded-xl transition-all duration-300 ${focused ? 'ring-2 ring-primary/30' : ''}`}
        animate={focused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : icon}
        </div>
        <Input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className="pl-10 pr-9 text-sm h-11 bg-secondary/40 border-border/40 rounded-xl focus-visible:ring-primary/40 transition-all duration-300"
        />
        {(query || value) && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </motion.div>

      <AnimatePresence>
        {value && !query && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            className="text-xs text-muted-foreground mt-1.5 truncate px-2 flex items-center gap-1.5"
          >
            <MapPin className="w-3 h-3 text-primary/60 flex-shrink-0" />
            {value}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="absolute z-50 top-full mt-2 w-full bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl shadow-black/30 overflow-hidden"
          >
            {results.map((r, i) => (
              <motion.button
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.2 }}
                onClick={() => handleSelect(r)}
                className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-primary/10 transition-all duration-200 flex items-start gap-2.5 border-b border-border/20 last:border-0 group"
              >
                <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="line-clamp-2 group-hover:text-foreground transition-colors">{r.display_name}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
