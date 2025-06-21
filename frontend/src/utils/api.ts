// API Configuration
// Updated to use Railway backend in production
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export const API_ENDPOINTS = {
  SEARCH_RECIPES: `${API_BASE_URL}/api/v1/search/recipes`,
  SEARCH_INGREDIENTS: `${API_BASE_URL}/api/v1/ingredients/search`,
  RECIPES: `${API_BASE_URL}/api/recipes`,
  RECIPE_DETAILS: `${API_BASE_URL}/api/v1/recipes`,
} as const

export { API_BASE_URL } 