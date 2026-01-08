"use client";

import { searchParamsSchema } from "@/nuqs";
import { debounce, useQueryStates } from "nuqs";
import { Input } from "../ui/input";
import { Search } from "lucide-react";

export const SearchBar = () => {
  const [params, setParams] = useQueryStates(searchParamsSchema);
  return (
    <div className="relative max-w-xl mx-auto">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
      <Input
        placeholder="Search for answers..."
        className="h-14 pl-12 text-lg rounded-2xl shadow-sm border-slate-200 bg-white"
        value={params.search || ""}
        onChange={(e) =>
          setParams(
            { ...params, search: e.target.value },
            { shallow: false, limitUrlUpdates: debounce(500) }
          )
        }
      />
    </div>
  );
};
