"use client";

import {
  City,
  Country,
  State,
  type ICity,
  type ICountry,
  type IState,
} from "country-state-city";
import { ChevronLeft, Globe, MapPin, Search } from "lucide-react";
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

export interface LocationContext {
  continent?: string;
  continentCode?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  regionCode?: string;
  city?: string;
  isGlobal?: boolean;
}

interface LocationSelectorProps {
  value?: LocationContext | null;
  onChange: (location: LocationContext | null) => void;
  disabled?: boolean;
  id?: string;
  canEdit: boolean;
}

type PickerStep = "country" | "region" | "city";

const CONTINENTS = [
  { code: "AF", name: "Africa" },
  { code: "AN", name: "Antarctica" },
  { code: "AS", name: "Asia" },
  { code: "EU", name: "Europe" },
  { code: "NA", name: "North America" },
  { code: "OC", name: "Oceania" },
  { code: "SA", name: "South America" },
] as const;

function isoToFlag(isoCode?: string): string {
  if (!isoCode || isoCode.length !== 2) return "";
  return String.fromCodePoint(
    ...isoCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0)),
  );
}

function formatLocationDisplay(value?: LocationContext | null): string {
  if (!value) return "Select location...";
  if (value.isGlobal) return "Global";

  const parts = [
    value.city,
    value.region,
    value.country,
    value.continent,
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : "Select location...";
}

function buildLocationPayload(
  country: ICountry,
  region?: IState | null,
  city?: ICity | null,
): LocationContext {
  return {
    country: country.name,
    countryCode: country.isoCode,
    region: region?.name,
    regionCode: region?.isoCode,
    city: city?.name,
    isGlobal: false,
  };
}

export function LocationSelector({
  value,
  onChange,
  disabled = false,
  id,
  canEdit,
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [step, setStep] = useState<PickerStep>("country");
  const [selectedCountry, setSelectedCountry] = useState<ICountry | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<IState | null>(null);

  const allCountries = useMemo(
    () =>
      Country.getAllCountries().sort((a, b) =>
        a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
      ),
    [],
  );

  const countries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return allCountries;

    return allCountries.filter(
      (country) =>
        country.name.toLowerCase().includes(query) ||
        country.isoCode.toLowerCase().includes(query),
    );
  }, [allCountries, search]);

  const regions = useMemo(() => {
    if (!selectedCountry) return [];

    const list = State.getStatesOfCountry(selectedCountry.isoCode);
    const query = search.trim().toLowerCase();

    if (!query) return list;
    return list.filter(
      (region) =>
        region.name.toLowerCase().includes(query) ||
        region.isoCode.toLowerCase().includes(query),
    );
  }, [search, selectedCountry]);

  const cities = useMemo(() => {
    if (!selectedCountry) return [];

    const list = selectedRegion
      ? City.getCitiesOfState(selectedCountry.isoCode, selectedRegion.isoCode)
      : City.getCitiesOfCountry(selectedCountry.isoCode);

    const query = search.trim().toLowerCase();
    if (!query) return list;

    return list?.filter((city) => city.name.toLowerCase().includes(query));
  }, [search, selectedCountry, selectedRegion]);

  const resetPicker = () => {
    setStep("country");
    setSearch("");
    setSelectedCountry(null);
    setSelectedRegion(null);
  };

  const closePicker = () => {
    setOpen(false);
    resetPicker();
  };

  const handleSelectGlobal = () => {
    onChange({ isGlobal: true });
    closePicker();
  };

  const handleSelectContinent = (continent: (typeof CONTINENTS)[number]) => {
    onChange({
      continent: continent.name,
      continentCode: continent.code,
      isGlobal: false,
    });
    closePicker();
  };

  const handleSelectCountry = (country: ICountry) => {
    setSelectedCountry(country);
    setSelectedRegion(null);
    setSearch("");

    const countryRegions = State.getStatesOfCountry(country.isoCode);
    if (countryRegions.length > 0) {
      setStep("region");
      return;
    }

    const countryCities = City.getCitiesOfCountry(country.isoCode);
    if (countryCities?.length! > 0) {
      setStep("city");
      return;
    }

    onChange(buildLocationPayload(country));
    closePicker();
  };

  const handleSelectRegion = (region: IState) => {
    if (!selectedCountry) return;

    setSelectedRegion(region);
    setSearch("");

    const stateCities = City.getCitiesOfState(
      selectedCountry.isoCode,
      region.isoCode,
    );

    if (stateCities.length > 0) {
      setStep("city");
      return;
    }

    onChange(buildLocationPayload(selectedCountry, region));
    closePicker();
  };

  const handleSelectCity = (city: ICity) => {
    if (!selectedCountry) return;

    onChange(buildLocationPayload(selectedCountry, selectedRegion, city));
    closePicker();
  };

  const handleUseCountryOnly = () => {
    if (!selectedCountry) return;

    onChange(buildLocationPayload(selectedCountry));
    closePicker();
  };

  const handleUseRegionOnly = () => {
    if (!selectedCountry || !selectedRegion) return;

    onChange(buildLocationPayload(selectedCountry, selectedRegion));
    closePicker();
  };

  const handleClear = () => {
    onChange(null);
    closePicker();
  };

  const handleBack = () => {
    setSearch("");

    if (step === "city") {
      if (selectedRegion) {
        setStep("region");
      } else {
        setStep("country");
        setSelectedCountry(null);
      }
      return;
    }

    if (step === "region") {
      setStep("country");
      setSelectedCountry(null);
      setSelectedRegion(null);
    }
  };

  const displayValue = formatLocationDisplay(value);

  return (
    <Popover
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          resetPicker();
        }
      }}
    >
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled || !canEdit}
        >
          <span className="flex items-center gap-2 truncate">
            {value?.isGlobal ? (
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : value?.countryCode ? (
              <span className="text-base leading-none">
                {isoToFlag(value.countryCode)}
              </span>
            ) : (
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <span className="truncate">{displayValue}</span>
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[340px] p-0" align="start">
        <div className="p-2 border-b space-y-2">
          {step !== "country" && (
            <button
              type="button"
              onClick={handleBack}
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </button>
          )}

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder={
                step === "country"
                  ? "Search countries..."
                  : step === "region"
                    ? "Search regions/states..."
                    : "Search cities..."
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>

        <ScrollArea className="h-[320px]">
          <div className="p-1">
            {step === "country" && (
              <>
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

                <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">
                  Continents
                </p>
                {CONTINENTS.map((continent) => (
                  <button
                    type="button"
                    key={continent.code}
                    onClick={() => handleSelectContinent(continent)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                      value?.continentCode === continent.code &&
                        !value?.country &&
                        "bg-accent",
                    )}
                  >
                    <span className="flex-1 text-left">{continent.name}</span>
                    {value?.continentCode === continent.code &&
                      !value?.country && (
                        <span className="text-xs text-primary font-medium">
                          Selected
                        </span>
                      )}
                  </button>
                ))}

                <div className="my-1 h-px bg-border" />
                <p className="px-2 py-1 text-xs text-muted-foreground uppercase tracking-wide">
                  Countries
                </p>
                {countries.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No countries found
                  </p>
                ) : (
                  countries.map((country) => (
                    <button
                      type="button"
                      key={country.isoCode}
                      onClick={() => handleSelectCountry(country)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors",
                        value?.countryCode === country.isoCode && "bg-accent",
                      )}
                    >
                      <span className="text-base leading-none">
                        {country.flag || isoToFlag(country.isoCode)}
                      </span>
                      <span className="flex-1 text-left">{country.name}</span>
                      {value?.countryCode === country.isoCode &&
                        !value?.region &&
                        !value?.city && (
                          <span className="text-xs text-primary font-medium">
                            Selected
                          </span>
                        )}
                    </button>
                  ))
                )}
              </>
            )}

            {step === "region" && selectedCountry && (
              <>
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  {selectedCountry.name}
                </div>

                <button
                  type="button"
                  onClick={handleUseCountryOnly}
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                >
                  Use country only
                </button>

                <div className="my-1 h-px bg-border" />

                {regions.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No regions or states found
                  </p>
                ) : (
                  regions.map((region) => (
                    <button
                      type="button"
                      key={region.isoCode}
                      onClick={() => handleSelectRegion(region)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span className="flex-1 text-left">{region.name}</span>
                    </button>
                  ))
                )}
              </>
            )}

            {step === "city" && selectedCountry && (
              <>
                <div className="px-2 py-2 text-xs text-muted-foreground">
                  {selectedRegion
                    ? `${selectedRegion.name}, ${selectedCountry.name}`
                    : selectedCountry.name}
                </div>

                <button
                  type="button"
                  onClick={
                    selectedRegion ? handleUseRegionOnly : handleUseCountryOnly
                  }
                  className="w-full text-left px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground"
                >
                  {selectedRegion ? "Use region only" : "Use country only"}
                </button>

                <div className="my-1 h-px bg-border" />

                {cities?.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No cities found
                  </p>
                ) : (
                  cities?.map((city) => (
                    <button
                      type="button"
                      key={`${city.name}-${city.latitude}-${city.longitude}`}
                      onClick={() => handleSelectCity(city)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded-sm hover:bg-accent hover:text-accent-foreground transition-colors"
                    >
                      <span className="flex-1 text-left">{city.name}</span>
                    </button>
                  ))
                )}
              </>
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
    : [location.city, location.region, location.country, location.continent]
        .filter(Boolean)
        .join(", ") || "Unknown";

  const flag = location.isGlobal ? null : isoToFlag(location.countryCode);

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
