'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChefHat, Clock, Users, Plus } from 'lucide-react'
import { Recipe } from '@/types/recipe'

export default function RecipesPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecipes()
  }, [])

  const fetchRecipes = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/v1/recipes')
      if (!response.ok) {
        throw new Error('Failed to fetch recipes')
      }
      const data = await response.json()
      setRecipes(data.recipes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'hard':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ChefHat className="h-12 w-12 text-orange-600 mx-auto animate-pulse" />
          <p className="mt-4 text-gray-600">Loading recipes...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button 
            onClick={fetchRecipes}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">Recipe Finder</h1>
              </Link>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-orange-600 transition-colors">
                Home
              </Link>
              <Link href="/recipes" className="text-orange-600 font-medium">
                Recipes
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-orange-600 transition-colors">
                Search
              </Link>
              <Link href="/demo" className="text-gray-600 hover:text-orange-600 transition-colors">
                Demo
              </Link>
              <Link href="/add-recipe" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Add Recipe
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">All Recipes</h2>
            <p className="mt-2 text-gray-600">
              {recipes.length} recipe{recipes.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <Link
            href="/add-recipe"
            className="flex items-center bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Recipe
          </Link>
        </div>

        {recipes.length === 0 ? (
          <div className="text-center py-12">
            <ChefHat className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first recipe!</p>
            <Link
              href="/add-recipe"
              className="inline-flex items-center bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Your First Recipe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe) => (
              <div key={recipe.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                {recipe.image_url && (
                  <img
                    src={recipe.image_url}
                    alt={recipe.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                      {recipe.title}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(recipe.difficulty)}`}>
                      {recipe.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {recipe.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {recipe.prep_time + recipe.cook_time} min
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {recipe.servings} servings
                    </div>
                  </div>

                  {recipe.category && (
                    <div className="mb-4">
                      <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        {recipe.category}
                      </span>
                    </div>
                  )}

                  {recipe.tags && recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {recipe.tags.slice(0, 3).map((tag, index) => (
                        <span key={index} className="inline-block bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {recipe.tags.length > 3 && (
                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                          +{recipe.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <Link
                    href={`/recipes/${recipe.id}`}
                    className="block w-full text-center bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    View Recipe
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 