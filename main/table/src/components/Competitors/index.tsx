import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActionArea,
  Tooltip,
  Link,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Button,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import LanguageIcon from '@mui/icons-material/Language';

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
  subIndustry: string;
  description: string;
  slogan: string;
  website: string;
  linkedin: string;
}

interface CompetitorCategory {
  name: string;
  description?: string;
  subcategories: {
    name: string;
    companies: Company[];
    glowColor: string;
  }[];
}

interface CompetitorCategories {
  goliaths: CompetitorCategory;
  challengers: CompetitorCategory;
  emergents: CompetitorCategory;
  indirectCompetitors: CompetitorCategory;
}

const Competitors: React.FC<{
  headers: string[];
  rows: any[][];
  selectedCompany: Company | null;
  onCompanySelect?: (company: Company) => void;
}> = ({ headers, rows, selectedCompany, onCompanySelect }) => {
  const theme = useTheme();
  const [hoveredCompany, setHoveredCompany] = useState<Company | null>(null);
  const [clickedCompetitor, setClickedCompetitor] = useState<Company | null>(null);
  
  // Graph state
  const [xAxisMetric, setXAxisMetric] = useState('employees');
  const [yAxisMetric, setYAxisMetric] = useState('revenue');
  const [selectedType, setSelectedType] = useState('goliaths');
  const [expandedPositions, setExpandedPositions] = useState<Set<string>>(new Set());
  const [selectedExpandedGroup, setSelectedExpandedGroup] = useState<string | null>(null);
  const [selectedGroupForDisplay, setSelectedGroupForDisplay] = useState<any[]>([]);

  // Helper functions to get column indices
  const getColumnIndex = (columnName: string) =>
    headers.findIndex(h => h.toLowerCase() === columnName.toLowerCase());

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

  // Parse company data from row
  const parseCompany = (row: any[]): Company => {
    const getFieldValue = (index: number) =>
      index !== -1 ? (row[index] || '').toString() : '';

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

  // Get revenue rank for categorization
  const getRevenueCategory = (revenue: string): 'goliath' | 'challenger' | 'emergent' => {
    const revenueLower = revenue.toLowerCase();
    if (revenueLower.includes('$1b') || revenueLower.includes('$10b') || revenueLower.includes('b+')) {
      return 'goliath';
    } else if (revenueLower.includes('$100m') || revenueLower.includes('$500m') || revenueLower.includes('$1b')) {
      return 'challenger';
    } else {
      return 'emergent';
    }
  };

  // Categorize competitors based on selected company
  const competitorCategories: CompetitorCategories | null = useMemo(() => {
    if (!selectedCompany) return null;

    const activity = selectedCompany.activity;
    const selectedCountry = selectedCompany.country;
    const selectedRegion = selectedCompany.region;
    const selectedRevenueCategory = getRevenueCategory(selectedCompany.revenue);

    // Get all companies with same activity (including selected company)
    const sameActivityCompanies = rows
      .filter(row => {
        const company = parseCompany(row);
        return company.activity === activity;
      })
      .map(parseCompany);

    // Categorize by revenue and geography
    const categorizeCompanies = (companies: Company[], category: 'goliath' | 'challenger' | 'emergent') => {
      // Filter companies by revenue category
      const categoryCompanies = companies.filter(company =>
        getRevenueCategory(company.revenue) === category
      );

      // Filter out the selected company from all categories
      const filteredCompanies = categoryCompanies.filter(company => company.name !== selectedCompany?.name);

      // Separate by geography
      const sameNation = filteredCompanies.filter(c => c.country === selectedCompany?.country);
      const sameRegion = filteredCompanies.filter(c =>
        c.region === selectedCompany?.region && c.country !== selectedCompany?.country
      );
      const international = filteredCompanies.filter(c =>
        c.region !== selectedCompany?.region && c.country !== selectedCompany?.country
      );

      // Combine all companies and limit to 25 total
      const allCompanies = [...sameNation, ...sameRegion, ...international];
      const limitedCompanies = allCompanies.slice(0, 25);

      // Add selected company only if it fits this revenue category
      const finalCompanies = selectedCompany && getRevenueCategory(selectedCompany.revenue) === category 
        ? [selectedCompany, ...limitedCompanies.slice(0, 24)] // Total 25 including selected company
        : limitedCompanies.slice(0, 25); // 25 without selected company

      return [
        {
          name: '',
          companies: finalCompanies,
          glowColor: '#2196f3' // Blue for selected company
        }
      ];
    };

    // Get indirect competitors (same sub-industry)
    const getIndirectCompetitors = (): { companies: Company[]; subIndustry: string } => {
      console.log('Available headers:', headers);
      console.log('Industry index:', getColumnIndex('industry'));
      
      // Extract sub-industry from selected company
      const industryIdx = getColumnIndex('industry');
      if (industryIdx === -1) {
        console.log('No industry column found');
        return { companies: [], subIndustry: '' };
      }
      
      const industryData = selectedCompany.row[industryIdx];
      let selectedSubIndustry = '';
      
      if (industryData && typeof industryData === 'object') {
        selectedSubIndustry = (industryData.subIndustry ?? industryData.subSector ?? '').toString();
      } else if (industryData) {
        // If it's a string, try to parse the third item from the chain
        const parts = industryData.toString().split(' > ');
        selectedSubIndustry = parts.length >= 3 ? parts[2].trim() : '';
      }
      
      console.log('Selected company sub-industry:', selectedSubIndustry);
      
      if (!selectedSubIndustry) {
        console.log('No sub-industry data available');
        return { companies: [], subIndustry: '' };
      }
      
      const selectedRevenue = selectedCompany.revenue;
      console.log('Looking for companies with sub-industry:', selectedSubIndustry);
      
      // Get companies with same sub-industry but DIFFERENT activity
      let indirectCompetitors = rows
        .map(parseCompany)
        .filter((company: Company) => {
          if (company.name === selectedCompany.name) return false;
          
          // Must have different activity (this is the key fix)
          if (company.activity === selectedCompany.activity) return false;
          
          const companyIndustryData = company.row[industryIdx];
          let companySubIndustry = '';
          
          if (companyIndustryData && typeof companyIndustryData === 'object') {
            companySubIndustry = (companyIndustryData.subIndustry ?? companyIndustryData.subSector ?? '').toString();
          } else if (companyIndustryData) {
            const parts = companyIndustryData.toString().split(' > ');
            companySubIndustry = parts.length >= 3 ? parts[2].trim() : '';
          }
          
          return companySubIndustry === selectedSubIndustry;
        });
      
      console.log('Found companies with same sub-industry:', indirectCompetitors.length);
      
      // Filter by same revenue first, then expand if needed
      const sameRevenue = indirectCompetitors.filter((c: Company) => c.revenue === selectedRevenue);
      const otherRevenue = indirectCompetitors.filter((c: Company) => c.revenue !== selectedRevenue);
      
      let finalCompetitors = [...sameRevenue, ...otherRevenue].slice(0, 25);
      
      console.log('Total indirect competitors:', finalCompetitors.length);
      return { companies: finalCompetitors, subIndustry: selectedSubIndustry };
    };

    const indirectCompetitorsData = getIndirectCompetitors();

    return {
      goliaths: {
        name: 'Goliaths',
        description: 'Industry leaders with revenue exceeding $1B.',
        subcategories: categorizeCompanies(sameActivityCompanies, 'goliath')
      },
      challengers: {
        name: 'Challengers',
        description: 'Ambitious companies with revenue between $100M - $1B, poised for growth.',
        subcategories: categorizeCompanies(sameActivityCompanies, 'challenger')
      },
      emergents: {
        name: 'Emergents',
        description: 'Innovative startups and growing businesses with revenue under $100M.',
        subcategories: categorizeCompanies(sameActivityCompanies, 'emergent')
      },
      indirectCompetitors: {
        name: 'Indirect Competitors',
        description: 'Companies operating in the same sub-industry, offering consumers with a broader range of choices and solutions.',
        subcategories: [
          {
            name: '',
            companies: (() => {
              const indirectCompanies = indirectCompetitorsData?.companies || [];
              if (indirectCompanies.length === 0) return [];
              
              // Separate by geography and order: Same Nation -> Same Region -> International
              const sameNation = indirectCompanies.filter(c => c.country === selectedCompany?.country);
              const sameRegion = indirectCompanies.filter(c =>
                c.region === selectedCompany?.region && c.country !== selectedCompany?.country
              );
              const international = indirectCompanies.filter(c =>
                c.region !== selectedCompany?.region && c.country !== selectedCompany?.country
              );

              // Combine in the correct order and limit to 25 total
              const allCompanies = [...sameNation, ...sameRegion, ...international];
              return allCompanies.slice(0, 25);
            })(),
            glowColor: '#9c27b0' // Purple for indirect competitors
          }
        ]
      }
    };
  }, [selectedCompany, rows]);

  // Helper function to get dynamic year range
  const getYearRange = () => {
    // Get all companies from current competitor categories
    let allCompanies: Company[] = [];
    
    if (competitorCategories) {
      if (selectedType === 'goliaths' && competitorCategories.goliaths?.subcategories[0]) {
        allCompanies.push(...competitorCategories.goliaths.subcategories[0].companies);
      } else if (selectedType === 'challengers' && competitorCategories.challengers?.subcategories[0]) {
        allCompanies.push(...competitorCategories.challengers.subcategories[0].companies);
      } else if (selectedType === 'emergents' && competitorCategories.emergents?.subcategories[0]) {
        allCompanies.push(...competitorCategories.emergents.subcategories[0].companies);
      } else if (selectedType === 'indirect' && competitorCategories.indirectCompetitors?.subcategories[0]) {
        allCompanies.push(...competitorCategories.indirectCompetitors.subcategories[0].companies);
      }
    }
    
    const allYears = allCompanies
      .map((c: Company) => parseInt(c.founded))
      .filter((y: number) => !isNaN(y) && y > 0);
    
    if (allYears.length === 0) {
      return { minYear: 1800, maxYear: new Date().getFullYear() };
    }
    
    const minYear = Math.min(...allYears);
    const maxYear = Math.max(new Date().getFullYear(), ...allYears);
    return { minYear, maxYear };
  };

  // Process data for graph
  const graphData = useMemo(() => {
    if (!competitorCategories) return [];

    const allCompanies: Company[] = [];
    
    // Collect companies based on selected type
    if (selectedType === 'goliaths') {
      if (competitorCategories.goliaths?.subcategories[0]) {
        allCompanies.push(...competitorCategories.goliaths.subcategories[0].companies);
      }
    } else if (selectedType === 'challengers') {
      if (competitorCategories.challengers?.subcategories[0]) {
        allCompanies.push(...competitorCategories.challengers.subcategories[0].companies);
      }
    } else if (selectedType === 'emergents') {
      if (competitorCategories.emergents?.subcategories[0]) {
        allCompanies.push(...competitorCategories.emergents.subcategories[0].companies);
      }
    } else if (selectedType === 'indirect') {
      if (competitorCategories.indirectCompetitors?.subcategories[0]) {
        allCompanies.push(...competitorCategories.indirectCompetitors.subcategories[0].companies);
      }
    }

    // Helper functions to normalize values
    const normalizeEmployees = (employees: string): number => {
      if (!employees) return 0;
      const empRanges = ['1-10', '11-50', '51-100', '101-250', '251-500', '501-1000', '1001-5000', '5001-10000', '10001+'];
      const index = empRanges.findIndex(range => employees.includes(range.replace('+', '')));
      return index === -1 ? 0 : (index + 1) / empRanges.length;
    };

    const normalizeRevenue = (revenue: string): number => {
      if (!revenue) return 0;
      const revRanges = ['Less than $1M', '$1M to $10M', '$10M to $50M', '$50M to $100M', '$100M to $500M', '$500M to $1B', '$1B to $10B', '$10B+'];
      const index = revRanges.findIndex(range => revenue.includes(range.replace('$', '').replace('+', '')));
      return index === -1 ? 0 : (index + 1) / revRanges.length;
    };

    const normalizeFounded = (founded: string): number => {
      if (!founded) return 0;
      const year = parseInt(founded);
      if (isNaN(year)) return 0;
      
      const { minYear, maxYear } = getYearRange();
      return (year - minYear) / (maxYear - minYear);
    };

    const normalizeBizgrid = (bizgrid: string): number => {
      if (!bizgrid) return 0;
      const score = parseFloat(bizgrid);
      if (isNaN(score)) return 0;
      return Math.min(score / 100, 1); // Assuming max score is 100
    };

    const getMetricValue = (company: Company, metric: string): number => {
      switch (metric) {
        case 'employees': return normalizeEmployees(company.employees);
        case 'revenue': return normalizeRevenue(company.revenue);
        case 'founded': return normalizeFounded(company.founded);
        case 'bizgridScore': return normalizeBizgrid(company.bizgridScore);
        default: return 0;
      }
    };

    // Get border color based on geographic relationship
    const getBorderColor = (company: Company): string => {
      if (company.name === selectedCompany?.name) return '#2196f3'; // Blue for selected company
      
      const isSameNation = company.country === selectedCompany?.country && company.region === selectedCompany?.region;
      const isSameRegion = company.region === selectedCompany?.region && !isSameNation;
      
      if (isSameNation) return '#4caf50'; // Green for same nation
      if (isSameRegion) return '#ff9800'; // Orange for same region
      return '#9c27b0'; // Purple for international
    };

    // Transform data for graph with grouping for overlapping companies
    const processedData: any[] = [];
    const positionMap = new Map<string, any[]>();
    
    allCompanies.forEach((company, index) => {
      const baseX = 80 + getMetricValue(company, xAxisMetric) * 670;
      const baseY = 450 - getMetricValue(company, yAxisMetric) * 400;
      
      // Create a key for the position (rounded to nearest 10 to group nearby positions)
      const posKey = `${Math.round(baseX/10)*10}-${Math.round(baseY/10)*10}`;
      
      if (!positionMap.has(posKey)) {
        positionMap.set(posKey, []);
      }
      positionMap.get(posKey)!.push({
        ...company,
        originalX: baseX,
        originalY: baseY,
        borderColor: getBorderColor(company)
      });
    });
    
    // Convert grouped data to display format
    positionMap.forEach((companies, posKey) => {
      const [x, y] = posKey.split('-').map(Number);
      const isExpanded = expandedPositions.has(posKey);
      const isSelectedForDisplay = selectedExpandedGroup === posKey;
      
      if (companies.length === 1) {
        // Single company - display normally
        processedData.push({
          ...companies[0],
          x: companies[0].originalX,
          y: companies[0].originalY,
          count: 1,
          posKey,
          isExpanded: false
        });
      } else {
        // Always show the original grouped circle in the graph
        processedData.push({
          ...companies[0], // Use first company for display
          x: companies[0].originalX,
          y: companies[0].originalY,
          count: companies.length,
          posKey,
          isExpanded: false,
          allCompanies: companies
        });
        
        // Additionally, show expanded companies on the left if selected
        if (isExpanded && isSelectedForDisplay) {
          companies.forEach((company, index) => {
            processedData.push({
              ...company,
              x: -200, // Fixed X position on the far left, outside the graph
              y: 50 + (index * 30), // Stack vertically with 30px spacing, starting higher
              count: 1, // Each company is individual when expanded
              posKey,
              isExpanded: true,
              indexInGroup: index
            });
          });
        }
      }
    });
    
    return processedData;
  }, [competitorCategories, selectedType, xAxisMetric, yAxisMetric, expandedPositions, selectedExpandedGroup]);

  // Helper function to get axis labels from normalized values
  const getAxisLabel = (metric: string, normalizedValue: number): string => {
    switch (metric) {
      case 'employees': {
        const empRanges = ['1-10', '11-50', '51-100', '101-250', '251-500', '501-1000', '1001-5000', '5001-10000', '10001+'];
        const index = Math.round(normalizedValue * (empRanges.length - 1));
        return empRanges[Math.min(index, empRanges.length - 1)];
      }
      case 'revenue': {
        const revRanges = ['<$1M', '$1M-$10M', '$10M-$50M', '$50M-$100M', '$100M-$500M', '$500M-$1B', '$1B-$10B', '$10B+'];
        const index = Math.round(normalizedValue * (revRanges.length - 1));
        return revRanges[Math.min(index, revRanges.length - 1)];
      }
      case 'founded': {
        const { minYear, maxYear } = getYearRange();
        const year = Math.round(minYear + normalizedValue * (maxYear - minYear));
        return year.toString();
      }
      case 'bizgridScore': {
        const score = Math.round(normalizedValue * 100);
        return score.toString();
      }
      default:
        return '0';
    }
  };

  // Handle company selection from grid
  const handleCompanySelect = (company: Company) => {
    setHoveredCompany(company);
    setClickedCompetitor(company); // Update the clicked competitor state
    // Call onCompanySelect to update the second company details card
    if (onCompanySelect) {
      onCompanySelect(company);
    }
  };

  // Handle expanding/collapsing company groups
  const handleGroupClick = (posKey: string) => {
    setExpandedPositions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(posKey)) {
        newSet.delete(posKey);
        // If this was the selected group, clear selection
        if (selectedExpandedGroup === posKey) {
          setSelectedExpandedGroup(null);
        }
      } else {
        newSet.add(posKey);
        // Set this as the selected group for display
        setSelectedExpandedGroup(posKey);
      }
      return newSet;
    });
  };

  // If no company is selected, show prompt
  if (!selectedCompany) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.secondary', mb: 2 }}>
          No Company Selected
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please select a company from the Main Directory and click "Competitor Analysis" to view competitors.
        </Typography>
      </Box>
    );
  }

  // Main competitors analysis page
  return (
    <Box>
      {/* Competitors Grid */}
      {competitorCategories && (
        <Box>
          {/* Market Segments Container */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid rgba(0,0,0,0.12)', mb: 3 }}>
            <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.9rem' }}>
                  Market Segments
                </Typography>
                <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                  Companies categorized by revenue size and geographic proximity
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" sx={{ fontSize: '0.9rem', fontWeight: 600 }}>Legend:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#2196f3', border: '1px solid #2196f3' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Selected</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#4caf50', border: '1px solid #4caf50' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Same Nation</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#ff9800', border: '1px solid #ff9800' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>Same Region</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#9c27b0', border: '1px solid #9c27b0' }} />
                    <Typography variant="body2" sx={{ fontSize: '0.9rem' }}>International</Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Grid container spacing={3}>
              {Object.entries(competitorCategories).map(([categoryKey, category]) => (
                <Grid item xs={12} md={3} key={categoryKey}>
                  <Box sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    backgroundColor: 'rgba(0,0,0,0.02)', 
                    border: '1px solid rgba(0,0,0,0.08)',
                    height: '100%',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      borderColor: 'rgba(0,0,0,0.12)'
                    }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {categoryKey === 'goliaths' && 'Revenue: $1B+'}
                        {categoryKey === 'challengers' && 'Revenue: $100M - $1B'}
                        {categoryKey === 'emergents' && 'Revenue: <$100M'}
                        {categoryKey === 'indirectCompetitors' && 'Same Sub-Industry'}
                      </Typography>
                    </Box>
                    {category.description && (
                      <Typography variant="body2" sx={{ fontSize: '0.8rem', color: 'text.secondary', mb: 1, fontStyle: 'italic' }}>
                        {category.description}
                      </Typography>
                    )}

              <Grid container spacing={2}>
                {category.subcategories.map((subcategory: any, subIndex: number) => (
                  <Grid item xs={12} md={12} key={subIndex}>
                    <Typography variant="h6" sx={{ mb: 0.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1, fontSize: '0.95rem' }}>
                      {subcategory.name}
                    </Typography>
                    <Grid container spacing={1}>
                      {subcategory.companies.map((company: Company, companyIndex: number) => {
                        // Determine glow color based on company type
                        const isSameNation = company.country === selectedCompany?.country && company.region === selectedCompany?.region;
                        const isSameRegion = company.region === selectedCompany?.region && !isSameNation;
                        const isInternational = !isSameNation && !isSameRegion;
                        
                        const glowColor = company.name === selectedCompany?.name 
                          ? '#2196f3' // Blue for selected company
                          : isSameNation
                            ? '#4caf50' // Green for same nation
                            : isSameRegion
                              ? '#ff9800' // Orange for same region
                              : '#9c27b0'; // Purple for international
                        const borderColor = company.name === selectedCompany?.name 
                          ? '#2196f3' // Blue for selected company
                          : isSameNation
                            ? '#4caf50' // Green for same nation
                            : isSameRegion
                              ? '#ff9800' // Orange for same region
                              : '#9c27b0'; // Purple for international

                        return (
                          <Grid item key={companyIndex}>
                            <Tooltip title={company.name} arrow>
                              <Card
                                elevation={company.name === selectedCompany?.name ? 6 : 2}
                                sx={{
                                  width: 48,
                                  height: 48,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  cursor: 'pointer',
                                  transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
                                  border: company.name === selectedCompany?.name ? '3px solid' : '2px solid',
                                  borderColor: borderColor,
                                  backgroundColor: company.name === selectedCompany?.name ? 'rgba(33, 150, 243, 0.1)' : 'white',
                                  borderRadius: 2,
                                  boxShadow: company.name === selectedCompany?.name
                                    ? `0 0 12px rgba(33, 150, 243, 0.6)`
                                    : `0 0 8px ${glowColor}40`,
                                  '&:hover': {
                                    transform: 'translateY(-2px)',
                                    boxShadow: company.name === selectedCompany?.name
                                      ? `0 0 16px rgba(33, 150, 243, 0.8)`
                                      : `0 0 12px ${glowColor}60`,
                                  }
                                }}
                                onClick={company.name === selectedCompany?.name ? undefined : () => handleCompanySelect(company)}
                              >
                                <CardActionArea sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  {company.logo ? (
                                    <img src={company.logo} alt={company.name} style={{ maxWidth: '100%', maxHeight: '80%', objectFit: 'contain' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                  ) : (
                                    <Typography variant="caption" color="textSecondary" sx={{ px: 1, textAlign: 'center' }}>{company.name || 'No logo'}</Typography>
                                  )}
                                </CardActionArea>
                              </Card>
                            </Tooltip>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                ))}
              </Grid>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Box>
      )}

      {/* Competitor Analysis Graph */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={9}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 2, backgroundColor: 'background.paper', border: '1px solid rgba(0,0,0,0.12)', mb: 3 }}>
        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', fontSize: '0.9rem' }}>
              Competitor Analysis Graph
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
              Visualize competitors across different metrics
            </Typography>
          </Box>
          
          {/* Company List Display - Almanac Style - Absolute Position */}
          {selectedGroupForDisplay.length >= 1 && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 250,
                maxHeight: 200,
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                overflowY: 'auto',
                zIndex: 1
              }}
            >
              <Box sx={{ p: 1.5, backgroundColor: '#f5f5f5', borderBottom: '1px solid #e0e0e0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '0.85rem' }}>
                  {selectedGroupForDisplay.length} Companies
                </Typography>
                <Button 
                  size="small" 
                  onClick={() => setSelectedGroupForDisplay([])}
                  sx={{ fontSize: '0.7rem', minWidth: 'auto', padding: '2px 6px' }}
                >
                  Close
                </Button>
              </Box>
              <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                {selectedGroupForDisplay.map((company: Company, index: number) => (
                  <Box
                    key={company.name}
                    sx={{
                      p: 1,
                      borderBottom: '1px solid #f0f0f0',
                      '&:hover': { backgroundColor: '#f9f9f9' },
                      cursor: 'pointer'
                    }}
                    onClick={() => handleCompanySelect(company)}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {company.logo && (
                        <img 
                          src={company.logo} 
                          alt={company.name} 
                          style={{ width: 20, height: 20, objectFit: 'contain' }}
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}
                      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                        {company.name}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

        {/* Graph Controls */}
        <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>X-Axis</InputLabel>
            <Select
              value={xAxisMetric}
              label="X-Axis"
              onChange={(e) => setXAxisMetric(e.target.value)}
            >
              <MenuItem value="employees">Number of employees</MenuItem>
              <MenuItem value="revenue">Revenue range</MenuItem>
              <MenuItem value="founded">Founded year</MenuItem>
              <MenuItem value="bizgridScore">Bizgrid score</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Y-Axis</InputLabel>
            <Select
              value={yAxisMetric}
              label="Y-Axis"
              onChange={(e) => setYAxisMetric(e.target.value)}
            >
              <MenuItem value="employees">Number of employees</MenuItem>
              <MenuItem value="revenue">Revenue range</MenuItem>
              <MenuItem value="founded">Founded year</MenuItem>
              <MenuItem value="bizgridScore">Bizgrid score</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Competitor Type</InputLabel>
            <Select
              value={selectedType}
              label="Competitor Type"
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <MenuItem value="goliaths">Goliaths</MenuItem>
              <MenuItem value="challengers">Challengers</MenuItem>
              <MenuItem value="emergents">Emergents</MenuItem>
              <MenuItem value="indirect">Indirect</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Graph Container */}
        <Box sx={{ height: 500, position: 'relative', backgroundColor: '#fafafa', borderRadius: 1, border: '1px solid #e0e0e0' }}>

          <svg width="100%" height="100%" viewBox="0 0 800 500">
            {/* Grid lines */}
            {[...Array(10)].map((_, i) => (
              <g key={`grid-${i}`}>
                <line
                  x1={80}
                  y1={50 + (i * 40)}
                  x2={750}
                  y2={50 + (i * 40)}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
                <line
                  x1={80 + (i * 67)}
                  y1={50}
                  x2={80 + (i * 67)}
                  y2={450}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              </g>
            ))}

            {/* Axes */}
            <line x1={80} y1={450} x2={750} y2={450} stroke="#333" strokeWidth="2" />
            <line x1={80} y1={50} x2={80} y2={450} stroke="#333" strokeWidth="2" />

            {/* X-axis labels */}
            {[...Array(11)].map((_, i) => {
              const value = getAxisLabel(xAxisMetric, i / 10);
              return (
                <text
                  key={`x-label-${i}`}
                  x={80 + (i * 67)}
                  y={470}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {value}
                </text>
              );
            })}

            {/* Y-axis labels */}
            {[...Array(11)].map((_, i) => {
              const value = getAxisLabel(yAxisMetric, 1 - (i / 10));
              return (
                <text
                  key={`y-label-${i}`}
                  x={65}
                  y={55 + (i * 40)}
                  textAnchor="end"
                  fontSize="10"
                  fill="#666"
                >
                  {value}
                </text>
              );
            })}

            {/* Axis labels */}
            <text x={400} y={490} textAnchor="middle" fontSize="14" fill="#333">
              {xAxisMetric === 'employees' ? 'Number of Employees' :
               xAxisMetric === 'revenue' ? 'Revenue Range' :
               xAxisMetric === 'founded' ? 'Founded Year' : 'Bizgrid Score'}
            </text>
            <text x="-25" y="250" textAnchor="middle" fontSize="14" fill="#333" transform="rotate(-90 -25 250)">
              {yAxisMetric === 'employees' ? 'Number of Employees' :
               yAxisMetric === 'revenue' ? 'Revenue Range' :
               yAxisMetric === 'founded' ? 'Founded Year' : 'Bizgrid Score'}
            </text>

            {/* Data points */}
            {graphData.map((company: any, index: number) => (
              <g key={`company-${index}`} style={{ cursor: ((company.count > 1 && !company.isExpanded) || company.isExpanded || company.count === 1) ? 'pointer' : 'default' }}>
                <circle
                  cx={company.x}
                  cy={company.y}
                  r="20"
                  fill="white"
                  stroke={company.borderColor}
                  strokeWidth="2"
                  style={{ cursor: ((company.count > 1 && !company.isExpanded) || company.isExpanded || company.count === 1) ? 'pointer' : 'default' }}
                  onClick={() => {
                    if ((company.count > 1 && !company.isExpanded) || company.isExpanded) {
                      handleGroupClick(company.posKey);
                      // Set the group for display in the top right
                      if (company.allCompanies && company.allCompanies.length > 1) {
                        setSelectedGroupForDisplay(company.allCompanies);
                      } else {
                        setSelectedGroupForDisplay([]);
                      }
                    } else if (company.count === 1) {
                      // Handle single company click - show dropdown with just this company
                      setSelectedGroupForDisplay([company]);
                    }
                  }}
                  onMouseOver={(e) => {
                    const circle = e.currentTarget as SVGCircleElement;
                    circle.style.filter = 'brightness(0.9)';
                  }}
                  onMouseOut={(e) => {
                    const circle = e.currentTarget as SVGCircleElement;
                    circle.style.filter = 'brightness(1)';
                  }}
                />
                
                {/* Always show company logo */}
                <image
                  href={company.logo}
                  x={company.x - 15}
                  y={company.y - 15}
                  width="30"
                  height="30"
                  style={{ pointerEvents: 'none' }}
                  onError={(e) => {
                    (e.target as SVGImageElement).style.display = 'none';
                  }}
                />
                
                {/* Show count indicator only for collapsed groups */}
                {company.count > 1 && !company.isExpanded && (
                  <circle
                    cx={company.x + 15}
                    cy={company.y - 15}
                    r="8"
                    fill="#ff5722"
                    stroke="white"
                    strokeWidth="1"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
                {company.count > 1 && !company.isExpanded && (
                  <text
                    x={company.x + 15}
                    y={company.y - 11}
                    textAnchor="middle"
                    fontSize="8"
                    fontWeight="bold"
                    fill="white"
                    style={{ pointerEvents: 'none' }}
                  >
                    {company.count}
                  </text>
                )}
                
                <title>{company.count > 1 && !company.isExpanded ? `${company.count} companies - click to expand` : company.name}</title>
              </g>
            ))}
          </svg>
        </Box>
      </Paper>
        </Grid>
      </Grid>

    </Box>
  );
};

export default Competitors;
