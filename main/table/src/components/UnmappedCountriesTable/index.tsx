import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Box as MuiBox,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

// Function to get color based on value (similar to map's color scale)
const getColorForValue = (value: number, maxValue: number) => {
  // Using a blue color scale similar to the map
  const intensity = Math.min(1, value / maxValue);
  const hue = 210; // Blue hue
  const saturation = 70;
  const lightness = 90 - (intensity * 40); // Lighter for lower values
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

interface CountryData {
  country: string;
  value: number;
  count: number;
}

interface UnmappedCountriesTableProps {
  data: CountryData[];
}

const UnmappedCountriesTable: React.FC<UnmappedCountriesTableProps> = ({ data }) => {
  const theme = useTheme();
  const [worldAtlasCountries, setWorldAtlasCountries] = useState<Set<string>>(new Set());
  
  // Load world atlas countries to compare against dataset
  useEffect(() => {
    const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
    fetch(geoUrl)
      .then(res => res.json())
      .then(geoData => {
        const countries = new Set<string>(
          geoData.objects.countries.geographies.map((geo: any) => geo.properties.name as string)
        );
        setWorldAtlasCountries(countries);
      })
      .catch(err => console.error('Error loading world atlas countries:', err));
  }, []);
  
  // Filter data to find countries not in world atlas
  const unmappedData = useMemo(() => {
    // If world atlas countries haven't loaded yet, show all data as unmapped temporarily
    if (worldAtlasCountries.size === 0) {
      console.log('World atlas countries not loaded yet, showing all data as unmapped temporarily');
      return data.sort((a, b) => b.value - a.value);
    }
    
    const filtered = data.filter(item => {
      const countryName = item.country;
      const isUnmapped = !worldAtlasCountries.has(countryName) || 
                        countryName === 'Hong Kong' || 
                        countryName === 'Macau';
      return isUnmapped;
    }).sort((a, b) => b.value - a.value);
    
    console.log('World atlas countries loaded:', worldAtlasCountries.size);
    console.log('Total countries in data:', data.length);
    console.log('Unmapped countries found:', filtered.length);
    
    return filtered;
  }, [data, worldAtlasCountries]);

  // Find max value for color scaling
  const maxValue = unmappedData.length > 0 ? unmappedData[0].value : 1;

  if (unmappedData.length === 0) {
    return null;
  }
  
  return (
    <Box sx={{ mt: 2 }}>
      <TableContainer component={Paper} sx={{ maxHeight: 560, overflowY: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center', width: '150px' }}>Country/Region</TableCell>
              <TableCell sx={{ width: '100px', fontWeight: 'bold', textAlign: 'center' }}>Distribution</TableCell>
              <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Companies</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unmappedData.map((item) => {
              const color = getColorForValue(item.value, maxValue);
              
              return (
                <TableRow key={item.country} hover>
                  <TableCell sx={{ textAlign: 'center' }}>{item.country}</TableCell>
                  <TableCell align="center" sx={{ width: '40px' }}>
                    <MuiBox 
                      sx={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: color,
                        borderRadius: '4px',
                        margin: '0 auto'
                      }}
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {item.value.toLocaleString()}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default UnmappedCountriesTable;
