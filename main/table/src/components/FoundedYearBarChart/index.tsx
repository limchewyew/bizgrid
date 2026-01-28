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

interface FoundedYearBarChartProps {
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

const FoundedYearBarChart: React.FC<FoundedYearBarChartProps> = ({ data, filters = {} }) => {
  const theme = useTheme();

  const chartData = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return [];
    }

    // Find the founded year column index
    const foundedYearIndex = data.headers.findIndex(header => 
      header.toLowerCase().includes('founded') && header.toLowerCase().includes('year')
    );

    if (foundedYearIndex === -1) {
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

    // Count companies by founded year ranges
    const yearCounts: { [key: string]: number } = {};
    
    // Initialize year ranges
    const yearRanges = [
      'Before 1950',
      '1950-1969',
      '1970-1989',
      '1990-1999',
      '2000-2009',
      '2010-2014',
      '2015-2019',
      '2020-Present'
    ];
    
    yearRanges.forEach(range => {
      yearCounts[range] = 0;
    });

    filteredRows.forEach(row => {
      const foundedYearValue = row[foundedYearIndex];
      if (!foundedYearValue) return;

      const year = parseInt(foundedYearValue.toString().trim());
      if (isNaN(year)) return;

      // Categorize by year ranges
      if (year < 1950) {
        yearCounts['Before 1950']++;
      } else if (year >= 1950 && year <= 1969) {
        yearCounts['1950-1969']++;
      } else if (year >= 1970 && year <= 1989) {
        yearCounts['1970-1989']++;
      } else if (year >= 1990 && year <= 1999) {
        yearCounts['1990-1999']++;
      } else if (year >= 2000 && year <= 2009) {
        yearCounts['2000-2009']++;
      } else if (year >= 2010 && year <= 2014) {
        yearCounts['2010-2014']++;
      } else if (year >= 2015 && year <= 2019) {
        yearCounts['2015-2019']++;
      } else if (year >= 2020) {
        yearCounts['2020-Present']++;
      }
    });

    // Convert to chart format
    return yearRanges.map(range => ({
      range,
      companies: yearCounts[range] || 0
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
            {payload[0].payload.range}
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
      <Paper elevation={2} sx={{ p: 3, height: '400px' }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6" color="text.secondary">
            No founded year data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, width: '50vw', height: '350px' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Founded Year
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

export default FoundedYearBarChart;
