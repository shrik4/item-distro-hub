# Item Distribution Hub Backend

Backend API for the Item Distribution Hub application, built with Express, MongoDB, and JWT authentication.

## Features

- User authentication with JWT
- Agent management (create, list, view assigned items)
- File upload (CSV/XLSX/XLS) with validation and parsing
- Item distribution algorithm to evenly distribute items among agents
- Secure API endpoints with authentication middleware

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository or copy the files to your project folder
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/item-distro-hub
   JWT_SECRET=your_secret_key_here
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=Admin@123
   MAX_UPLOAD_SIZE_BYTES=5242880
   ```

4. Seed the admin user:
   ```
   npm run seed
   ```

5. Start the server:
   ```
   npm start
   ```
   
   For development with auto-reload:
   ```
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email and password

### Agents
- `GET /api/agents` - List all agents with their assigned item counts
- `POST /api/agents` - Create a new agent
- `GET /api/agents/:id/lists` - Get items assigned to a specific agent

### Upload & Distribution
- `POST /api/upload` - Upload and distribute items (accepts CSV/XLSX/XLS files)
- `POST /api/distribute` - Re-distribute existing items among agents

## File Format Requirements

Uploaded files must be CSV, XLSX, or XLS format with the following headers:
- FirstName (required)
- Phone (required)
- Notes (required)

Headers are case-insensitive and can include variations like "first_name", "first name", "phone number", etc.

## Connecting with Frontend

This backend is designed to work with the Item Distribution Hub frontend. Make sure the frontend is configured to connect to this backend API at the correct URL (e.g., http://localhost:5000).

## License

MIT