import { SheetData } from '../services/googleSheets';

export interface CountryData {
  country: string;
  value: number;
  count: number;
}

export const processCountryData = (sheetData: SheetData): CountryData[] => {
  if (!sheetData.rows || sheetData.rows.length === 0) {
    return [];
  }

  // Find the indices for Country and Company Name columns
  const countryIndex = sheetData.headers.findIndex(header => 
    header.toLowerCase() === 'country'
  );
  const companyNameIndex = sheetData.headers.findIndex(header => 
    header.toLowerCase() === 'company name'
  );

  if (countryIndex === -1) {
    console.error('Country column not found');
    return [];
  }

  // Aggregate data by country
  const countryMap = new Map<string, { count: number; companies: Set<string> }>();

  sheetData.rows.forEach(row => {
    const country = row[countryIndex];
    const companyName = companyNameIndex !== -1 ? row[companyNameIndex] : null;

    if (country && country.trim()) {
      const normalizedCountry = country.trim();
      
      if (!countryMap.has(normalizedCountry)) {
        countryMap.set(normalizedCountry, { count: 0, companies: new Set() });
      }
      
      const countryData = countryMap.get(normalizedCountry)!;
      countryData.count++;
      
      if (companyName && companyName.trim()) {
        countryData.companies.add(companyName.trim());
      }
    }
  });

  // Convert to CountryData array
  const result: CountryData[] = Array.from(countryMap.entries()).map(([country, data]) => ({
    country,
    value: data.companies.size, // Number of unique companies
    count: data.count // Total number of entries
  }));

  // Sort by value (number of companies) in descending order
  return result.sort((a, b) => b.value - a.value);
};

export const getCountryStatistics = (sheetData: SheetData) => {
  const countryData = processCountryData(sheetData);
  
  const totalCountries = countryData.length;
  const totalCompanies = countryData.reduce((sum, country) => sum + country.value, 0);
  const totalEntries = countryData.reduce((sum, country) => sum + country.count, 0);
  
  const topCountries = countryData.slice(0, 10);
  
  return {
    totalCountries,
    totalCompanies,
    totalEntries,
    topCountries,
    countryData
  };
};
