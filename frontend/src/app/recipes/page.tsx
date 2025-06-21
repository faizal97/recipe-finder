'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Heart, ArrowLeft } from 'lucide-react'
import { getSavedRecipes, SavedRecipe } from '@/utils/savedRecipes'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/types/recipe'

export default function MyRecipesPage() {
  const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load saved recipes from localStorage
    const recipes = getSavedRecipes()
    setSavedRecipes(recipes)
    setLoading(false)

    // Add event listener to refresh when page becomes visible again
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const updatedRecipes = getSavedRecipes()
        setSavedRecipes(updatedRecipes)
      }
    }

    const handleFocus = () => {
      const updatedRecipes = getSavedRecipes()
      setSavedRecipes(updatedRecipes)
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Convert SavedRecipe to Recipe format for RecipeCard component
  const convertToRecipeFormat = (savedRecipe: SavedRecipe): Recipe => {
    return {
      id: savedRecipe.id,
      title: savedRecipe.title,
      description: 'Saved recipe', // We don't store description in SavedRecipe
      ingredients: [], // We don't store full ingredients in SavedRecipe
      prepTime: savedRecipe.prepTime,
      cookTime: savedRecipe.cookTime,
      servings: savedRecipe.servings,
      imageUrl: savedRecipe.imageUrl,
      matchCount: 0 // Not applicable for saved recipes
    }
  }

  const handleRefresh = () => {
    const recipes = getSavedRecipes()
    setSavedRecipes(recipes)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading saved recipes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors touch-manipulation"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2 sm:gap-3">
                <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-red-500 fill-current" />
                My Saved Recipes
              </h1>
              <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
                {savedRecipes.length} saved recipe{savedRecipes.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleRefresh}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors touch-manipulation self-start sm:self-auto"
          >
            Refresh
          </button>
        </div>

        {savedRecipes.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Heart className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">No saved recipes yet</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto text-sm sm:text-base px-4">
              Start exploring recipes and save your favorites by clicking the heart icon on any recipe card or detail page.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors touch-manipulation"
            >
              <ChefHat className="h-5 w-5" />
              Discover Recipes
            </Link>
          </div>
        ) : (
          <>
            {/* Saved date info */}
            <div className="mb-4 sm:mb-6 text-xs sm:text-sm text-gray-500">
              Most recently saved: {new Date(savedRecipes[0]?.savedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>

            {/* Recipe Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              {savedRecipes.map((savedRecipe) => (
                <RecipeCard
                  key={savedRecipe.id}
                  recipe={convertToRecipeFormat(savedRecipe)}
                  userIngredients={[]} // No ingredients filter on saved recipes page
                />
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-8 sm:mt-12 bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">About Your Saved Recipes</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <p className="font-medium text-gray-900 mb-1">Total Saved</p>
                  <p>{savedRecipes.length} recipes</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Storage</p>
                  <p>Saved locally in your browser</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900 mb-1">Privacy</p>
                  <p>Your data never leaves your device</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 