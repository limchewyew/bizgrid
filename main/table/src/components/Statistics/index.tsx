import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { fetchDataFromSheet } from '../../services/googleSheets';
import StatisticsFilters from './StatisticsFilters';

interface ChartData {
  name: string;
  count: number;
}

const Statistics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]); // Add headers state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{
    region: string[];
    country: string[];
    sector: string[];
    employees: string[];
    foundedYear: string[];
    revenueRange: string[];
  }>({
    region: [],
    country: [],
    sector: [],
    employees: [],
    foundedYear: [],
    revenueRange: [],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const sheetData = await fetchDataFromSheet();
        console.log('Loaded data:', sheetData);
        console.log('Data rows length:', sheetData.rows.length);
        console.log('Headers:', sheetData.headers);
        
        setHeaders(sheetData.headers); // Set headers
        setData(sheetData.rows);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Get filter options based on data
  const filterOptions = React.useMemo(() => {
    const columnIndex = (name: string) => {
      // Find column index based on common column names
      const columnMapping: Record<string, number> = {
        'country': 3,  // Column D - Country data
        'region': 4,   // Column E - Region data  
        'sector': 11,  // Column L - Trying column 11 for Sector data
        'number of employees': 8,  // Column I - Employee data
        'founded year': 7,  // Column H - Founded year data
        'revenue range': 10,   // Column K - Revenue data (FIXED)
      };
      return columnMapping[name.toLowerCase()] || -1;
    };

    const unique = (idx: number, predefinedOptions?: string[]) => {
      if (idx === -1) return predefinedOptions || [];
      return Array.from(
        new Set([
          ...(predefinedOptions || []),
          ...data
            .map(r => r[idx])
            .filter(Boolean)
            .map(v => v.toString().trim())
        ])
      ).sort((a, b) => a.localeCompare(b));
    };

    const employeeRangeOptions = [
      '1-10',
      '11-50',
      '51-100',
      '101-250',
      '251-500',
      '501-1000',
      '1001-5000',
      '5001-10000',
      '10001+'
    ];

    const revenueRangeOptions = [
      'Less than $1M',
      '$1M to $10M',
      '$10M to $50M',
      '$50M to $100M',
      '$100M to $500M',
      '$500M to $1B',
      '$1B to $10B',
      '$10B+'
    ];

    return {
      region: unique(columnIndex('region')),
      country: unique(columnIndex('country')),
      sector: unique(columnIndex('sector')),
      employees: employeeRangeOptions,
      foundedYear: [], // Will use predefined eras
      revenueRange: revenueRangeOptions,
    };
  }, [data]);

  const handleFilterChange = (filterType: string, values: string[]) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: values
    }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      region: [],
      country: [],
      sector: [],
      employees: [],
      foundedYear: [],
      revenueRange: [],
    });
  };

  // Filter data based on selected filters
  const filteredData = React.useMemo(() => {
    console.log('filteredData useMemo called');
    console.log('Current filters:', filters);
    console.log('Original data length:', data.length);
    
    const result = data.filter(row => {
      const match = (idx: number, selected: string[]) => {
        if (idx === -1 || selected.length === 0) return true;
        const val = row[idx];
        if (!val) return false;
        return selected.includes(val.toString().trim());
      };

      const columnIndex = (name: string) => {
        const columnMapping: Record<string, number> = {
          'country': 3,  // Column D - Country data
          'region': 4,   // Column E - Region data  
          'sector': 11,  // Column L - Trying column 11 for Sector data
          'number of employees': 8,  // Column I - Employee data
          'founded year': 7,  // Column H - Founded year data
          'revenue range': 10,   // Column K - Revenue data (FIXED)
        };
        return columnMapping[name.toLowerCase()] || -1;
      };

      // Founded year special handling
      const foundedYearMatch = () => {
        if (filters.foundedYear.length === 0) return true;
        const foundedIdx = columnIndex('founded year');
        if (foundedIdx === -1) return true;
        
        const year = row[foundedIdx];
        if (!year || year.toString().trim() === '') return true; // Allow rows with no year data
        
        const yearNum = parseInt(year.toString().trim());
        if (isNaN(yearNum)) return true; // Allow rows with invalid year data
        
        // Handle era-based selection (e.g., "pre-1950", "1950-1979", etc.)
        const matches = filters.foundedYear.some(era => {
          switch (era) {
            case 'pre-1950': return yearNum < 1950;
            case '1950-1979': return yearNum >= 1950 && yearNum <= 1979;
            case '1980-1989': return yearNum >= 1980 && yearNum <= 1989;
            case '1990-1999': return yearNum >= 1990 && yearNum <= 1999;
            case '2000-2009': return yearNum >= 2000 && yearNum <= 2009;
            case '2010-2014': return yearNum >= 2010 && yearNum <= 2014;
            case '2015-2019': return yearNum >= 2015 && yearNum <= 2019;
            case '2020-present': return yearNum >= 2020 && yearNum <= new Date().getFullYear();
            default: return false;
          }
        });
        
        if (filters.foundedYear.length > 0 && year && year.toString().trim() !== '') {
          console.log(`Year ${yearNum} matches eras ${filters.foundedYear.join(', ')}: ${matches}`);
        }
        
        return matches;
      };

      const finalResult = (
        match(columnIndex('region'), filters.region) &&
        match(columnIndex('country'), filters.country) &&
        match(columnIndex('sector'), filters.sector) &&
        match(columnIndex('number of employees'), filters.employees) &&
        match(columnIndex('revenue range'), filters.revenueRange) &&
        foundedYearMatch()
      );
      
      return finalResult;
    });
    
    console.log('Filtered data length:', result.length);
    return result;
  }, [data, filters]);

  const processCountriesData = (): ChartData[] => {
    const countryCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      // Use column D (index 3) for Country data
      let country = row[3] || 'Unknown';
      
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Remove slice(0, 10) to show all
  };

  // Process countries data for table with ranking
  const processCountriesTableData = () => {
    console.log('processCountriesTableData called');
    console.log('filters.foundedYear:', filters.foundedYear);
    console.log('filteredData length:', filteredData.length);
    console.log('original data length:', data.length);
    
    const countryCount: { [key: string]: number } = {};
    
    filteredData.forEach((row, index) => {
      // Debug first few rows to understand the data structure
      if (index < 5) {
        console.log(`Row ${index} full data:`, row);
        console.log(`Row ${index} country data:`, row[4], 'Type:', typeof row[4]);
      }
      
      // Use column index 4 for Country data (after transformation: 0=Row Number, 1=Logo, 2=Company Name, 3=Location, 4=Country)
      const countryData = row[4];
      let countryName = 'Unknown';
      
      if (countryData) {
        if (typeof countryData === 'string') {
          countryName = countryData.trim();
        } else if (typeof countryData === 'object' && countryData !== null) {
          // If it's an object, try to get a string representation
          countryName = countryData.toString();
          // If toString() returns [object Object], try accessing common properties
          if (countryName === '[object Object]') {
            countryName = countryData.value || countryData.name || countryData.label || JSON.stringify(countryData);
          }
        } else {
          countryName = String(countryData);
        }
      }
      
      countryCount[countryName] = (countryCount[countryName] || 0) + 1;
    });

    console.log('countryCount:', countryCount);

    return Object.entries(countryCount)
      .map(([name, count]) => ({ 
        rank: 0, // Will be set after sorting
        country: name, 
        numberOfCompanies: count 
      }))
      .sort((a, b) => b.numberOfCompanies - a.numberOfCompanies)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  };

  const processCountryData = (): ChartData[] => {
    const countryCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      const country = row[3] || 'Unknown'; // Country column index - Column D
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processSectorData = (): ChartData[] => {
    const sectorCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      const sector = row[11] || 'Unknown'; // Sector column index - Column L (Trying column 11)
      sectorCount[sector] = (sectorCount[sector] || 0) + 1;
    });

    // Check if this is actually revenue data - if so, sort by revenue range
    const isRevenueData = Object.keys(sectorCount).some(key => 
      key.includes('$') || key.includes('Less than') || key.includes('Unknown')
    );

    if (isRevenueData) {
      // Define the logical order for revenue ranges from small to big
      const revenueOrder = [
        'Less than $1M',
        '$1M to $10M',
        '$10M to $50M',
        '$50M to $100M',
        '$100M to $500M',
        '$500M to $1B',
        '$1B to $10B',
        '$10B+',
        'Unknown'
      ];

      // Create ordered data array
      const orderedData: ChartData[] = [];
      
      // Add ranges in the specified order
      revenueOrder.forEach(range => {
        if (sectorCount[range]) {
          orderedData.push({ name: range, count: sectorCount[range] });
        }
      });

      // Add any other ranges that weren't in the specified order
      Object.entries(sectorCount).forEach(([name, count]) => {
        if (!revenueOrder.includes(name)) {
          orderedData.push({ name, count });
        }
      });

      return orderedData;
    }

    // If it's actual sector data, return top 10 by count
    return Object.entries(sectorCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processRevenueData = (): ChartData[] => {
    const revenueCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      const revenue = row[10] || 'Unknown'; // Revenue range column index - Column K (FIXED)
      revenueCount[revenue] = (revenueCount[revenue] || 0) + 1;
    });

    // Define the specific order for revenue ranges
    const revenueOrder = [
      'Less than $1M',
      '$1M to $10M',
      '$10M to $50M',
      '$50M to $100M',
      '$100M to $500M',
      '$500M to $1B',
      '$1B to $10B',
      '$10B+',
      'Unknown'
    ];

    // Create ordered data array
    const orderedData: ChartData[] = [];
    
    // Add ranges in the specified order
    revenueOrder.forEach(range => {
      if (revenueCount[range]) {
        orderedData.push({ name: range, count: revenueCount[range] });
      }
    });

    // Add any other ranges that weren't in the specified order
    Object.entries(revenueCount).forEach(([name, count]) => {
      if (!revenueOrder.includes(name)) {
        orderedData.push({ name, count });
      }
    });

    return orderedData;
  };

  const processEmployeeData = (): ChartData[] => {
    const employeeCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      const employees = row[8] || 'Unknown'; // Number of employees column index
      employeeCount[employees] = (employeeCount[employees] || 0) + 1;
    });

    // Define the order for employee ranges from small to big
    const employeeOrder = [
      '1-10',
      '11-50',
      '51-100',
      '101-250',
      '251-500',
      '501-1000',
      '1001-5000',
      '5001-10000',
      '10001+',
      'Unknown'
    ];

    // Create ordered data array
    const orderedData: ChartData[] = [];
    
    // Add ranges in the specified order
    employeeOrder.forEach(range => {
      if (employeeCount[range]) {
        orderedData.push({ name: range, count: employeeCount[range] });
      }
    });

    // Add any other ranges that weren't in the specified order
    Object.entries(employeeCount).forEach(([name, count]) => {
      if (!employeeOrder.includes(name)) {
        orderedData.push({ name, count });
      }
    });

    return orderedData;
  };

  const processFoundedYearData = (): ChartData[] => {
    const yearCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      const year = row[7] || 'Unknown'; // Founded year column index
      if (year && year !== 'Unknown') {
        const yearNum = parseInt(year);
        let era = 'Unknown';
        
        if (yearNum < 1950) {
          era = 'Pre-1950: Legacy/Industrial';
        } else if (yearNum >= 1950 && yearNum <= 1979) {
          era = '1950-1979: Post-War Expansion';
        } else if (yearNum >= 1980 && yearNum <= 1989) {
          era = '1980-1989: Early Tech';
        } else if (yearNum >= 1990 && yearNum <= 1999) {
          era = '1990-1999: Dot-com Era';
        } else if (yearNum >= 2000 && yearNum <= 2009) {
          era = '2000-2009: Web 2.0 / Post-Crisis';
        } else if (yearNum >= 2010 && yearNum <= 2014) {
          era = '2010-2014: Early SaaS/Cloud';
        } else if (yearNum >= 2015 && yearNum <= 2019) {
          era = '2015-2019: Late-Stage Growth';
        } else if (yearNum >= 2020) {
          era = '2020-Present: Post-Pandemic';
        }
        
        yearCount[era] = (yearCount[era] || 0) + 1;
      } else {
        yearCount['Unknown'] = (yearCount['Unknown'] || 0) + 1;
      }
    });

    // Define the order for eras
    const eraOrder = [
      'Pre-1950: Legacy/Industrial',
      '1950-1979: Post-War Expansion',
      '1980-1989: Early Tech',
      '1990-1999: Dot-com Era',
      '2000-2009: Web 2.0 / Post-Crisis',
      '2010-2014: Early SaaS/Cloud',
      '2015-2019: Late-Stage Growth',
      '2020-Present: Post-Pandemic',
      'Unknown'
    ];

    // Create ordered data array
    const orderedData: ChartData[] = [];
    
    // Add eras in the specified order
    eraOrder.forEach(era => {
      if (yearCount[era]) {
        orderedData.push({ name: era, count: yearCount[era] });
      }
    });

    return orderedData;
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

  return (
    <Box sx={{ width: '100%' }}>
      <StatisticsFilters
        filters={filters}
        filterOptions={filterOptions}
        onFilterChange={handleFilterChange}
        onClearAll={handleClearAllFilters}
        allData={data}
        headers={headers}
      />
      
      {/* Countries Ranking Table */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
            Master Table
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#001f3f', color: '#ffffff', textAlign: 'center' }}>
                    Rank
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#001f3f', color: '#ffffff', textAlign: 'center' }}>
                    Country
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, backgroundColor: '#001f3f', color: '#ffffff', textAlign: 'center' }}>
                    Number of Companies
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {processCountriesTableData().map((row) => (
                  <TableRow key={row.country} hover>
                    <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>
                      {row.rank}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {row.country}
                    </TableCell>
                    <TableCell sx={{ textAlign: 'center' }}>
                      {row.numberOfCompanies.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
