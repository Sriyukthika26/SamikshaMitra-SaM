# SamikshaMitra(SaM) - Your Smart Evaluation Companion 

SaM was built during the **Morgan Stanley Code to Give Hackathon'25**.  
This is a smart evaluation tool designed to process various submissions, including:  
- 🖼️ **Images**  
- 📄 **PDFs**  
- 📝 **Text files**  
- 🎙️ **Audio**  
- 🎥 **Video**

### SaM is a full stack web application built using MongoDB, Express.js, React.js, Node.js, Python, Gemini API & Flask.
It uses **custom rubric tables** and **teacher-defined evaluation criteria** to grade submissions, providing detailed analysis through an **interactive dashboard**.  

## 🔹 Key Features of Application:

- **🚀 Automated Evaluation**  
  - Uses **Gemini 1.5 Flash model** to assess submissions  
  - Assigns scores based on predefined rubrics  

- **🏆 Leaderboard**  
  - Ranks submissions according to generated scores  
  - Categorizes submissions into:  
    - ✅ **Shortlisted**  
    - ⏳ **On-hold**  
    - ❌ **Rejected**  

- **📊 Comprehensive Dashboard**  
  - 📌 **Submission Summary**  
  - 📈 **Marks Distribution & Justification**  
    - Detailed breakdown of scores  
    - Explanations for assigned marks  
  - 🌟 **Key Project Highlights**  
  - 📝 **Feedback for Improvement**  
  - 📊 **Data-Driven Insights**  
    - Interactive graphs and charts to analyze performance trends  

- **🛠️ Manual Evaluation Option**  
  - Allows teachers to review and **adjust** generated scores  


## Project Structure

```
SamikshaMitra-SaM/
├── frontend/           # React frontend application
│   ├── src/           # Source code
│   ├── public/        # Static assets
│   └── package.json   # Frontend dependencies
├── backend/           # Node.js/Express backend
│   ├── config/       # Configuration files
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Custom middleware
│   ├── models/       # Database models
│   ├── routes/       # API routes
│   ├── utils/        # Utility functions
│   └── server.js     # Main server file
└── package.json      # Root package.json
```

## Features

- User Authentication (JWT-based)
- File Upload with Cloudinary integration
- Security features (Helmet, CORS)
- MongoDB Database Integration
- Gemini API Integration
- Modern React Frontend with Vite

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary Account (for file uploads)
- Google AI API Key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/SamikshaMitra-SaM.git
cd SamikshaMitra-SaM
```

2. Install dependencies:
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

3. Create a `.env` file in the backend directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GOOGLE_AI_API_KEY=your_google_ai_api_key
```

## Running the Application

### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:5000

### Production Mode

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Start the backend server:
```bash
npm start
```

## API Endpoints

The backend provides the following main API endpoints:

- Authentication:
  - POST /api/auth/register
  - POST /api/auth/login
  - POST /api/auth/logout

- File Management:
  - POST /api/upload
  - GET /api/files
  - DELETE /api/files/:id

