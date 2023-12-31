import useSWRImmutable from "swr/immutable";

type FeatureClass = "A" | "H" | "L" | "P" | "R" | "S" | "T" | "U" | "V";

type GeoNameParams = Partial<{
  q: string;
  name: string;
  name_equals: string;
  name_startsWith: string;
  maxRows: number;
  startRow: number;
  country: string;
  countryBias: string;
  continentCode: "AF" | "AS" | "EU" | "NA" | "OC" | "SA" | "AN";
  adminCode1: string;
  adminCode2: string;
  adminCode3: string;
  adminCode4: string;
  adminCode5: string;
  featureClass: FeatureClass;
  featureCode: string;
  cities: "cities1000" | "cities5000" | "cities15000";
  lang: string;
  style: "SHORT" | "MEDIUM" | "LONG" | "FULL";
  isNameRequired: boolean;
  tag: string;
  operator: "AND" | "OR";
  charset: "UTF8";
  fuzzy: number;
  east: number;
  west: number;
  north: number;
  south: number;
  searchlang: string;
  orderby: "population" | "elevation" | "relevance";
  inclBbox: boolean;
}> & { username: string };

type GeoName = {
  geonameId: number;

  name: string;
  asciiName: string;
  toponymName: string;
  alternateNames: {
    name: string;
    lang: string;
    isPreferredName: boolean;
    isShortName: boolean;
    isColloquial: boolean;
    isHistoric: boolean;
  }[];
  lat: string;
  lng: string;
  fcl: FeatureClass;
  fclName: string;
  fcode: string;
  countryId: string;

  countryCode: string;
  countryName: string;
  continentCode: string;

  fcodeName: string;
  adminId1: string;
  adminCodes1: {
    ISO3166_2: string;
  };
  adminName1: string;

  adminCode1: string;
  adminId2: string;
  adminCode2: string;

  adminName2: string;

  adminName3: string;
  adminName4: string;
  adminName5: string;
  population: number;
  astergdem: number;

  srtm3: number;
  timezone: {
    gmtOffset: number;
    timeZoneId: string;
    dstOffset: number;
  };
  bbox: {
    east: number;
    south: number;
    north: number;
    west: number;
    accuracyLevel: number;
  };
  score: number;
};
type GeoNameResponse = {
  totalResultsCount: number;
  geonames: Partial<GeoName>[];
};
export const GeoNames = (initParams: Partial<GeoNameParams> = {}) => {
  return async (params: Partial<GeoNameParams>): Promise<GeoNameResponse> => {
    return (
      await fetch(
        `http://api.geonames.org/search?${new URLSearchParams({
          ...initParams,
          ...params,
          type: "json",
        } as any as { [name: string]: string }).toString()}`,
      )
    ).json();
  };
};

export const useGeoNames = (
  params: GeoNameParams,
): { isLoading: boolean; isError: Error } & GeoNameResponse => {

  const url = `http://api.geonames.org/search?${new URLSearchParams({
    ...params,
    type: "json",
  } as any as { [name: string]: string }).toString()}`;
  const { data, error, isLoading } = useSWRImmutable(url, (...args) => {
    if (!(params.q || params.name || params.name_equals)) {
      return {
        isError: Error("q, name or name_equals must be provided")
      }
    }
    return fetch(...args).then((res) => res.json())
  },
  );
  return {
    ...data,
    isLoading,
    isError: error,
  };
};
