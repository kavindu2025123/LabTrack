const ApiError = require('../utils/ApiError');

// NOTE: The schema has no "notifications" table, so (matching the original
// notificationRoutes.js) this stays an in-memory mock store. Swap this array
// for real pool.query() calls, the same way the other services use `pool`,
// if/when a notifications table is added - the controller/routes above
// don't need to change either way.
let notifications = []; // { id, user_id, message, is_read, created_at }
let nextId = 1;

function getUserNotifications(userId) {
  return notifications.filter((n) => n.user_id === userId);
}

function createNotification({ user_id, message }) {
  if (!user_id || !message) {
    throw new ApiError(400, 'user_id and message are required');
  }

  const note = {
    id: nextId++,
    user_id,
    message,
    is_read: false,
    created_at: new Date(),
  };
  notifications.push(note);
  return note;
}

function markAsRead(id) {
  const note = notifications.find((n) => n.id === parseInt(id, 10));
  if (!note) throw new ApiError(404, 'Notification not found');

  note.is_read = true;
  return note;
}

module.exports = { getUserNotifications, createNotification, markAsRead };
