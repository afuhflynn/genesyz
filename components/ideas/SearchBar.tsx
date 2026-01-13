"use client";

import { Search } from "lucide-react";
import { debounce, useQueryStates } from "nuqs";
import { searchParamsSchema } from "@/nuqs";
import { Input } from "../ui/input";

export const SearchBar = () => {
  const [params, setParams] = useQueryStates(searchParamsSchema);
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search ideas..."
          className="pl-9"
          value={params.search as string}
          onChange={(e) =>
            setParams(
              { ...params, search: e.target.value },
              { shallow: false, limitUrlUpdates: debounce(600) },
            )
          }
        />
      </div>
    </div>
  );
};
