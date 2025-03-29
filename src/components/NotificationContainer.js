import React from 'react';
import { useNotifications } from '../contexts/NotificationContext';
import ToastNotification from './ToastNotification';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col space-y-2">
      {notifications.map(notification => (
        <ToastNotification
          key={notification.id}
          id={notification.id}
          message={notification.message}
          type={notification.type}
          duration={notification.duration}
          onClose={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer; 