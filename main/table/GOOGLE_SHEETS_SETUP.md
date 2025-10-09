# Google Sheets Integration Setup Guide

## Step 1: Create/Prepare Your Google Sheet

1. Open your Google Sheet in Google Drive
2. **The first row will be used as table headers** - you can name your columns anything you want!
3. Add your data starting from the second row

Example:
```
| Company Name | City | Country | Industry | Founded | Employees | Revenue Range | LinkedIn URL | Website |
|--------------|------|---------|----------|---------|-----------|---------------|--------------|---------|
| Acme Corp    | NYC  | USA     | Tech     | 2020    | 50-100    | $1M-$5M       | https://...  | acme.com|
```

**Note:** The table will automatically use your Google Sheet's first row as headers. Any column with "url", "website", or "linkedin" in the header name will be displayed as clickable link icons.

## Step 2: Make Your Sheet Publicly Accessible

1. Click the **Share** button in the top right
2. Click **"Change to anyone with the link"**
3. Set permission to **"Viewer"**
4. Click **Done**

## Step 3: Get Your Sheet ID

1. Look at your Google Sheet URL:
   ```
   https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit
   ```
2. Copy the ID between `/d/` and `/edit`:
   ```
   1a2b3c4d5e6f7g8h9i0j
   ```

## Step 4: Get Google Sheets API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Click **"Enable APIs and Services"**
4. Search for **"Google Sheets API"**
5. Click **Enable**
6. Go to **Credentials** → **Create Credentials** → **API Key**
7. Copy the API key
8. (Optional but recommended) Click **Edit API Key** → **API restrictions** → Select **"Google Sheets API"**

## Step 5: Configure Your App

1. Open the `.env` file in your project root
2. Replace the placeholder values:
   ```
   REACT_APP_GOOGLE_API_KEY=AIzaSyC-your-actual-api-key-here
   REACT_APP_SHEET_ID=1a2b3c4d5e6f7g8h9i0j
   REACT_APP_SHEET_NAME=Sheet1
   ```
   
   **Note:** If your sheet tab has a different name (not "Sheet1"), update `REACT_APP_SHEET_NAME` accordingly.

## Step 6: Restart Your App

1. Stop your development server (Ctrl+C)
2. Run `npm start` again
3. The app will automatically load data from your Google Sheet!

## Troubleshooting

### "Missing Google Sheets configuration" error
- Make sure you've set the API key and Sheet ID in the `.env` file
- Restart your development server after editing `.env`

### "Failed to load companies" error
- Check that your sheet is set to "Anyone with the link can view"
- Verify the Sheet ID is correct
- Make sure the Google Sheets API is enabled in your Google Cloud project
- Check the browser console for detailed error messages

### No data showing
- Verify your sheet has data (not just headers)
- Check that the sheet name matches `REACT_APP_SHEET_NAME`
- Make sure the first row contains your column headers

## Features

- **Auto-refresh**: Data loads automatically when the page loads
- **Manual refresh**: Click the "Refresh" button to reload data from Google Sheets
- **Search**: Use the search box to filter companies
- **Real-time**: Any changes you make to the Google Sheet will appear after clicking Refresh

## Security Note

For production use, consider:
- Using OAuth 2.0 instead of API keys
- Implementing a backend API to hide credentials
- Using environment-specific API keys
