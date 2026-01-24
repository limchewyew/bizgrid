import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  CardMedia,
  CircularProgress,
  Alert,
  Button,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Avatar,
  IconButton,
  Toolbar,
  AppBar,
  Checkbox,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  MailOutline as MailIcon,
  StarBorder as StarIcon,
  Archive as ArchiveIcon,
  Delete as DeleteIcon,
  MarkAsUnread as UnreadIcon,
  Label as LabelIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { fetchFromSpecificSheet } from '../../services/googleSheets';

interface NewsletterItem {
  date: string;
  title: string;
  content: string;
  image: string;
}

const Newsletter: React.FC = () => {
  const [newsletters, setNewsletters] = useState<NewsletterItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNewsletter, setSelectedNewsletter] = useState<NewsletterItem | null>(null);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadNewsletterData = async () => {
      try {
        setLoading(true);
        const data = await fetchFromSpecificSheet('Newsletter');
        
        if (!data || data.length === 0) {
          setError('No newsletter data found');
          return;
        }

        // Find column indices
        const headers = data[0];
        const dateIdx = headers.findIndex((h: string) => h.toLowerCase() === 'date');
        const titleIdx = headers.findIndex((h: string) => h.toLowerCase() === 'title');
        const contentIdx = headers.findIndex((h: string) => h.toLowerCase() === 'content');
        const imageIdx = headers.findIndex((h: string) => h.toLowerCase() === 'image');

        if (dateIdx === -1 || titleIdx === -1 || contentIdx === -1) {
          setError('Required columns not found in Newsletter sheet');
          return;
        }

        // Parse newsletter data
        const newsletterData: NewsletterItem[] = data.slice(1)
          .filter((row: any[]) => row.some(cell => cell !== null && cell !== ''))
          .map((row: any[]) => ({
            date: row[dateIdx] || '',
            title: row[titleIdx] || '',
            content: row[contentIdx] || '',
            image: row[imageIdx] || ''
          }))
          .filter((item: NewsletterItem) => item.title && item.content); // Only include items with title and content

        setNewsletters(newsletterData);
      } catch (err) {
        console.error('Error loading newsletter data:', err);
        setError('Failed to load newsletter data');
      } finally {
        setLoading(false);
      }
    };

    loadNewsletterData();
  }, []);

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      // Try to parse the date in different formats
      let date: Date;
      
      // If it's already a valid date string
      date = new Date(dateString);
      
      // If invalid, try common Google Sheets formats
      if (isNaN(date.getTime())) {
        // Try format: MM/DD/YYYY
        const mmddyyyy = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (mmddyyyy) {
          date = new Date(parseInt(mmddyyyy[3]), parseInt(mmddyyyy[1]) - 1, parseInt(mmddyyyy[2]));
        }
        // Try format: DD/MM/YYYY
        else {
          const ddmmyyyy = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
          if (ddmmyyyy) {
            date = new Date(parseInt(ddmmyyyy[3]), parseInt(ddmmyyyy[2]) - 1, parseInt(ddmmyyyy[1]));
          }
          // Try format: YYYY-MM-DD
          else {
            const yyyymmdd = dateString.match(/(\d{4})-(\d{1,2})-(\d{1,2})/);
            if (yyyymmdd) {
              date = new Date(parseInt(yyyymmdd[1]), parseInt(yyyymmdd[2]) - 1, parseInt(yyyymmdd[3]));
            }
          }
        }
      }
      
      // If still invalid, return the original string
      if (isNaN(date.getTime())) {
        return dateString;
      }
      
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'Today';
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays} days ago`;
      
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch {
      return dateString;
    }
  };

  const handleToggleCheck = (index: number) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(index)) {
      newChecked.delete(index);
    } else {
      newChecked.add(index);
    }
    setCheckedItems(newChecked);
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const renderFormattedText = (text: string) => {
    // Convert *text* to <strong>text</strong>
    const parts = text.split(/(\*[^*]+\*)/);
    return parts.map((part, index) => {
      if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
        return <strong key={index}>{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  // Filter newsletters based on search term
  const filteredNewsletters = newsletters.filter(newsletter =>
    newsletter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    newsletter.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Sidebar - Newsletter List */}
        <Paper sx={{ width: 400, borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column' }}>
          {/* Toolbar */}
          <Box sx={{ p: 1, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center' }}>
            <TextField
              size="small"
              placeholder="Search newsletters..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flex: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {/* Newsletter List */}
          <List sx={{ flex: 1, overflow: 'auto', p: 0 }}>
            {filteredNewsletters.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm ? 'No newsletters found matching your search' : '📭 No newsletters available'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {searchTerm ? 'Try different keywords' : 'Check back later for updates!'}
                </Typography>
              </Box>
            ) : (
              filteredNewsletters.map((newsletter, filteredIndex) => {
                // Find the original index for checkbox functionality
                const originalIndex = newsletters.findIndex(n => n === newsletter);
                return (
                <ListItem
                  key={originalIndex}
                  button
                  selected={selectedNewsletter === newsletter}
                  onClick={() => setSelectedNewsletter(newsletter)}
                  sx={{
                    borderBottom: '1px solid rgba(0,0,0,0.08)',
                    py: 1.5,
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)',
                      borderLeft: '3px solid #1976d2'
                    }
                  }}
                >
                  <ListItemIcon>
                    <Checkbox
                      size="small"
                      checked={checkedItems.has(originalIndex)}
                      onChange={() => handleToggleCheck(originalIndex)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </ListItemIcon>
                  <ListItemIcon>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <MailIcon />
                    </Avatar>
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {newsletter.title}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }}>
                          {renderFormattedText(truncateContent(newsletter.content))}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                          {formatDate(newsletter.date)}
                        </Typography>
                      </Box>
                    }
                  />
                  <IconButton size="small" onClick={(e) => e.stopPropagation()}>
                    <StarIcon fontSize="small" />
                  </IconButton>
                </ListItem>
                );
              })
            )}
          </List>
        </Paper>

        {/* Right Content - Selected Newsletter */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'background.paper' }}>
          {selectedNewsletter ? (
            <>
              {/* Email Header */}
              <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
                  {selectedNewsletter.title}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {formatDate(selectedNewsletter.date)}
                </Typography>
              </Box>

              {/* Email Content */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {/* Image at the top */}
                {selectedNewsletter.image && (
                  <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <img
                      src={selectedNewsletter.image}
                      alt={selectedNewsletter.title}
                      style={{
                        maxWidth: '100%',
                        height: 'auto',
                        maxHeight: '400px',
                        objectFit: 'contain',
                        borderRadius: '8px'
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </Box>
                )}

                {/* Content */}
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: 1.8,
                    color: 'text.primary',
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {renderFormattedText(selectedNewsletter.content)}
                </Typography>
              </Box>

            </>
          ) : (
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'text.secondary' }}>
              <Box sx={{ textAlign: 'center' }}>
                <MailIcon sx={{ fontSize: 64, mb: 2, opacity: 0.3 }} />
                <Typography variant="h6">
                  Select a newsletter to read
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  Choose from the list on the left
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Newsletter;
