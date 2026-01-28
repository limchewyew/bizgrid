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

interface RevenueRangeBarChartProps {
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

const RevenueRangeBarChart: React.FC<RevenueRangeBarChartProps> = ({ data, filters = {} }) => {
  const theme = useTheme();

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

  const chartData = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return [];
    }

    // Find the revenue range column index
    const revenueIndex = data.headers.findIndex(header => 
      header.toLowerCase().includes('revenue')
    );

    if (revenueIndex === -1) {
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

    // Count companies by revenue range
    const revenueCounts: { [key: string]: number } = {};
    
    // Initialize all ranges with 0
    revenueRangeOptions.forEach(range => {
      revenueCounts[range] = 0;
    });

    filteredRows.forEach(row => {
      const revenueValue = row[revenueIndex];
      if (!revenueValue) return;

      const normalizedValue = revenueValue.toString().trim();
      
      // Only count if it's one of our predefined ranges
      if (revenueRangeOptions.includes(normalizedValue)) {
        revenueCounts[normalizedValue]++;
      }
    });

    // Convert to chart format
    return revenueRangeOptions.map(range => ({
      range,
      companies: revenueCounts[range] || 0
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
      <Paper elevation={2} sx={{ p: 3, height: '350px' }}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100%">
          <Typography variant="h6" color="text.secondary">
            No revenue data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, width: '50vw', height: '350px' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Revenue Range
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

export default RevenueRangeBarChart;
