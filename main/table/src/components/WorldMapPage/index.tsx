import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import { fetchDataFromSheet } from '../../services/googleSheets';
import { processCountryData, getCountryStatistics } from '../../utils/countryDataProcessor';
import ChoroplethMap from '../ChoroplethMap';
import UnmappedCountriesTable from '../UnmappedCountriesTable';
import EmployeeBarChart from '../EmployeeBarChart';
import FoundedYearBarChart from '../FoundedYearBarChart';
import RevenueRangeBarChart from '../RevenueRangeBarChart';
import BizgridScoreBarChart from '../BizgridScoreBarChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface WorldMapPageProps {
  filters?: {
    country: string[];
    region: string[];
    sector: string[];
    industry: string[];
    subIndustry: string[];
    employees: string[];
    foundedYear: string[];
    revenueRange: string[];
    activity: string[];
    bizgridScore: string[];
  };
}

const WorldMapPage: React.FC<WorldMapPageProps> = ({ filters = {} }) => {
  const [sheetData, setSheetData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await fetchDataFromSheet();
        setSheetData(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Apply filters to the data
  const filteredData = React.useMemo(() => {
    if (!sheetData || !sheetData.rows || sheetData.rows.length === 0) {
      return sheetData;
    }

    let filteredRows = [...sheetData.rows];

    // Apply country filter
    if (filters.country && filters.country.length > 0) {
      const countryIndex = sheetData.headers.findIndex((header: string) => 
        header.toLowerCase() === 'country'
      );
      if (countryIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.country!.includes(row[countryIndex]?.toString().trim())
        );
      }
    }

    // Apply sector filter
    if (filters.sector && filters.sector.length > 0) {
      const sectorIndex = sheetData.headers.findIndex((header: string) => 
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

    // Apply employees filter
    if (filters.employees && filters.employees.length > 0) {
      const employeesIndex = sheetData.headers.findIndex((header: string) => 
        header.toLowerCase().includes('employee')
      );
      if (employeesIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const employees = row[employeesIndex]?.toString().trim();
          if (!employees) return false;
          
          // Normalize employee ranges
          let normalizedEmployees = employees;
          if (employees === '10000+') {
            normalizedEmployees = '10001+';
          }
          
          return filters.employees!.includes(normalizedEmployees);
        });
      }
    }

    // Apply revenue filter
    if (filters.revenueRange && filters.revenueRange.length > 0) {
      const revenueIndex = sheetData.headers.findIndex((header: string) => 
        header.toLowerCase().includes('revenue')
      );
      if (revenueIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.revenueRange!.includes(row[revenueIndex]?.toString().trim())
        );
      }
    }

    // Apply founded year filter
    if (filters.foundedYear && filters.foundedYear.length > 0) {
      const foundedIndex = sheetData.headers.findIndex((header: string) => 
        header.toLowerCase().includes('founded') && header.toLowerCase().includes('year')
      );
      if (foundedIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const foundedYear = row[foundedIndex]?.toString().trim();
          if (!foundedYear) return false;
          
          const year = parseInt(foundedYear);
          if (isNaN(year)) return false;

          // Check if year falls within any selected era
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

    // Apply region filter
    if (filters.region && filters.region.length > 0) {
      const regionIndex = sheetData.headers.findIndex((header: string) => 
        header.toLowerCase() === 'region'
      );
      if (regionIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.region!.includes(row[regionIndex]?.toString().trim())
        );
      }
    }

    // Apply industry filter
    if (filters.industry && filters.industry.length > 0) {
      const industryIndex = sheetData.headers.findIndex((header: string) => 
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

    // Apply sub-industry filter
    if (filters.subIndustry && filters.subIndustry.length > 0) {
      const subIndustryIndex = sheetData.headers.findIndex((header: string) => 
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

    // Apply activity filter
    if (filters.activity && filters.activity.length > 0) {
      const activityIndex = sheetData.headers.findIndex((header: string) => 
        header.toLowerCase() === 'activity'
      );
      if (activityIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.activity!.includes(row[activityIndex]?.toString().trim())
        );
      }
    }

    // Apply bizgrid score filter
    if (filters.bizgridScore && filters.bizgridScore.length > 0) {
      const bizgridIndex = sheetData.headers.findIndex((header: string) => 
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

    return {
      ...sheetData,
      rows: filteredRows
    };
  }, [sheetData, filters]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!filteredData) {
    return (
      <Box p={3}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  const stats = getCountryStatistics(filteredData);
  const countryData = stats.countryData;

  // Prepare data for bar chart (top 15 countries)
  const barChartData = stats.topCountries.slice(0, 15).map(country => ({
    country: country.country.length > 15 ? country.country.substring(0, 15) + '...' : country.country,
    fullCountry: country.country,
    companies: country.value,
    entries: country.count
  }));

  // Prepare data for pie chart (top 8 countries + others)
  const pieChartData = stats.topCountries.slice(0, 8).map(country => ({
    name: country.country,
    value: country.value
  }));
  
  const othersCount = countryData.slice(8).reduce((sum, country) => sum + country.value, 0);
  if (othersCount > 0) {
    pieChartData.push({
      name: 'Others',
      value: othersCount
    });
  }

  // Colors for pie chart
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1'];

  return (
    <Box sx={{ width: '100%', p: 2 }}>
      <Paper elevation={2} sx={{ p: 1.5, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', lg: 'row' }, alignItems: 'flex-start' }}>
          {/* World Map Content */}
          <Box sx={{ width: { xs: '100%', lg: '60%' }, minWidth: 0 }}>
            <ChoroplethMap 
              data={countryData} 
              title="World Atlas"
              colorScheme="blue"
            />
          </Box>
          
          {/* Unmapped Countries Table */}
          <Box sx={{ width: { xs: '100%', lg: '40%' }, flexShrink: 0 }}>
            <UnmappedCountriesTable data={countryData} />
          </Box>
        </Box>
      </Paper>
      
      {/* Two Bar Charts Side by Side - Each 50% width */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2, mb: 2 }}>
        <EmployeeBarChart 
          data={filteredData} 
          filters={filters}
        />
        <FoundedYearBarChart 
          data={filteredData} 
          filters={filters}
        />
      </Box>

      {/* Two More Bar Charts Side by Side - Each 50% width */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 2 }}>
        <RevenueRangeBarChart 
          data={filteredData} 
          filters={filters}
        />
        <BizgridScoreBarChart 
          data={filteredData} 
          filters={filters}
        />
      </Box>
    </Box>
  );
};

export default WorldMapPage;
