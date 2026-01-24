import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  TablePagination,
  Paper,
  Typography,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  Autocomplete,
  Chip,
  Link,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Card,
  CardActionArea,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';
import SortIcon from '@mui/icons-material/Sort';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import CheckIcon from '@mui/icons-material/Check';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import BalanceIcon from '@mui/icons-material/Balance';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import CasinoIcon from '@mui/icons-material/Casino';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { fetchDataFromSheet } from '../../services/googleSheets';
import Statistics from '../Statistics';
import WorldMapPage from '../WorldMapPage';
import Newsletter from '../Newsletter';
import Competitors from '../Competitors';
import { useTheme, useMediaQuery } from '@mui/material';

// Company interface for competitor selection
interface Company {
  row: any[];
  name: string;
  logo: string;
  country: string;
  region: string;
  employees: string;
  founded: string;
  revenue: string;
  bizgridScore: string;
  activity: string;
  description: string;
  slogan: string;
  website: string;
  linkedin: string;
}

// Feature flags
const ENABLE_PALETTE = false; // hide color palette for now

const CompanyDirectory: React.FC = () => {
  const theme = useTheme();
  // Force desktop view by setting isMobile and isTablet to false
  const isMobile = false;
  const isTablet = false;
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  // Load selected companies from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('selectedCompanies');
    if (saved) {
      setSelectedCompanies(JSON.parse(saved));
    }
  }, []);

  // Save selected companies to localStorage when they change
  useEffect(() => {
    localStorage.setItem('selectedCompanies', JSON.stringify(selectedCompanies));
  }, [selectedCompanies]);

  const toggleCompanySelection = (companyName: string) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyName)) {
        return prev.filter(name => name !== companyName);
      } else {
        if (prev.length >= 6) {
          return prev; // Don't add more than 6 companies
        }
        return [...prev, companyName];
      }
    });
  };

  const clearSelection = () => {
    setSelectedCompanies([]);
  };
  
  // Responsive styles
  const responsiveStyles = {
    container: {
      p: isMobile ? 1 : 2,
      mt: 2,
    },
    searchContainer: {
      mb: 2,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: 2,
    },
    searchField: {
      flex: 1,
      minWidth: isMobile ? '100%' : 'auto',
    },
    tableContainer: {
      maxHeight: 'calc(100vh - 200px)',
      overflow: 'auto',
    },
    table: {
      minWidth: isMobile ? 'auto' : 650,
    },
    tableCell: {
      py: isMobile ? 1 : 1.5,
      px: isMobile ? 0.5 : 2,
      fontSize: isMobile ? '0.75rem' : '0.875rem',
    },
    headerCell: {
      fontWeight: 600,
      whiteSpace: 'nowrap',
    },
    pagination: {
      mt: 2,
      '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
        marginBottom: isMobile ? 1 : 0,
      },
    },
  };
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<any[] | null>(null);
  const [clickedRow, setClickedRow] = useState<any[] | null>(null);
  const [competitorRow, setCompetitorRow] = useState<any[] | null>(null);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Company | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>({
    column: 'Bizgrid Score',
    direction: 'desc'
  });
  const [paletteCache, setPaletteCache] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortMenuAnchor, setSortMenuAnchor] = useState<null | HTMLElement>(null);
  const [surpriseCompany, setSurpriseCompany] = useState<any[] | null>(null);
  const [showSurprise, setShowSurprise] = useState(false);
  const [filters, setFilters] = useState<{
    country: string[];
    region: string[];
    employees: string[];
    foundedYear: string[];
    revenueRange: string[];
    sector: string[];
    industry: string[];
    subIndustry: string[];
    activity: string[];
  }>({
    country: [],
    region: [],
    employees: [],
    foundedYear: [],
    revenueRange: [],
    sector: [],
    industry: [],
    subIndustry: [],
    activity: []
  });

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

  const foundedYearOptions = ['Oldest to Newest', 'Newest to Oldest'];

  const normalizeEmployeeRange = (val: string) => {
    const v = (val || '').toString().trim();
    if (!v) return v;
    return v.startsWith('10000') ? '10001+' : v;
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDataFromSheet();
      
      // Debug: Log headers and first row of data
      console.log('Headers:', data.headers);
      if (data.rows.length > 0) {
        console.log('First row data:', data.rows[0]);
      }
      
      setHeaders(data.headers);
      setRows(data.rows);
      setPaletteCache({});
    } catch (err: any) {
      setError(err.message || 'Failed to load data from Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Clear selections when country selection changes
  useEffect(() => {
    setFilters(prev => ({ ...prev }));
  }, [filters.country]);

  const columnIndex = (name: string) =>
    headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const countryIdx = columnIndex('country');
  const regionIdx = columnIndex('region');
  const employeesIdx = columnIndex('number of employees');
  const foundedIdx = columnIndex('founded year');
  const industryIdx = columnIndex('industry');
  const locationIdx = columnIndex('location');
  const sectorIdx = columnIndex('sector');
  const revenueIdx = columnIndex('revenue range');
  const accoladesIdx = columnIndex('accolades');
  const activityIdx = columnIndex('activity');

  // Removed sticky column layout (table replaced by card grid)

  const filterOptions = React.useMemo(() => {
    const unique = (idx: number, predefinedOptions?: string[]) =>
      idx === -1
        ? predefinedOptions || []
        : Array.from(
            new Set([
              ...(predefinedOptions || []),
              ...rows
                .map(r => r[idx])
                .filter(Boolean)
                .map(v => v.toString().trim())
            ])
          ).sort((a, b) => a.localeCompare(b));
    const extractSector = (val: any) => {
      if (!val) return '';
      if (typeof val === 'object') return (val.sector ?? val.industry ?? '').toString().trim();
      return val.toString().trim();
    };
    const extractIndustry = (val: any) => {
      if (!val) return '';
      if (typeof val === 'object') return (val.industry ?? val.sector ?? '').toString().trim();
      return val.toString().trim();
    };
    const extractSubIndustry = (val: any) => {
      if (!val) return '';
      if (typeof val === 'object') return (val.subIndustry ?? val.subSector ?? '').toString().trim();
      return '';
    };

    const sectorOptions = sectorIdx === -1
      ? []
      : Array.from(new Set(rows.map(r => extractSector(r[sectorIdx])).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    const industryOptions = industryIdx === -1
      ? []
      : Array.from(new Set(rows.map(r => extractIndustry(r[industryIdx])).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    const subIndustryOptions = industryIdx === -1
      ? []
      : Array.from(new Set(rows.map(r => extractSubIndustry(r[industryIdx])).filter(Boolean))).sort((a, b) => a.localeCompare(b));
      
    const activityOptions = activityIdx === -1
      ? []
      : Array.from(new Set(rows.map(r => {
          const val = r[activityIdx];
          return val ? val.toString().trim() : '';
        }).filter(Boolean))).sort((a, b) => a.localeCompare(b));

    const countryOptions = countryIdx === -1
      ? []
      : Array.from(new Set(
          rows.map(r => r[countryIdx])
            .filter((country: any) => country && country.toString().trim())
            .map((country: any) => country.toString().trim())
        )).sort((a, b) => a.localeCompare(b));

    const regionOptions = regionIdx === -1
      ? []
      : Array.from(new Set(
          rows.map(r => r[regionIdx])
            .filter((region: any) => region && region.toString().trim())
            .map((region: any) => region.toString().trim())
        )).sort((a, b) => a.localeCompare(b));
    return {
      country: countryOptions,
      region: regionOptions,
      // Keep employees in predefined ascending order only
      employees: employeeRangeOptions,
      foundedYear: unique(foundedIdx, foundedYearOptions),
      // Keep revenue in predefined ascending order only
      revenueRange: revenueRangeOptions,
      sector: sectorOptions,
      industry: industryOptions,
      subIndustry: subIndustryOptions,
      activity: activityOptions
    };
  }, [rows, filters.country, filters.region, countryIdx, regionIdx, employeesIdx, foundedIdx, revenueIdx, sectorIdx, industryIdx, locationIdx, activityIdx, revenueRangeOptions, employeeRangeOptions, foundedYearOptions]);

  const filteredByFilters = React.useMemo(() => {
    return rows.filter(row => {
      const match = (idx: number, selected: string[]) => {
        if (idx === -1 || selected.length === 0) return true;
        const val = row[idx];
        if (!val) return false;
        return selected.includes(val.toString().trim());
      };

      // Special handling for founded year sorting
      const foundedYearMatch = () => {
        if (filters.foundedYear.length === 0) return true;
        if (filters.foundedYear.includes('Oldest to Newest') || 
            filters.foundedYear.includes('Newest to Oldest')) {
          return true; // We'll handle sorting separately
        }
        return match(foundedIdx, filters.foundedYear);
      };

      return (
        match(countryIdx, filters.country) &&
        match(regionIdx, filters.region) &&
        (() => {
          if (locationIdx === -1) return true;
          const raw = row[locationIdx];
          if (!raw || typeof raw !== 'object') return false;
          return true;
        })() &&
        // Employees: normalize any '10000+' data to '10001+' to align with options
        (() => {
          if (employeesIdx === -1 || filters.employees.length === 0) return true;
          const raw = row[employeesIdx];
          if (!raw) return false;
          const norm = normalizeEmployeeRange(raw.toString());
          return filters.employees.includes(norm);
        })() &&
        // Sector filter
        (() => {
          if (sectorIdx === -1 || filters.sector.length === 0) return true;
          const raw = row[sectorIdx];
          if (!raw) return false;
          const val = typeof raw === 'object' ? (raw.sector ?? raw.industry ?? '').toString().trim() : raw.toString().trim();
          return filters.sector.includes(val);
        })() &&
        // Industry filter
        (() => {
          if (industryIdx === -1 || filters.industry.length === 0) return true;
          const raw = row[industryIdx];
          if (!raw) return false;
          const val = typeof raw === 'object' ? (raw.industry ?? raw.sector ?? '').toString().trim() : raw.toString().trim();
          return filters.industry.includes(val);
        })() &&
        // Sub-industry filter
        (() => {
          if (industryIdx === -1 || filters.subIndustry.length === 0) return true;
          const raw = row[industryIdx];
          if (!raw || typeof raw !== 'object') return false;
          const sub = (raw.subIndustry ?? raw.subSector ?? '').toString().trim();
          if (!sub) return false;
          return filters.subIndustry.includes(sub);
        })() &&
        // Activity filter
        (() => {
          if (activityIdx === -1 || filters.activity.length === 0) return true;
          const val = row[activityIdx];
          if (!val) return false;
          return filters.activity.includes(val.toString().trim());
        })() &&
        foundedYearMatch() &&
        match(revenueIdx, filters.revenueRange)
      );
    });
  }, [rows, filters, countryIdx, regionIdx, employeesIdx, foundedIdx, revenueIdx, sectorIdx, industryIdx]);

  const searchFilteredRows = filteredByFilters.filter(row =>
    row.some(
      cell =>
        cell &&
        cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const coverageStats = React.useMemo(() => {
    const countries = new Set<string>();
    const sectors = new Set<string>();
    const industries = new Set<string>();
    const subIndustries = new Set<string>();
    const activities = new Set<string>();

    // Use searchFilteredRows to reflect search results in coverage stats
    searchFilteredRows.forEach(row => {
      const loc = locationIdx !== -1 ? row[locationIdx] : undefined;
      if (loc && typeof loc === 'object') {
        const country = (loc.country ?? '').toString().trim();
        if (country) countries.add(country);
      }

      const country = countryIdx !== -1 ? (row[countryIdx] ?? '').toString().trim() : '';
      if (country) countries.add(country);

      const sectorVal = sectorIdx !== -1 ? row[sectorIdx] : undefined;
      if (sectorVal) {
        const sectorStr = typeof sectorVal === 'object'
          ? (sectorVal.sector ?? sectorVal.industry ?? '').toString().trim()
          : sectorVal.toString().trim();
        if (sectorStr) sectors.add(sectorStr);
      }

      const ind = industryIdx !== -1 ? row[industryIdx] : undefined;
      if (ind && typeof ind === 'object') {
        const main = (ind.industry ?? ind.sector ?? '').toString().trim();
        const sub = (ind.subIndustry ?? ind.subSector ?? '').toString().trim();
        if (main) industries.add(main);
        if (sub) subIndustries.add(sub);
      } else if (typeof ind === 'string') {
        const main = ind.toString().trim();
        if (main) industries.add(main);
      }

      // Add activity to the set
      const activity = activityIdx !== -1 ? row[activityIdx] : undefined;
      if (activity) {
        const activityStr = activity.toString().trim();
        if (activityStr) activities.add(activityStr);
      }
    });

    return {
      companies: searchFilteredRows.length,
      countries: countries.size,
      sectors: sectors.size,
      industries: industries.size,
      subIndustries: subIndustries.size,
      activities: activities.size
    };
  }, [searchFilteredRows, locationIdx, countryIdx, sectorIdx, industryIdx, activityIdx]);

  const sortedAndFilteredRows = React.useMemo(() => {
    let result = [...searchFilteredRows];

    // If sorting by Added Date, we'll handle it in the main sort config
    if (sortConfig?.column === 'Added Date') {
      result.sort((a, b) => {
        // Row number is always the first element in the row array
        const aRowNum = a[0];
        const bRowNum = b[0];
        const aNum = typeof aRowNum === 'number' ? aRowNum : 0;
        const bNum = typeof bRowNum === 'number' ? bRowNum : 0;
        return sortConfig.direction === 'asc' 
          ? aNum - bNum  // Oldest first (smaller row numbers first)
          : bNum - aNum; // Newest first (larger row numbers first)
      });
    }
    // Apply founded year sorting if specified in filters
    else if (filters.foundedYear.includes('Oldest to Newest') || 
             filters.foundedYear.includes('Newest to Oldest')) {
      result.sort((a, b) => {
        const aYear = parseInt(a[foundedIdx]?.toString() || '0', 10) || 0;
        const bYear = parseInt(b[foundedIdx]?.toString() || '0', 10) || 0;
        return filters.foundedYear.includes('Oldest to Newest') 
          ? aYear - bYear 
          : bYear - aYear;
      });
    }

    // Apply other column sorting if specified
    if (sortConfig) {
      result.sort((a, b) => {
        const idx = headers.findIndex(header =>
          header.toLowerCase() === sortConfig.column.toLowerCase()
        );

        if (idx === -1) return 0;

        const aRaw = a[idx];
        const bRaw = b[idx];
        const aValue = (aRaw ?? '').toString().trim();
        const bValue = (bRaw ?? '').toString().trim();
        const dir = sortConfig.direction === 'asc' ? 1 : -1;

        const headerName = headers[idx];
        if (headerName === 'Revenue range') {
          const getRank = (val: string) => {
            const i = revenueRangeOptions.indexOf(val);
            return i === -1 ? Number.MAX_SAFE_INTEGER : i;
          };
          return (getRank(aValue) - getRank(bValue)) * dir;
        }

        if (headerName === 'Number of employees') {
          const getRank = (val: string) => {
            const i = employeeRangeOptions.indexOf(normalizeEmployeeRange(val));
            return i === -1 ? Number.MAX_SAFE_INTEGER : i;
          };
          return (getRank(aValue) - getRank(bValue)) * dir;
        }

        if (headerName === 'Founded year') {
          const aNum = parseInt(aValue || '0', 10) || 0;
          const bNum = parseInt(bValue || '0', 10) || 0;
          return (aNum - bNum) * dir;
        }

        if (headerName === 'Bizgrid Score') {
          const aNum = parseFloat(aValue?.toString() || '0') || 0;
          const bNum = parseFloat(bValue?.toString() || '0') || 0;
          return (aNum - bNum) * dir;
        }

        // Default string compare
        return dir * aValue.localeCompare(bValue);
      });
    }

    return result;
  }, [searchFilteredRows, sortConfig, headers, filters.foundedYear, foundedIdx]);

  useEffect(() => {
    setPage(0);
    // Trigger refresh when filters or sort config changes
    loadData();
  }, [filters, sortConfig]);

  // Keep this effect for page changes without refresh
  useEffect(() => {
    setPage(0);
  }, [searchTerm, rows]);

  const rowsPerPage = 840;
  const paginatedRows = sortedAndFilteredRows.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  useEffect(() => {
    const maxPage = Math.max(0, Math.ceil(sortedAndFilteredRows.length / rowsPerPage) - 1);
    if (page > maxPage) setPage(0);
  }, [sortedAndFilteredRows, page]);

  const handleSort = (column: string) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.column === column) {
        return {
          column,
          direction: prevConfig.direction === 'asc' ? 'desc' : 'asc'
        };
      }
      return { column, direction: 'asc' };
    });
  };

  const handleSurpriseMe = () => {
    // Get all available companies from the filtered data
    const availableCompanies = [...sortedAndFilteredRows];
    
    if (availableCompanies.length === 0) {
      return;
    }
    
    // Select one random company
    const randomIndex = Math.floor(Math.random() * availableCompanies.length);
    const selectedCompany = availableCompanies[randomIndex];
    
    setSurpriseCompany(selectedCompany);
    setShowSurprise(true);
  };

  // Handle competitor selection
  const handleCompetitorSelect = (company: Company) => {
    setCompetitorRow(company.row);
    setSelectedCompetitor(company);
  };

  // Get border color for selected competitor card
  const getCompetitorBorderColor = () => {
    if (!selectedCompetitor || !parseCompanyForCompetitors(clickedRow || hoveredRow)) return '#2196f3';
    
    const originalCompany = parseCompanyForCompetitors(clickedRow || hoveredRow);
    const isSameNation = selectedCompetitor.country === originalCompany?.country && selectedCompetitor.region === originalCompany?.region;
    const isSameRegion = selectedCompetitor.region === originalCompany?.region && !isSameNation;
    const isInternational = !isSameNation && !isSameRegion;
    
    return isSameNation
      ? '#4caf50' // Green for same nation
      : isSameRegion
        ? '#ff9800' // Orange for same region
        : '#9c27b0'; // Purple for international
  };

  // Parse company data from row for Competitors component
  const parseCompanyForCompetitors = (row: any[] | null) => {
    if (!row) return null;
    
    const getColumnIndex = (columnName: string) => 
      headers.findIndex(h => h.toLowerCase() === columnName.toLowerCase());
    
    const getFieldValue = (index: number) => 
      index !== -1 ? (row[index] || '').toString() : '';

    const nameIdx = getColumnIndex('company name');
    const logoIdx = getColumnIndex('logo');
    const countryIdx = getColumnIndex('country');
    const regionIdx = getColumnIndex('region');
    const employeesIdx = getColumnIndex('number of employees');
    const foundedIdx = getColumnIndex('founded year');
    const revenueIdx = getColumnIndex('revenue range');
    const bizgridIdx = getColumnIndex('bizgrid score');
    const activityIdx = getColumnIndex('activity');
    const subIndustryIdx = getColumnIndex('sub industry') !== -1 ? getColumnIndex('sub industry') : 
                         getColumnIndex('sub-industry') !== -1 ? getColumnIndex('sub-industry') :
                         getColumnIndex('subindustry') !== -1 ? getColumnIndex('subindustry') :
                         getColumnIndex('sub industry sector') !== -1 ? getColumnIndex('sub industry sector') :
                         getColumnIndex('industry') !== -1 ? getColumnIndex('industry') : -1;
    const descriptionIdx = getColumnIndex('description');
    const sloganIdx = getColumnIndex('slogan');
    const websiteIdx = getColumnIndex('website');
    const linkedinIdx = getColumnIndex('linkedin');

    return {
      row,
      name: getFieldValue(nameIdx),
      logo: getFieldValue(logoIdx),
      country: getFieldValue(countryIdx),
      region: getFieldValue(regionIdx),
      employees: getFieldValue(employeesIdx),
      founded: getFieldValue(foundedIdx),
      revenue: getFieldValue(revenueIdx),
      bizgridScore: getFieldValue(bizgridIdx),
      activity: getFieldValue(activityIdx),
      subIndustry: getFieldValue(subIndustryIdx),
      description: getFieldValue(descriptionIdx),
      slogan: getFieldValue(sloganIdx),
      website: getFieldValue(websiteIdx),
      linkedin: getFieldValue(linkedinIdx),
    };
  };

  const getRevenueStyle = (value: any) => {
    if (!value || typeof value !== 'string') return {};
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === '—' || normalized === '-') return {};

    const revenueColorMap: Record<string, string> = {
      'less than $1m': '#f3e8ff',
      '$1m to $10m': '#e6d7ff',
      '$10m to $50m': '#d5bfff',
      '$50m to $100m': '#c4a6ff',
      '$100m to $500m': '#b48cff',
      '$500m to $1b': '#a873ff',
      '$1b to $10b': '#8f5eff',
      '$10b+': '#7a3cff'
    };

    const backgroundColor = revenueColorMap[normalized];
    if (!backgroundColor) return {};

    return {
      backgroundColor,
      color: '#1c0a33' // dark text keeps contrast on light-to-mid purple
    };
  };

  const getEmployeeStyle = (value: any) => {
    if (!value || typeof value !== 'string') return {};
    const normalized = value.trim().toLowerCase();
    if (!normalized || normalized === '—' || normalized === '-') return {};

    const employeeColorMap: Record<string, string> = {
      '1-10': '#f3e8ff',
      '11-50': '#e6d7ff',
      '51-100': '#d5bfff',
      '101-250': '#c4a6ff',
      '251-500': '#b48cff',
      '501-1000': '#a873ff',
      '1001-5000': '#8f5eff',
      '5001-10000': '#7a3cff',
      '10000+': '#6729c7',
      '10001+': '#6729c7'
    };

    // Handle any variant that starts with 10000 or 10001 as the darkest shade
    const backgroundColor =
      employeeColorMap[normalized] ||
      (normalized.startsWith('10000') || normalized.startsWith('10001') ? '#6729c7' : undefined);

    if (!backgroundColor) return {};

    return {
      backgroundColor,
      color: '#1c0a33'
    };
  };

  const getFoundedYearStyle = (value: any) => {
    const year = typeof value === 'number' ? value : parseInt(value, 10);
    if (Number.isNaN(year)) return {};

    const minYear = 1800;
    const maxYear = new Date().getFullYear();
    const clampedYear = Math.min(Math.max(year, minYear), maxYear);
    const t = (clampedYear - minYear) / (maxYear - minYear); // 0 = oldest, 1 = newest

    // Older (smaller year) -> darker; newer -> lighter within a purple hue
    const lightness = 35 + (85 - 35) * t; // range 35% (dark) to 85% (light)
    const backgroundColor = `hsl(268, 80%, ${lightness}%)`;

    return {
      backgroundColor,
      color: '#1c0a33'
    };
  };

  const toHex = (v: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(v)));
    return clamped.toString(16).padStart(2, '0');
  };

  const getLuminance = (hex: string) => {
    const clean = hex.replace('#', '');
    if (clean.length !== 6) return 0;
    const r = parseInt(clean.slice(0, 2), 16);
    const g = parseInt(clean.slice(2, 4), 16);
    const b = parseInt(clean.slice(4, 6), 16);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };

  const sortColorsLightToDark = (colors: string[]) =>
    [...colors].sort((a, b) => getLuminance(b) - getLuminance(a)); // higher lum first (lightest on left)

  const MAX_PALETTE_COLORS = 3;
  const MIN_FRACTION_OF_TOP = 0; // keep even rare colors

  const extractPaletteFromImage = (url: string, maxColors = MAX_PALETTE_COLORS): Promise<string[]> =>
    new Promise((resolve, reject) => {
      if (!url) {
        resolve([]);
        return;
      }

      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.decoding = 'async';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 64;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve([]);
            return;
          }
          ctx.drawImage(img, 0, 0, size, size);
          const { data } = ctx.getImageData(0, 0, size, size);

          const bucketSize = 16; // finer channel quantization step to capture small accents
          const buckets: Record<string, { count: number; r: number; g: number; b: number }> = {};

          for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 128) continue; // skip transparent pixels
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            const br = Math.round(r / bucketSize) * bucketSize;
            const bg = Math.round(g / bucketSize) * bucketSize;
            const bb = Math.round(b / bucketSize) * bucketSize;
            const key = `${br}-${bg}-${bb}`;
            if (!buckets[key]) buckets[key] = { count: 0, r: 0, g: 0, b: 0 };
            const bucket = buckets[key];
            bucket.count += 1;
            bucket.r += r;
            bucket.g += g;
            bucket.b += b;
          }

          const entries = Object.values(buckets)
            .map(b => ({
              count: b.count,
              r: b.r / b.count,
              g: b.g / b.count,
              b: b.b / b.count
            }))
            .sort((a, b) => b.count - a.count);

          if (!entries.length) {
            resolve([]);
            return;
          }

          const topCount = entries[0].count || 1;
          const filtered = entries.filter(e => e.count >= topCount * MIN_FRACTION_OF_TOP);

          const distinct: { r: number; g: number; b: number }[] = [];
          const distanceSq = (a: typeof distinct[number], b: typeof distinct[number]) =>
            (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
          const minDistSq = 20 * 20; // allow more distinct hues to come through

          for (const entry of filtered) {
            if (distinct.length >= maxColors) break;
            if (distinct.length === 0) {
              distinct.push(entry);
              continue;
            }
            if (distinct.every(d => distanceSq(d, entry) < minDistSq)) continue;
            distinct.push(entry);
          }

          // If we still have room, allow remaining filtered colors (deduped by hex) even if similar
          if (distinct.length < maxColors) {
            for (const entry of filtered) {
              if (distinct.length >= maxColors) break;
              const hex = `#${toHex(entry.r)}${toHex(entry.g)}${toHex(entry.b)}`;
              const exists = distinct.some(
                d => `#${toHex(d.r)}${toHex(d.g)}${toHex(d.b)}` === hex
              );
              if (!exists) distinct.push(entry);
            }
          }

          const colors = distinct
            .map(c => `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`)
            .slice(0, maxColors);

          resolve(colors.length ? colors : []);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => resolve([]);
      img.src = url.startsWith('http') ? url : `https://${url}`;
    });

  const logoColumnIndex = headers.findIndex(h => h.toLowerCase().includes('logo'));
  const showPaletteColumn = ENABLE_PALETTE && logoColumnIndex !== -1;

  useEffect(() => {
    if (!showPaletteColumn) return;
    const urls = rows
      .map(row => row[logoColumnIndex])
      .filter(url => typeof url === 'string' && url.trim().length > 0);

    urls.forEach(url => {
      if (paletteCache[url]) return;
      extractPaletteFromImage(url)
        .then(colors => {
          setPaletteCache(prev => ({ ...prev, [url]: colors }));
        })
        .catch(() => {
          setPaletteCache(prev => ({ ...prev, [url]: [] }));
        });
    });
  }, [rows, showPaletteColumn, logoColumnIndex, paletteCache]);

  // No augmented headers needed for card grid view

  return (
    <>
    <Box>
    {/* Brand and Search Bar */}
    <Box sx={{ mb: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, pb: 2, borderBottom: '1px solid rgba(0,0,0,0.12)' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box component="img" 
          src="/Main Logo.png" 
          alt="BizGrid Logo" 
          sx={{ 
            height: 60, 
            width: 'auto',
            objectFit: 'contain',
            [theme.breakpoints.down('sm')]: {
              height: 48
            },
            '&:hover': {
              filter: 'drop-shadow(0 0 15px rgba(0, 120, 255, 0.4))',
              transform: 'scale(1.05)',
              transition: 'all 0.3s ease'
            }
          }}
        />
        <Typography 
          variant="h2" 
          component="h1"
          sx={{ 
            fontWeight: 700,
            fontFamily: 'Inter, sans-serif',
            color: theme.palette.primary.main,
            [theme.breakpoints.down('sm')]: {
              fontSize: '2rem'
            },
            background: 'linear-gradient(135deg, #1976d2 0%, #2196f3 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textFillColor: 'transparent',
            letterSpacing: '0.1em'
          }}
        >
          BIZGRID
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<RefreshIcon />}
          onClick={loadData}
          disabled={loading}
        >
          Refresh
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<FilterListIcon />}
          onClick={() => setFilterOpen(true)}
          disabled={currentTab === 3 || currentTab === 4 || currentTab === 5}
        >
          Filters
        </Button>
        <TextField
          variant="outlined"
          size="small"
          placeholder="Search companies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300, '& .MuiOutlinedInput-root': { height: '40px' } }}
        />
      </Box>
    </Box>

    {/* Navigation Tabs */}
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 1,
        backgroundColor: 'background.paper',
        border: '1px solid rgba(0,0,0,0.12)',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}
    >
      <Tabs 
        value={currentTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{ 
          minHeight: 'auto',
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '0.95rem',
            minHeight: '40px',
            py: 1
          },
          '& .MuiTabs-indicator': {
            backgroundColor: theme.palette.primary.main,
            height: '3px'
          },
          '& .MuiTabs-flexContainer': {
            minHeight: 'auto'
          }
        }}
      >
        <Tab label="Main Directory" />
        <Tab label="Competitors" />
        <Tab label="Comparison" />
        <Tab label="Statistics" />
        <Tab label="World Map" />
        <Tab label="Newsletter" />
      </Tabs>
    </Paper>

    <Box sx={{ mb: 0 }}>
      {/* Content goes here */}
      </Box>

      {/* Dashboard showing hovered company details - Hidden in statistics, comparison, world map, and newsletter tabs */}
      {currentTab !== 2 && currentTab !== 3 && currentTab !== 4 && currentTab !== 5 && (
      <Paper elevation={1} sx={{ mb: 1.5, p: 2.5, borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid rgba(0,0,0,0.06)', position: 'sticky', top: 8, zIndex: 11 }}>
        <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: 2.5, flexDirection: { xs: 'column', md: 'row' } }}>
          <Box sx={{ width: 48, height: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1.5, background: 'rgba(0,0,0,0.04)', overflow: 'hidden', mt: { xs: 0, md: 1 }, flexShrink: 0 }}>
            {(() => {
              const logoIdxDash = headers.findIndex(h => h.toLowerCase() === 'logo');
              const nameIdxDash = headers.findIndex(h => h.toLowerCase() === 'company name');
              const displayRow = clickedRow || hoveredRow;
              const logoUrl = displayRow && logoIdxDash !== -1 ? displayRow[logoIdxDash] : '';
              const name = displayRow && nameIdxDash !== -1 ? (displayRow[nameIdxDash] || '').toString() : 'Hover a logo';
              return logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={name} 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'contain',
                    padding: 4
                  }} 
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                />
              ) : (
                <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>No logo</Typography>
              );
            })()}
          </Box>
          <Box sx={{ flex: 1, width: '100%' }}>
            {(() => {
              const displayRow = clickedRow || hoveredRow;
              if (!displayRow) return null;
              
              const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
              const get = (i: number) => (i !== -1 ? displayRow[i] : '');
              
              // Extract Sector, Industry, and Sub-Industry
              const sectorData = get(idx('Sector'));
              const industryData = get(idx('Industry')) as any;
              const sector = typeof sectorData === 'object' ? (sectorData.sector ?? sectorData.industry ?? '').toString() : sectorData.toString();
              const industry = industryData && typeof industryData === 'object' ? (industryData.industry ?? industryData.sector ?? '').toString() : industryData.toString();
              const subIndustry = industryData && typeof industryData === 'object' ? (industryData.subIndustry ?? industryData.subSector ?? '').toString() : '';
              
              // Get Activity
              const activityIdx = headers.findIndex(h => h.toLowerCase() === 'activity');
              const activity = activityIdx !== -1 ? (displayRow[activityIdx] || '').toString() : '';
              
              // Create industry chain string including Activity
              const industryChain = [sector, industry, subIndustry, activity].filter(Boolean).join(' > ');
              
              return (
                <>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="h5" sx={{ fontWeight: 600 }}>
                        {(() => {
                          const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                          return nameIdx !== -1 ? (displayRow[nameIdx] || '').toString() : 'Explore companies';
                        })()}
                      </Typography>
                      {(() => {
                        const bizgridIdx = headers.findIndex(h => h.toLowerCase() === 'bizgrid score');
                        const bizgridScore = bizgridIdx !== -1 ? displayRow[bizgridIdx] : '';
                        if (bizgridScore && bizgridScore.toString().trim()) {
                          return (
                            <Tooltip 
                              title="Bizgrid Score is calculated using an algorithm that takes into account Number of Employees, Legacy, and Revenue Range"
                              arrow
                              placement="top"
                            >
                              <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                px: 2.5, 
                                py: 0.75, 
                                borderRadius: 3, 
                                background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                                color: '#2d3748',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                letterSpacing: '0.5px',
                                boxShadow: '0 4px 12px rgba(168, 237, 234, 0.3)',
                                border: '1px solid rgba(255, 255, 255, 0.5)',
                                backdropFilter: 'blur(10px)',
                                cursor: 'help'
                              }}>
                                <Box sx={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center',
                                  gap: 0.5
                                }}>
                                  <Box sx={{ 
                                    width: 6, 
                                    height: 6, 
                                    borderRadius: '50%', 
                                    backgroundColor: '#4a5568',
                                    boxShadow: '0 0 8px rgba(74, 85, 104, 0.4)'
                                  }} />
                                  Bizgrid Score: {bizgridScore.toString()}
                                </Box>
                              </Box>
                            </Tooltip>
                          );
                        }
                        return null;
                      })()}
                    </Box>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => setCurrentTab(1)}
                      sx={{
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        '&:hover': {
                          backgroundColor: 'primary.light',
                          borderColor: 'primary.dark',
                          color: 'primary.dark',
                        },
                        flexShrink: 0
                      }}
                    >
                      Competitor Analysis
                    </Button>
                  </Box>
                  {industryChain && (
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'text.secondary',
                        opacity: 0.85,
                        fontStyle: 'italic',
                      }}
                    >
                      {industryChain}
                    </Typography>
                  )}
                </>
              );
            })()}
            {(() => {
              const displayRow = clickedRow || hoveredRow;
              if (!displayRow) return null;
              const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
              const get = (i: number) => (i !== -1 ? displayRow[i] : '');
              const loc = get(idx('Location')) as any;
              const state = loc && typeof loc === 'object' ? (loc.state ?? '').toString() : '';
              const country = (get(idx('Country')) || '').toString();
              const employees = (get(idx('Number of employees')) || '').toString();
              const founded = (get(idx('Founded year')) || '').toString();
              const revenue = (get(idx('Revenue range')) || '').toString();
              const linkedin = (get(idx('LinkedIn')) || '').toString();
              const website = (get(idx('Website')) || '').toString();
              const slogan = (get(idx('Slogan')) || '').toString();
              const accolades = (get(idx('Accolades')) || '').toString();
              const description = (get(idx('Description')) || '').toString();
              
              // Extract Sector, Industry, and Sub-Industry
              const sectorData = get(idx('Sector'));
              const industryData = get(idx('Industry')) as any;
              const sector = typeof sectorData === 'object' ? (sectorData.sector ?? sectorData.industry ?? '').toString() : sectorData.toString();
              const industry = industryData && typeof industryData === 'object' ? (industryData.industry ?? industryData.sector ?? '').toString() : industryData.toString();
              const subIndustry = industryData && typeof industryData === 'object' ? (industryData.subIndustry ?? industryData.subSector ?? '').toString() : '';
              
              // Get Activity
              const activityIdx = headers.findIndex(h => h.toLowerCase() === 'activity');
              const activity = activityIdx !== -1 ? (displayRow[activityIdx] || '').toString() : '';
              
              // Create industry chain string including Activity
              const industryChain = [sector, industry, subIndustry, activity].filter(Boolean).join(' > ');

              return (
                <>
                  <Grid container spacing={2}>
                    {/* First Column: Country, Links */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5 }}>
                        <Typography variant="subtitle2">Country:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{country || '-'}</Typography>
                        
                        <Typography variant="subtitle2">Links:</Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {linkedin && (
                            <Link 
                              href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              <LinkedInIcon fontSize="small" />
                            </Link>
                          )}
                          {website && (
                            <Link 
                              href={website.startsWith('http') ? website : `https://${website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center', 
                                textDecoration: 'none',
                                '&:hover': {
                                  textDecoration: 'underline'
                                }
                              }}
                            >
                              <LanguageIcon fontSize="small" />
                            </Link>
                          )}
                          {!linkedin && !website && (
                            <Typography variant="body2">-</Typography>
                          )}
                        </Box>
                      </Box>
                    </Grid>
                    
                    {/* Second Column: Employee, Slogan */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5 }}>
                        <Typography variant="subtitle2">Employee:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{employees || '-'}</Typography>
                        
                        <Typography variant="subtitle2">Slogan:</Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{slogan || '-'}</Typography>
                      </Box>
                    </Grid>
                    
                    {/* Third Column: Founded, Revenue */}
                    <Grid item xs={12} md={4}>
                      <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5 }}>
                        <Typography variant="subtitle2">Founded:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{founded || '-'}</Typography>
                        
                        <Typography variant="subtitle2">Revenue:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{revenue || '-'}</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent' }}>
                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                        <Typography variant="subtitle2" component="span">Description:</Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>{description || '-'}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </>
              );
            })()}
          </Box>
        </Box>
      </Paper>
      )}

      {/* Company Details Card from Competitors - Moved here */}
      {currentTab === 1 && competitorRow && (
        <Paper 
          elevation={1} 
          sx={{ 
            mb: 1.5, 
            p: 2.5, 
            borderRadius: 2, 
            backgroundColor: 'background.paper', 
            border: `2px solid ${getCompetitorBorderColor()}`,
            boxShadow: `0 0 12px ${getCompetitorBorderColor()}40`
          }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.9rem' }}>
              Selected Competitor
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'flex-start' }, gap: 2.5, flexDirection: { xs: 'column', md: 'row' } }}>
            <Box sx={{ width: 48, height: 48, minWidth: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1.5, background: 'rgba(0,0,0,0.04)', overflow: 'hidden', mt: { xs: 0, md: 1 }, flexShrink: 0 }}>
              {(() => {
                const logoIdxDash = headers.findIndex(h => h.toLowerCase() === 'logo');
                const nameIdxDash = headers.findIndex(h => h.toLowerCase() === 'company name');
                const logoUrl = competitorRow && logoIdxDash !== -1 ? competitorRow[logoIdxDash] : '';
                const name = competitorRow && nameIdxDash !== -1 ? (competitorRow[nameIdxDash] || '').toString() : '';
                return logoUrl ? (
                  <img 
                    src={logoUrl} 
                    alt={name} 
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'contain',
                      padding: 4
                    }} 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                ) : (
                  <Typography variant="caption" color="textSecondary" sx={{ fontSize: '0.7rem' }}>No logo</Typography>
                );
              })()}
            </Box>
            <Box sx={{ flex: 1, width: '100%' }}>
              {(() => {
                if (!competitorRow) return null;
                
                const idx = (name: string) => headers.findIndex(h => h.toLowerCase() === name.toLowerCase());
                const get = (i: number) => (i !== -1 ? competitorRow[i] : '');
                
                const name = get(idx('Company Name'));
                const country = get(idx('Country'));
                const employees = get(idx('Number of employees'));
                const founded = get(idx('Founded year'));
                const revenue = get(idx('Revenue range'));
                const linkedin = get(idx('LinkedIn'));
                const website = get(idx('Website'));
                const slogan = get(idx('Slogan'));
                const description = get(idx('Description'));
                const bizgridScore = get(idx('Bizgrid Score'));
                
                // Extract Sector, Industry, and Sub-Industry
                const sectorData = get(idx('Sector'));
                const industryData = get(idx('Industry')) as any;
                const sector = typeof sectorData === 'object' ? (sectorData.sector ?? sectorData.industry ?? '').toString() : sectorData.toString();
                const industry = industryData && typeof industryData === 'object' ? (industryData.industry ?? industryData.sector ?? '').toString() : industryData.toString();
                const subIndustry = industryData && typeof industryData === 'object' ? (industryData.subIndustry ?? industryData.subSector ?? '').toString() : '';
                
                // Get Activity
                const activityIdx = headers.findIndex(h => h.toLowerCase() === 'activity');
                const activity = activityIdx !== -1 ? (competitorRow[activityIdx] || '').toString() : '';
                
                // Create industry chain string including Activity
                const industryChain = [sector, industry, subIndustry, activity].filter(Boolean).join(' > ');
                
                return (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, flexWrap: 'wrap', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          {name}
                        </Typography>
                        {bizgridScore && bizgridScore.trim() && (
                          <Tooltip 
                            title="Bizgrid Score is calculated using an algorithm that takes into account Number of Employees, Legacy, and Revenue Range"
                            arrow
                            placement="top"
                          >
                            <Box sx={{ 
                              display: 'inline-flex', 
                              alignItems: 'center', 
                              px: 2.5, 
                              py: 0.75, 
                              borderRadius: 3, 
                              background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', 
                              color: '#2d3748',
                              fontSize: '0.8rem',
                              fontWeight: 600,
                              letterSpacing: '0.5px',
                              boxShadow: '0 4px 12px rgba(168, 237, 234, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.5)',
                              backdropFilter: 'blur(10px)',
                              cursor: 'help'
                            }}>
                              <Box sx={{ 
                                display: 'inline-flex', 
                                alignItems: 'center',
                                gap: 0.5
                              }}>
                                <Box sx={{ 
                                  width: 6, 
                                  height: 6, 
                                  borderRadius: '50%', 
                                  backgroundColor: '#4a5568',
                                  boxShadow: '0 0 8px rgba(74, 85, 104, 0.4)'
                                }} />
                                Bizgrid Score: {bizgridScore}
                              </Box>
                            </Box>
                          </Tooltip>
                        )}
                      </Box>
                    </Box>
                    {industryChain && (
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          mb: 2, 
                          color: 'text.secondary',
                          fontSize: '0.9rem',
                          fontWeight: 500,
                          fontStyle: 'italic',
                          lineHeight: 1.4
                        }}
                      >
                        {industryChain}
                      </Typography>
                    )}
                    <Grid container spacing={2}>
                      {/* First Column: Country, Links */}
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5 }}>
                          <Typography variant="subtitle2">Country:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{country || '-'}</Typography>
                          
                          <Typography variant="subtitle2">Links:</Typography>
                          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                            {linkedin && (
                              <Link 
                                href={linkedin.startsWith('http') ? linkedin : `https://${linkedin}`} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                sx={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                <LinkedInIcon fontSize="small" />
                              </Link>
                            )}
                            {website && (
                              <Link 
                                href={website.startsWith('http') ? website : `https://${website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                sx={{ 
                                  display: 'inline-flex', 
                                  alignItems: 'center', 
                                  textDecoration: 'none',
                                  '&:hover': {
                                    textDecoration: 'underline'
                                  }
                                }}
                              >
                                <LanguageIcon fontSize="small" />
                              </Link>
                            )}
                            {!linkedin && !website && (
                              <Typography variant="body2">-</Typography>
                            )}
                          </Box>
                        </Box>
                      </Grid>
                      
                      {/* Second Column: Employee, Slogan */}
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5 }}>
                          <Typography variant="subtitle2">Employee:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{employees || '-'}</Typography>
                          
                          <Typography variant="subtitle2">Slogan:</Typography>
                          <Typography variant="body2" sx={{ fontStyle: 'italic' }}>{slogan || '-'}</Typography>
                        </Box>
                      </Grid>
                      
                      {/* Third Column: Founded, Revenue */}
                      <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 1.5, rowGap: 0.5 }}>
                          <Typography variant="subtitle2">Founded:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{founded || '-'}</Typography>
                          
                          <Typography variant="subtitle2">Revenue:</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{revenue || '-'}</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid rgba(0,0,0,0.12)', background: 'transparent' }}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <Typography variant="subtitle2" component="span">Description:</Typography>
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', flex: 1 }}>{description || '-'}</Typography>
                        </Box>
                      </Box>
                    </Box>
                  </>
                );
              })()}
            </Box>
          </Box>
        </Paper>
      )}

      {/* Surprise Me Section - Only show in Main Directory tab */}
      {currentTab === 0 && (
      <Paper 
        elevation={0} 
        sx={{ 
          p: 2, 
          borderRadius: 1.5, 
          backgroundColor: 'background.paper', 
          border: '1px solid rgba(0,0,0,0.12)',
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
          mb: 2
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 3
        }}>
          <Typography variant="subtitle1" sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary' }}>
            Discover Random Companies
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ShuffleIcon />}
              onClick={handleSurpriseMe}
            >
              Surprise Me
            </Button>
            <IconButton
              size="small"
              onClick={() => setShowSurprise(false)}
              sx={{ 
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ClearIcon />
            </IconButton>
          </Box>
        </Box>
        
        {showSurprise && surpriseCompany && (
          <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(25, 118, 210, 0.05)', borderRadius: 1, border: '1px solid rgba(25, 118, 210, 0.2)' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {(() => {
                const logoIdxGrid = headers.findIndex(h => h.toLowerCase() === 'logo');
                const nameIdxGrid = headers.findIndex(h => h.toLowerCase() === 'company name');
                const bizgridIdxGrid = headers.findIndex(h => h.toLowerCase() === 'bizgrid score');
                const logoUrl = logoIdxGrid !== -1 ? surpriseCompany[logoIdxGrid] : '';
                const name = nameIdxGrid !== -1 ? (surpriseCompany[nameIdxGrid] || '').toString() : '';
                const bizgridScore = bizgridIdxGrid !== -1 ? surpriseCompany[bizgridIdxGrid] : '';
                
                return (
                  <>
                    <Box sx={{ position: 'relative' }}>
                      <Card 
                        elevation={2} 
                        sx={{ 
                          borderRadius: 2,
                          width: 48,
                          height: 48, 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          p: 0.25, 
                          transition: 'transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                          backgroundColor: clickedRow === surpriseCompany ? 'rgba(0, 0, 0, 0.04)' : 'white',
                          border: '2px solid rgba(25, 118, 210, 0.3)',
                          '&:hover': { 
                            transform: 'translateY(-2px)', 
                            boxShadow: 3,
                            cursor: 'pointer'
                          }
                        }}
                        onMouseEnter={() => !clickedRow && setHoveredRow(surpriseCompany)}
                        onClick={() => {
                          if (clickedRow === surpriseCompany) {
                            setClickedRow(null);
                            setHoveredRow(null);
                          } else {
                            setClickedRow(surpriseCompany);
                            setHoveredRow(surpriseCompany);
                          }
                        }}
                      >
                        {logoUrl ? (
                          <Box
                            component="img"
                            src={logoUrl}
                            alt={name}
                            sx={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'contain',
                              borderRadius: 1
                            }}
                            onError={(e: any) => {
                              e.currentTarget.style.display = 'none';
                              const nextElement = e.currentTarget.nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <Box
                          sx={{
                            display: logoUrl ? 'none' : 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            height: '100%',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                            fontSize: '0.6rem',
                            fontWeight: 600,
                            color: '#666',
                            textAlign: 'center',
                            p: 0.25
                          }}
                        >
                          {name ? name.split(' ').slice(0, 2).map((word: string) => word[0]).join('').toUpperCase().slice(0, 3) : 'N/A'}
                        </Box>
                      </Card>
                    </Box>
                    <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 600, color: 'text.primary' }}>
                      {name}
                    </Typography>
                  </>
                );
              })()}
            </Box>
          </Box>
        )}
      </Paper>
      )}

      {/* Our coverage stats card - Hidden only in Statistics, World Map, and Newsletter tabs */}
      {currentTab !== 1 && currentTab !== 3 && currentTab !== 5 && (
        <Box sx={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: 'background.default', mb: 1 }}>
        <Paper 
          elevation={0} 
          sx={{ 
            p: 1.5,  // Increased padding for better spacing
            borderRadius: 1.5, 
            backgroundColor: 'background.paper', 
            border: '1px solid rgba(0,0,0,0.12)',
            boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
          }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1.5, sm: 2, md: 3 }, 
            whiteSpace: 'nowrap', 
            margin: 0, 
            px: 1
          }}>
          <Typography variant="h6" sx={{ 
            opacity: 0.95, 
            minWidth: { xs: 90, sm: 100, md: 120 }, 
            fontWeight: 600, 
            my: 0, 
            lineHeight: 1.5, 
            flexShrink: 0,
            fontSize: '0.95rem'
          }}>Our Coverage</Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1.5, sm: 2, md: 3 }, flex: 1, overflowX: 'auto', '&::-webkit-scrollbar': { display: 'none' }, scrollbarWidth: 'none' }}>
            {[
              { value: coverageStats.companies, label: 'companies' },
              { value: coverageStats.countries, label: 'countries' },
              { value: coverageStats.sectors, label: 'sectors' },
              { value: coverageStats.industries, label: 'industries' },
              { value: coverageStats.subIndustries, label: 'sub-industries' },
              { value: coverageStats.activities, label: 'activities' }
            ].map((item, index) => (
              <Box key={index} sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, flexShrink: 0 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    lineHeight: 1, 
                    fontSize: { 
                      xs: '0.9rem', 
                      sm: '1rem', 
                      md: '1.25rem' 
                    } 
                  }}
                >
                  {item.value}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="textSecondary"
                  sx={{
                    fontSize: {
                      xs: '0.7rem',
                      sm: '0.75rem',
                      md: '0.8rem'
                    }
                  }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
          <Box sx={{ flexShrink: 0, ml: 'auto', pl: { xs: 1, sm: 2 } }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<SortIcon />}
              onClick={(e) => setSortMenuAnchor(e.currentTarget)}
            >
              Sort
            </Button>
          </Box>
        </Box>
      </Paper>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentTab === 0 && ( // Main Directory tab
            <>
              <Box sx={{ mt: 1, height: 'calc(100vh - 280px)', overflowY: 'auto', pr: 1, pb: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.25 }}>
                {paginatedRows.map((row, rowIndex) => {
                  const logoIdxGrid = headers.findIndex(h => h.toLowerCase() === 'logo');
                  const nameIdxGrid = headers.findIndex(h => h.toLowerCase() === 'company name');
                  const bizgridIdxGrid = headers.findIndex(h => h.toLowerCase() === 'bizgrid score');
                  const logoUrl = logoIdxGrid !== -1 ? row[logoIdxGrid] : '';
                  const name = nameIdxGrid !== -1 ? (row[nameIdxGrid] || '').toString() : '';
                  const bizgridScore = bizgridIdxGrid !== -1 ? row[bizgridIdxGrid] : '';
                  return (
                    <Box sx={{ flex: '0 0 auto' }} key={`${page}-${rowIndex}`}>
                      <Tooltip title={name || 'Company name'} arrow>
                        <Box sx={{ position: 'relative' }}>
                          <Card 
                            elevation={1} 
                            sx={{ 
                              borderRadius: 2,
                              width: 48,
                              height: 48, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              p: 0.25, 
                              transition: 'transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                              backgroundColor: clickedRow === row ? 'rgba(0, 0, 0, 0.04)' : 'white',
                              '&:hover': { 
                                transform: 'translateY(-2px)', 
                                boxShadow: 3,
                                cursor: 'pointer'
                              }
                            }}
                            onMouseEnter={() => !clickedRow && setHoveredRow(row)}
                            onClick={() => {
                              if (clickedRow === row) {
                                setClickedRow(null);
                                setHoveredRow(null);
                              } else {
                                setClickedRow(row);
                                setHoveredRow(row);
                              }
                            }}
                          >
                            <CardActionArea sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {logoUrl ? (
                                <img src={logoUrl} alt={name || 'Logo'} style={{ maxWidth: '100%', maxHeight: '80%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <Typography variant="caption" color="textSecondary" sx={{ px: 1, textAlign: 'center' }}>{name || 'No logo'}</Typography>
                              )}
                            </CardActionArea>
                          </Card>
                        </Box>
                      </Tooltip>
                    </Box>
                  );
                })}
                </Box>
              </Box>
              <Box sx={{ mt: 1 }}>
                <TablePagination
                  component="div"
                  count={sortedAndFilteredRows.length}
                  page={page}
                  onPageChange={(_, newPage) => setPage(newPage)}
                  rowsPerPage={rowsPerPage}
                  rowsPerPageOptions={[rowsPerPage]}
                />
              </Box>
            </>
          )}

          {currentTab === 1 && ( // Competitors tab
            <Competitors 
              headers={headers} 
              rows={rows} 
              selectedCompany={parseCompanyForCompetitors(clickedRow || hoveredRow)}
              onCompanySelect={handleCompetitorSelect}
            />
          )}

          {currentTab === 2 && ( // Comparison tab
            <>
              {/* Instructions */}
              <Paper elevation={0} sx={{ mb: 2, p: 2, borderRadius: 1.5, backgroundColor: 'background.paper', border: '1px solid rgba(0,0,0,0.12)' }}>
                <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                  💡 Select up to 6 company logos below to build your comparison. Your selections are saved automatically.
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                  <Typography variant="body2" sx={{ 
                    color: selectedCompanies.length >= 6 ? 'error.main' : 'text.secondary',
                    fontWeight: selectedCompanies.length >= 6 ? 600 : 'normal'
                  }}>
                    Selected: {selectedCompanies.length}/6 companies
                  </Typography>
                  {selectedCompanies.length >= 6 && (
                    <Typography variant="body2" sx={{ color: 'error.main', fontSize: '0.85rem' }}>
                      ⚠️ Maximum limit reached
                    </Typography>
                  )}
                  {selectedCompanies.length > 0 && (
                    <Button size="small" onClick={clearSelection} startIcon={<ClearIcon />}>
                      Clear All
                    </Button>
                  )}
                </Box>
              </Paper>

              {/* Comparison Table */}
              {selectedCompanies.length > 0 && (
                <Paper elevation={0} sx={{ mb: 2, borderRadius: 1.5, backgroundColor: 'background.paper', border: '1px solid rgba(0,0,0,0.12)', width: '100%', overflow: 'hidden' }}>
                  <TableContainer>
                    <Table sx={{ tableLayout: 'fixed' }}>
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, backgroundColor: 'white', color: 'black', borderBottom: '2px solid #212121', textAlign: 'center', width: '200px' }}>Metric</TableCell>
                          {selectedCompanies.map((company, index) => {
                            // Find company data to get logo - use full rows array instead of paginatedRows
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              const name = nameIdx !== -1 ? (row[nameIdx] || '').toString() : '';
                              return name === company;
                            });
                            const logoIdx = headers.findIndex(h => h.toLowerCase() === 'logo');
                            const logoUrl = companyRow && logoIdx !== -1 ? companyRow[logoIdx] : '';
                            
                            return (
<TableCell key={index} sx={{ fontWeight: 600, backgroundColor: 'white', color: 'black', borderBottom: '2px solid #212121', width: `${100 / (selectedCompanies.length + 1)}%`, textAlign: 'center', px: 1, whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, justifyContent: 'center' }}>
                                    {logoUrl ? (
                                      <img 
                                        src={logoUrl} 
                                        alt={company} 
                                        style={{ 
                                          width: 24, 
                                          height: 24, 
                                          objectFit: 'contain',
                                          marginRight: 4
                                        }} 
                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                                      />
                                    ) : null}
                                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'black', fontSize: '0.875rem', whiteSpace: 'normal', wordWrap: 'break-word' }}>
                                      {company}
                                    </Typography>
                                  </Box>
                                  <IconButton size="small" onClick={() => toggleCompanySelection(company)} sx={{ p: 0.5, ml: 1 }}>
                                    <ClearIcon fontSize="small" />
                                  </IconButton>
                                </Box>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Country</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            const countryIdx = headers.findIndex(h => h.toLowerCase() === 'country');
                            const country = companyRow && countryIdx !== -1 ? companyRow[countryIdx] : '-';
                            return <TableCell key={company} sx={{ textAlign: 'center', width: `${100 / (selectedCompanies.length + 1)}%`, px: 1, whiteSpace: 'normal', wordWrap: 'break-word', '& .MuiTypography-root': { whiteSpace: 'normal' } }}>{country || '-'}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Number of Employees</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            const employeesIdx = headers.findIndex(h => h.toLowerCase() === 'number of employees');
                            const employees = companyRow && employeesIdx !== -1 ? companyRow[employeesIdx] : '-';
                            return <TableCell key={company} sx={{ textAlign: 'center' }}>{employees || '-'}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Founded Year</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            const foundedIdx = headers.findIndex(h => h.toLowerCase() === 'founded year');
                            const founded = companyRow && foundedIdx !== -1 ? companyRow[foundedIdx] : '-';
                            return <TableCell key={company} sx={{ textAlign: 'center' }}>{founded || '-'}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Revenue</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            const revenueIdx = headers.findIndex(h => h.toLowerCase() === 'revenue range');
                            const revenue = companyRow && revenueIdx !== -1 ? companyRow[revenueIdx] : '-';
                            return <TableCell key={company} sx={{ textAlign: 'center' }}>{revenue || '-'}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Bizgrid Score</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            const bizgridIdx = headers.findIndex(h => h.toLowerCase() === 'bizgrid score');
                            const bizgridScore = companyRow && bizgridIdx !== -1 ? companyRow[bizgridIdx] : '-';
                            return <TableCell key={company} sx={{ textAlign: 'center' }}>{bizgridScore || '-'}</TableCell>;
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Activity</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            
                            // Try different variations of activity column names
                            const activityIdx = headers.findIndex(h => h.toLowerCase() === 'activity');
                            const activity = companyRow && activityIdx !== -1 ? companyRow[activityIdx] : '';
                            
                            // Get sector and industry data for tooltip
                            const sectorIdx = headers.findIndex(h => h.toLowerCase() === 'sector');
                            const industryIdx = headers.findIndex(h => h.toLowerCase() === 'industry');
                            const sector = companyRow && sectorIdx !== -1 ? companyRow[sectorIdx] : '';
                            const industryData = companyRow && industryIdx !== -1 ? companyRow[industryIdx] : '';
                            
                            // Extract sector and industry from data
                            let sectorText = '';
                            let industryText = '';
                            let subIndustryText = '';
                            
                            if (typeof sector === 'object' && sector) {
                              sectorText = sector.sector || sector['Sector'] || '';
                            } else if (typeof sector === 'string') {
                              sectorText = sector.trim();
                            }
                            
                            if (typeof industryData === 'object' && industryData) {
                              industryText = industryData.industry || industryData['Industry'] || '';
                              subIndustryText = industryData.subIndustry || industryData['subIndustry'] || '';
                            } else if (typeof industryData === 'string') {
                              industryText = industryData.trim();
                            }
                            
                            // Create the full chain for tooltip
                            const chainParts = [sectorText, industryText, subIndustryText, activity.toString().trim()].filter(part => part && part !== '-');
                            const fullChain = chainParts.join(' > ');
                            
                            // Format activity data
                            let displayText = '-';
                            if (typeof activity === 'object' && activity) {
                              displayText = activity.activity || activity['Activity'] || '-';
                            } else if (typeof activity === 'string') {
                              displayText = activity.trim() || '-';
                            }
                            
                            return (
                              <TableCell key={`${company}-activity`} sx={{ 
                                textAlign: 'center', 
                                whiteSpace: 'normal', 
                                wordWrap: 'break-word',
                                maxWidth: '200px',
                                px: 2,
                                '& .MuiTypography-root': { 
                                  whiteSpace: 'normal',
                                  wordBreak: 'break-word'
                                } 
                              }}>
                                <Tooltip title={fullChain || displayText} arrow>
                                  <Box>
                                    {displayText}
                                  </Box>
                                </Tooltip>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 500, textAlign: 'center' }}>Links</TableCell>
                          {selectedCompanies.map((company) => {
                            const companyRow = rows.find(row => {
                              const nameIdx = headers.findIndex(h => h.toLowerCase() === 'company name');
                              return nameIdx !== -1 && (row[nameIdx] || '').toString() === company;
                            });
                            
                            const websiteIdx = headers.findIndex(h => h.toLowerCase() === 'website');
                            const linkedinIdx = headers.findIndex(h => h.toLowerCase() === 'linkedin');
                            
                            const website = companyRow && websiteIdx !== -1 ? companyRow[websiteIdx] : null;
                            const linkedin = companyRow && linkedinIdx !== -1 ? companyRow[linkedinIdx] : null;
                            
                            return (
                              <TableCell key={company} sx={{ textAlign: 'center' }}>
                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                  {website ? (
                                    <Link href={website.toString().startsWith('http') ? website.toString() : `https://${website}`} target="_blank" rel="noopener noreferrer">
                                      <LanguageIcon fontSize="small" color="primary" />
                                    </Link>
                                  ) : null}
                                  {linkedin ? (
                                    <Link href={linkedin.toString().startsWith('http') ? linkedin.toString() : `https://${linkedin}`} target="_blank" rel="noopener noreferrer">
                                      <LinkedInIcon fontSize="small" color="primary" />
                                    </Link>
                                  ) : null}
                                  {!website && !linkedin ? '-' : null}
                                </Box>
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}

              {/* Company Logo Grid for Selection */}
              <Box sx={{ mt: 1, height: 'calc(100vh - 400px)', overflowY: 'auto', pr: 1, pb: 2 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Select Companies to Compare
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {paginatedRows.map((row, rowIndex) => {
                  const logoIdxGrid = headers.findIndex(h => h.toLowerCase() === 'logo');
                  const nameIdxGrid = headers.findIndex(h => h.toLowerCase() === 'company name');
                  const logoUrl = logoIdxGrid !== -1 ? row[logoIdxGrid] : '';
                  const name = nameIdxGrid !== -1 ? (row[nameIdxGrid] || '').toString() : '';
                  const isSelected = selectedCompanies.includes(name);
                  
                  const isMaxReached = selectedCompanies.length >= 6 && !isSelected;
                  
                  return (
                    <Box sx={{ flex: '0 0 auto' }} key={`comparison-${rowIndex}`}>
                      <Tooltip title={isMaxReached ? 'Maximum 6 companies limit reached' : (name || 'Company name')} arrow>
                        <Box sx={{ position: 'relative' }}>
                          <Card 
                            elevation={isSelected ? 3 : (isMaxReached ? 0 : 1)} 
                            sx={{ 
                              borderRadius: 2,
                              width: 48,
                              height: 48, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              p: 0.25, 
                              transition: 'transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease',
                              backgroundColor: isSelected ? 'rgba(25, 118, 210, 0.08)' : (isMaxReached ? 'rgba(0,0,0,0.04)' : 'white'),
                              border: isSelected ? '2px solid' : 'none',
                              borderColor: isSelected ? 'primary.main' : 'transparent',
                              opacity: isMaxReached ? 0.5 : 1,
                              '&:hover': isMaxReached ? {} : { 
                                transform: 'translateY(-2px)', 
                                boxShadow: 3,
                                cursor: 'pointer'
                              }
                            }}
                            onClick={() => !isMaxReached && toggleCompanySelection(name)}
                          >
                            <CardActionArea sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {logoUrl ? (
                                <img src={logoUrl} alt={name || 'Logo'} style={{ maxWidth: '100%', maxHeight: '80%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                              ) : (
                                <Typography variant="caption" color="textSecondary" sx={{ px: 1, textAlign: 'center' }}>{name || 'No logo'}</Typography>
                              )}
                            </CardActionArea>
                          </Card>
                          {isSelected && (
                            <Box sx={{ 
                              position: 'absolute', 
                              top: -8, 
                              right: -8, 
                              backgroundColor: 'primary.main', 
                              borderRadius: '50%', 
                              width: 20, 
                              height: 20, 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center' 
                            }}>
                              <CheckIcon sx={{ fontSize: 12, color: 'white' }} />
                            </Box>
                          )}
                        </Box>
                      </Tooltip>
                    </Box>
                  );
                })}
                </Box>
              </Box>
            </>
          )}

          {currentTab === 3 && ( // Statistics tab
            <Statistics />
          )}

          {currentTab === 4 && ( // World Map tab
            <WorldMapPage />
          )}

          {currentTab === 5 && ( // Newsletter tab
            <Newsletter />
          )}
        </>
      )}

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Filters</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Autocomplete
              multiple
              options={filterOptions.region}
              value={filters.region}
              onChange={(_, value) => setFilters(prev => ({ ...prev, region: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Region"
                  placeholder="Search region"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#2196f3',
                      },
                      '&:hover fieldset': {
                        borderColor: '#2196f3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.country}
              value={filters.country}
              onChange={(_, value) => setFilters(prev => ({ ...prev, country: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Country"
                  placeholder="Search country"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#2196f3',
                      },
                      '&:hover fieldset': {
                        borderColor: '#2196f3',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#2196f3',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.sector}
              value={filters.sector}
              onChange={(_, value) => setFilters(prev => ({ ...prev, sector: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sector"
                  placeholder="Search sector"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff9800',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.industry}
              value={filters.industry}
              onChange={(_, value) => setFilters(prev => ({ ...prev, industry: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Industry"
                  placeholder="Search industry"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff9800',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.subIndustry}
              value={filters.subIndustry}
              onChange={(_, value) => setFilters(prev => ({ ...prev, subIndustry: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Sub-industry"
                  placeholder="Search sub-industry"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff9800',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.activity}
              value={filters.activity}
              onChange={(_, value) => setFilters(prev => ({ ...prev, activity: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Activity"
                  placeholder="Search activities"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&:hover fieldset': {
                        borderColor: '#ff9800',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#ff9800',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.employees}
              value={filters.employees}
              onChange={(_, value) => setFilters(prev => ({ ...prev, employees: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Number of employees"
                  placeholder="Search"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#9c27b0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9c27b0',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#9c27b0',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.foundedYear}
              value={filters.foundedYear}
              onChange={(_, value) => setFilters(prev => ({ ...prev, foundedYear: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Founded year"
                  placeholder="Search"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#9c27b0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9c27b0',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#9c27b0',
                      },
                    },
                  }}
                />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.revenueRange}
              value={filters.revenueRange}
              onChange={(_, value) => setFilters(prev => ({ ...prev, revenueRange: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Revenue range"
                  placeholder="Search"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        borderColor: '#9c27b0',
                      },
                      '&:hover fieldset': {
                        borderColor: '#9c27b0',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: '#9c27b0',
                      },
                    },
                  }}
                />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFilters({ 
                country: [], 
                region: [],
                employees: [], 
                foundedYear: [], 
                revenueRange: [], 
                sector: [], 
                industry: [], 
                subIndustry: [],
                activity: [] 
              })
            }
          >
            Clear
          </Button>
          <Button onClick={() => setFilterOpen(false)} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchor}
        open={Boolean(sortMenuAnchor)}
        onClose={() => setSortMenuAnchor(null)}
        PaperProps={{
          sx: { minWidth: 220 }
        }}
      >
        <MenuItem 
          onClick={() => {
            setSortConfig({ column: 'Added Date', direction: sortConfig?.column === 'Added Date' && sortConfig?.direction === 'asc' ? 'desc' : 'asc' });
            setSortMenuAnchor(null);
          }}
          selected={sortConfig?.column === 'Added Date'}
          sx={{ 
            backgroundColor: sortConfig?.column === 'Added Date' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: sortConfig?.column === 'Added Date' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {sortConfig?.column === 'Added Date' ? <CheckIcon color="primary" /> : (sortConfig?.column === 'Added Date' && sortConfig?.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: sortConfig?.column === 'Added Date' ? 600 : 400 }}>
              Added Date {sortConfig?.column === 'Added Date' ? (sortConfig?.direction === 'asc' ? '(Oldest First)' : '(Newest First)') : ''}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortConfig({ column: 'Company Name', direction: sortConfig?.column === 'Company Name' && sortConfig?.direction === 'asc' ? 'desc' : 'asc' });
            setSortMenuAnchor(null);
          }}
          selected={sortConfig?.column === 'Company Name'}
          sx={{ 
            backgroundColor: sortConfig?.column === 'Company Name' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: sortConfig?.column === 'Company Name' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {sortConfig?.column === 'Company Name' ? <CheckIcon color="primary" /> : (sortConfig?.column === 'Company Name' && sortConfig?.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: sortConfig?.column === 'Company Name' ? 600 : 400 }}>
              Alphabetical Order {sortConfig?.column === 'Company Name' ? (sortConfig?.direction === 'asc' ? '(A to Z)' : '(Z to A)') : ''}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortConfig({ column: 'Revenue range', direction: sortConfig?.column === 'Revenue range' && sortConfig?.direction === 'asc' ? 'desc' : 'asc' });
            setSortMenuAnchor(null);
          }}
          selected={sortConfig?.column === 'Revenue range'}
          sx={{ 
            backgroundColor: sortConfig?.column === 'Revenue range' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: sortConfig?.column === 'Revenue range' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {sortConfig?.column === 'Revenue range' ? <CheckIcon color="primary" /> : (sortConfig?.column === 'Revenue range' && sortConfig?.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: sortConfig?.column === 'Revenue range' ? 600 : 400 }}>
              Revenue Range {sortConfig?.column === 'Revenue range' ? (sortConfig?.direction === 'asc' ? '(Low to High)' : '(High to Low)') : ''}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortConfig({ column: 'Founded year', direction: sortConfig?.column === 'Founded year' && sortConfig?.direction === 'asc' ? 'desc' : 'asc' });
            setSortMenuAnchor(null);
          }}
          selected={sortConfig?.column === 'Founded year'}
          sx={{ 
            backgroundColor: sortConfig?.column === 'Founded year' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: sortConfig?.column === 'Founded year' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {sortConfig?.column === 'Founded year' ? <CheckIcon color="primary" /> : (sortConfig?.column === 'Founded year' && sortConfig?.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: sortConfig?.column === 'Founded year' ? 600 : 400 }}>
              Founded Year {sortConfig?.column === 'Founded year' ? (sortConfig?.direction === 'asc' ? '(Oldest to Newest)' : '(Newest to Oldest)') : ''}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortConfig({ column: 'Number of employees', direction: sortConfig?.column === 'Number of employees' && sortConfig?.direction === 'asc' ? 'desc' : 'asc' });
            setSortMenuAnchor(null);
          }}
          selected={sortConfig?.column === 'Number of employees'}
          sx={{ 
            backgroundColor: sortConfig?.column === 'Number of employees' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: sortConfig?.column === 'Number of employees' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {sortConfig?.column === 'Number of employees' ? <CheckIcon color="primary" /> : (sortConfig?.column === 'Number of employees' && sortConfig?.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: sortConfig?.column === 'Number of employees' ? 600 : 400 }}>
              Number of Employees {sortConfig?.column === 'Number of employees' ? (sortConfig?.direction === 'asc' ? '(Few to Many)' : '(Many to Few)') : ''}
            </Typography>
          </ListItemText>
        </MenuItem>
        <MenuItem 
          onClick={() => {
            setSortConfig({ column: 'Bizgrid Score', direction: sortConfig?.column === 'Bizgrid Score' && sortConfig?.direction === 'asc' ? 'desc' : 'asc' });
            setSortMenuAnchor(null);
          }}
          selected={sortConfig?.column === 'Bizgrid Score'}
          sx={{ 
            backgroundColor: sortConfig?.column === 'Bizgrid Score' ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
            '&:hover': { backgroundColor: sortConfig?.column === 'Bizgrid Score' ? 'rgba(25, 118, 210, 0.12)' : 'rgba(0, 0, 0, 0.04)' }
          }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {sortConfig?.column === 'Bizgrid Score' ? <CheckIcon color="primary" /> : (sortConfig?.column === 'Bizgrid Score' && sortConfig?.direction === 'asc' ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />)}
          </ListItemIcon>
          <ListItemText>
            <Typography sx={{ fontWeight: sortConfig?.column === 'Bizgrid Score' ? 600 : 400 }}>
              Bizgrid Score {sortConfig?.column === 'Bizgrid Score' ? (sortConfig?.direction === 'asc' ? '(Low to High)' : '(High to Low)') : ''}
            </Typography>
          </ListItemText>
        </MenuItem>
      </Menu>
    </Box>
    </>
  );
};

export default CompanyDirectory;
