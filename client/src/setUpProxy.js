
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: process.env.REACT_APP_BACKEND_URL || 'https://plivo-assignment-5.onrender.com',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '',
      },
    })
  );
};