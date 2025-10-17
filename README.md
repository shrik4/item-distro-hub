# AgentFlow - Lead Distribution System

A modern frontend application for managing agents and distributing CSV leads efficiently. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

- **JWT Authentication** - Secure login/logout with token-based authentication
- **Agent Management** - Add, view, and manage sales agents
- **CSV Processing** - Upload and validate CSV files with client-side parsing
- **Smart Distribution** - Automatically distribute leads among 5 agents evenly
- **Search & Filter** - Find specific leads quickly with powerful search
- **Real-time Stats** - Dashboard showing key metrics and distribution status
- **Responsive Design** - Works beautifully on all screen sizes

## 📋 Prerequisites

- Node.js 18+ and npm
- Backend API running (see API Contract below)

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and set your backend API URL:
```
VITE_API_BASE_URL=http://localhost:5000
```

4. Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## 📁 Project Structure

```
src/
├── components/
│   ├── agents/          # Agent-related components
│   ├── csv/             # CSV upload and preview
│   ├── dashboard/       # Dashboard components
│   ├── layout/          # Navigation and layout
│   └── ui/              # Reusable UI components (shadcn)
├── lib/
│   ├── api.ts           # API client with error handling
│   └── auth.ts          # Authentication utilities
├── pages/
│   ├── Login.tsx        # Login page
│   ├── Dashboard.tsx    # Main dashboard
│   └── AgentDetail.tsx  # Agent's assigned list view
├── utils/
│   ├── distribute.ts    # Distribution algorithm + tests
│   └── csvValidator.ts  # CSV validation logic
└── index.css            # Global styles and design system
```

## 🎨 Design System

The application uses a professional design system with:
- **Primary Color**: Indigo/Blue (`hsl(239 84% 67%)`)
- **Semantic Tokens**: All colors defined in `index.css`
- **Animations**: Smooth transitions and fades
- **Components**: shadcn/ui for consistent, accessible UI

## 📊 CSV Format

Upload CSV files with these required columns (case-insensitive):
- `FirstName` - Lead's first name
- `Phone` - Phone number with country code
- `Notes` - Additional notes or comments

### Sample CSV

A sample CSV with 12 rows is provided at `public/sample.csv`:
```csv
FirstName,Phone,Notes
John Doe,+1-555-0101,Interested in premium plan
Jane Smith,+1-555-0102,Follow up next week
...
```

## 🔐 Authentication

The app uses JWT token authentication:
- Tokens stored in localStorage (⚠️ HttpOnly cookies recommended for production)
- Auto-redirect on 401 responses
- Token included in all API requests via `Authorization: Bearer <token>` header

**Demo Credentials:**
- Email: `admin@example.com`
- Password: `password123`

## 🔄 Distribution Algorithm

Leads are distributed evenly among 5 agents:

```typescript
// Example: 12 items, 5 agents
// Base: floor(12/5) = 2
// Remainder: 12 % 5 = 2
// Distribution: [3, 3, 2, 2, 2]
```

The algorithm is tested in `src/utils/distribute.ts`

## 🌐 API Contract

The frontend expects these backend endpoints:

### Authentication
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: { id, name, email } }
```

### Agents
```
GET /api/agents
Headers: Authorization: Bearer <token>
Response: [{ id, name, email, mobile, assignedCount }]

POST /api/agents
Headers: Authorization: Bearer <token>
Body: { name, email, mobile, password }
Response: { created agent }

GET /api/agents/:id/lists
Headers: Authorization: Bearer <token>
Response: { agentId, agentName, items: [...] }
```

### Distribution
```
POST /api/distribute
Headers: Authorization: Bearer <token>
Body: { items: [...], agentIds: [id1,id2,id3,id4,id5] }
Response: { distributed: [...], total }
```

## 🧪 Testing

Run tests for the distribution algorithm:
```bash
npm test
```

## 🏗️ Building for Production

```bash
npm run build
```

The optimized build will be in the `dist/` folder.

## ⚙️ Configuration

### File Size Limit
Maximum upload size is 5MB (configurable in `src/utils/csvValidator.ts`)

### Distribution Count
Currently fixed at 5 agents. Modify `handleDistribute` in `Dashboard.tsx` to change.

## 🔒 Security Notes

- **Token Storage**: Currently using localStorage. For production, implement HttpOnly cookies
- **Input Validation**: All forms use Zod schemas for validation
- **Error Handling**: Sensitive error details not exposed to users
- **CORS**: Backend must allow requests from frontend origin

## 🎯 Future Enhancements

- [ ] Bulk agent import
- [ ] Export distributed lists
- [ ] Email notifications
- [ ] Advanced filtering options
- [ ] Analytics dashboard
- [ ] Real-time updates via WebSockets

## 📝 License

This project is for demonstration purposes.

## 🤝 Contributing

This is a test project. For production use, ensure:
- Proper error logging
- HttpOnly cookie authentication
- Rate limiting
- Input sanitization
- Comprehensive testing
