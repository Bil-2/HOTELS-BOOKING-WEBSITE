// API Configuration
const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5002',
  ENDPOINTS: {
    HOTELS: '/api/hotels',
    BOOKINGS: '/api/bookings',
    AUTH: '/api/auth',
    STAFF: '/api/staff',
    CHAINS: '/api/chain',
    AI_ASSISTANT: '/api/ai-assistant',
    STATUS: '/api/status',
    HEALTH: '/api/health'
  }
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Export individual endpoints
export const API_ENDPOINTS = {
  HOTELS: buildApiUrl(API_CONFIG.ENDPOINTS.HOTELS),
  BOOKINGS: buildApiUrl(API_CONFIG.ENDPOINTS.BOOKINGS),
  AUTH: buildApiUrl(API_CONFIG.ENDPOINTS.AUTH),
  STAFF: buildApiUrl(API_CONFIG.ENDPOINTS.STAFF),
  CHAINS: buildApiUrl(API_CONFIG.ENDPOINTS.CHAINS),
  AI_ASSISTANT: buildApiUrl(API_CONFIG.ENDPOINTS.AI_ASSISTANT),
  STATUS: buildApiUrl(API_CONFIG.ENDPOINTS.STATUS),
  HEALTH: buildApiUrl(API_CONFIG.ENDPOINTS.HEALTH)
};

export default API_CONFIG;
