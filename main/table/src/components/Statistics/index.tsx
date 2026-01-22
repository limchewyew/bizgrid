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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TableSortLabel,
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

interface TableData {
  rank: number;
  country: string;
  numberOfCompanies: number;
}

type SortField = 'rank' | 'country' | 'numberOfCompanies';
type GroupByField = 'country' | 'region' | 'sector' | 'employees' | 'foundedYear' | 'revenueRange';
type SortOrder = 'asc' | 'desc';

const Statistics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]); // Add headers state
  const [columnMap, setColumnMap] = useState<{ [key: string]: number }>({}); // Add column map state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('rank');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [groupByField, setGroupByField] = useState<GroupByField>('country');
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
        setColumnMap(sheetData.columnMap || {}); // Set column map
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
      // Use dynamic column finding like Company Directory
      return headers.findIndex(h => h.toLowerCase() === name);
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
  }, [data, headers]);

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
        // Use dynamic column finding like Company Directory
        return headers.findIndex(h => h.toLowerCase() === name);
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
      // Use dynamic column finding
      const countryIdx = headers.findIndex(h => h.toLowerCase() === 'country');
      let country = countryIdx !== -1 ? (row[countryIdx] || 'Unknown') : 'Unknown';
      
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Remove slice(0, 10) to show all
  };

  // Process data for table based on selected grouping field
  const processTableData = (): TableData[] => {
    console.log('processTableData called with groupByField:', groupByField);
    console.log('filters.foundedYear:', filters.foundedYear);
    console.log('filteredData length:', filteredData.length);
    console.log('original data length:', data.length);
    
    const itemCount: { [key: string]: number } = {};
    
    // Get column index for the selected grouping field
    const getColumnIndex = (field: GroupByField): number => {
      // Use dynamic column finding like Company Directory
      const fieldNameMap: Record<GroupByField, string> = {
        'country': 'country',
        'region': 'region',
        'sector': 'sector',
        'employees': 'number of employees',
        'foundedYear': 'founded year',
        'revenueRange': 'revenue range'
      };
      
      const headerName = fieldNameMap[field];
      return headers.findIndex(h => h.toLowerCase() === headerName);
    };
    
    const colIndex = getColumnIndex(groupByField);
    
    filteredData.forEach((row, index) => {
      // Debug first few rows to understand the data structure
      if (index < 5) {
        console.log(`Row ${index} full data:`, row);
        console.log(`Row ${index} ${groupByField} data:`, row[colIndex], 'Type:', typeof row[colIndex]);
      }
      
      const itemData = row[colIndex];
      let itemName = 'Unknown';
      
      if (itemData) {
        if (typeof itemData === 'string') {
          itemName = itemData.trim();
        } else if (typeof itemData === 'object' && itemData !== null) {
          // If it's an object, try to get a string representation
          itemName = itemData.toString();
          // If toString() returns [object Object], try accessing common properties
          if (itemName === '[object Object]') {
            itemName = itemData.value || itemData.name || itemData.label || JSON.stringify(itemData);
          }
        } else {
          itemName = String(itemData);
        }
      }
      
      // Special handling for founded year to convert to eras
      if (groupByField === 'foundedYear' && itemName !== 'Unknown') {
        const yearNum = parseInt(itemName);
        if (!isNaN(yearNum)) {
          if (yearNum < 1950) {
            itemName = 'Pre-1950';
          } else if (yearNum >= 1950 && yearNum <= 1979) {
            itemName = '1950-1979';
          } else if (yearNum >= 1980 && yearNum <= 1989) {
            itemName = '1980-1989';
          } else if (yearNum >= 1990 && yearNum <= 1999) {
            itemName = '1990-1999';
          } else if (yearNum >= 2000 && yearNum <= 2009) {
            itemName = '2000-2009';
          } else if (yearNum >= 2010 && yearNum <= 2014) {
            itemName = '2010-2014';
          } else if (yearNum >= 2015 && yearNum <= 2019) {
            itemName = '2015-2019';
          } else if (yearNum >= 2020) {
            itemName = '2020-present';
          }
        }
      }
      
      // Only count if it's valid data
      if (itemName && itemName !== 'Unknown' && itemName !== '') {
        // For country grouping, exclude regions
        if (groupByField === 'country' && isRegion(itemName)) {
          return;
        }
        itemCount[itemName] = (itemCount[itemName] || 0) + 1;
      }
    });

    console.log('itemCount:', itemCount);

    return Object.entries(itemCount)
      .map(([name, count]) => ({ 
        rank: 0, // Will be set after sorting
        country: name, 
        numberOfCompanies: count 
      }))
      .sort((a, b) => b.numberOfCompanies - a.numberOfCompanies)
      .map((item, index) => ({ ...item, rank: index + 1 }));
  };

  // Helper function to identify if a value is a region
  const isRegion = (value: string): boolean => {
    const regions = [
      'North America', 'South America', 'Europe', 'Asia', 'Africa', 'Oceania', 
      'Middle East', 'Central America', 'Caribbean', 'Southeast Asia',
      'Eastern Europe', 'Western Europe', 'Northern Europe', 'Southern Europe',
      'East Asia', 'South Asia', 'West Asia', 'Central Asia',
      'North Africa', 'West Africa', 'East Africa', 'Southern Africa', 'Central Africa',
      'Pacific Islands',
      '#N/A', 'Unknown', ''
    ];
    return regions.includes(value);
  };

  const processCountryData = (): ChartData[] => {
    const countryCount: { [key: string]: number } = {};
    
    filteredData.forEach(row => {
      // Use dynamic column finding
      const countryIdx = headers.findIndex(h => h.toLowerCase() === 'country');
      let country = countryIdx !== -1 ? (row[countryIdx] || 'Unknown') : 'Unknown';
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
      // Use dynamic column finding
      const sectorIdx = headers.findIndex(h => h.toLowerCase() === 'sector');
      let sector = sectorIdx !== -1 ? (row[sectorIdx] || 'Unknown') : 'Unknown';
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
      // Use dynamic column finding
      const revenueIdx = headers.findIndex(h => h.toLowerCase() === 'revenue range');
      let revenue = revenueIdx !== -1 ? (row[revenueIdx] || 'Unknown') : 'Unknown';
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
      // Use dynamic column finding
      const employeeIdx = headers.findIndex(h => h.toLowerCase() === 'number of employees');
      let employees = employeeIdx !== -1 ? (row[employeeIdx] || 'Unknown') : 'Unknown';
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
      const foundedIdx = headers.findIndex(h => h.toLowerCase() === 'founded year');
      if (foundedIdx === -1) return;
      
      const year = row[foundedIdx] || 'Unknown'; // Founded year column index
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

  // Sort table data based on selected field and order
  const sortedTableData = React.useMemo(() => {
    const data = processTableData();
    return [...data].sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'rank':
          aValue = a.rank;
          bValue = b.rank;
          break;
        case 'country':
          aValue = a.country.toLowerCase();
          bValue = b.country.toLowerCase();
          break;
        case 'numberOfCompanies':
          aValue = a.numberOfCompanies;
          bValue = b.numberOfCompanies;
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [processTableData, sortField, sortOrder]);

  // Calculate total companies
  const totalCompanies = React.useMemo(() => {
    return processTableData().reduce((sum, item) => sum + item.numberOfCompanies, 0);
  }, [processTableData]);

  const handleSort = (field: SortField) => {
    const isAsc = sortField === field && sortOrder === 'asc';
    setSortOrder(isAsc ? 'desc' : 'asc');
    setSortField(field);
  };

  const handleGroupByChange = (field: GroupByField) => {
    setGroupByField(field);
    // Reset sort to rank when changing grouping
    setSortField('rank');
    setSortOrder('asc');
  };

  // Get display name for grouping field
  const getGroupByDisplayLabel = (field: GroupByField): string => {
    const labels: Record<GroupByField, string> = {
      'country': 'Country',
      'region': 'Region',
      'sector': 'Sector',
      'employees': 'Number of Employees',
      'foundedYear': 'Founded Year',
      'revenueRange': 'Revenue Range'
    };
    return labels[field];
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
      
      {/* Master Table */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>
              Master Table
            </Typography>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Group By</InputLabel>
              <Select
                value={groupByField}
                label="Group By"
                onChange={(e) => handleGroupByChange(e.target.value as GroupByField)}
              >
                <MenuItem value="country">Country</MenuItem>
                <MenuItem value="region">Region</MenuItem>
                <MenuItem value="sector">Sector</MenuItem>
                <MenuItem value="employees">Number of Employees</MenuItem>
                <MenuItem value="foundedYear">Founded Year</MenuItem>
                <MenuItem value="revenueRange">Revenue Range</MenuItem>
              </Select>
            </FormControl>
          </Box>
          <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell 
                    sx={{ fontWeight: 600, backgroundColor: '#001f3f', color: '#ffffff', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => handleSort('rank')}
                  >
                    <TableSortLabel
                      active={sortField === 'rank'}
                      direction={sortField === 'rank' ? sortOrder : 'asc'}
                      sx={{ color: '#ffffff !important' }}
                    >
                      Rank
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, backgroundColor: '#001f3f', color: '#ffffff', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => handleSort('country')}
                  >
                    <TableSortLabel
                      active={sortField === 'country'}
                      direction={sortField === 'country' ? sortOrder : 'asc'}
                      sx={{ color: '#ffffff !important' }}
                    >
                      {getGroupByDisplayLabel(groupByField)}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell 
                    sx={{ fontWeight: 600, backgroundColor: '#001f3f', color: '#ffffff', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => handleSort('numberOfCompanies')}
                  >
                    <TableSortLabel
                      active={sortField === 'numberOfCompanies'}
                      direction={sortField === 'numberOfCompanies' ? sortOrder : 'asc'}
                      sx={{ color: '#ffffff !important' }}
                    >
                      Number of Companies
                    </TableSortLabel>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedTableData.map((row) => (
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
                {/* Total Bar */}
                <TableRow 
                  sx={{ 
                    backgroundColor: '#f5f5f5',
                    fontWeight: 'bold',
                    borderTop: '2px solid #001f3f'
                  }}
                >
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                    Total
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                    
                  </TableCell>
                  <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>
                    {totalCompanies.toLocaleString()}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Statistics;
