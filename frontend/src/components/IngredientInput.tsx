'use client'

import { useState } from 'react'
import { Plus, X, Edit2, Check, RotateCcw } from 'lucide-react'
import { IngredientInputProps } from '@/types/recipe'

export default function IngredientInput({
  ingredients,
  onChange,
  placeholder = "Enter ingredient (e.g., 2 cups flour, 1 tsp salt)",
  maxIngredients = 50,
  className = ""
}: IngredientInputProps) {
  const [newIngredient, setNewIngredient] = useState('')
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [error, setError] = useState('')

  const addIngredient = () => {
    const trimmedIngredient = newIngredient.trim()
    
    // Validation
    if (!trimmedIngredient) {
      setError('Please enter an ingredient')
      return
    }
    
    if (trimmedIngredient.length < 2) {
      setError('Ingredient must be at least 2 characters long')
      return
    }
    
    if (ingredients.length >= maxIngredients) {
      setError(`Maximum ${maxIngredients} ingredients allowed`)
      return
    }
    
    // Check for duplicates (case insensitive)
    if (ingredients.some(ingredient => 
      ingredient.toLowerCase() === trimmedIngredient.toLowerCase()
    )) {
      setError('This ingredient is already added')
      return
    }
    
    // Add ingredient
    onChange([...ingredients, trimmedIngredient])
    setNewIngredient('')
    setError('')
  }

  const removeIngredient = (index: number) => {
    const updatedIngredients = ingredients.filter((_, i) => i !== index)
    onChange(updatedIngredients)
    
    // Reset editing state if we're editing the removed ingredient
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditingValue('')
    }
  }

  const startEditing = (index: number) => {
    setEditingIndex(index)
    setEditingValue(ingredients[index])
    setError('')
  }

  const saveEdit = () => {
    const trimmedValue = editingValue.trim()
    
    if (!trimmedValue) {
      setError('Please enter an ingredient')
      return
    }
    
    if (trimmedValue.length < 2) {
      setError('Ingredient must be at least 2 characters long')
      return
    }
    
    // Check for duplicates (excluding the current ingredient being edited)
    if (ingredients.some((ingredient, index) => 
      index !== editingIndex && 
      ingredient.toLowerCase() === trimmedValue.toLowerCase()
    )) {
      setError('This ingredient is already added')
      return
    }
    
    // Update ingredient
    const updatedIngredients = [...ingredients]
    updatedIngredients[editingIndex!] = trimmedValue
    onChange(updatedIngredients)
    
    // Reset editing state
    setEditingIndex(null)
    setEditingValue('')
    setError('')
  }

  const cancelEdit = () => {
    setEditingIndex(null)
    setEditingValue('')
    setError('')
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: 'add' | 'edit') => {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (action === 'add') {
        addIngredient()
      } else {
        saveEdit()
      }
    } else if (e.key === 'Escape' && action === 'edit') {
      cancelEdit()
    }
  }

  const clearAll = () => {
    onChange([])
    setNewIngredient('')
    setEditingIndex(null)
    setEditingValue('')
    setError('')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-800">
          Ingredients
          <span className="text-red-500 ml-1">*</span>
          <span className="text-gray-700 font-normal ml-2">
            ({ingredients.length}/{maxIngredients})
          </span>
        </label>
        {ingredients.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="flex items-center text-sm text-gray-700 hover:text-red-600 transition-colors"
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Clear All
          </button>
        )}
      </div>

      {/* Add New Ingredient */}
      <div className="flex gap-2">
        <div className="flex-1">
          <input
            type="text"
            value={newIngredient}
            onChange={(e) => setNewIngredient(e.target.value)}
            onKeyDown={(e) => handleKeyPress(e, 'add')}
            placeholder={placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent placeholder-gray-700 text-gray-900"
            disabled={ingredients.length >= maxIngredients}
          />
        </div>
        <button
          type="button"
          onClick={addIngredient}
          disabled={ingredients.length >= maxIngredients}
          className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </p>
      )}

      {/* Ingredients List */}
      {ingredients.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-800">Added Ingredients:</h4>
          <div className="max-h-64 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-3 bg-gray-50">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="flex items-center gap-2 bg-white p-2 rounded-md shadow-sm"
              >
                <span className="text-sm text-gray-700 font-medium min-w-0 flex-shrink-0">
                  {index + 1}.
                </span>
                
                {editingIndex === index ? (
                  // Edit Mode
                  <>
                    <input
                      type="text"
                      value={editingValue}
                      onChange={(e) => setEditingValue(e.target.value)}
                      onKeyDown={(e) => handleKeyPress(e, 'edit')}
                      className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-transparent text-gray-900"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="p-1 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors"
                      title="Save changes"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="p-1 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                      title="Cancel editing"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  // Display Mode
                  <>
                    <span className="flex-1 text-sm text-gray-900 break-words">
                      {ingredient}
                    </span>
                    <button
                      type="button"
                      onClick={() => startEditing(index)}
                      className="p-1 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded transition-colors"
                      title="Edit ingredient"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="p-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                      title="Remove ingredient"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Helper Text */}
      <div className="text-xs text-gray-700 space-y-1">
        <p>💡 <strong>Tips:</strong></p>
        <ul className="list-disc list-inside space-y-1 ml-4">
          <li>Include quantities and measurements (e.g., &quot;2 cups flour&quot;, &quot;1 tsp salt&quot;)</li>
          <li>Be specific about preparation (e.g., &quot;1 onion, diced&quot;, &quot;2 cloves garlic, minced&quot;)</li>
          <li>Press Enter to quickly add an ingredient</li>
          <li>Click the edit icon to modify existing ingredients</li>
        </ul>
      </div>
    </div>
  )
} 