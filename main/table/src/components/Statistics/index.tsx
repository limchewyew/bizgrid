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

interface ChartData {
  name: string;
  count: number;
}

const Statistics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const sheetData = await fetchDataFromSheet();
        setData(sheetData.rows);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const processCountriesData = (): ChartData[] => {
    const countryCount: { [key: string]: number } = {};
    
    data.forEach(row => {
      // Try different columns to find the actual Country data
      let country = 'Unknown';
      
      // Try column D (index 3)
      if (row[3] && typeof row[3] === 'string' && row[3].trim()) {
        country = row[3];
      }
      // Try column E (index 4) - this might be regions
      else if (row[4] && typeof row[4] === 'string' && row[4].trim()) {
        country = row[4];
      }
      // Try column F (index 5)
      else if (row[5] && typeof row[5] === 'string' && row[5].trim()) {
        country = row[5];
      }
      // Try column G (index 6)
      else if (row[6] && typeof row[6] === 'string' && row[6].trim()) {
        country = row[6];
      }
      
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count); // Remove slice(0, 10) to show all
  };

  const processCountryData = (): ChartData[] => {
    const countryCount: { [key: string]: number } = {};
    
    data.forEach(row => {
      const country = row[4] || 'Unknown'; // Country column index
      countryCount[country] = (countryCount[country] || 0) + 1;
    });

    return Object.entries(countryCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const processSectorData = (): ChartData[] => {
    const sectorCount: { [key: string]: number } = {};
    
    data.forEach(row => {
      const sector = row[10] || 'Unknown'; // Sector column index
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
    
    data.forEach(row => {
      const revenue = row[9] || 'Unknown'; // Revenue range column index
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
    
    data.forEach(row => {
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
    
    data.forEach(row => {
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
    <Box p={3}>
      <Grid container spacing={3}>
        {/* Countries Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Regions
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processCountryData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Sectors Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue range
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processSectorData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#dc004e" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Founded Year
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={processFoundedYearData()} margin={{ top: 5, right: 30, left: 20, bottom: 120 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={120} 
                    interval={0}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#388e3c" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Employees Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Employee Ranges
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={processEmployeeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#f57c00" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Countries Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Countries
              </Typography>
              <TableContainer component={Paper} sx={{ maxHeight: 500, overflow: 'auto' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Rank</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Country</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 'bold' }}>Number of companies</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {processCountriesData().map((row, index) => (
                      <TableRow key={row.name} hover>
                        <TableCell align="center">{index + 1}</TableCell>
                        <TableCell align="center" component="th" scope="row">
                          {row.name}
                        </TableCell>
                        <TableCell align="center">{row.count}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Statistics;
