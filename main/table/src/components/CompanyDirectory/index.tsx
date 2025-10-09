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
  Paper,
  Typography,
  InputAdornment,
  IconButton,
  Link,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import RefreshIcon from '@mui/icons-material/Refresh';
import { fetchDataFromSheet } from '../../services/googleSheets';

const CompanyDirectory: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [headers, setHeaders] = useState<string[]>([]);
  const [rows, setRows] = useState<any[][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchDataFromSheet();
      setHeaders(data.headers);
      setRows(data.rows);
    } catch (err: any) {
      setError(err.message || 'Failed to load data from Google Sheets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredRows = rows.filter(row =>
    row.some(
      cell =>
        cell &&
        cell.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
        <TableContainer sx={{ maxHeight: 'calc(100vh - 180px)' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {headers.map((header, index) => {
                  const isDescription = header.toLowerCase() === 'description';
                  return (
                    <TableCell 
                      key={index} 
                      align="center"
                      sx={isDescription ? { minWidth: '300px', maxWidth: '400px' } : {}}
                    >
                      {header}
                    </TableCell>
                  );
                })}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex} hover>
                    {row.map((cell, cellIndex) => {
                      const header = headers[cellIndex]?.toLowerCase() || '';
                      const isImage = header.includes('logo') || header.includes('image');
                      const isUrl = (header.includes('url') || header.includes('website') || header.includes('linkedin')) && !isImage;
                      const isLocation = header === 'location';
                      const isIndustry = header === 'industry';
                      const isDescription = header === 'description';
                      
                      return (
                        <TableCell 
                          key={cellIndex}
                          align="center"
                          sx={isDescription ? { minWidth: '300px', maxWidth: '400px', whiteSpace: 'normal', wordWrap: 'break-word' } : { whiteSpace: 'nowrap' }}
                        >
                          {isImage && cell ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img 
                                src={cell} 
                                alt="Logo" 
                                style={{ 
                                  maxWidth: '40px', 
                                  maxHeight: '40px', 
                                  objectFit: 'contain' 
                                }}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                }}
                              />
                            </Box>
                          ) : isLocation && typeof cell === 'object' ? (
                            <Box>
                              <Typography variant="body2">{cell.city}</Typography>
                              <Typography variant="caption" color="textSecondary">{cell.state}</Typography>
                            </Box>
                          ) : isIndustry && typeof cell === 'object' ? (
                            <Box>
                              <Typography variant="body2">{cell.industry}</Typography>
                              <Typography variant="caption" color="textSecondary">{cell.subIndustry}</Typography>
                            </Box>
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
      </Paper>
      )}
    </Box>
  );
};

export default CompanyDirectory;
