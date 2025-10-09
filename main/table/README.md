# Company Directory

A modern, Tracxn-like company directory web application built with React and Material-UI.

## Features

- 📊 Clean, responsive table layout
- 🔍 Real-time search functionality
- 🔗 Direct links to company websites and LinkedIn profiles
- 📱 Mobile-friendly responsive design
- 🎨 Modern UI with Material-UI components

## Table Columns

The directory displays the following information for each company:

- **Company Name** - The official name of the company
- **City** - City where the company is located
- **Country** - Country of operation
- **Industry** - Primary industry sector
- **Founded** - Year the company was founded
- **Employees** - Number of employees
- **Revenue Range** - Estimated revenue range
- **Links** - Quick access to LinkedIn and company website

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Adding Company Data

To add companies to the directory, edit the `sampleCompanies` array in `src/components/CompanyDirectory/index.tsx`:

```typescript
const sampleCompanies: Company[] = [
  {
    id: 1,
    name: "Example Corp",
    city: "San Francisco",
    country: "USA",
    industry: "Technology",
    foundedDate: "2020",
    employeeCount: "50-100",
    revenueRange: "$1M-$5M",
    linkedinUrl: "https://linkedin.com/company/example",
    website: "https://example.com"
  },
  // Add more companies here
];
```

## Future Enhancements

- Backend API integration
- Add/Edit/Delete company functionality
- Advanced filtering and sorting
- Export to CSV/Excel
- Company detail pages
- Analytics dashboard

## Built With

- [React](https://reactjs.org/) - Frontend framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Material-UI](https://mui.com/) - UI component library
- [Material Icons](https://mui.com/material-ui/material-icons/) - Icon library

## License

This project is open source and available under the MIT License.
