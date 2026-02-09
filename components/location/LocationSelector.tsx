"use client";

import { Globe, MapPin } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LocationContext {
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  timezone?: string;
  currency?: string;
  isGlobal?: boolean;
}

interface LocationSelectorProps {
  value?: LocationContext | null;
  onChange: (location: LocationContext | null) => void;
  disabled?: boolean;
  id?: string;
}

// Common locations for quick selection
const COMMON_LOCATIONS = [
  { name: "Global", code: "GLOBAL", isGlobal: true },
  { name: "United States", code: "US" },
  { name: "United Kingdom", code: "GB" },
  { name: "Canada", code: "CA" },
  { name: "Australia", code: "AU" },
  { name: "Germany", code: "DE" },
  { name: "France", code: "FR" },
  { name: "Nigeria", code: "NG" },
  { name: "Kenya", code: "KE" },
  { name: "South Africa", code: "ZA" },
  { name: "Ghana", code: "GH" },
  { name: "India", code: "IN" },
  { name: "Singapore", code: "SG" },
  { name: "Brazil", code: "BR" },
];

export function LocationSelector({
  value,
  onChange,
  disabled = false,
  id,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const displayValue = value?.isGlobal
    ? "Global"
    : value?.city && value?.country
      ? `${value.city}, ${value.country}`
      : value?.country || "Select location...";

  const filteredLocations = COMMON_LOCATIONS.filter((loc) =>
    loc.name.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSelect = (location: (typeof COMMON_LOCATIONS)[0]) => {
    onChange({
      country: location.name,
      countryCode: location.code,
      isGlobal: location.isGlobal || false,
    });
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          <span className="flex items-center gap-2 truncate">
            {value?.isGlobal ? (
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{displayValue}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="p-2">
          <Input
            placeholder="Search location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
          />
        </div>
        <ScrollArea className="h-[200px]">
          <div className="p-2">
            {filteredLocations.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No locations found
              </p>
            ) : (
              <div className="space-y-1">
                {filteredLocations.map((location) => (
                  <button
                    type="button"
                    key={location.code}
                    onClick={() => handleSelect(location)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                  >
                    {location.isGlobal ? (
                      <Globe className="h-4 w-4 shrink-0" />
                    ) : (
                      <MapPin className="h-4 w-4 shrink-0" />
                    )}
                    <span className="flex-1 text-left">{location.name}</span>
                    {value?.countryCode === location.code && (
                      <span className="text-xs text-primary font-medium">
                        Selected
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
        {value && (
          <div className="border-t p-2">
            <button
              type="button"
              onClick={handleClear}
              className="w-full text-sm text-muted-foreground hover:text-foreground py-1.5"
            >
              Clear selection
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Display component for showing location in read-only mode
export function LocationBadge({
  location,
}: {
  location: LocationContext | null | undefined;
}) {
  if (!location) return null;

  const displayText = location.isGlobal
    ? "Global"
    : location.city
      ? `${location.city}, ${location.country}`
      : location.country;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
      {location.isGlobal ? (
        <Globe className="h-3.5 w-3.5" />
      ) : (
        <MapPin className="h-3.5 w-3.5" />
      )}
      <span>{displayText}</span>
    </div>
  );
}
