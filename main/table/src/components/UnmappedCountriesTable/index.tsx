import React from 'react';
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
  Chip
} from '@mui/material';

interface CountryData {
  country: string;
  value: number;
  count: number;
}

interface UnmappedCountriesTableProps {
  data: CountryData[];
}

// List of countries not in world atlas
const UNMAPPED_COUNTRIES = [
  'Andorra', 'Antigua and Barbuda', 'Bahrain', 'Barbados', 'Bermuda',
  'British Virgin Islands', 'Cape Verde', 'Cayman Islands', 'Curacao',
  'Democratic Republic of the Congo', 'Eswatini', 'Faroe Islands',
  'French Polynesia', 'Gibraltar', 'Isle of Man', 'Jersey', 'Kiribati',
  'Liechtenstein', 'Maldives', 'Malta', 'Marshall Islands', 'Mauritius',
  'Monaco', 'Nauru', 'North Macedonia', 'Saint Vincent and the Grenadines',
  'Samoa', 'Sao Tome and Principe', 'Seychelles', 'Singapore', 'Tonga',
  'Turks and Caicos Islands', 'U.S. Virgin Islands'
];

const UnmappedCountriesTable: React.FC<UnmappedCountriesTableProps> = ({ data }) => {
  // Filter data to only include unmapped countries
  const unmappedData = data.filter(item => 
    UNMAPPED_COUNTRIES.includes(item.country) ||
    item.country === 'Hong Kong' ||
    item.country === 'Macau'
  ).sort((a, b) => b.value - a.value);

  if (unmappedData.length === 0) {
    return null;
  }

  return (
    <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Countries & Regions Not Displayed on Map
      </Typography>
      <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
        The following countries and special administrative regions are not included in the world map atlas 
        but are tracked in your database:
      </Typography>
      
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Country/Region</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Companies</TableCell>
              <TableCell align="right" sx={{ fontWeight: 'bold' }}>Total Entries</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {unmappedData.map((item) => (
              <TableRow key={item.country} hover>
                <TableCell>{item.country}</TableCell>
                <TableCell align="right">
                  <Typography variant="body2" fontWeight="bold">
                    {item.value.toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell align="right">{item.count.toLocaleString()}</TableCell>
                <TableCell>
                  {item.country === 'Hong Kong' || item.country === 'Macau' ? (
                    <Chip 
                      label="Special Administrative Region" 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                  ) : (
                    <Chip 
                      label="Not in Atlas" 
                      size="small" 
                      color="default" 
                      variant="outlined"
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      <Typography variant="caption" sx={{ mt: 2, display: 'block', color: '#666' }}>
        Note: These regions are included in the overall statistics but cannot be displayed geographically 
        on the world map due to limitations in the mapping dataset.
      </Typography>
    </Paper>
  );
};

export default UnmappedCountriesTable;
