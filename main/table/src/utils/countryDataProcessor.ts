import { SheetData } from '../services/googleSheets';

export interface CountryData {
  country: string;
  value: number;
  count: number;
}

export interface CountryDetailedData {
  country: string;
  value: number;
  count: number;
  topIndustries: { industry: string; count: number }[];
  averageBizgridScore: number;
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

export const processCountryDetailedData = (sheetData: SheetData): CountryDetailedData[] => {
  if (!sheetData.rows || sheetData.rows.length === 0) {
    return [];
  }

  // Find the indices for required columns
  const countryIndex = sheetData.headers.findIndex(header => 
    header.toLowerCase() === 'country'
  );
  const companyNameIndex = sheetData.headers.findIndex(header => 
    header.toLowerCase() === 'company name'
  );
  const industryIndex = sheetData.headers.findIndex(header => 
    header.toLowerCase() === 'industry'
  );
  const bizgridIndex = sheetData.headers.findIndex(header => 
    header.toLowerCase().includes('bizgrid') || header.toLowerCase().includes('score')
  );

  if (countryIndex === -1) {
    console.error('Country column not found');
    return [];
  }

  // Aggregate data by country
  const countryMap = new Map<string, { 
    count: number; 
    companies: Set<string>; 
    industries: Map<string, number>;
    bizgridScores: number[];
  }>();

  sheetData.rows.forEach(row => {
    const country = row[countryIndex];
    const companyName = companyNameIndex !== -1 ? row[companyNameIndex] : null;
    const industryData = industryIndex !== -1 ? row[industryIndex] : null;
    const bizgridScore = bizgridIndex !== -1 ? row[bizgridIndex] : null;

    if (country && country.trim()) {
      const normalizedCountry = country.trim();
      
      if (!countryMap.has(normalizedCountry)) {
        countryMap.set(normalizedCountry, { 
          count: 0, 
          companies: new Set(), 
          industries: new Map(),
          bizgridScores: []
        });
      }
      
      const countryData = countryMap.get(normalizedCountry)!;
      countryData.count++;
      
      if (companyName && companyName.trim()) {
        countryData.companies.add(companyName.trim());
      }

      // Process industry data - only extract Sub-Industry
      if (industryData && typeof industryData === 'object') {
        const subIndustry = industryData.subIndustry || '';
        
        if (subIndustry.trim()) {
          const currentCount = countryData.industries.get(subIndustry) || 0;
          countryData.industries.set(subIndustry, currentCount + 1);
        }
      } else if (industryData && industryData.trim()) {
        // Fallback for non-object data (treat as sub-industry)
        const currentCount = countryData.industries.get(industryData) || 0;
        countryData.industries.set(industryData, currentCount + 1);
      }

      // Process Bizgrid score
      if (bizgridScore && bizgridScore.trim()) {
        const score = parseFloat(bizgridScore.toString());
        if (!isNaN(score) && score >= 0 && score <= 100) {
          countryData.bizgridScores.push(score);
        }
      }
    }
  });

  // Convert to CountryDetailedData array
  const result: CountryDetailedData[] = Array.from(countryMap.entries()).map(([country, data]) => {
    // Get top 3 industries
    const sortedIndustries = Array.from(data.industries.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([industry, count]) => ({ industry, count }));

    // Calculate average Bizgrid score
    const averageBizgridScore = data.bizgridScores.length > 0 
      ? data.bizgridScores.reduce((sum, score) => sum + score, 0) / data.bizgridScores.length
      : 0;

    return {
      country,
      value: data.companies.size, // Number of unique companies
      count: data.count, // Total number of entries
      topIndustries: sortedIndustries,
      averageBizgridScore: Math.round(averageBizgridScore * 10) / 10 // Round to 1 decimal place
    };
  });

  // Sort by value (number of companies) in descending order
  return result.sort((a, b) => b.value - a.value);
};
