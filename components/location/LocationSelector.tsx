"use client";

import {
  continents,
  countries,
  getEmojiFlag,
  type TContinentCode,
  type TCountryCode,
} from "countries-list";
import { ChevronDown, ChevronRight, Globe, MapPin, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface LocationContext {
  country?: string;
  countryCode?: string;
  continent?: string;
  continentCode?: string;
  isGlobal?: boolean;
}

interface LocationSelectorProps {
  value?: LocationContext | null;
  onChange: (location: LocationContext | null) => void;
  disabled?: boolean;
  id?: string;
}

interface CountryWithFlag {
  code: string;
  name: string;
  emoji: string;
  continent: TContinentCode;
}

type GroupedCountries = Record<TContinentCode, CountryWithFlag[]>;

const CONTINENT_ORDER: TContinentCode[] = [
  "AF",
  "AS",
  "EU",
  "NA",
  "SA",
  "OC",
  "AN",
];

function groupCountriesByContinent(): GroupedCountries {
  const grouped: Partial<GroupedCountries> = {};

  for (const [code, data] of Object.entries(countries)) {
    const continentCode = data.continent as TContinentCode;
    if (!grouped[continentCode]) {
      grouped[continentCode] = [];
    }
    grouped[continentCode]!.push({
      code,
      name: data.name,
      emoji: getEmojiFlag(code as TCountryCode) || "",
      continent: continentCode,
    });
  }

  for (const continentCode of Object.keys(grouped) as TContinentCode[]) {
    grouped[continentCode]!.sort((a, b) => a.name.localeCompare(b.name));
  }

  return grouped as GroupedCountries;
}

const GROUPED_COUNTRIES = groupCountriesByContinent();

export function LocationSelector({
  value,
  onChange,
  disabled = false,
  id,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [expandedContinents, setExpandedContinents] = useState<
    Set<TContinentCode>
  >(new Set());

  const displayValue = value?.isGlobal
    ? "Global"
    : value?.country || "Select location...";

  const filteredGroups = useMemo(() => {
    if (!search.trim()) {
      return GROUPED_COUNTRIES;
    }

    const query = search.toLowerCase();
    const filtered: Partial<GroupedCountries> = {};

    for (const continentCode of CONTINENT_ORDER) {
      const continentName = continents[continentCode]?.toLowerCase() || "";
      const countryList = GROUPED_COUNTRIES[continentCode];

      if (!countryList) continue;

      if (continentName.includes(query)) {
        filtered[continentCode] = countryList;
      } else {
        const matchingCountries = countryList.filter(
          (country) =>
            country.name.toLowerCase().includes(query) ||
            country.code.toLowerCase().includes(query),
        );
        if (matchingCountries.length > 0) {
          filtered[continentCode] = matchingCountries;
        }
      }
    }

    return filtered as GroupedCountries;
  }, [search]);

  const toggleContinent = (continentCode: TContinentCode) => {
    setExpandedContinents((prev) => {
      const next = new Set(prev);
      if (next.has(continentCode)) {
        next.delete(continentCode);
      } else {
        next.add(continentCode);
      }
      return next;
    });
  };

  const handleSelectGlobal = () => {
    onChange({
      isGlobal: true,
    });
    setOpen(false);
    setSearch("");
  };

  const handleSelectCountry = (country: CountryWithFlag) => {
    onChange({
      country: country.name,
      countryCode: country.code,
      continent: continents[country.continent],
      continentCode: country.continent,
      isGlobal: false,
    });
    setOpen(false);
    setSearch("");
  };

  const handleClear = () => {
    onChange(null);
    setOpen(false);
  };

  const visibleContinents = CONTINENT_ORDER.filter(
    (code) => filteredGroups[code] && filteredGroups[code].length > 0,
  );

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
            ) : value?.countryCode ? (
              <span className="text-base leading-none">
                {getEmojiFlag(value.countryCode as TCountryCode)}
              </span>
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{displayValue}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search countries or continents..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[300px]">
          <div className="p-1">
            {/* Global Option */}
            <button
              type="button"
              onClick={handleSelectGlobal}
              className={cn(
                "w-full flex items-center gap-2 px-2 py-2 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                value?.isGlobal && "bg-accent",
              )}
            >
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">Global</span>
              {value?.isGlobal && (
                <span className="text-xs text-primary font-medium">
                  Selected
                </span>
              )}
            </button>

            <div className="my-1 h-px bg-border" />

            {/* Continents and Countries */}
            {visibleContinents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No countries found
              </p>
            ) : (
              visibleContinents.map((continentCode) => {
                const continentName = continents[continentCode];
                const countryList = filteredGroups[continentCode];
                const isExpanded = expandedContinents.has(continentCode);
                const countryCount = countryList?.length || 0;

                if (!countryList) return null;

                return (
                  <div key={continentCode}>
                    <button
                      type="button"
                      onClick={() => toggleContinent(continentCode)}
                      className="w-full flex items-center gap-2 px-2 py-2 text-sm font-medium rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="flex-1 text-left">{continentName}</span>
                      <span className="text-xs text-muted-foreground">
                        {countryCount}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="ml-2 pl-4 border-l border-border">
                        {countryList.map((country) => (
                          <button
                            type="button"
                            key={country.code}
                            onClick={() => handleSelectCountry(country)}
                            className={cn(
                              "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                              value?.countryCode === country.code &&
                                "bg-accent",
                            )}
                          >
                            <span className="text-base leading-none">
                              {country.emoji}
                            </span>
                            <span className="flex-1 text-left">
                              {country.name}
                            </span>
                            {value?.countryCode === country.code && (
                              <span className="text-xs text-primary font-medium">
                                Selected
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
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

export function LocationBadge({
  location,
}: {
  location: LocationContext | null | undefined;
}) {
  if (!location) return null;

  const displayText = location.isGlobal
    ? "Global"
    : location.country || "Unknown";

  const flag = location.isGlobal
    ? null
    : location.countryCode
      ? getEmojiFlag(location.countryCode as TCountryCode)
      : null;

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground text-sm">
      {location.isGlobal ? (
        <Globe className="h-3.5 w-3.5" />
      ) : flag ? (
        <span className="text-sm leading-none">{flag}</span>
      ) : (
        <MapPin className="h-3.5 w-3.5" />
      )}
      <span>{displayText}</span>
    </div>
  );
}
