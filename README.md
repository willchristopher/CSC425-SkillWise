# SkillWise

An AI-powered tutoring and learning platform that helps students track progress, complete challenges, and receive personalized feedback.

## Team Members

- Will Christopher
- Zach Walters
- Emma Rowe
- Jackson Bradley

## Tech Stack

### Database
- **PostgreSQL** - Relational database for storing user data, goals, challenges, submissions, and feedback

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Middleware**
  - CORS - Cross-Origin Resource Sharing
  - Body Parser - Request body parsing
  - JWT Middleware - Authentication and authorization
  - Helmet - Security headers
  - Morgan - HTTP request logging

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

### AI & LLM
- **Google Gemini API** - AI model for generating challenges, feedback, and tutoring support

### Authentication
- **JWT (JSON Web Tokens)** - Token-based authentication
- **Refresh Tokens** - Secure session management

### Testing
- **Jest** - Unit and integration testing framework
- **Cypress** - End-to-end (E2E) testing framework

### Additional Tools
- **Sentry** - Error tracking and monitoring
- **Docker** - Containerization for development and deployment

## Project Structure

```
SkillWise/
├── backend/                    # Express server
│   ├── src/
│   │   ├── controllers/       # Route handlers
│   │   ├── services/          # Business logic
│   │   ├── models/            # Data models
│   │   ├── middleware/        # Custom middleware
│   │   ├── utils/             # Utility functions and prompt templates
│   │   ├── config/            # Configuration files
│   │   └── database/          # Database connections
│   ├── database/
│   │   └── migrations/        # SQL migrations
│   ├── tests/                 # Test files (Jest)
│   ├── server.js              # Entry point
│   └── package.json
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── services/          # API service layer
│   │   ├── hooks/             # Custom React hooks
│   │   ├── contexts/          # React contexts (auth, theme)
│   │   └── styles/            # CSS files
│   ├── cypress/               # E2E tests
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── docker-compose.yml         # Docker Compose configuration
├── launch.sh                  # Project launch script
└── package.json
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL (or use Docker)
- Google Gemini API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/willchristopher/CSC425-SkillWise.git
   cd CSC425-SkillWise
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the `backend` directory:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/skillwise
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   NODE_ENV=development
   PORT=3001
   ```

   Create a `.env` file in the `frontend` directory:
   ```
   VITE_API_URL=http://localhost:3001
   ```

4. **Set up the database**
   ```bash
   npm run migrate
   ```

### Running the Project

#### Using the Launch Script
```bash
./launch.sh
```

#### Manual Startup

**Start the backend:**
```bash
cd backend
npm install
npm start
```

**Start the frontend (in a new terminal):**
```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173` (frontend) and the API at `http://localhost:3001` (backend).

#### Using Docker Compose
```bash
docker-compose up
```

## Running Tests

### Backend Tests (Jest)
```bash
cd backend
npm test
```

### Frontend Tests (Cypress)
```bash
cd frontend
npm run cypress:open    # Interactive testing
npm run cypress:run     # Headless testing
```

### Run All Tests
```bash
npm run test
```

## API Authentication

The API uses JWT-based authentication:

1. **Login** - Get access and refresh tokens
2. **Access Token** - Short-lived token (15 minutes) for API requests
3. **Refresh Token** - Long-lived token stored in the database for obtaining new access tokens

Include the access token in the Authorization header:
```
Authorization: Bearer <access_token>
```

## Key Features

- **User Authentication** - Secure JWT-based auth with refresh tokens
- **Goal Management** - Create and track learning goals
- **Challenge System** - AI-generated challenges across all subjects
- **AI Feedback** - Personalized feedback on submissions using Google Gemini
- **Peer Reviews** - Review and feedback from fellow students
- **Progress Tracking** - Detailed analytics and progress visualization
- **Leaderboard** - Compete and see rankings
- **Dark Mode** - Theme toggle for better accessibility

## Development

### Code Structure Best Practices

- **Controllers** - Handle HTTP requests and responses
- **Services** - Contain business logic and database operations
- **Models** - Define data structures and relationships
- **Middleware** - Handle authentication, logging, error handling
- **Utils** - Reusable helper functions and AI prompt templates

### Adding New Features

1. Create API endpoint in `backend/src/routes`
2. Implement service logic in `backend/src/services`
3. Add controller in `backend/src/controllers`
4. Create React component in `frontend/src/components`
5. Add tests (Jest for backend, Cypress for E2E)
6. Update API service in `frontend/src/services`

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run migrations: `npm run migrate`

### API Key Issues
- Verify GEMINI_API_KEY is set in `.env`
- Check API key permissions in Google Cloud Console

### Port Already in Use
- Change PORT in `.env` (backend)
- Change port in `vite.config.js` (frontend)

## Contributing

1. Create a feature branch
2. Make your changes
3. Write tests
4. Submit a pull request

## License

This project is part of CSC 425 coursework.

## Support

For issues or questions, please open an issue on GitHub or contact the development team.
