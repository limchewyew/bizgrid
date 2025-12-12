import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Tooltip,
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
  TableSortLabel,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RefreshIcon from '@mui/icons-material/Refresh';
import FilterListIcon from '@mui/icons-material/FilterList';
import CampaignIcon from '@mui/icons-material/Campaign';
import { fetchDataFromSheet } from '../../services/googleSheets';

const CompanyDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    column: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [paletteCache, setPaletteCache] = useState<Record<string, string[]>>({});
  const [page, setPage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<{
    country: string[];
    employees: string[];
    foundedYear: string[];
    revenueRange: string[];
    sector: string[];
    industry: string[];
    accolades: string[];
  }>({
    country: [],
    employees: [],
    foundedYear: [],
    revenueRange: [],
    sector: [],
    industry: [],
    accolades: []
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

  const columnIndex = (name: string) =>
    headers.findIndex(h => h.toLowerCase() === name.toLowerCase());

  const countryIdx = columnIndex('country');
  const employeesIdx = columnIndex('number of employees');
  const foundedIdx = columnIndex('founded year');
  const revenueIdx = columnIndex('revenue range');
  const locationIdx = columnIndex('location');
  const sectorIdx = columnIndex('sector');
  const industryIdx = columnIndex('industry');
  const accoladesIdx = columnIndex('accolades');

  const logoIdx = columnIndex('logo');
  const nameIdx = columnIndex('company name');
  const locationIdxSticky = columnIndex('location');
  const countryIdxSticky = columnIndex('country');

  const stickyCols = React.useMemo(() => {
    const widths = new Map<number, number>();
    if (logoIdx !== -1) widths.set(logoIdx, 72);
    if (nameIdx !== -1) widths.set(nameIdx, 260);
    if (locationIdxSticky !== -1) widths.set(locationIdxSticky, 200);
    if (countryIdxSticky !== -1) widths.set(countryIdxSticky, 160);

    const order = [logoIdx, nameIdx, locationIdxSticky, countryIdxSticky].filter(
      (i): i is number => i !== -1
    );
    let left = 0;
    const map = new Map<number, { left: number; width: number }>();
    for (const idx of order) {
      const w = widths.get(idx) || 160;
      map.set(idx, { left, width: w });
      left += w;
    }
    return map;
  }, [logoIdx, nameIdx, locationIdxSticky, countryIdxSticky]);

  

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

    const sectorOptions = sectorIdx === -1
      ? []
      : Array.from(new Set(rows.map(r => extractSector(r[sectorIdx])).filter(Boolean))).sort((a, b) => a.localeCompare(b));
    const industryOptions = industryIdx === -1
      ? []
      : Array.from(new Set(rows.map(r => extractIndustry(r[industryIdx])).filter(Boolean))).sort((a, b) => a.localeCompare(b));

    return {
      country: unique(countryIdx),
      // Keep employees in predefined ascending order only
      employees: employeeRangeOptions,
      foundedYear: unique(foundedIdx, foundedYearOptions),
      // Keep revenue in predefined ascending order only
      revenueRange: revenueRangeOptions,
      sector: sectorOptions,
      industry: industryOptions,
      accolades: ['Certified B-Corp', 'S&P 500', 'FTSE 100']
    };
  }, [rows, countryIdx, employeesIdx, foundedIdx, revenueIdx, sectorIdx, industryIdx]);

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
        // Accolades filter (Certified B-Corp, S&P 500, FTSE 100)
        (() => {
          if (accoladesIdx === -1 || filters.accolades.length === 0) return true;
          const raw = row[accoladesIdx];
          if (!raw) return false;
          const toStrArr = (v: any): string[] => Array.isArray(v) ? v : [v];
          const vals = toStrArr(raw).map(x => (x ?? '').toString().toLowerCase());
          const hasBCorp = vals.some(v => v.includes('certified_b_corporation'));
          const hasSP500 = vals.some(v => v.includes('s-and-p-500'));
          const hasFTSE = vals.some(v => v.includes('encrypted-tbn0.gstatic.com'));
          const present: string[] = [];
          if (hasBCorp) present.push('Certified B-Corp');
          if (hasSP500) present.push('S&P 500');
          if (hasFTSE) present.push('FTSE 100');
          if (present.length === 0) return false;
          return filters.accolades.some(a => present.includes(a));
        })() &&
        foundedYearMatch() &&
        match(revenueIdx, filters.revenueRange)
      );
    });
  }, [rows, filters, countryIdx, employeesIdx, foundedIdx, revenueIdx, sectorIdx, industryIdx, accoladesIdx]);

  const searchFilteredRows = filteredByFilters.filter(row =>
    row.some(
      cell =>
        cell &&
        cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const coverageStats = React.useMemo(() => {
    const cities = new Set<string>();
    const countries = new Set<string>();
    const sectors = new Set<string>();
    const industries = new Set<string>();
    const subIndustries = new Set<string>();

    filteredByFilters.forEach(row => {
      const loc = locationIdx !== -1 ? row[locationIdx] : undefined;
      if (loc && typeof loc === 'object') {
        const city = (loc.city ?? '').toString().trim();
        if (city) cities.add(city);
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
    });

    return {
      companies: filteredByFilters.length,
      cities: cities.size,
      countries: countries.size,
      sectors: sectors.size,
      industries: industries.size,
      subIndustries: subIndustries.size
    };
  }, [filteredByFilters, locationIdx, countryIdx, sectorIdx, industryIdx]);

  const sortedAndFilteredRows = React.useMemo(() => {
    let result = [...searchFilteredRows];

    // Apply founded year sorting if specified in filters
    if (filters.foundedYear.includes('Oldest to Newest') || 
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

        // Default string compare
        return dir * aValue.localeCompare(bValue);
      });
    }

    return result;
  }, [searchFilteredRows, sortConfig, headers, filters.foundedYear, foundedIdx]);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, filters, sortConfig, rows]);

  const rowsPerPage = 200;
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
  const showPaletteColumn = logoColumnIndex !== -1;

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

  const augmentedHeaders = showPaletteColumn ? [...headers, 'Color Palette'] : headers;

  return (
    <>
    <Box>
      <Box sx={{ mb: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 400, letterSpacing: '-0.02em' }}>
          Company Directory
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
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
          sx={{ width: 300 }}
        />
        </Box>
      </Box>

      {/* Our coverage stats card */}
      <Paper elevation={0} sx={{ mb: 0.5, p: 1.25, borderRadius: 1.5, backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ opacity: 0.95, minWidth: 120, fontWeight: 600 }}>Our Coverage</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>{coverageStats.companies}</Typography>
              <Typography variant="caption" color="textSecondary">companies</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>{coverageStats.cities}</Typography>
              <Typography variant="caption" color="textSecondary">cities</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>{coverageStats.countries}</Typography>
              <Typography variant="caption" color="textSecondary">countries</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>{coverageStats.sectors}</Typography>
              <Typography variant="caption" color="textSecondary">sectors</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>{coverageStats.industries}</Typography>
              <Typography variant="caption" color="textSecondary">industries</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
              <Typography variant="h6" sx={{ lineHeight: 1 }}>{coverageStats.subIndustries}</Typography>
              <Typography variant="caption" color="textSecondary">sub-industries</Typography>
            </Box>
          </Box>
        </Box>
      </Paper>

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
      <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 'calc(100vh - 120px)', overflow: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {augmentedHeaders.map((header, index) => {
                  const normalizedHeader = header.toString().trim().toLowerCase();
                  const isDescription = normalizedHeader === 'description';
                  const isSortable =
                    header === 'Company Name' ||
                    header === 'Country' ||
                    header === 'Revenue range' ||
                    header === 'Founded year' ||
                    header === 'Number of employees';
                  const displayHeader =
                    normalizedHeader === 'sector' || normalizedHeader === 'primary business'
                      ? 'Sector'
                      : header;

                  return (
                    <TableCell
                      key={index}
                      align="center"
                      sx={{
                        textAlign: 'center',
                        backgroundColor: '#0B2740',
                        ...(stickyCols.has(index)
                          ? {
                              position: 'sticky',
                              left: stickyCols.get(index)!.left,
                              zIndex: 3,
                              backgroundColor: '#0B2740',
                              minWidth: stickyCols.get(index)!.width,
                              maxWidth: stickyCols.get(index)!.width,
                              boxShadow: index === Array.from(stickyCols.keys()).slice(-1)[0]
                                ? 'inset -1px 0 0 rgba(0,0,0,0.12)'
                                : undefined
                            }
                          : {}),
                        ...(isDescription
                          ? { minWidth: '500px', maxWidth: '800px', whiteSpace: 'normal', wordWrap: 'break-word' }
                          : {})
                      }}
                    >
                      {isSortable ? (
                        <TableSortLabel
                          active={sortConfig?.column === header}
                          direction={sortConfig?.column === header ? sortConfig.direction : 'asc'}
                          onClick={() => handleSort(header)}
                          sx={{
                            color: 'white !important',
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'center',
                            '& .MuiTableSortLabel-icon': {
                              color: 'white !important'
                            },
                            '&:hover': {
                              color: 'white !important'
                            },
                            '&.Mui-active': {
                              color: 'white !important'
                            }
                          }}
                        >
                          {displayHeader}
                        </TableSortLabel>
                      ) : (
                        <Box sx={{ color: 'white' }}>{displayHeader}</Box>
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedAndFilteredRows.length > 0 ? (
                paginatedRows.map((row, rowIndex) => (
                  <TableRow key={`${page}-${rowIndex}`} hover>
                    {row.map((cell, cellIndex) => {
                      const headerRaw = headers[cellIndex] || '';
                      const header = headerRaw.toString().trim().toLowerCase();
                      const isImage = header.includes('logo') || header.includes('image');
                      const isAccolades = header === 'accolades';
                      const isUrl = (header.includes('url') || header.includes('website') || header.includes('linkedin')) && !isImage;
                      const isLocation = header === 'location';
                      const isSector =
                        header === 'sector';
                      const isIndustry =
                        header === 'industry';
                      const isDescription = header === 'description';
                      const isSlogan = header === 'slogan';
                      const isRevenueRange = header === 'revenue range';
                      const isEmployeeCount = header === 'number of employees';
                      const isFoundedYear = header === 'founded year';
                      const revenueStyle = isRevenueRange ? getRevenueStyle(cell) : {};
                      const employeeStyle = isEmployeeCount ? getEmployeeStyle(cell) : {};
                      const foundedStyle = isFoundedYear ? getFoundedYearStyle(cell) : {};
                      
                      return (
                        <TableCell 
                          key={cellIndex}
                          align="center"
                          sx={{
                            ...(stickyCols.has(cellIndex)
                              ? {
                                  position: 'sticky',
                                  left: stickyCols.get(cellIndex)!.left,
                                  zIndex: 1,
                                  backgroundColor: 'background.paper',
                                  minWidth: stickyCols.get(cellIndex)!.width,
                                  maxWidth: stickyCols.get(cellIndex)!.width,
                                  boxShadow: cellIndex === Array.from(stickyCols.keys()).slice(-1)[0]
                                    ? 'inset -1px 0 0 rgba(0,0,0,0.06)'
                                    : undefined
                                }
                              : {}),
                            ...(isDescription
                              ? { minWidth: '400px', maxWidth: '600px', whiteSpace: 'normal', wordWrap: 'break-word' }
                              : { whiteSpace: 'nowrap' }),
                            ...revenueStyle,
                            ...employeeStyle,
                            ...foundedStyle
                          }}
                        >
                          {(isImage || isAccolades) && cell ? (
                            Array.isArray(cell) && isAccolades ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.75 }}>
                                {cell.map((url: string, idx: number) => {
                                  const label = url.includes('s-and-p-500')
                                    ? "S&P 500"
                                    : url.toLowerCase().includes('certified_b_corporation')
                                    ? 'Certified B-Corp'
                                    : url.includes('encrypted-tbn0.gstatic.com')
                                    ? 'FTSE 100'
                                    : 'Accolade';
                                  return (
                                    <Tooltip key={`${url}-${idx}`} title={label} placement="top">
                                      <img
                                        src={url}
                                        alt={label}
                                        style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                      />
                                    </Tooltip>
                                  );
                                })}
                              </Box>
                            ) : (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {isAccolades ? (
                                  (() => {
                                    const url = cell as string;
                                    const label = url.includes('s-and-p-500')
                                      ? "S&P 500"
                                      : url.toLowerCase().includes('certified_b_corporation')
                                      ? 'Certified B-Corp'
                                      : url.includes('encrypted-tbn0.gstatic.com')
                                      ? 'FTSE 100'
                                      : 'Accolade';
                                    return (
                                      <Tooltip title={label} placement="top">
                                        <img
                                          src={url}
                                          alt={label}
                                          style={{ width: '40px', height: '40px', objectFit: 'contain' }}
                                          onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                          }}
                                        />
                                      </Tooltip>
                                    );
                                  })()
                                ) : isSlogan ? (
                                  cell ? (
                                    <Tooltip title={cell.toString()} placement="top">
                                      <CampaignIcon color="primary" />
                                    </Tooltip>
                                  ) : null
                                ) : (
                                  <img 
                                    src={cell}
                                    alt={'Logo'}
                                    style={{ maxWidth: '40px', maxHeight: '40px', objectFit: 'contain' }}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                  />
                                )}
                              </Box>
                            )
                          ) : isSlogan ? (
                            cell ? (
                              <Tooltip title={cell.toString()} placement="top">
                                <CampaignIcon color="primary" />
                              </Tooltip>
                            ) : null
                          ) : isLocation && typeof cell === 'object' ? (
                            <Box>
                              <Typography variant="body2">{cell.city}</Typography>
                              <Typography variant="caption" color="textSecondary">{cell.state}</Typography>
                            </Box>
                          ) : isSector && cell ? (
                            <Typography variant="body2">
                              {typeof cell === 'object'
                                ? cell.sector || cell.industry || ''
                                : cell.toString()}
                            </Typography>
                          ) : isIndustry && cell ? (
                            (() => {
                              if (typeof cell !== 'object') {
                                return <Typography variant="body2">{cell.toString()}</Typography>;
                              }
                              const getField = (obj: any, key: string) => {
                                const found = Object.keys(obj).find(k => k.toLowerCase() === key.toLowerCase());
                                return found ? obj[found] : undefined;
                              };
                              const main = getField(cell, 'sector') ?? getField(cell, 'industry');
                              const sub = getField(cell, 'subSector') ?? getField(cell, 'subIndustry');
                              return (
                                <Box>
                                  <Typography variant="body2">{main || ''}</Typography>
                                  {sub ? (
                                    <Typography variant="caption" color="textSecondary">
                                      {sub}
                                    </Typography>
                                  ) : null}
                                </Box>
                              );
                            })()
                          ) : isUrl && cell ? (
                            <IconButton
                              size="small"
                              href={cell.startsWith('http') ? cell : `https://${cell}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              {header.includes('linkedin') ? (
                                <LinkedInIcon color="primary" />
                              ) : (
                                <OpenInNewIcon />
                              )}
                            </IconButton>
                          ) : (
                            cell || ''
                          )}
                        </TableCell>
                      );
                    })}
                    {showPaletteColumn && (
                      <TableCell align="center" sx={{ whiteSpace: 'nowrap' }}>
                        {(() => {
                          const logoUrl = row[logoColumnIndex];
                          const colors =
                            (typeof logoUrl === 'string' && paletteCache[logoUrl]) || [];
                          const swatches = sortColorsLightToDark(colors);
                          while (swatches.length < MAX_PALETTE_COLORS) {
                            swatches.push('#ffffff');
                          }
                          if (!swatches.length) return '';
                          return (
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.5 }}>
                              {swatches.slice(0, MAX_PALETTE_COLORS).map((color, idx) => (
                                <Box
                                  key={`${color}-${idx}`}
                                  sx={{
                                    width: 18,
                                    height: 18,
                                    borderRadius: 0.5,
                                    backgroundColor: color,
                                    border: '1px solid rgba(0,0,0,0.1)'
                                  }}
                                />
                              ))}
                            </Box>
                          );
                        })()}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length || 1} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="textSecondary">
                      {headers.length === 0 ? 'Loading...' : 'No data found.'}
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={sortedAndFilteredRows.length}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[rowsPerPage]}
        />
      </Paper>
      )}
    </Box>

      <Dialog open={filterOpen} onClose={() => setFilterOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Filters</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
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
                <TextField {...params} label="Country" placeholder="Search country" />
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
                <TextField {...params} label="Sector" placeholder="Search sector" />
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
                <TextField {...params} label="Industry" placeholder="Search industry" />
              )}
            />
            <Autocomplete
              multiple
              options={filterOptions.accolades}
              value={filters.accolades}
              onChange={(_, value) => setFilters(prev => ({ ...prev, accolades: value }))}
              renderTags={(value, getTagProps) =>
                value.map((option, index) => (
                  <Chip label={option} {...getTagProps({ index })} />
                ))
              }
              renderInput={(params) => (
                <TextField {...params} label="Accolades" placeholder="Select accolade(s)" />
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
                <TextField {...params} label="Number of employees" placeholder="Search" />
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
                <TextField {...params} label="Founded year" placeholder="Search" />
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
                <TextField {...params} label="Revenue range" placeholder="Search" />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setFilters({ country: [], employees: [], foundedYear: [], revenueRange: [], sector: [], industry: [], accolades: [] })
            }
          >
            Clear
          </Button>
          <Button onClick={() => setFilterOpen(false)} variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CompanyDirectory;
