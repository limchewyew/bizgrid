import React, { useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  TableSortLabel,
  Tooltip
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import InfoIcon from '@mui/icons-material/Info';

interface SectorTableProps {
  data?: {
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

const SectorTable: React.FC<SectorTableProps> = ({ data, filters = {} }) => {
  const [currentView, setCurrentView] = useState<'sector' | 'industry' | 'subIndustry' | 'activity'>('sector');
  const [selectedSector, setSelectedSector] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');
  const [selectedSubIndustry, setSelectedSubIndustry] = useState<string>('');
  const [orderBy, setOrderBy] = useState<'name' | 'count'>('count');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');
  const tableData = useMemo(() => {
    if (!data || !data.rows || data.rows.length === 0) {
      return [];
    }

    let filteredRows = [...data.rows];

    // Apply all filters (same logic as other components)
    if (filters.country && filters.country.length > 0) {
      const countryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'country'
      );
      if (countryIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.country!.includes(row[countryIndex]?.toString().trim())
        );
      }
    }

    if (filters.region && filters.region.length > 0) {
      const regionIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'region'
      );
      if (regionIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.region!.includes(row[regionIndex]?.toString().trim())
        );
      }
    }

    // Apply sector filter only if not in sector view (to avoid filtering out the selected sector)
    if (filters.sector && filters.sector.length > 0 && currentView !== 'sector') {
      const sectorIndex = data.headers.findIndex((header: string) => 
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

    if (filters.employees && filters.employees.length > 0) {
      const employeesIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('employee')
      );
      if (employeesIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const employees = row[employeesIndex]?.toString().trim();
          if (!employees) return false;
          
          let normalizedEmployees = employees;
          if (employees === '10000+') {
            normalizedEmployees = '10001+';
          }
          
          return filters.employees!.includes(normalizedEmployees);
        });
      }
    }

    if (filters.revenueRange && filters.revenueRange.length > 0) {
      const revenueIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('revenue')
      );
      if (revenueIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.revenueRange!.includes(row[revenueIndex]?.toString().trim())
        );
      }
    }

    if (filters.foundedYear && filters.foundedYear.length > 0) {
      const foundedIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('founded') && header.toLowerCase().includes('year')
      );
      if (foundedIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const foundedYear = row[foundedIndex]?.toString().trim();
          if (!foundedYear) return false;
          
          const year = parseInt(foundedYear);
          if (isNaN(year)) return false;

          return filters.foundedYear!.some(era => {
            switch (era) {
              case 'pre-1950': return year <= 1949;
              case '1950-1979': return year >= 1950 && year <= 1979;
              case '1980-1989': return year >= 1980 && year <= 1989;
              case '1990-1999': return year >= 1990 && year <= 1999;
              case '2000-2009': return year >= 2000 && year <= 2009;
              case '2010-2014': return year >= 2010 && year <= 2014;
              case '2015-2019': return year >= 2015 && year <= 2019;
              case '2020-present': return year >= 2020;
              default: return false;
            }
          });
        });
      }
    }

    if (filters.industry && filters.industry.length > 0) {
      const industryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'industry'
      );
      if (industryIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const industry = row[industryIndex];
          if (!industry) return false;
          const industryValue = typeof industry === 'object' 
            ? (industry.industry ?? industry.sector ?? '').toString().trim()
            : industry.toString().trim();
          return filters.industry!.includes(industryValue);
        });
      }
    }

    if (filters.subIndustry && filters.subIndustry.length > 0) {
      const industryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'industry'
      );
      if (industryIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const industry = row[industryIndex];
          if (!industry || typeof industry !== 'object') return false;
          const subValue = (industry.subIndustry ?? industry.subSector ?? '').toString().trim();
          if (!subValue) return false;
          return filters.subIndustry!.includes(subValue);
        });
      }
    }

    if (filters.activity && filters.activity.length > 0) {
      const activityIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'activity'
      );
      if (activityIndex !== -1) {
        filteredRows = filteredRows.filter(row => 
          filters.activity!.includes(row[activityIndex]?.toString().trim())
        );
      }
    }

    if (filters.bizgridScore && filters.bizgridScore.length > 0) {
      const bizgridIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('bizgrid') || header.toLowerCase().includes('score')
      );
      if (bizgridIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const bizgridScore = row[bizgridIndex]?.toString().trim();
          if (!bizgridScore) return false;
          const score = parseFloat(bizgridScore);
          if (isNaN(score)) return false;
          
          return filters.bizgridScore!.some(range => {
            switch (range) {
              case '0-20': return score >= 0 && score <= 20;
              case '20-40': return score > 20 && score <= 40;
              case '40-60': return score > 40 && score <= 60;
              case '60-80': return score > 60 && score <= 80;
              case '80-100': return score > 80 && score <= 100;
              default: return false;
            }
          });
        });
      }
    }

    // Apply drill-down filters
    if (currentView === 'industry' && selectedSector) {
      const sectorIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('sector')
      );
      if (sectorIndex !== -1) {
        filteredRows = filteredRows.filter(row => {
          const sector = row[sectorIndex];
          if (!sector) return false;
          const sectorValue = typeof sector === 'object' 
            ? (sector.sector ?? sector.industry ?? '').toString().trim()
            : sector.toString().trim();
          return sectorValue === selectedSector;
        });
      }
    }

    if (currentView === 'subIndustry' && selectedSector && selectedIndustry) {
      const sectorIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('sector')
      );
      const industryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'industry'
      );
      
      filteredRows = filteredRows.filter(row => {
        let sectorMatch = true;
        let industryMatch = true;
        
        if (sectorIndex !== -1) {
          const sector = row[sectorIndex];
          if (!sector) return false;
          const sectorValue = typeof sector === 'object' 
            ? (sector.sector ?? sector.industry ?? '').toString().trim()
            : sector.toString().trim();
          sectorMatch = sectorValue === selectedSector;
        }
        
        if (industryIndex !== -1) {
          const industry = row[industryIndex];
          if (!industry) return false;
          const industryValue = typeof industry === 'object' 
            ? (industry.industry ?? industry.sector ?? '').toString().trim()
            : industry.toString().trim();
          industryMatch = industryValue === selectedIndustry;
        }
        
        return sectorMatch && industryMatch;
      });
    }

    if (currentView === 'activity' && selectedSector && selectedIndustry && selectedSubIndustry) {
      const sectorIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase().includes('sector')
      );
      const industryIndex = data.headers.findIndex((header: string) => 
        header.toLowerCase() === 'industry'
      );
      
      filteredRows = filteredRows.filter(row => {
        let sectorMatch = true;
        let industryMatch = true;
        let subIndustryMatch = true;
        
        if (sectorIndex !== -1) {
          const sector = row[sectorIndex];
          if (!sector) return false;
          const sectorValue = typeof sector === 'object' 
            ? (sector.sector ?? sector.industry ?? '').toString().trim()
            : sector.toString().trim();
          sectorMatch = sectorValue === selectedSector;
        }
        
        if (industryIndex !== -1) {
          const industry = row[industryIndex];
          if (!industry) return false;
          const industryValue = typeof industry === 'object' 
            ? (industry.industry ?? industry.sector ?? '').toString().trim()
            : industry.toString().trim();
          industryMatch = industryValue === selectedIndustry;
        }
        
        // Also check sub-industry match
        if (industryIndex !== -1) {
          const industry = row[industryIndex];
          if (!industry || typeof industry !== 'object') return false;
          const subValue = (industry.subIndustry ?? industry.subSector ?? '').toString().trim();
          subIndustryMatch = subValue === selectedSubIndustry;
        }
        
        return sectorMatch && industryMatch && subIndustryMatch;
      });
    }

    // Count based on current view
    const countMap: { [key: string]: number } = {};
    
    filteredRows.forEach(row => {
      let key = 'Unknown';
      
      if (currentView === 'sector') {
        const sectorIndex = data.headers.findIndex((header: string) => 
          header.toLowerCase().includes('sector')
        );
        if (sectorIndex !== -1 && row[sectorIndex]) {
          const sectorValue = row[sectorIndex];
          key = typeof sectorValue === 'object' 
            ? (sectorValue.sector ?? sectorValue.industry ?? 'Unknown').toString().trim()
            : sectorValue.toString().trim();
        }
      } else if (currentView === 'industry') {
        const industryIndex = data.headers.findIndex((header: string) => 
          header.toLowerCase() === 'industry'
        );
        if (industryIndex !== -1 && row[industryIndex]) {
          const industryValue = row[industryIndex];
          key = typeof industryValue === 'object' 
            ? (industryValue.industry ?? industryValue.sector ?? 'Unknown').toString().trim()
            : industryValue.toString().trim();
        }
      } else if (currentView === 'subIndustry') {
        const industryIndex = data.headers.findIndex((header: string) => 
          header.toLowerCase() === 'industry'
        );
        if (industryIndex !== -1 && row[industryIndex] && typeof row[industryIndex] === 'object') {
          const industryValue = row[industryIndex];
          key = (industryValue.subIndustry ?? industryValue.subSector ?? 'Unknown').toString().trim();
        }
      } else if (currentView === 'activity') {
        const activityIndex = data.headers.findIndex((header: string) => 
          header.toLowerCase() === 'activity'
        );
        if (activityIndex !== -1 && row[activityIndex]) {
          key = row[activityIndex].toString().trim();
        }
      }
      
      countMap[key] = (countMap[key] || 0) + 1;
    });

    // Convert to array and sort by count (descending)
    let sortedData = Object.entries(countMap)
      .map(([name, count]) => ({
        name,
        numberOfCompanies: count
      }));

    // Apply sorting
    if (orderBy === 'name') {
      sortedData.sort((a, b) => {
        const comparison = a.name.localeCompare(b.name);
        return order === 'asc' ? comparison : -comparison;
      });
    } else {
      sortedData.sort((a, b) => {
        return order === 'asc' ? a.numberOfCompanies - b.numberOfCompanies : b.numberOfCompanies - a.numberOfCompanies;
      });
    }

    return sortedData;

  }, [data, filters, currentView, selectedSector, selectedIndustry, selectedSubIndustry, orderBy, order]);

  const handleSort = (property: 'name' | 'count') => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleBack = () => {
    if (currentView === 'activity') {
      setCurrentView('subIndustry');
      setSelectedSubIndustry('');
    } else if (currentView === 'subIndustry') {
      setCurrentView('industry');
      setSelectedIndustry('');
    } else if (currentView === 'industry') {
      setCurrentView('sector');
      setSelectedSector('');
    }
  };

  const handleRowClick = (name: string) => {
    if (currentView === 'sector') {
      setSelectedSector(name);
      setCurrentView('industry');
    } else if (currentView === 'industry') {
      setSelectedIndustry(name);
      setCurrentView('subIndustry');
    } else if (currentView === 'subIndustry') {
      setSelectedSubIndustry(name);
      setCurrentView('activity');
    }
  };

  const getColumnTitle = () => {
    switch (currentView) {
      case 'sector': return 'Sector';
      case 'industry': return 'Industry';
      case 'subIndustry': return 'Sub-Industry';
      case 'activity': return 'Activity';
      default: return 'Sector';
    }
  };

  const getMainTitle = () => {
    switch (currentView) {
      case 'sector': return 'Sector Distribution';
      case 'industry': return 'Industry Distribution';
      case 'subIndustry': return 'Sub-Industry Distribution';
      case 'activity': return 'Activity Distribution';
      default: return 'Sector Distribution';
    }
  };

  const getBreakdownPath = () => {
    const parts = [];
    if (selectedSector) parts.push(selectedSector);
    if (selectedIndustry) parts.push(selectedIndustry);
    if (selectedSubIndustry) parts.push(selectedSubIndustry);
    return parts.join(' > ');
  };

  const getTableTitle = () => {
    switch (currentView) {
      case 'sector': return 'Sector Distribution';
      case 'industry': return `Industry Distribution - ${selectedSector}`;
      case 'subIndustry': return `Sub-Industry Distribution - ${selectedSector} > ${selectedIndustry}`;
      case 'activity': return `Activity Distribution - ${selectedSector} > ${selectedIndustry} > ${selectedSubIndustry}`;
      default: return 'Sector Distribution';
    }
  };

  if (!data) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Sector Distribution
            </Typography>
          </Box>
          <Typography color="text.secondary">
            No data available
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {getMainTitle()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
              {getBreakdownPath()}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Click on the items to drill down on them" arrow>
              <IconButton 
                size="small" 
                sx={{ 
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                  }
                }}
              >
                <InfoIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {currentView !== 'sector' && (
              <IconButton onClick={handleBack} sx={{ ml: 2 }}>
                <ArrowBackIcon />
              </IconButton>
            )}
          </Box>
        </Box>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>{getColumnTitle()}</span>
                    <IconButton
                      size="small"
                      onClick={() => handleSort('name')}
                      sx={{
                        color: 'inherit',
                        padding: 0.5,
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <FilterListIcon 
                        fontSize="small"
                        sx={{
                          transform: orderBy === 'name' && order === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span>Companies</span>
                    <IconButton
                      size="small"
                      onClick={() => handleSort('count')}
                      sx={{
                        color: 'inherit',
                        padding: 0.5,
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                    >
                      <FilterListIcon 
                        fontSize="small"
                        sx={{
                          transform: orderBy === 'count' && order === 'desc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.2s'
                        }}
                      />
                    </IconButton>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((item: { name: string; numberOfCompanies: number }, index: number) => (
                <TableRow 
                  key={item.name} 
                  sx={{ 
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    cursor: currentView !== 'activity' ? 'pointer' : 'default'
                  }}
                  onClick={() => currentView !== 'activity' && handleRowClick(item.name)}
                >
                  <TableCell sx={{ textAlign: 'center' }}>{item.name}</TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {item.numberOfCompanies.toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
              {tableData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ color: 'text.secondary' }}>
                    No data available
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};

export default SectorTable;
