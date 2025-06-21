package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
	"recipe-finder-backend/services"
	"github.com/gorilla/mux"
)

// RecipeHandler handles recipe-related HTTP requests
type RecipeHandler struct{
	spoonacularService *services.SpoonacularService
	storageService     *services.StorageService
}

// NewRecipeHandler creates a new recipe handler
func NewRecipeHandler() *RecipeHandler {
	return &RecipeHandler{
		spoonacularService: services.NewSpoonacularService(),
		storageService:     services.NewStorageService(),
	}
}

// HealthCheck handles GET /api/v1/health
func (h *RecipeHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	
	response := map[string]interface{}{
		"status":    "healthy",
		"timestamp": time.Now().Format(time.RFC3339),
		"service":   "Recipe Finder API",
		"version":   "1.0.0",
	}
	
	json.NewEncoder(w).Encode(response)
}

// RecipeSearchRequest represents the request body for recipe search
type RecipeSearchRequest struct {
	Ingredients []string `json:"ingredients"`
}

// Recipe represents a recipe in the response
type Recipe struct {
	ID          string   `json:"id"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Ingredients []string `json:"ingredients"`
	PrepTime    string   `json:"prepTime"`
	CookTime    string   `json:"cookTime"`
	Servings    int      `json:"servings"`
	ImageURL    string   `json:"imageUrl"`
	MatchCount  int      `json:"matchCount"`
}

// GetRecipesByIngredients handles GET and POST /api/recipes
func (h *RecipeHandler) GetRecipesByIngredients(w http.ResponseWriter, r *http.Request) {
	// Handle OPTIONS request for CORS
	if r.Method == "OPTIONS" {
		w.WriteHeader(http.StatusOK)
		return
	}
	
	var ingredients []string
	
	if r.Method == http.MethodGet {
		// Handle GET request with query parameters
		ingredientsParam := r.URL.Query().Get("ingredients")
		if ingredientsParam != "" {
			// Split comma-separated ingredients
			ingredients = strings.Split(ingredientsParam, ",")
			// Trim whitespace from each ingredient
			for i, ingredient := range ingredients {
				ingredients[i] = strings.TrimSpace(ingredient)
			}
		}
	} else if r.Method == http.MethodPost {
		// Handle POST request with JSON body
		var req RecipeSearchRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request body", http.StatusBadRequest)
			return
		}
		ingredients = req.Ingredients
	} else {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Use Spoonacular service to get recipes
	recipes, err := h.spoonacularService.SearchRecipesByIngredients(ingredients)
	if err != nil {
		// Log the error but don't expose internal details to client
		http.Error(w, "Failed to fetch recipes", http.StatusInternalServerError)
		return
	}

	// If user provided ingredients, recalculate match counts for better accuracy
	if len(ingredients) > 0 {
		for i := range recipes {
			recipes[i].MatchCount = h.spoonacularService.CalculateMatchCount(ingredients, recipes[i].Ingredients)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"recipes":     recipes,
		"total":       len(recipes),
		"ingredients": ingredients,
	}
	
	json.NewEncoder(w).Encode(response)
}

// GetStorageStats handles GET /api/v1/storage/stats
func (h *RecipeHandler) GetStorageStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	stats, err := h.storageService.GetStorageStats()
	if err != nil {
		http.Error(w, "Failed to get storage stats", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(stats)
}

// CreateFilenameMapping handles POST /api/v1/storage/mapping
func (h *RecipeHandler) CreateFilenameMapping(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	if err := h.storageService.CreateFilenameMapping(); err != nil {
		http.Error(w, "Failed to create filename mapping", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	response := map[string]string{
		"status": "success",
		"message": "Filename mapping created successfully",
	}
	json.NewEncoder(w).Encode(response)
}

// SearchIngredients handles GET /api/v1/ingredients/search
func (h *RecipeHandler) SearchIngredients(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get query parameter
	query := r.URL.Query().Get("q")
	if query == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"ingredients": []interface{}{},
			"query":       "",
		})
		return
	}

	// Search for ingredients
	ingredients, err := h.spoonacularService.SearchIngredients(query)
	if err != nil {
		http.Error(w, "Failed to search ingredients", http.StatusInternalServerError)
		return
	}

	// Return results
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"ingredients": ingredients,
		"query":       query,
		"total":       len(ingredients),
	}
	json.NewEncoder(w).Encode(response)
}

// SearchRecipes handles GET /api/v1/search/recipes
func (h *RecipeHandler) SearchRecipes(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Get query parameter
	query := r.URL.Query().Get("q")
	if query == "" {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"recipes": []interface{}{},
			"query":   "",
			"total":   0,
		})
		return
	}

	// Search for recipes using the existing service but filter by title
	recipes, err := h.spoonacularService.SearchRecipesByIngredients([]string{query})
	if err != nil {
		http.Error(w, "Failed to search recipes", http.StatusInternalServerError)
		return
	}

	// Filter recipes that contain the query in the title
	var filteredRecipes []Recipe
	for _, recipe := range recipes {
		if len(filteredRecipes) >= 8 { // Limit to 8 results for autocomplete
			break
		}
		// Check if title contains the search query (case insensitive)
		if containsIgnoreCase(recipe.Title, query) {
			// Convert services.Recipe to handlers.Recipe
			convertedRecipe := Recipe{
				ID:          recipe.ID,
				Title:       recipe.Title,
				Description: recipe.Description,
				Ingredients: recipe.Ingredients,
				PrepTime:    recipe.PrepTime,
				CookTime:    recipe.CookTime,
				Servings:    recipe.Servings,
				ImageURL:    recipe.ImageURL,
				MatchCount:  recipe.MatchCount,
			}
			filteredRecipes = append(filteredRecipes, convertedRecipe)
		}
	}

	// Return results
	w.Header().Set("Content-Type", "application/json")
	response := map[string]interface{}{
		"recipes": filteredRecipes,
		"query":   query,
		"total":   len(filteredRecipes),
	}
	json.NewEncoder(w).Encode(response)
}

// Helper function to check if a string contains another string (case insensitive)
func containsIgnoreCase(s, substr string) bool {
	return len(s) >= len(substr) && 
		   (s == substr || 
		   	(len(s) > len(substr) && 
		   	 (s[:len(substr)] == substr || 
		   	  s[len(s)-len(substr):] == substr || 
		   	  strings.Contains(strings.ToLower(s), strings.ToLower(substr)))))
}

// GetRecipeDetails handles GET /api/v1/recipes/{id}
func (h *RecipeHandler) GetRecipeDetails(w http.ResponseWriter, r *http.Request) {
	fmt.Printf("🔍 Recipe details request: %s %s\n", r.Method, r.URL.Path)
	
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Extract recipe ID from URL using gorilla/mux
	vars := mux.Vars(r)
	recipeID := vars["id"]
	fmt.Printf("🔑 Extracted recipe ID: '%s'\n", recipeID)
	
	if recipeID == "" {
		http.Error(w, "Recipe ID is required", http.StatusBadRequest)
		return
	}

	// Get recipe details from Spoonacular service
	recipeDetails, err := h.spoonacularService.GetRecipeDetails(recipeID)
	if err != nil {
		// Log the error but don't expose internal details to client
		fmt.Printf("Error fetching recipe details for ID %s: %v\n", recipeID, err)
		http.Error(w, "Failed to fetch recipe details", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(recipeDetails)
} 