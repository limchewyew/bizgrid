import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  Chip,
  Slider,
  Tooltip,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';

interface StatisticsFiltersProps {
  filters: {
    region: string[];
    country: string[];
    sector: string[];
    employees: string[];
    foundedYear: string[];
    revenueRange: string[];
  };
  filterOptions: {
    region: string[];
    country: string[];
    sector: string[];
    employees: string[];
    foundedYear: string[];
    revenueRange: string[];
  };
  onFilterChange: (filterType: string, values: string[]) => void;
  onClearAll: () => void;
  allData: any[];
  headers: string[]; // Add headers prop
}

const foundedYearEraOptions = [
  { value: 'pre-1950', label: 'Pre-1950: Legacy/Industrial' },
  { value: '1950-1979', label: '1950-1979: Post-War Expansion' },
  { value: '1980-1989', label: '1980-1989: Early Tech' },
  { value: '1990-1999', label: '1990-1999: Dot-com Era' },
  { value: '2000-2009', label: '2000-2009: Web 2.0 / Post-Crisis' },
  { value: '2010-2014', label: '2010-2014: Early SaaS/Cloud' },
  { value: '2015-2019', label: '2015-2019: Late-Stage Growth' },
  { value: '2020-present', label: '2020-Present: Post-Pandemic' },
];

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

