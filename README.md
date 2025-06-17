# WeSeg - Insurance Broker Management Platform

A comprehensive SaaS platform designed for solo insurance brokers, providing advanced pipeline management, client tracking, and business tools in Brazilian Portuguese.

## Features

- **Pipeline Management**: Drag-and-drop interface with color-coded stages (Contato, Negociação, Fechamento, Finalizado)
- **Lead Tracking**: Detailed customer cards with contact information, insurance types, and premium values
- **Contact Management**: Integrated email and WhatsApp communication tools
- **Document Management**: PDF attachment system with document type categorization
- **Dashboard Analytics**: Real-time metrics and performance insights
- **Responsive Design**: Desktop-first interface optimized for professional use

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Express.js + Node.js
- **Database**: In-memory storage (easily replaceable with PostgreSQL)
- **UI Components**: shadcn/ui + Tailwind CSS
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: TanStack Query (React Query)

## Prerequisites

Before running this application, ensure you have:

- Node.js 18+ installed on your system
- npm or yarn package manager

## Installation & Setup

1. **Clone the repository** (if applicable) or ensure all files are in your project directory

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Access the application**:
   - Open your browser and navigate to `http://localhost:5000`
   - The application will be running with hot reload enabled

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components (Dashboard, Pipeline, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   └── lib/            # Utilities and configurations
├── server/                 # Backend Express application
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage implementation
│   └── vite.ts            # Vite development setup
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Database schema and types
└── package.json           # Dependencies and scripts
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally

## Usage Guide

### Pipeline Management
1. Navigate to the Pipeline page using the sidebar
2. Use the search bar to filter leads by name, email, or insurance type
3. Drag cards between columns to update lead status
4. Click the circular plus (+) button in column headers to add new leads

### Adding New Leads
1. Click the plus button in any pipeline column
2. Fill in the required information:
   - Name
   - Email
   - Phone (optional)
   - Insurance type (Auto, Residencial, Vida, Empresarial)
   - Annual premium amount
3. Click "Criar Lead" to save

### Contact Management
1. Click the down arrow (⌄) on any customer card to expand contact options
2. Use the copy buttons to copy email addresses or phone numbers
3. Click WhatsApp icon to open WhatsApp with the customer's number
4. Contact information is displayed in a compact, easy-to-use format

### Document Attachment
1. Click the paperclip icon on any customer card
2. Select document type: Orçamento, Proposta, or Seguro
3. Choose a PDF file (maximum 25MB)
4. Click "Anexar" to attach the document

### Archiving Leads
1. Click the archive icon on any customer card
2. Confirm the action in the dialog that appears
3. Archived leads are removed from the active pipeline

## Customization

### Adding New Insurance Types
Update the insurance types in `shared/schema.ts` and the form options in the add lead dialog.

### Modifying Pipeline Stages
Edit the `statusColumns` array in `client/src/pages/pipeline.tsx` to customize pipeline stages.

### Changing Currency Format
The application uses Brazilian Real (BRL) formatting. Modify the `formatCurrency` function in `client/src/lib/utils.ts` to change currency settings.

## Data Storage

The application currently uses in-memory storage for simplicity. To implement persistent storage:

1. Set up a PostgreSQL database
2. Update the storage implementation in `server/storage.ts`
3. Configure database connection settings
4. Run database migrations if needed

## Environment Variables

No environment variables are required for basic functionality. For production deployment, consider adding:

- `NODE_ENV=production`
- Database connection strings
- API keys for external services

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

This is a complete SaaS platform ready for customization and deployment. The codebase follows modern React and TypeScript best practices with comprehensive error handling and user-friendly interfaces.

## License

[Add your license information here]