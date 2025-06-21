'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChefHat, ArrowLeft } from 'lucide-react'
import IngredientInput from '@/components/IngredientInput'

export default function DemoPage() {
  const [ingredients, setIngredients] = useState<string[]>([
    '2 cups all-purpose flour',
    '1 tsp baking powder',
    '1/2 tsp salt'
  ])

  const handleIngredientsChange = (newIngredients: string[]) => {
    setIngredients(newIngredients)
    console.log('Ingredients updated:', newIngredients)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <h1 className="ml-2 text-2xl font-bold text-gray-900">Recipe Finder</h1>
              </Link>
            </div>
            <Link 
              href="/" 
              className="flex items-center text-gray-600 hover:text-orange-600 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Ingredient Input Component Demo
            </h2>
            <p className="text-gray-600">
              This demo showcases the IngredientInput component with all its features including 
              adding, editing, removing ingredients, validation, and keyboard shortcuts.
            </p>
          </div>

          {/* Component Demo */}
          <div className="space-y-8">
            <IngredientInput
              ingredients={ingredients}
              onChange={handleIngredientsChange}
              placeholder="Enter ingredient with quantity (e.g., 2 cups flour)"
              maxIngredients={20}
            />

            {/* Current State Display */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Current State (for development)
              </h3>
              <div className="bg-gray-100 rounded-md p-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Ingredients Array:</strong>
                </p>
                <pre className="text-xs text-gray-800 bg-white p-3 rounded border overflow-x-auto">
{JSON.stringify(ingredients, null, 2)}
                </pre>
                <p className="text-sm text-gray-600 mt-3">
                  <strong>Total Count:</strong> {ingredients.length} ingredients
                </p>
              </div>
            </div>

            {/* Feature Overview */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Component Features
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">✨ Core Features</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Add ingredients with validation</li>
                    <li>• Edit ingredients inline</li>
                    <li>• Remove individual ingredients</li>
                    <li>• Clear all ingredients</li>
                    <li>• Duplicate detection</li>
                    <li>• Maximum limit enforcement</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">⌨️ Keyboard Shortcuts</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Enter</kbd> - Add/Save ingredient</li>
                    <li>• <kbd className="px-1 py-0.5 bg-gray-200 rounded text-xs">Escape</kbd> - Cancel editing</li>
                    <li>• Auto-focus on edit mode</li>
                    <li>• Responsive design</li>
                    <li>• Accessibility support</li>
                    <li>• TypeScript types included</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Usage Example */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Usage Example
              </h3>
              <div className="bg-gray-900 text-gray-100 rounded-md p-4 overflow-x-auto">
                <pre className="text-sm">
{`import IngredientInput from '@/components/IngredientInput'

function RecipeForm() {
  const [ingredients, setIngredients] = useState<string[]>([])

  return (
    <IngredientInput
      ingredients={ingredients}
      onChange={setIngredients}
      placeholder="Enter ingredient with quantity"
      maxIngredients={50}
      className="mb-6"
    />
  )
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 