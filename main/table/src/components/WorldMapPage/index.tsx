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
      <Typography variant="h4" gutterBottom align="center">
        Global Company Distribution
      </Typography>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Countries
              </Typography>
              <Typography variant="h4">
                {stats.totalCountries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Companies
              </Typography>
              <Typography variant="h4">
                {stats.totalCompanies}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Entries
              </Typography>
              <Typography variant="h4">
                {stats.totalEntries}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Avg Companies/Country
              </Typography>
              <Typography variant="h4">
                {stats.totalCountries > 0 ? (stats.totalCompanies / stats.totalCountries).toFixed(1) : '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="World Map" />
          <Tab label="Top Countries" />
          <Tab label="Distribution" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <ChoroplethMap 
          data={countryData} 
          title="Company Distribution by Country"
          colorScheme="blue"
        />
        <UnmappedCountriesTable data={countryData} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top 15 Countries by Number of Companies
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="country" 
                    angle={-45} 
                    textAnchor="end" 
                    height={100}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div style={{ backgroundColor: 'white', padding: '8px', border: '1px solid #ccc' }}>
                            <p><strong>{data.fullCountry}</strong></p>
                            <p>Companies: {data.companies}</p>
                            <p>Total Entries: {data.entries}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="companies" fill="#2196f3" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Top 10 Countries
              </Typography>
              {stats.topCountries.slice(0, 10).map((country, index) => (
                <Box key={country.country} sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">
                    {index + 1}. {country.country}
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {country.value}
                  </Typography>
                </Box>
              ))}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Company Distribution (Top 8 Countries)
              </Typography>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Regional Insights
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" paragraph>
                  <strong>Most Represented:</strong> {stats.topCountries[0]?.country} ({stats.topCountries[0]?.value} companies)
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Countries with Data:</strong> {stats.totalCountries}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Average per Country:</strong> {stats.totalCountries > 0 ? (stats.totalCompanies / stats.totalCountries).toFixed(1) : '0'} companies
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Top 3 Countries:</strong>
                </Typography>
                <Box component="ul" sx={{ pl: 2, mt: 1 }}>
                  {stats.topCountries.slice(0, 3).map((country, index) => (
                    <li key={country.country}>
                      <Typography variant="body2">
                        {country.country}: {country.value} companies ({((country.value / stats.totalCompanies) * 100).toFixed(1)}%)
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>
    </Box>
  );
};

export default WorldMapPage;
