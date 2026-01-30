import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';

interface SectorTableProps {
  data?: {
    headers: string[];
    rows: any[][];
  };
  filters?: {
    country?: string[];
    region?: string[];
    sector?: string[];
    industry?: string[];
    subIndustry?: string[];
    employees?: string[];
    foundedYear?: string[];
    revenueRange?: string[];
    activity?: string[];
    bizgridScore?: string[];
  };
}

const SectorTable: React.FC<SectorTableProps> = ({ data, filters = {} }) => {
  const sectorData = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return [];
    }

    let filteredRows = [...data.rows];

    // Apply all filters (same logic as other components)
    if (filters.country && filters.country.length > 0) {
      const countryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'country'
      );
      if (countryIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.country!.includes(row[countryIndex]?.toString().trim())
        );
      }
    }

    if (filters.region && filters.region.length > 0) {
      const regionIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'region'
      );
      if (regionIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.region!.includes(row[regionIndex]?.toString().trim())
        );
      }
    }

    if (filters.sector && filters.sector.length > 0) {
      const sectorIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('sector')
      );
      if (sectorIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const sector = row[sectorIndex];
          if (!sector) return false;
          const sectorValue = typeof sector === 'object' 
            ? (sector.sector ?? sector.industry ?? '').toString().trim()
            : sector.toString().trim();
          return filters.sector!.includes(sectorValue);
        });
      }
    }

    if (filters.employees && filters.employees.length > 0) {
      const employeesIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('employee')
      );
      if (employeesIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const employees = row[employeesIndex]?.toString().trim();
          if (!employees) return false;
          
          let normalizedEmployees = employees;
          if (employees === '10000+') {
            normalizedEmployees = '10001+';
          }
          
          return filters.employees!.includes(normalizedEmployees);
        });
      }
    }

    if (filters.revenueRange && filters.revenueRange.length > 0) {
      const revenueIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('revenue')
      );
      if (revenueIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.revenueRange!.includes(row[revenueIndex]?.toString().trim())
        );
      }
    }

    if (filters.foundedYear && filters.foundedYear.length > 0) {
      const foundedIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('founded') && header.toLowerCase().includes('year')
      );
      if (foundedIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const foundedYear = row[foundedIndex]?.toString().trim();
          if (!foundedYear) return false;
          
          const year = parseInt(foundedYear);
          if (isNaN(year)) return false;

          return filters.foundedYear!.some(era => {
            switch (era) {
              case 'pre-1950': return year <= 1949;
              case '1950-1979': return year >= 1950 && year <= 1979;
              case '1980-1989': return year >= 1980 && year <= 1989;
              case '1990-1999': return year >= 1990 && year <= 1999;
              case '2000-2009': return year >= 2000 && year <= 2009;
              case '2010-2014': return year >= 2010 && year <= 2014;
              case '2015-2019': return year >= 2015 && year <= 2019;
              case '2020-present': return year >= 2020;
              default: return false;
            }
          });
        });
      }
    }

    if (filters.industry && filters.industry.length > 0) {
      const industryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'industry'
      );
      if (industryIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const industry = row[industryIndex];
          if (!industry) return false;
          const industryValue = typeof industry === 'object' 
            ? (industry.industry ?? industry.sector ?? '').toString().trim()
            : industry.toString().trim();
          return filters.industry!.includes(industryValue);
        });
      }
    }

    if (filters.subIndustry && filters.subIndustry.length > 0) {
      const subIndustryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('sub-industry')
      );
      if (subIndustryIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const subIndustry = row[subIndustryIndex];
          if (!subIndustry || typeof subIndustry !== 'object') return false;
          const subValue = (subIndustry.subIndustry ?? subIndustry.subSector ?? '').toString().trim();
          if (!subValue) return false;
          return filters.subIndustry!.includes(subValue);
        });
      }
    }

    if (filters.activity && filters.activity.length > 0) {
      const activityIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'activity'
      );
      if (activityIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.activity!.includes(row[activityIndex]?.toString().trim())
        );
      }
    }

    if (filters.bizgridScore && filters.bizgridScore.length > 0) {
      const bizgridIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('bizgrid') || header.toLowerCase().includes('score')
      );
      if (bizgridIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const bizgridScore = row[bizgridIndex]?.toString().trim();
          if (!bizgridScore) return false;
          const score = parseFloat(bizgridScore);
          if (isNaN(score)) return false;
          
          return filters.bizgridScore!.some(range => {
            switch (range) {
              case '0-20': return score >= 0 && score <= 20;
              case '20-40': return score > 20 && score <= 40;
              case '40-60': return score > 40 && score <= 60;
              case '60-80': return score > 60 && score <= 80;
              case '80-100': return score > 80 && score <= 100;
              default: return false;
            }
          });
        });
      }
    }

    // Count companies by sector
    const sectorCount: { [key: string]: number } = {};
    
    filteredRows.forEach(row => {
      const sectorIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('sector')
      );
      
      let sector = 'Unknown';
      if (sectorIndex !== -1 && row[sectorIndex]) {
        const sectorValue = row[sectorIndex];
        sector = typeof sectorValue === 'object' 
          ? (sectorValue.sector ?? sectorValue.industry ?? 'Unknown').toString().trim()
          : sectorValue.toString().trim();
      }
      
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });

    // Convert to array and sort by count (descending)
    return Object.entries(sectorCount)
      .map(([sector, count]) => ({
        sector,
        numberOfCompanies: count
      }))
      .sort((a, b) => b.numberOfCompanies - a.numberOfCompanies);

  }, [data, filters]);

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Sector Distribution
          </Typography>
          <Typography color="text.secondary">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Sector Distribution
        </Typography>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>Sector</TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'right' }}>
                  Number of Companies
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sectorData.map((item, index) => (
                <TableRow key={item.sector} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                  <TableCell>{item.sector}</TableCell>
                  <TableCell sx={{ textAlign: 'right' }}>
                    {item.numberOfCompanies.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {sectorData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SectorTable;
