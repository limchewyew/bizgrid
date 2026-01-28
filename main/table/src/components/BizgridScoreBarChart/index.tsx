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

interface BizgridScoreBarChartProps {
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

const BizgridScoreBarChart: React.FC<BizgridScoreBarChartProps> = ({ data, filters = {} }) => {
  const theme = useTheme();

  const bizgridScoreOptions = [
    '0-20',
    '20-40',
    '40-60',
    '60-80',
    '80-100'
  ];

  const chartData = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return [];
    }

    // Find the bizgrid score column index
    const bizgridIndex = data.headers.findIndex(header => 
      header.toLowerCase().includes('bizgrid') || header.toLowerCase().includes('score')
    );

    if (bizgridIndex === -1) {
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

    // Count companies by bizgrid score ranges
    const scoreCounts: { [key: string]: number } = {};
    
    // Initialize all ranges with 0
    bizgridScoreOptions.forEach(range => {
      scoreCounts[range] = 0;
    });

    filteredRows.forEach(row => {
      const scoreValue = row[bizgridIndex];
      if (!scoreValue) return;

      const score = parseFloat(scoreValue.toString().trim());
      if (isNaN(score)) return;

      // Categorize by score ranges
      if (score >= 0 && score <= 20) {
        scoreCounts['0-20']++;
      } else if (score > 20 && score <= 40) {
        scoreCounts['20-40']++;
      } else if (score > 40 && score <= 60) {
        scoreCounts['40-60']++;
      } else if (score > 60 && score <= 80) {
        scoreCounts['60-80']++;
      } else if (score > 80 && score <= 100) {
        scoreCounts['80-100']++;
      }
    });

    // Convert to chart format
    return bizgridScoreOptions.map(range => ({
      range,
      companies: scoreCounts[range] || 0
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
            Score: {payload[0].payload.range}
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
            No bizgrid score data available
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper elevation={2} sx={{ p: 3, width: '50vw', height: '350px' }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', textAlign: 'center' }}>
        Bizgrid Score
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

export default BizgridScoreBarChart;
