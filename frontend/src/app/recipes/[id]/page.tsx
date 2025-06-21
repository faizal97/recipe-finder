'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ChefHat, 
  Clock, 
  Users, 
  ArrowLeft, 
  ExternalLink,
  Heart,
  Star,
  DollarSign,
  Leaf,
  Shield
} from 'lucide-react'
import { saveRecipe, unsaveRecipe, isRecipeSaved } from '@/utils/savedRecipes'
import { API_ENDPOINTS } from '@/utils/api'
import SocialShare from '@/components/SocialShare'

interface DetailedIngredient {
  id: number
  name: string
  originalName: string
  amount: number
  unit: string
  unitLong: string
  original: string
  aisle: string
  image: string
  meta: string[]
}

interface Instruction {
  number: number
  step: string
}

interface RecipeDetails {
  id: string
  title: string
  description: string
  summary: string
  ingredients: DetailedIngredient[]
  instructions: Instruction[]
  prepTime: string
  cookTime: string
  totalTime: string
  servings: number
  imageUrl: string
  sourceUrl: string
  spoonacularUrl: string
  healthScore: number
  pricePerServing: number
  cuisines: string[]
  dishTypes: string[]
  diets: string[]
  occasions: string[]
  isVegetarian: boolean
  isVegan: boolean
  isGlutenFree: boolean
  isDairyFree: boolean
  isVeryHealthy: boolean
  isCheap: boolean
  isPopular: boolean
  isSustainable: boolean
}

