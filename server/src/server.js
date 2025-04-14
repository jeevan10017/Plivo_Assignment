import 'dotenv/config';
import { connectDB } from './db/db.js';
import { initEmailTransporter } from './utils/email.js';
import app from './app.js';

// Remove Socket.IO and HTTP server creation since Vercel Serverless doesn't support WebSockets
const startServer = async () => {
  try {
    await connectDB();
    // await initEmailTransporter();
    
    // Only start server in development
    if (process.env.NODE_ENV !== 'production') {
      const PORT = process.env.PORT || 5000;
      app.listen(PORT, () => {
        logger.info(`Server running on port ${PORT}`);
      });
    }
  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Export the Express app for Vercel
export default app;

// Start server only in development
if (process.env.NODE_ENV !== 'production') {
  startServer();
}