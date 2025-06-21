export interface SavedRecipe {
  id: string;
  title: string;
  imageUrl: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  savedAt: string;
}

const SAVED_RECIPES_KEY = 'recipeFinder_savedRecipes';

export const getSavedRecipes = (): SavedRecipe[] => {
  if (typeof window === 'undefined') return [];
  
  try {
    const saved = localStorage.getItem(SAVED_RECIPES_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading saved recipes:', error);
    return [];
  }
};

export const saveRecipe = (recipe: Omit<SavedRecipe, 'savedAt'>): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedRecipes = getSavedRecipes();
    const newRecipe: SavedRecipe = {
      ...recipe,
      savedAt: new Date().toISOString()
    };
    
    // Remove if already exists and add to beginning
    const filtered = savedRecipes.filter(r => r.id !== recipe.id);
    const updated = [newRecipe, ...filtered];
    
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error saving recipe:', error);
  }
};

export const unsaveRecipe = (recipeId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const savedRecipes = getSavedRecipes();
    const filtered = savedRecipes.filter(r => r.id !== recipeId);
    localStorage.setItem(SAVED_RECIPES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing saved recipe:', error);
  }
};

export const isRecipeSaved = (recipeId: string): boolean => {
  if (typeof window === 'undefined') return false;
  
  const savedRecipes = getSavedRecipes();
  return savedRecipes.some(r => r.id === recipeId);
}; 