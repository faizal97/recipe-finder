// Recipe-related type definitions for the Recipe Finder app

export interface Recipe {
  id: string
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number // in minutes
  cook_time: number // in minutes
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  image_url?: string
  created_at: string
  updated_at: string
}

export interface CreateRecipeRequest {
  title: string
  description?: string
  ingredients: string[]
  instructions: string[]
  prep_time?: number
  cook_time?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
  tags?: string[]
  image_url?: string
}

export interface UpdateRecipeRequest {
  title?: string
  description?: string
  ingredients?: string[]
  instructions?: string[]
  prep_time?: number
  cook_time?: number
  servings?: number
  difficulty?: 'easy' | 'medium' | 'hard'
  category?: string
  tags?: string[]
  image_url?: string
}

export interface SearchRecipeParams {
  q?: string // query string
  category?: string
  difficulty?: 'easy' | 'medium' | 'hard'
  tags?: string[]
  max_prep_time?: number
  max_cook_time?: number
}

export interface RecipeListResponse {
  recipes: Recipe[]
  total: number
}

export interface SearchRecipeResponse {
  recipes: Recipe[]
  total: number
  query?: string
}

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

// Component prop types
export interface IngredientInputProps {
  ingredients: string[]
  onChange: (ingredients: string[]) => void
  placeholder?: string
  maxIngredients?: number
  className?: string
  required?: boolean
  label?: string
}

export interface InstructionInputProps {
  instructions: string[]
  onChange: (instructions: string[]) => void
  placeholder?: string
  maxInstructions?: number
  className?: string
  required?: boolean
  label?: string
}

export interface RecipeFormData {
  title: string
  description: string
  ingredients: string[]
  instructions: string[]
  prep_time: number
  cook_time: number
  servings: number
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  tags: string[]
  image_url: string
}

export interface RecipeCardProps {
  recipe: Recipe
  onEdit?: (recipe: Recipe) => void
  onDelete?: (recipeId: string) => void
  showActions?: boolean
  className?: string
}

export interface RecipeFilterProps {
  onFilterChange: (filters: SearchRecipeParams) => void
  initialFilters?: SearchRecipeParams
  categories?: string[]
  className?: string
}

// Form validation types
export interface FormErrors {
  [key: string]: string | undefined
}

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: unknown) => string | undefined
}

export interface ValidationRules {
  [key: string]: ValidationRule
}

// API Error types
export interface ApiError {
  message: string
  status: number
  details?: unknown
}

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// Recipe categories and difficulties (can be extended)
export const RECIPE_CATEGORIES = [
  'Italian',
  'Mexican',
  'Asian',
  'Mediterranean',
  'American',
  'Indian',
  'French',
  'Thai',
  'Chinese',
  'Japanese',
  'Korean',
  'Greek',
  'Spanish',
  'German',
  'British',
  'Middle Eastern',
  'African',
  'Caribbean',
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Keto',
  'Paleo',
  'Dessert',
  'Appetizer',
  'Main Course',
  'Side Dish',
  'Breakfast',
  'Lunch',
  'Dinner',
  'Snack',
  'Beverage'
] as const

export const RECIPE_DIFFICULTIES = ['easy', 'medium', 'hard'] as const

export const RECIPE_TAGS = [
  'quick',
  'healthy',
  'comfort-food',
  'party',
  'family-friendly',
  'date-night',
  'budget-friendly',
  'meal-prep',
  'one-pot',
  'no-bake',
  'grilled',
  'baked',
  'fried',
  'steamed',
  'raw',
  'spicy',
  'sweet',
  'savory',
  'creamy',
  'crunchy',
  'protein-rich',
  'low-carb',
  'high-fiber',
  'dairy-free',
  'nut-free',
  'soy-free',
  'egg-free'
] as const

export type RecipeCategory = typeof RECIPE_CATEGORIES[number]
export type RecipeDifficulty = typeof RECIPE_DIFFICULTIES[number]
export type RecipeTag = typeof RECIPE_TAGS[number] 