export default function RecipeDetailPage() {
  const params = useParams()
  const recipeId = params.id as string
  const [recipe, setRecipe] = useState<RecipeDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    if (recipeId) {
      fetchRecipeDetails()
    }
  }, [recipeId])

  useEffect(() => {
    if (recipe) {
      setIsSaved(isRecipeSaved(recipe.id))
    }
  }, [recipe])

  const fetchRecipeDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_ENDPOINTS.RECIPE_DETAILS}/${recipeId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch recipe details')
      }
      
      const data = await response.json()
      setRecipe(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToggle = () => {
    if (!recipe) return
    
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-orange-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-800">Loading recipe details...</p>
        </div>
      </div>
    )
  }

  if (error || !recipe) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error || 'Recipe not found'}</p>
          <Link 
            href="/"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 sm:py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <ChefHat className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                <h1 className="ml-2 text-lg sm:text-2xl font-bold text-gray-900">Recipe Finder</h1>
              </Link>
            </div>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors text-sm sm:text-base touch-manipulation"
            >
              <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Back to Search</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Recipe Image and Basic Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden lg:sticky lg:top-8">
              <div className="aspect-square bg-gradient-to-br from-orange-200 to-yellow-200 relative">
                <img
                  src={recipe.imageUrl}
                  alt={recipe.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
              </div>
              
              <div className="p-4 sm:p-6">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 leading-tight">{recipe.title}</h1>
                
                {/* Recipe Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-800">Prep Time</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{recipe.prepTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-800">Cook Time</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{recipe.cookTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-800">Servings</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{recipe.servings}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600 mr-2 flex-shrink-0" />
                    <div>
                      <p className="text-xs sm:text-sm text-gray-800">Total Time</p>
                      <p className="font-medium text-gray-900 text-sm sm:text-base">{recipe.totalTime}</p>
                    </div>
                  </div>
                </div>

                {/* Health & Diet Info */}
                <div className="space-y-3 sm:space-y-4">
                  {recipe.healthScore > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-800">Health Score</span>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 mr-1" />
                        <span className="font-medium text-gray-900 text-sm">{recipe.healthScore}/100</span>
                      </div>
                    </div>
                  )}
                  
                  {recipe.pricePerServing > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-800">Price per Serving</span>
                      <div className="flex items-center">
                        <DollarSign className="h-4 w-4 text-green-500 mr-1" />
                        <span className="font-medium text-gray-900 text-sm">${(recipe.pricePerServing / 100).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Diet Tags */}
                <div className="mt-4 sm:mt-6">
                  <div className="flex flex-wrap gap-2">
                    {recipe.isVegetarian && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegetarian
                      </span>
                    )}
                    {recipe.isVegan && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Leaf className="h-3 w-3 mr-1" />
                        Vegan
                      </span>
                    )}
                    {recipe.isGlutenFree && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Gluten-Free
                      </span>
                    )}
                    {recipe.isDairyFree && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Dairy-Free
                      </span>
                    )}
                    {recipe.isVeryHealthy && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        <Heart className="h-3 w-3 mr-1" />
                        Very Healthy
                      </span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 sm:mt-6 space-y-3">
                  {/* Save Button */}
                  <button
                    onClick={handleSaveToggle}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200 touch-manipulation ${
                      isSaved
                        ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg'
                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border-2 border-orange-200 hover:border-orange-300'
                    }`}
                  >
                    <Heart 
                      className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-200 ${
                        isSaved ? 'fill-current' : ''
                      }`} 
                    />
                    <span className="text-sm sm:text-base">{isSaved ? 'Saved to My Recipes' : 'Save to My Recipes'}</span>
                  </button>
                  
                  {/* Share Button */}
                  <div className="flex justify-center">
                    <SocialShare
                      title={recipe.title}
                      description={recipe.summary ? recipe.summary.replace(/<[^>]*>/g, '').slice(0, 200) : recipe.description}
                      url={typeof window !== 'undefined' ? window.location.href : ''}
                      imageUrl={recipe.imageUrl}
                      size="md"
                    />
                  </div>
                </div>

                {/* External Links */}
                <div className="mt-4 sm:mt-6 space-y-2">
                  {recipe.sourceUrl && (
                    <a
                      href={recipe.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-orange-600 hover:text-orange-700 text-sm touch-manipulation"
                    >
                      <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                      View Original Recipe
                    </a>
                  )}
                  {recipe.spoonacularUrl && (
                    <a
                      href={recipe.spoonacularUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-orange-600 hover:text-orange-700 text-sm touch-manipulation"
                    >
                      <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
                      View on Spoonacular
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recipe Content */}
          <div className="lg:col-span-2 space-y-6 sm:space-y-8">
            {/* Description */}
            {recipe.summary && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">About This Recipe</h2>
                <div 
                  className="text-gray-800 leading-relaxed text-sm sm:text-base [&>p]:mb-3 [&>ul]:mb-3 [&>ol]:mb-3 [&>li]:mb-1"
                  dangerouslySetInnerHTML={{ __html: recipe.summary }}
                />
              </div>
            )}

            {/* Ingredients */}
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Ingredients ({recipe.ingredients.length})
              </h2>
              <ul className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-center">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg mr-4 overflow-hidden">
                      {ingredient.image && (
                        <img
                          src={ingredient.image}
                          alt={ingredient.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{ingredient.original}</p>
                      {ingredient.aisle && (
                        <p className="text-sm text-gray-700">Found in: {ingredient.aisle}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Instructions */}
            {recipe.instructions && recipe.instructions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Instructions ({recipe.instructions.length} steps)
                </h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction) => (
                    <li key={instruction.number} className="flex">
                      <div className="flex-shrink-0 w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-4">
                        {instruction.number}
                      </div>
                      <p className="text-gray-800 leading-relaxed pt-1">{instruction.step}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Additional Info */}
            {(recipe.cuisines?.length > 0 || recipe.dishTypes?.length > 0 || recipe.diets?.length > 0) && (
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Additional Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {recipe.cuisines?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Cuisines</h3>
                      <div className="flex flex-wrap gap-1">
                        {recipe.cuisines.map((cuisine, index) => (
                          <span key={index} className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                            {cuisine}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recipe.dishTypes?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Dish Types</h3>
                      <div className="flex flex-wrap gap-1">
                        {recipe.dishTypes.map((dishType, index) => (
                          <span key={index} className="inline-block bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                            {dishType}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {recipe.diets?.length > 0 && (
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Diets</h3>
                      <div className="flex flex-wrap gap-1">
                        {recipe.diets.map((diet, index) => (
                          <span key={index} className="inline-block bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 