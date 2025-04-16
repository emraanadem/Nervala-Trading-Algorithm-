const tradeStore = require('./tradeStore.js');

// Export all trade store functions and the default export
module.exports = {
  ...tradeStore,
  default: tradeStore
}; 