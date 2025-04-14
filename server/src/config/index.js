export default {
    database: {
      url: process.env.DATABASE_URL,
    },
    clerk: {
      secretKey: process.env.CLERK_SECRET_KEY,
      publishableKey: process.env.CLERK_PUBLISHABLE_KEY,
      apiVersion: 'v1'
    },

  };