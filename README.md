# TaskFlow

A modern, AI-powered project management application built with the MERN stack. TaskFlow helps teams organize tasks, track progress across boards, and leverage AI for intelligent task planning and estimation.

![TaskFlow Logo](https://img.shields.io/badge/TaskFlow-Project%20Management-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-ISC-orange)

## 📸 Screenshots

### Login Page
![alt text](<Screenshot 2026-06-29 at 3.12.34 PM-1.png>)




### Dashboard
![alt text](<Screenshot 2026-06-29 at 3.13.08 PM.png>)

### Board View
![alt text](<Screenshot 2026-06-29 at 3.13.15 PM.png>)



## 🛠 Tech Stack

### Frontend
- **React 19.2.7** - UI library
- **React Router DOM 7.18.0** - Client-side routing
- **TailwindCSS 4.3.1** - Utility-first CSS framework
- **Framer Motion 11.18.2** - Animation library
- **@tanstack/react-query 5.101.1** - Data fetching and caching
- **@dnd-kit 6.3.1** - Drag and drop functionality
- **Recharts 2.15.4** - Data visualization
- **Axios 1.18.1** - HTTP client
- **React Hot Toast 2.6.0** - Toast notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express 5.2.1** - Web framework
- **MongoDB 9.7.2** - Database with Mongoose ODM
- **JWT 9.0.3** - Authentication tokens
- **bcryptjs 3.0.3** - Password hashing
- **CORS 2.8.6** - Cross-origin resource sharing
- **dotenv 17.4.2** - Environment variable management

### Database
- **MongoDB** - NoSQL document database

### AI Integration
- **Google Gemini 2.5 Flash** - AI model for task planning suggestions

## 🚀 Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local instance or MongoDB Atlas)
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd task_flow
```

### 2. Backend Setup

```bash
cd server
npm install
cp .env.example .env
```

Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_secure_jwt_secret
GEMINI_API_KEY=your_gemini_api_key  # Optional
PORT=5001
CLIENT_URL=http://localhost:3000
```

Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5001`

### 3. Frontend Setup

```bash
cd client
npm install
```

Create `.env` file in client directory:
```env
REACT_APP_API_URL=http://localhost:5001/api
```

Start the frontend development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## 🔐 Environment Variables

### Server (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `MONGO_URI` | MongoDB connection string | Yes | - |
| `JWT_SECRET` | Secret key for JWT token generation | Yes | - |
| `GEMINI_API_KEY` | Google Gemini API key for AI features | No | - |
| `PORT` | Server port | No | 5001 |
| `CLIENT_URL` | Allowed CORS origins (comma-separated) | No | - |

### Client (.env)
| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `REACT_APP_API_URL` | Backend API base URL | No | http://localhost:5001/api |

## 🤖 AI Feature Integration

### LLM Choice - Google Gemini 2.5 Flash

**Why Gemini?**
- **Fast Response Time**: Flash model provides quick responses suitable for real-time task planning
- **Cost-Effective**: Lower cost compared to GPT-4 while maintaining good quality
- **JSON Output**: Reliable structured output for task estimation data
- **Free Tier Available**: Generous free tier for development and testing

### How the AI Feature Works

The AI feature suggests task planning estimates when creating or editing tasks:

1. **Input**: Task title and optional description
2. **Processing**: Sends task details to Gemini API with a structured prompt
3. **Output**: Returns JSON with:
   - `estimatedEffort`: Time estimate (e.g., "2-4 hours")
   - `suggestedDueDate`: Recommended completion date (YYYY-MM-DD)
   - `reasoning`: Brief explanation of the estimate

**Fallback Mechanism**: If the API key is not configured or the API fails, the system uses a rule-based fallback that estimates effort based on word count and complexity.

**Example API Request**:
```javascript
POST /api/ai/suggest
{
  "title": "Implement user authentication",
  "description": "Add login, signup, and password reset functionality"
}
```

**Example Response**:
```json
{
  "estimatedEffort": "1 day",
  "suggestedDueDate": "2024-07-05",
  "reasoning": "Authentication involves multiple security considerations and testing requirements.",
  "source": "gemini"
}
```

## 📡 API Documentation

### Authentication Endpoints

#### Register User
- **POST** `/api/auth/register`
- **Description**: Create a new user account
- **Body**: `{ name, email, password }`
- **Response**: `{ message, user: { id, name, email } }`

#### Login User
- **POST** `/api/auth/login`
- **Description**: Authenticate user and receive JWT token
- **Body**: `{ email, password }`
- **Response**: `{ token, user: { id, name, email } }`

#### Get Current User
- **GET** `/api/auth/me`
- **Description**: Get authenticated user details
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ id, name, email }`

### Board Endpoints

#### Create Board
- **POST** `/api/boards`
- **Description**: Create a new board
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description }`
- **Response**: `{ _id, title, description, owner, createdAt }`

#### Get All Boards
- **GET** `/api/boards`
- **Description**: Get all boards for authenticated user
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `[{ _id, title, description, owner, createdAt }]`

#### Get Board by ID
- **GET** `/api/boards/:id`
- **Description**: Get specific board details
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ _id, title, description, owner, createdAt }`

