import React, { useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Paper,
  useTheme
} from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface EmployeeBarChartProps {
  data: {
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

const EmployeeBarChart: React.FC<EmployeeBarChartProps> = ({ data, filters = {} }) => {
  const theme = useTheme();

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

  const chartData = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return [];
    }

    // Find the employee column index
    const employeeIndex = data.headers.findIndex(header => 
      header.toLowerCase().includes('number of employees') || header.toLowerCase().includes('employee')
    );

    if (employeeIndex === -1) {
      return [];
    }

    // Apply filters to get filtered rows
    let filteredRows = [...data.rows];

    // Apply country filter
    if (filters.country && filters.country.length > 0) {
      const countryIndex = data.headers.findIndex(header => 
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
      const sectorIndex = data.headers.findIndex(header => 
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

    // Apply other filters similarly...
    if (filters.region && filters.region.length > 0) {
      const regionIndex = data.headers.findIndex(header => 
        header.toLowerCase() === 'region'
      );
      if (regionIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.region!.includes(row[regionIndex]?.toString().trim())
        );
      }
    }

    // Count companies by employee range
    const employeeCounts: { [key: string]: number } = {};
    
    // Initialize all ranges with 0
    employeeRangeOptions.forEach(range => {
      employeeCounts[range] = 0;
    });

    filteredRows.forEach(row => {
      const employeeValue = row[employeeIndex];
      if (!employeeValue) return;

      let normalizedValue = employeeValue.toString().trim();
      
      // Normalize 10000+ to 10001+
      if (normalizedValue === '10000+') {
        normalizedValue = '10001+';
      }

      // Only count if it's one of our predefined ranges
      if (employeeRangeOptions.includes(normalizedValue)) {
        employeeCounts[normalizedValue]++;
      }
    });

    // Convert to chart format
    return employeeRangeOptions.map(range => ({
      range,
      companies: employeeCounts[range] || 0
    }));
  }, [data, filters]);

  const colors = [
    '#f3e8ff', '#e6d7ff', '#d5bfff', '#c4a6ff', '#b48cff',
    '#a873ff', '#8f5eff', '#7a3cff', '#6729c7'
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <Card sx={{ p: 2, backgroundColor: 'background.paper', border: '1px solid #e0e0e0' }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {payload[0].payload.range} Employees
          </Typography>
          <Typography variant="body2" color="primary">
            {payload[0].value} Companies
          </Typography>
        </Card>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <Paper elevation={2} sx={{ p: 3, height: '50vh' }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6" color="text.secondary">
            No employee data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, width: '50vw', height: '350px' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Number of Employees
      </Typography>
      <ResponsiveContainer width="100%" height="95%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis 
            dataKey="range" 
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fontSize: 12 }}
            interval={0}
          />
          <YAxis hide={false} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="companies" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Paper>
  );
};

export default EmployeeBarChart;
