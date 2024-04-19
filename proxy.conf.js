module.exports = {
  '/api': {
    target: 'https://dev-api.rubic.exchange',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  '/rest-auth': {
    target: 'https://dev-api.rubic.exchange',
    secure: false,
    changeOrigin: true,
    logLevel: 'debug'
  },
  '/': {
    secure: false,
    bypass: function (req, res) {
      req.headers['X-Custom-Header'] = 'yes';
    }
  }
};