#### Update Board
- **PUT** `/api/boards/:id`
- **Description**: Update board details
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description }`
- **Response**: Updated board object

#### Delete Board
- **DELETE** `/api/boards/:id`
- **Description**: Delete a board
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Board removed" }`

### Task Endpoints

#### Create Task
- **POST** `/api/tasks`
- **Description**: Create a new task
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description, board, status, priority, dueDate, estimatedEffort }`
- **Response**: Created task object

#### Get Tasks
- **GET** `/api/tasks`
- **Description**: Get tasks for a specific board
- **Headers**: `Authorization: Bearer <token>`
- **Query**: `?board=<boardId>`
- **Response**: Array of task objects

#### Get Task Summary
- **GET** `/api/tasks/summary`
- **Description**: Get task statistics and summary
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ total, byStatus, byPriority }`

#### Update Task
- **PUT** `/api/tasks/:id`
- **Description**: Update task details
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Any task field
- **Response**: Updated task object

#### Delete Task
- **DELETE** `/api/tasks/:id`
- **Description**: Delete a task
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `{ message: "Task removed" }`

### AI Endpoints

#### Suggest Task Planning
- **POST** `/api/ai/suggest`
- **Description**: Get AI-powered task planning suggestions
- **Headers**: `Authorization: Bearer <token>`
- **Body**: `{ title, description }`
- **Response**: `{ estimatedEffort, suggestedDueDate, reasoning, source }`

### Health Check
- **GET** `/api/health`
- **Description**: Check API health status
- **Response**: `{ status: "ok", service: "TaskFlow API" }`

## 🔗 Live Demo

- **Frontend**: *[Add your Vercel deployment URL]*
- **Backend**: *[Add your backend deployment URL]*

### Test Credentials
- **Email**: test@test.com
- **Password**: 123456

## ⚠️ Known Issues & Limitations

### Current Limitations
1. **No Real-time Updates**: Tasks don't update in real-time across multiple users
2. **Single User per Board**: Boards are currently limited to individual ownership
3. **No Team Collaboration**: Missing features like comments, mentions, and team assignments
4. **Limited AI Context**: AI suggestions don't consider existing tasks or project timeline
5. **No File Attachments**: Tasks cannot include file attachments or images
6. **Basic Search**: No advanced search or filtering capabilities
7. **No Notifications**: Missing notification system for task updates

### Improvements for Future Development
1. **WebSocket Integration**: Add real-time updates using Socket.io
2. **Team Features**: Implement team creation, member management, and permissions
3. **Advanced AI**: Enhance AI to consider project context and dependencies
4. **File Storage**: Add file upload capability using cloud storage (AWS S3, Cloudinary)
5. **Advanced Search**: Implement full-text search with MongoDB Atlas Search
6. **Notification System**: Add email and in-app notifications
7. **Mobile App**: Develop React Native mobile applications
8. **Analytics Dashboard**: Add comprehensive project analytics and reporting
9. **Calendar View**: Implement calendar and timeline views for tasks
10. **Integrations**: Add third-party integrations (Slack, GitHub, Jira)

## 📝 License

This project is licensed under the ISC License.

## 👨‍💻 Developer

Developed as a full-stack MERN application demonstrating modern web development practices, AI integration, and responsive design.

---

**Note**: This project uses MongoDB for data storage. Ensure your MongoDB instance is running before starting the backend server. For production deployment, use MongoDB Atlas or configure your own MongoDB server.
