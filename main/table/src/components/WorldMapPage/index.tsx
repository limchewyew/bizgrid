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

const WorldMapPage: React.FC = () => {
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

  if (!sheetData) {
    return (
      <Box p={3}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  const stats = getCountryStatistics(sheetData);
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
      <Paper elevation={2} sx={{ p: 1.5 }}>
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
    </Box>
  );
};

export default WorldMapPage;
