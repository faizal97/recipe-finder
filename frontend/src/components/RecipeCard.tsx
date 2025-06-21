'use client'

import { Recipe } from '@/types/recipe'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { saveRecipe, unsaveRecipe, isRecipeSaved } from '@/utils/savedRecipes'
import SocialShare from './SocialShare'

interface RecipeCardProps {
  recipe: Recipe
  userIngredients: string[]
}

export default function RecipeCard({ recipe, userIngredients }: RecipeCardProps) {
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    setIsSaved(isRecipeSaved(recipe.id))
  }, [recipe.id])

  const calculateIngredientPercentage = () => {
    if (userIngredients.length === 0) return 0 // No ingredients selected, show 0%
    return Math.round((recipe.matchCount / recipe.ingredients.length) * 100)
  }

  const handleSaveToggle = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation when clicking save button
    e.stopPropagation()
    
    if (isSaved) {
      unsaveRecipe(recipe.id)
      setIsSaved(false)
    } else {
      saveRecipe({
        id: recipe.id,
        title: recipe.title,
        imageUrl: recipe.imageUrl,
        prepTime: recipe.prepTime,
        cookTime: recipe.cookTime,
        servings: recipe.servings
      })
      setIsSaved(true)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video bg-gradient-to-br from-orange-200 to-yellow-200 relative">
        <img
          src={recipe.imageUrl}
          alt={recipe.title}
          className="w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
          }}
        />
        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          className={`absolute top-2 right-2 p-2.5 rounded-full transition-all duration-200 touch-manipulation ${
            isSaved 
              ? 'bg-red-500 text-white shadow-lg hover:bg-red-600' 
              : 'bg-white/90 text-gray-600 hover:bg-white hover:text-red-500'
          }`}
          title={isSaved ? 'Remove from saved recipes' : 'Save recipe'}
        >
          <Heart 
            className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${
              isSaved ? 'fill-current' : ''
            }`} 
          />
        </button>
      </div>
      <div className="p-4 sm:p-5">
        <h3 className="font-semibold text-gray-900 mb-2 text-base sm:text-lg leading-tight">{recipe.title}</h3>
        <p className="text-sm text-gray-700 mb-3 line-clamp-2">{recipe.description}</p>
        <p className="text-sm text-gray-700 mb-3">
          <span className="text-orange-600 font-medium">Ingredients: {recipe.matchCount}</span> / {recipe.ingredients.length}
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${calculateIngredientPercentage()}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-700 mb-4 gap-2">
          <span className="flex items-center gap-1">⏱ {recipe.prepTime}</span>
          <span className="flex items-center gap-1">🍳 {recipe.cookTime}</span>
          <span className="flex items-center gap-1">👥 {recipe.servings}</span>
        </div>
        <div className="flex gap-2 mb-4">
          <Link 
            href={`/recipes/${recipe.id}`}
            className="flex-1 text-center text-orange-600 text-sm font-medium hover:text-orange-700 bg-orange-50 hover:bg-orange-100 py-3 rounded-lg transition-colors touch-manipulation"
          >
            View Recipe
          </Link>
          <SocialShare
            title={recipe.title}
            description={recipe.description}
            url={`${typeof window !== 'undefined' ? window.location.origin : ''}/recipes/${recipe.id}`}
            imageUrl={recipe.imageUrl}
            size="sm"
            className="flex-shrink-0"
          />
        </div>
      </div>
    </div>
  )
} 