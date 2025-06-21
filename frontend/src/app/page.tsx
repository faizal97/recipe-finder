'use client'

import Link from 'next/link'
import { Plus, Search, X, ChevronDown } from 'lucide-react'
import IngredientInput from '@/components/IngredientInput'
import RecipeCard from '@/components/RecipeCard'
import { Recipe } from '@/types/recipe'
import { useState, useEffect, useRef } from 'react'

interface Ingredient {
  id: number
  name: string
  image: string
}

export default function Home() {
  const [ingredients, setIngredients] = useState<string[]>([])
  const [newIngredient, setNewIngredient] = useState('')
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(false)
  const [searchResults, setSearchResults] = useState<Ingredient[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleAddIngredient = (ingredientName?: string) => {
    const ingredient = ingredientName || newIngredient.trim()
    if (ingredient && !ingredients.includes(ingredient)) {
      setIngredients([...ingredients, ingredient])
      setNewIngredient('')
      setSearchResults([])
      setShowDropdown(false)
    }
  }

  const searchIngredients = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    setIsSearching(true)
    setShowDropdown(true) // Show dropdown immediately to show loading state
    
    try {
      const response = await fetch(`http://localhost:8080/api/v1/ingredients/search?q=${encodeURIComponent(query)}`)
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.ingredients || [])
        setShowDropdown(true)
      } else {
        setSearchResults([])
        setShowDropdown(true) // Still show to display "no results" message
      }
    } catch (error) {
      console.error('Error searching ingredients:', error)
      setSearchResults([])
      setShowDropdown(false)
    } finally {
      setIsSearching(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setNewIngredient(value)
    searchIngredients(value)
  }

  const handleSelectIngredient = (ingredient: Ingredient) => {
    handleAddIngredient(ingredient.name)
  }

  const handleClearAll = () => {
    setIngredients([])
    setNewIngredient('')
    // Load all recipes when clearing
    loadAllRecipes()
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (searchResults.length > 0 && showDropdown) {
        handleSelectIngredient(searchResults[0])
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false)
    } else if (e.key === 'ArrowDown' && searchResults.length > 0) {
      e.preventDefault()
      // Focus first dropdown item (could be enhanced with keyboard navigation)
    }
  }

  const handleButtonClick = () => {
    // Only allow adding if there's a matching ingredient from search results
    if (searchResults.length > 0 && showDropdown) {
      const exactMatch = searchResults.find(ingredient => 
        ingredient.name.toLowerCase() === newIngredient.toLowerCase()
      )
      if (exactMatch) {
        handleSelectIngredient(exactMatch)
      } else {
        // Select the first result if no exact match
        handleSelectIngredient(searchResults[0])
      }
    }
  }

  const loadAllRecipes = async () => {
    console.log('Loading all recipes...')
    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients: [] }), // Empty ingredients to get all recipes
      })

      console.log('Response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Received data:', data)
        console.log('Number of recipes:', data.recipes?.length)
        setRecipes(data.recipes || [])
      } else {
        console.error('Failed to fetch recipes')
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFindRecipes = async () => {
    if (ingredients.length === 0) {
      loadAllRecipes()
      return
    }

    setLoading(true)
    try {
      const response = await fetch('http://localhost:8080/api/recipes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      })

      if (response.ok) {
        const data = await response.json()
        setRecipes(data.recipes)
      } else {
        console.error('Failed to fetch recipes')
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Load all recipes on component mount
  useEffect(() => {
    console.log('useEffect running...')
    loadAllRecipes()
  }, [])

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const getHeaderTitle = () => {
    if (ingredients.length === 0) {
      return "All Recipes"
    }
    return `Recipe Results ${recipes.length > 0 ? `(${recipes.length} found)` : ''}`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="w-full lg:w-80 bg-white rounded-lg shadow-sm p-6 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Ingredients</h2>
            
            {/* Ingredients Display */}
            <div className="mb-4 min-h-[60px] p-3 border border-gray-200 rounded-lg bg-gray-50">
              {ingredients.length === 0 ? (
                <p className="text-gray-500 text-sm">Your ingredients will appear here...</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full"
                    >
                      {ingredient}
                      <button
                        onClick={() => setIngredients(ingredients.filter((_, i) => i !== index))}
                        className="hover:bg-orange-200 rounded-full p-0.5"
                        aria-label={`Remove ${ingredient}`}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Ingredient Input */}
            <div className="relative mb-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newIngredient}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyPress}
                    placeholder="Type an ingredient..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  
                  {/* Dropdown */}
                  {showDropdown && (
                    <div 
                      ref={dropdownRef}
                      className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto"
                    >
                      {isSearching ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((ingredient) => (
                          <button
                            key={ingredient.id}
                            onClick={() => handleSelectIngredient(ingredient)}
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                          >
                            <img 
                              src={ingredient.image} 
                              alt={ingredient.name}
                              className="w-8 h-8 rounded object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <span className="text-sm">{ingredient.name}</span>
                          </button>
                        ))
                      ) : newIngredient.length >= 2 ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          No ingredients found
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
                <button
                  onClick={handleButtonClick}
                  disabled={!newIngredient.trim() || searchResults.length === 0}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleFindRecipes}
                disabled={loading}
                className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 disabled:bg-orange-300 font-medium text-sm"
              >
                {loading ? 'Finding...' : 'Find Recipes'}
              </button>
              <button
                onClick={handleClearAll}
                disabled={ingredients.length === 0}
                className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed font-medium text-sm"
              >
                Clear All
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{getHeaderTitle()}</h1>
              <p className="text-gray-600">
                {ingredients.length === 0 
                  ? "Discover delicious recipes from our collection" 
                  : `Recipes that match your ingredients: ${ingredients.join(', ')}`
                }
              </p>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-gray-500">Loading recipes...</div>
              </div>
            ) : recipes.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} userIngredients={ingredients} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">No recipes found</div>
                <p className="text-gray-400 text-sm">Try adding different ingredients or clearing your current selection</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
