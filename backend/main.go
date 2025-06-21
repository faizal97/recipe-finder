package main

import (
	"fmt"
	"log"
	"net/http"
	"os"

	"github.com/gorilla/mux"
	"github.com/rs/cors"
	"recipe-finder-backend/handlers"
)

func main() {
	// Create handlers
	recipeHandler := handlers.NewRecipeHandler()

	// Create a new router
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()
	
	// Health check endpoint
	api.HandleFunc("/health", healthCheck).Methods("GET")
	
	// Recipe endpoints
	api.HandleFunc("/recipes", recipeHandler.GetRecipes).Methods("GET")
	api.HandleFunc("/recipes", recipeHandler.CreateRecipe).Methods("POST")
	api.HandleFunc("/recipes/{id}", recipeHandler.GetRecipe).Methods("GET")
	api.HandleFunc("/recipes/{id}", recipeHandler.UpdateRecipe).Methods("PUT")
	api.HandleFunc("/recipes/{id}", recipeHandler.DeleteRecipe).Methods("DELETE")
	
	// Search endpoint
	api.HandleFunc("/search", recipeHandler.SearchRecipes).Methods("GET")

	// Setup CORS
	c := cors.New(cors.Options{
		AllowedOrigins: []string{"http://localhost:3000"}, // Frontend URL
		AllowedMethods: []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{"*"},
	})

	// Get port from environment or default to 8080
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	// Start server
	handler := c.Handler(r)
	fmt.Printf("🚀 Recipe Finder API server starting on port %s\n", port)
	fmt.Printf("📚 API Documentation: http://localhost:%s/api/v1/health\n", port)
	fmt.Printf("🔍 Search endpoint: http://localhost:%s/api/v1/search\n", port)
	fmt.Printf("📝 Recipes endpoint: http://localhost:%s/api/v1/recipes\n", port)
	log.Fatal(http.ListenAndServe(":"+port, handler))
}

// Health check handler
func healthCheck(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	fmt.Fprintf(w, `{
		"status": "healthy", 
		"message": "Recipe Finder API is running",
		"version": "1.0.0",
		"endpoints": {
			"recipes": "/api/v1/recipes",
			"search": "/api/v1/search",
			"health": "/api/v1/health"
		}
	}`)
} 