const StatisticsFilters: React.FC<StatisticsFiltersProps> = ({
  filters,
  filterOptions,
  onFilterChange,
  onClearAll,
  allData,
  headers,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('region');
  
  // Get all unique years from actual data by finding the "Founded year" column dynamically
  const yearData = React.useMemo(() => {
    console.log('Headers:', headers);
    console.log('allData length:', allData?.length);
    
    if (!allData || allData.length === 0 || !headers || headers.length === 0) {
      console.log('No data or headers available');
      return { min: 1900, max: new Date().getFullYear(), years: [], frequencies: {} };
    }
    
    // Find the column index for "Founded year" (case-insensitive search)
    const foundedYearIndex = headers.findIndex(header => 
      header.toLowerCase().includes('founded') && header.toLowerCase().includes('year')
    );
    
    console.log('Founded year column index:', foundedYearIndex);
    
    if (foundedYearIndex === -1) {
      console.log('Founded year column not found in headers:', headers);
      return { min: 1900, max: new Date().getFullYear(), years: [], frequencies: {} };
    }
    
    // Define the 8 categories
    const categories = [
      { key: 'pre-1950', label: 'Pre-1950: Legacy/Industrial', min: 0, max: 1949 },
      { key: '1950-1979', label: '1950-1979: Post-War Expansion', min: 1950, max: 1979 },
      { key: '1980-1989', label: '1980-1989: Early Tech', min: 1980, max: 1989 },
      { key: '1990-1999', label: '1990-1999: Dot-com Era', min: 1990, max: 1999 },
      { key: '2000-2009', label: '2000-2009: Web 2.0 / Post-Crisis', min: 2000, max: 2009 },
      { key: '2010-2014', label: '2010-2014: Early SaaS/Cloud', min: 2010, max: 2014 },
      { key: '2015-2019', label: '2015-2019: Late-Stage Growth', min: 2015, max: 2019 },
      { key: '2020-present', label: '2020-Present', min: 2020, max: new Date().getFullYear() },
    ];
    
    // Extract years and categorize them
    const years = allData
      .map(row => row[foundedYearIndex])
      .filter(year => year && year.toString().trim() !== '')
      .map(year => parseInt(year.toString().trim()))
      .filter(year => !isNaN(year) && year > 0);
    
    // Count frequencies by category
    const categoryFrequencies: { [key: string]: number } = {};
    
    categories.forEach(category => {
      categoryFrequencies[category.key] = 0;
    });
    
    years.forEach(year => {
      const category = categories.find(cat => year >= cat.min && year <= cat.max);
      if (category) {
        categoryFrequencies[category.key]++;
      }
    });
    
    console.log('Category frequencies:', categoryFrequencies);
    
    const uniqueYears = Array.from(new Set(years)).sort((a, b) => a - b);
    const minYear = Math.min(...uniqueYears);
    const maxYear = Math.max(...uniqueYears);
    
    console.log('Year range:', { min: minYear, max: maxYear });
    
    return { 
      min: minYear, 
      max: maxYear, 
      years: uniqueYears, 
      frequencies: categoryFrequencies,
      categories: categories
    };
  }, [allData, headers]);
  
  const [yearRange, setYearRange] = useState<[number, number]>([yearData.min, yearData.max]);
  
  // Update year range when data changes
  useEffect(() => {
    setYearRange([yearData.min, yearData.max]);
  }, [yearData.min, yearData.max]);

  const categories = [
    { key: 'region', label: 'Region' },
    { key: 'country', label: 'Country' },
    { key: 'sector', label: 'Sector' },
    { key: 'employees', label: 'Number of Employees' },
    { key: 'foundedYear', label: 'Founded Year' },
    { key: 'revenueRange', label: 'Revenue Range' },
  ];

  // Get era categories for founded year
  const eraCategories = yearData.categories || [];

  const handleTagClick = (filterType: string, value: string) => {
    const currentValues = filters[filterType as keyof typeof filters] || [];
    let newValues: string[];
    
    if (currentValues.includes(value)) {
      newValues = currentValues.filter((v: string) => v !== value);
    } else {
      newValues = [...currentValues, value];
    }
    
    onFilterChange(filterType, newValues);
  };

  const handleYearRangeChange = (event: Event, newValue: number | number[]) => {
    const range = newValue as [number, number];
    setYearRange(range);
    
    // Convert range to era keys using eraCategories
    const eraKeys: string[] = [];
    eraCategories.forEach(category => {
      if (range[0] <= category.max && range[1] >= category.min) {
        eraKeys.push(category.key);
      }
    });
    
    console.log('Range to era keys:', range, '->', eraKeys);
    onFilterChange('foundedYear', eraKeys);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0);
  };

  const getCurrentOptions = () => {
    switch (selectedCategory) {
      case 'region':
        return filterOptions.region;
      case 'country':
        return filterOptions.country;
      case 'sector':
        return filterOptions.sector;
      case 'employees':
        return employeeRangeOptions;
      case 'foundedYear':
        return []; // Using slider instead of tags
      case 'revenueRange':
        return revenueRangeOptions;
      default:
        return [];
    }
  };

  const getCurrentValues = () => {
    switch (selectedCategory) {
      default:
        return filters[selectedCategory as keyof typeof filters] || [];
    }
  };

  const getCategoryActiveCount = (categoryKey: string) => {
    return filters[categoryKey as keyof typeof filters]?.length || 0;
  };

  // Custom Histogram Slider Component
  const HistogramSlider: React.FC<{
    value: [number, number];
    onChange: (event: Event, newValue: number | number[]) => void;
    min: number;
    max: number;
    frequencies: { [key: string]: number };
    categories: Array<{ key: string; label: string; min: number; max: number }>;
  }> = ({ value, onChange, min, max, frequencies, categories }) => {
    const sliderRef = useRef<HTMLDivElement>(null);
    // Initialize selectedCategories from parent filters
    const [selectedCategories, setSelectedCategories] = useState<string[]>(filters.foundedYear);
    
    // Update selectedCategories when parent filters change
    React.useEffect(() => {
      setSelectedCategories(filters.foundedYear);
    }, [filters.foundedYear]);
    
    const maxFrequency = Math.max(...Object.values(frequencies), 1);
    
    // Debug: Log current state
    console.log('HistogramSlider render:', { selectedCategories, frequencies });
    
    const handleCategoryClick = (categoryKey: string, categoryMin: number, categoryMax: number) => {
      console.log('Category clicked:', categoryKey);
      console.log('Current selection before:', selectedCategories);
      
      const newSelection = selectedCategories.includes(categoryKey)
        ? selectedCategories.filter(key => key !== categoryKey)
        : [...selectedCategories, categoryKey];
      
      console.log('New selection after:', newSelection);
      setSelectedCategories(newSelection);
      
      // Send the era keys directly to the parent filter
      console.log('Sending to filter:', newSelection);
      onFilterChange('foundedYear', newSelection);
      
      // Also update the range display
      if (newSelection.length > 0) {
        const selectedCats = eraCategories.filter(cat => newSelection.includes(cat.key));
        const newMin = Math.min(...selectedCats.map(cat => cat.min));
        const newMax = Math.max(...selectedCats.map(cat => cat.max));
        console.log('Setting range display:', [newMin, newMax]);
        onChange({} as Event, [newMin, newMax]);
      } else {
        console.log('Clearing selection');
        onChange({} as Event, [yearData.min, yearData.max]);
      }
    };
    
    // Create bars for each category
    const bars = eraCategories.map((category, index) => {
      const frequency = frequencies[category.key] || 0;
      const height = (frequency / maxFrequency) * 60; // Max height of 60px
      const barWidth = 100 / eraCategories.length; // Percentage width for each bar
      const left = index * barWidth; // Calculate left position
      const isSelected = selectedCategories.includes(category.key);
      
      console.log(`Rendering bar ${category.key}:`, { 
        frequency, 
        height, 
        isSelected,
        selectedCategories,
        includesCheck: selectedCategories.includes(category.key)
      });
      
      return (
        <Tooltip key={category.key} title={`${category.label}: ${frequency} companies`}>
          <Box
            onClick={() => handleCategoryClick(category.key, category.min, category.max)}
            sx={{
              position: 'absolute',
              left: `${left}%`,
              bottom: 0,
              width: `${barWidth}%`,
              height: `${height}px`,
              backgroundColor: isSelected ? '#1976d2' : '#e0e0e0',
              borderRadius: '2px 2px 0 0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              '&:hover': {
                backgroundColor: isSelected ? '#1565c0' : '#bdbdbd',
                transform: 'translateY(-2px)',
              }
            }}
          />
        </Tooltip>
      );
    });
    
    return (
      <Box sx={{ position: 'relative', height: '120px', mt: 2 }}>
        {/* Histogram bars */}
        <Box ref={sliderRef} sx={{ position: 'relative', height: '60px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
          {bars}
        </Box>
        
        {/* Category labels */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1, px: 1, position: 'relative' }}>
          {eraCategories.map((category, index) => {
            const barWidth = 100 / eraCategories.length;
            const left = index * barWidth + barWidth / 2; // Center of each bar
            
            return (
              <Typography
                key={category.key}
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  textAlign: 'center',
                  color: selectedCategories.includes(category.key) ? '#1976d2' : '#666',
                  fontWeight: selectedCategories.includes(category.key) ? 600 : 400,
                  cursor: 'pointer',
                  position: 'absolute',
                  left: `${left}%`,
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                }}
                onClick={() => handleCategoryClick(category.key, category.min, category.max)}
              >
                {category.label.split(':')[0]}
              </Typography>
            );
          })}
        </Box>
      </Box>
    );
  };

  return (
    <Card sx={{ mb: 1 }}>
      <CardContent sx={{ pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" fontWeight={600}>
            Filters
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {getActiveFiltersCount() > 0 && (
              <Typography variant="caption" color="text.secondary">
                {getActiveFiltersCount()} active
              </Typography>
            )}
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClearAll}
              disabled={getActiveFiltersCount() === 0}
            >
              Clear All
            </Button>
          </Box>
        </Box>
        
        <Divider sx={{ mb: 2 }} />

        <Box sx={{ display: 'flex', gap: 2, minHeight: 300 }}>
          {/* Left Panel - Categories */}
          <Box sx={{ width: 200, flexShrink: 0 }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Metric
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {categories.map((category) => (
                <Box
                  key={category.key}
                  onClick={() => setSelectedCategory(category.key)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderRadius: 1,
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === category.key 
                      ? 'primary.main' 
                      : 'transparent',
                    color: selectedCategory === category.key 
                      ? 'primary.contrastText' 
                      : 'text.primary',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    '&:hover': {
                      backgroundColor: selectedCategory === category.key 
                        ? 'primary.dark' 
                        : 'action.hover',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {category.label}
                  </Typography>
                  {getCategoryActiveCount(category.key) > 0 && (
                    <Chip 
                      size="small" 
                      label={getCategoryActiveCount(category.key)} 
                      color={selectedCategory === category.key ? 'default' : 'primary'}
                      variant={selectedCategory === category.key ? 'outlined' : 'filled'}
                      sx={{ 
                        ml: 1,
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: selectedCategory === category.key ? 'rgba(255,255,255,0.2)' : undefined,
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right Panel - Tags or Slider */}
          <Box sx={{ flex: 1, pl: 2, borderLeft: '1px solid rgba(0,0,0,0.12)' }}>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>
              Options
            </Typography>
            
            {selectedCategory === 'foundedYear' ? (
              <Box sx={{ px: 1, py: 2 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Select Year Range: {yearRange[0]} - {yearRange[1]}
                </Typography>
                <HistogramSlider
                  value={yearRange}
                  onChange={handleYearRangeChange}
                  min={yearData.min}
                  max={yearData.max}
                  frequencies={yearData.frequencies}
                  categories={eraCategories}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', textAlign: 'center' }}>
                  Bar height represents number of companies founded in each year
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {getCurrentOptions().map((option: any) => {
                  const isSelected = getCurrentValues().includes(option);
                  return (
                    <Chip
                      key={option}
                      label={option}
                      onClick={() => handleTagClick(selectedCategory, option)}
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? 'primary' : 'default'}
                      clickable
                      sx={{
                        '&:hover': {
                          backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                        },
                        fontSize: '0.875rem',
                        height: 32,
                      }}
                    />
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default StatisticsFilters;
