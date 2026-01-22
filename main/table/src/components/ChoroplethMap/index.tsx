import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Annotation,
  ZoomableGroup
} from 'react-simple-maps';
import { scaleQuantile } from 'd3-scale';
import { Box, Typography, useTheme, Tooltip } from '@mui/material';
import { Paper } from '@mui/material';

// GeoJSON URL for world countries
const geoUrl = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryData {
  country: string;
  value: number;
  count: number;
}

interface ChoroplethMapProps {
  data: CountryData[];
  title?: string;
  colorScheme?: 'blue' | 'green' | 'red' | 'purple';
}

const ChoroplethMap: React.FC<ChoroplethMapProps> = ({ 
  data, 
  title = 'World Map',
  colorScheme = 'blue' 
}) => {
  const theme = useTheme();
  const [geographies, setGeographies] = useState<any[]>([]);
  const [tooltipContent, setTooltipContent] = useState<string>('');

  // Color schemes
  const colorSchemes = {
    blue: ['#e3f2fd', '#bbdefb', '#90caf9', '#64b5f6', '#42a5f5', '#2196f3', '#1e88e5', '#1976d2'],
    green: ['#e8f5e8', '#c8e6c9', '#a5d6a7', '#81c784', '#66bb6a', '#4caf50', '#43a047', '#388e3c'],
    red: ['#ffebee', '#ffcdd2', '#ef9a9a', '#e57373', '#ef5350', '#f44336', '#e53935', '#d32f2f'],
    purple: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#8e24aa', '#7b1fa2']
  };

  // Country name mapping for common variations
  const countryNameMap: { [key: string]: string } = {
    'United States': 'United States of America',
    'USA': 'United States of America',
    'US': 'United States of America',
    'United Kingdom': 'United Kingdom',
    'UK': 'United Kingdom',
    'South Korea': 'South Korea',
    'Russia': 'Russia',
    'Czech Republic': 'Czechia',
    'Macedonia': 'North Macedonia',
    'Swaziland': 'eSwatini',
    'Congo': 'Congo',
    'Democratic Republic of Congo': 'Democratic Republic of the Congo',
    'Ivory Coast': "Côte d'Ivoire",
    'Burma': 'Myanmar',
    'East Timor': 'Timor-Leste',
    'Palestine': 'Palestine',
    'Western Sahara': 'Western Sahara',
    'Kosovo': 'Kosovo',
    'Taiwan': 'Taiwan',
    'Dominican Republic': 'Dominican Rep.',
    'Equatorial Guinea': 'Eq. Guinea',
    'Solomon Islands': 'Solomon Is.',
    'U.S. Virgin Islands': 'United States Virgin Islands',
    'Phillipines': 'Philippines'
  };

  // Normalize country names
  const normalizeCountryName = (name: string): string => {
    if (!name) return '';
    return countryNameMap[name.trim()] || name.trim();
  };

  // Create data map for quick lookup
  const dataMap = new Map<string, CountryData>();
  const hongKongDataRef = React.useRef<CountryData | null>(null);
  const macauDataRef = React.useRef<CountryData | null>(null);
  
  data.forEach(item => {
    const normalizedName = normalizeCountryName(item.country);
    if (normalizedName) {
      // Special handling for Hong Kong and Macau
      if (item.country === 'Hong Kong') {
        hongKongDataRef.current = item;
      } else if (item.country === 'Macau') {
        macauDataRef.current = item;
      } else {
        dataMap.set(normalizedName, item);
      }
    }
  });

  // Create color scale
  const values = data.map(d => d.value).filter(v => v > 0);
  const colorScale = scaleQuantile<string>()
    .domain(values)
    .range(colorSchemes[colorScheme]);

  // Load geographies
  useEffect(() => {
    fetch(geoUrl)
      .then(res => res.json())
      .then(data => {
        setGeographies(data.objects.countries.geographies);
      })
      .catch(err => console.error('Error loading geographies:', err));
  }, []);

  const handleGeographyEnter = (geo: any) => {
    const countryName = geo.properties.name;
    const countryData = dataMap.get(countryName);
    
    if (countryData) {
      let tooltipText = `${countryName}: ${countryData.value.toLocaleString()} companies (${countryData.count} entries)`;
      
      // Add Hong Kong and Macau data when hovering over China
      if (countryName === 'China') {
        let specialRegions = [];
        if (hongKongDataRef.current) {
          specialRegions.push(`Hong Kong (SAR): ${hongKongDataRef.current.value.toLocaleString()} companies`);
        }
        if (macauDataRef.current) {
          specialRegions.push(`Macau (SAR): ${macauDataRef.current.value.toLocaleString()} companies`);
        }
        if (specialRegions.length > 0) {
          tooltipText += `\n${specialRegions.join('\n')}`;
        }
      }
      
      setTooltipContent(tooltipText);
    } else {
      let tooltipText = `${countryName}: No data`;
      
      // Show Hong Kong and Macau data for China even if China has no data
      if (countryName === 'China') {
        let specialRegions = [];
        if (hongKongDataRef.current) {
          specialRegions.push(`Hong Kong (SAR): ${hongKongDataRef.current.value.toLocaleString()} companies`);
        }
        if (macauDataRef.current) {
          specialRegions.push(`Macau (SAR): ${macauDataRef.current.value.toLocaleString()} companies`);
        }
        if (specialRegions.length > 0) {
          tooltipText += `\n${specialRegions.join('\n')}`;
        }
      }
      
      setTooltipContent(tooltipText);
    }
  };

  const handleGeographyLeave = () => {
    setTooltipContent('');
  };

  const getFillColor = (geo: any) => {
    const countryName = geo.properties.name;
    const countryData = dataMap.get(countryName);
    
    if (countryData && countryData.value > 0) {
      return colorScale(countryData.value);
    }
    return '#f5f5f5'; // Light gray for countries with no data
  };

  return (
    <Paper elevation={2} sx={{ p: 3, backgroundColor: theme.palette.background.paper }}>
      <Typography variant="h5" gutterBottom align="center" color={theme.palette.text.primary}>
        {title}
      </Typography>
      
      <Box sx={{ width: '100%', height: '500px', position: 'relative' }}>
        <ComposableMap
          projection="geoNaturalEarth1"
          projectionConfig={{
            scale: 147,
          }}
        >
          <ZoomableGroup zoom={1}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={getFillColor(geo)}
                    stroke="#ffffff"
                    strokeWidth={0.5}
                    style={{
                      default: {
                        outline: 'none',
                      },
                      hover: {
                        fill: theme.palette.primary.main,
                        outline: 'none',
                        cursor: 'pointer',
                      },
                      pressed: {
                        outline: 'none',
                      },
                    }}
                    onMouseEnter={() => handleGeographyEnter(geo)}
                    onMouseLeave={handleGeographyLeave}
                  />
                ))
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        
        {tooltipContent && (
          <Box
            sx={{
              position: 'absolute',
              top: 10,
              left: 10,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px',
              pointerEvents: 'none',
              zIndex: 1000,
            }}
          >
            {tooltipContent}
          </Box>
        )}
      </Box>
      
    </Paper>
  );
};

export default ChoroplethMap;
