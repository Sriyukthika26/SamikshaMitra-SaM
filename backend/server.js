import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import connectDB from './config/db.js';

// Import routes
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import geminiRoutes from './routes/geminiRoutes.js'; 
import cloudinaryRoutes from './routes/cloudinaryRoutes.js';

dotenv.config();
const port = process.env.PORT || 5000;

// Connect to the database
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/gemini', geminiRoutes); 
app.use('/api/cloudinary', cloudinaryRoutes);

app.get('/', (req, res) => res.send('Server is ready'));

app.use(notFound);
app.use(errorHandler);

app.listen(port, () => console.log(`Server started on port ${port}`));





















// import express from 'express';
// import dotenv from 'dotenv';
// import cookieParser from 'cookie-parser';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Import your routes
// import userRoutes from './routes/userRoutes.js'; // <-- Import userRoutes
// import uploadRoutes from './routes/uploadRoutes.js';
// import geminiRoutes from './routes/geminiRoutes.js';

// // Middleware imports
// import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// // Load environment variables
// dotenv.config();

// // Determine __dirname (ES Module workaround)
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// // Body parser middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Cookie parser
// app.use(cookieParser());

// // Mount your routes
// app.use('/api/users', userRoutes);         // Now routes like /api/user/auth will work
// app.use('/api', uploadRoutes);
// app.use('/api/gemini', geminiRoutes);

// // Simple health check route
// app.get('/', (req, res) => {
//   res.send('Server is ready');
// });

// // Not found middleware
// app.use(notFound);

// // Error handler middleware
// app.use(errorHandler);

// // Start the server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
