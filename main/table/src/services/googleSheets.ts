import axios from 'axios';

const API_KEY = process.env.REACT_APP_GOOGLE_API_KEY;
const SHEET_ID = process.env.REACT_APP_SHEET_ID;
const SHEET_NAME = process.env.REACT_APP_SHEET_NAME || 'Sheet1';

// Define which columns to display and fetch
const ALLOWED_COLUMNS = [
  'Logo',
  'Company Name',
  'Country',
  'Region',
  'Description',
  'LinkedIn',
  'Website',
  'Number of employees',
  'Founded year',
  'Revenue range',
  'Sector',          // new: explicit sector column (e.g., column N)
  'Industry',
  'Sub-Industry',
  'S&P 500?',
  'Certified B-Corp?',
  'FTSE 100?',
  'AEX?',
  'Slogan',
  'Accolades',
  'Bizgrid Score',
  'Activity'
  // Note: Primary Business intentionally removed per latest requirements
];

// Define display columns (after combining Industry/Sub-Industry)
const DISPLAY_COLUMNS = [
  'Logo',
  'Company Name',
  'Country',
  'Region',
  'Description',
  'LinkedIn',
  'Website',
  'Number of employees',
  'Founded year',
  'Revenue range',
  'Sector',     // show sector as its own column
  'Industry',   // industry will keep showing industry/sub-industry combined
  'Slogan',
  'Accolades',
  'Bizgrid Score',
  'Activity'   // Add Activity column
];

export interface SheetData {
  headers: string[];
  rows: any[][];
  columnMap?: { [key: string]: number }; // Map of original column names to indices
  rowNumbers?: number[]; // Store original row numbers from the sheet
}

export const fetchDataFromSheet = async (): Promise<SheetData> => {
  if (!API_KEY || !SHEET_ID) {
    console.error('Missing Google Sheets configuration. Please set REACT_APP_GOOGLE_API_KEY and REACT_APP_SHEET_ID in .env file');
    return { headers: [], rows: [] };
  }

  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
    console.log('Fetching from URL:', url);
    const response = await axios.get(url);
    
    const rows = response.data.values;
    
    if (!rows || rows.length === 0) {
      console.log('No data found in the sheet');
      return { headers: [], rows: [] };
    }

    // First row is headers
    const allHeaders = rows[0];
    
    // Create a map of column names to indices
    const columnMap: { [key: string]: number } = {};
    ALLOWED_COLUMNS.forEach(allowedCol => {
      const index = allHeaders.findIndex((h: string) => 
        h.trim().toLowerCase() === allowedCol.toLowerCase()
      );
      if (index !== -1) {
        columnMap[allowedCol] = index;
      }
    });
    
    // Store row numbers (1-based index from the sheet, excluding header)
    const rowNumbers = Array.from({ length: rows.length - 1 }, (_, i) => i + 2);
    
    // Transform data rows to combine Industry/Sub-Industry
    const dataRows = rows.slice(1).map((row: any[], index: number) => {
      const transformedRow: any[] = [];
      
      // Add row number as the first column
      transformedRow.push(rowNumbers[index]);
      
      DISPLAY_COLUMNS.forEach(displayCol => {
        if (displayCol === 'Accolades') {
          // Read directly from the Accolades column
          const accolades = columnMap['Accolades'] !== undefined ? (row[columnMap['Accolades']] || '').toString() : '';
          transformedRow.push(accolades);
        } else if (displayCol === 'Industry') {
          // Combine Industry and Sub-Industry
          const industry = columnMap['Industry'] !== undefined ? row[columnMap['Industry']] || '' : '';
          const subIndustry = columnMap['Sub-Industry'] !== undefined ? row[columnMap['Sub-Industry']] || '' : '';
          transformedRow.push({ industry, subIndustry });
        } else {
          // Regular column
          const index = columnMap[displayCol];
          transformedRow.push(index !== undefined ? row[index] || '' : '');
        }
      });
      
      return transformedRow;
    });

    return { 
      headers: ['Row Number', ...DISPLAY_COLUMNS], // Row Number is now the first column
      rows: dataRows, 
      columnMap,
      rowNumbers 
    };
  } catch (error: any) {
    console.error('Error fetching data from Google Sheets:', error);
    
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.error?.message || '';
      
      if (status === 400) {
        throw new Error(`Bad Request (400): ${message}. Check that Google Sheets API is enabled and the API key is valid.`);
      } else if (status === 403) {
        throw new Error(`Access Denied (403): ${message}. Make sure the sheet is publicly accessible (Anyone with link can view).`);
      } else if (status === 404) {
        throw new Error(`Not Found (404): Sheet not found. Check your Sheet ID and Sheet Name.`);
      } else {
        throw new Error(`Error ${status}: ${message}`);
      }
    }
    
    throw error;
  }
};
