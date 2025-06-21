package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/gorilla/mux"
	"recipe-finder-backend/models"
)

// RecipeHandler handles recipe-related HTTP requests
type RecipeHandler struct {
	// In a real application, this would be a database connection or service
	// For now, we'll use an in-memory slice for demonstration
	recipes []models.Recipe
}

// NewRecipeHandler creates a new recipe handler
func NewRecipeHandler() *RecipeHandler {
	return &RecipeHandler{
		recipes: []models.Recipe{},
	}
}

// GetRecipes handles GET /api/v1/recipes
func (h *RecipeHandler) GetRecipes(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	response := map[string]interface{}{
		"recipes": h.recipes,
		"total":   len(h.recipes),
	}
	
	json.NewEncoder(w).Encode(response)
}

// CreateRecipe handles POST /api/v1/recipes
func (h *RecipeHandler) CreateRecipe(w http.ResponseWriter, r *http.Request) {
	var req models.CreateRecipeRequest
	
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Create new recipe
	recipe := models.Recipe{
		ID:           generateID(),
		Title:        req.Title,
		Description:  req.Description,
		Ingredients:  req.Ingredients,
		Instructions: req.Instructions,
		PrepTime:     req.PrepTime,
		CookTime:     req.CookTime,
		Servings:     req.Servings,
		Difficulty:   req.Difficulty,
		Category:     req.Category,
		Tags:         req.Tags,
		ImageURL:     req.ImageURL,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	
	// Add to in-memory storage
	h.recipes = append(h.recipes, recipe)
	
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(recipe)
}

// GetRecipe handles GET /api/v1/recipes/{id}
func (h *RecipeHandler) GetRecipe(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Find recipe by ID
	for _, recipe := range h.recipes {
		if recipe.ID == id {
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(recipe)
			return
		}
	}
	
	http.Error(w, "Recipe not found", http.StatusNotFound)
}

// UpdateRecipe handles PUT /api/v1/recipes/{id}
func (h *RecipeHandler) UpdateRecipe(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	var req models.UpdateRecipeRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	
	// Find and update recipe
	for i, recipe := range h.recipes {
		if recipe.ID == id {
			// Update fields if provided
			if req.Title != nil {
				recipe.Title = *req.Title
			}
			if req.Description != nil {
				recipe.Description = *req.Description
			}
			if req.Ingredients != nil {
				recipe.Ingredients = *req.Ingredients
			}
			if req.Instructions != nil {
				recipe.Instructions = *req.Instructions
			}
			if req.PrepTime != nil {
				recipe.PrepTime = *req.PrepTime
			}
			if req.CookTime != nil {
				recipe.CookTime = *req.CookTime
			}
			if req.Servings != nil {
				recipe.Servings = *req.Servings
			}
			if req.Difficulty != nil {
				recipe.Difficulty = *req.Difficulty
			}
			if req.Category != nil {
				recipe.Category = *req.Category
			}
			if req.Tags != nil {
				recipe.Tags = *req.Tags
			}
			if req.ImageURL != nil {
				recipe.ImageURL = *req.ImageURL
			}
			
			recipe.UpdatedAt = time.Now()
			h.recipes[i] = recipe
			
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(recipe)
			return
		}
	}
	
	http.Error(w, "Recipe not found", http.StatusNotFound)
}

// DeleteRecipe handles DELETE /api/v1/recipes/{id}
func (h *RecipeHandler) DeleteRecipe(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]
	
	// Find and remove recipe
	for i, recipe := range h.recipes {
		if recipe.ID == id {
			// Remove recipe from slice
			h.recipes = append(h.recipes[:i], h.recipes[i+1:]...)
			
			w.Header().Set("Content-Type", "application/json")
			response := map[string]string{
				"message": "Recipe deleted successfully",
				"id":      id,
			}
			json.NewEncoder(w).Encode(response)
			return
		}
	}
	
	http.Error(w, "Recipe not found", http.StatusNotFound)
}

// SearchRecipes handles GET /api/v1/search
func (h *RecipeHandler) SearchRecipes(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query().Get("q")
	category := r.URL.Query().Get("category")
	difficulty := r.URL.Query().Get("difficulty")
	
	var filteredRecipes []models.Recipe
	
	// Simple search implementation
	for _, recipe := range h.recipes {
		match := true
		
		// Filter by query (search in title and description)
		if query != "" {
			if !contains(recipe.Title, query) && !contains(recipe.Description, query) {
				match = false
			}
		}
		
		// Filter by category
		if category != "" && recipe.Category != category {
			match = false
		}
		
		// Filter by difficulty
		if difficulty != "" && recipe.Difficulty != difficulty {
			match = false
		}
		
		if match {
			filteredRecipes = append(filteredRecipes, recipe)
		}
	}
	
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"recipes": filteredRecipes,
		"total":   len(filteredRecipes),
		"query":   query,
	}
	json.NewEncoder(w).Encode(response)
}

// Helper functions
func generateID() string {
	// Simple ID generation - in production, use UUID or similar
	return time.Now().Format("20060102150405")
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(substr) == 0 || 
		(len(s) > len(substr) && (s[:len(substr)] == substr || 
		s[len(s)-len(substr):] == substr || 
		containsSubstring(s, substr))))
}

func containsSubstring(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
} 