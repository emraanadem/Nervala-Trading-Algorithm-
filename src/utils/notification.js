// Simple notification helper
let notificationHandler = null;

// Register the notification handler
export const registerNotificationHandler = (handler) => {
  notificationHandler = handler;
};

// Show a notification
export const showNotification = (message, type = 'info', duration = 5000) => {
  if (notificationHandler) {
    return notificationHandler(message, type, duration);
  } else {
    console.warn('Notification handler not registered');
    console.log(message, type, duration);
    return null;
  }
};

// Helper functions for specific notification types
export const showSuccessNotification = (message, duration = 5000) => 
  showNotification(message, 'success', duration);

export const showErrorNotification = (message, duration = 8000) => 
  showNotification(message, 'error', duration);

export const showTradeNotification = (message, duration = 8000) => 
  showNotification(message, 'trade', duration);

export const showWarningNotification = (message, duration = 5000) => 
  showNotification(message, 'warning', duration);

export default {
  registerNotificationHandler,
  showNotification,
  showSuccessNotification,
  showErrorNotification,
  showTradeNotification,
  showWarningNotification
}; 