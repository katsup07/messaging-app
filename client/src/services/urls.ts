export const _apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const _baseFriendsUrl = `${_apiBaseUrl}/friends`;
export const _baseMessageUrl = `${_apiBaseUrl}/messages`;
export const _baseAuthUrl = `${_apiBaseUrl}/auth`;
export const _baseFriendRequestUrl = `${_apiBaseUrl}/friend-requests`;