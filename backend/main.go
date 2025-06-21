package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
	"github.com/rs/cors"
	"recipe-finder-backend/handlers"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Printf("Warning: .env file not found: %v", err)
	}

	// Create handlers
	recipeHandler := handlers.NewRecipeHandler()

	// Create a new router
	r := mux.NewRouter()

	// API routes
	api := r.PathPrefix("/api/v1").Subrouter()
	
	// Health check endpoint
	api.HandleFunc("/health", recipeHandler.HealthCheck).Methods("GET")
	
	// Storage stats endpoint
	api.HandleFunc("/storage/stats", recipeHandler.GetStorageStats).Methods("GET")
	
	// Storage filename mapping endpoint
	api.HandleFunc("/storage/mapping", recipeHandler.CreateFilenameMapping).Methods("POST")
	
	// Ingredient search endpoint
	api.HandleFunc("/ingredients/search", recipeHandler.SearchIngredients).Methods("GET")
	
	// Recipe search endpoint for autocomplete
	api.HandleFunc("/search/recipes", recipeHandler.SearchRecipes).Methods("GET")
	
	// Recipe details endpoint - MUST come before generic recipe search
	fmt.Printf("📝 Registering route: GET /api/v1/recipes/{id}\n")
	api.HandleFunc("/recipes/{id}", recipeHandler.GetRecipeDetails).Methods("GET")
	
	// Test route
	api.HandleFunc("/recipes/test", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]string{"message": "test route works"})
	}).Methods("GET")
	
	// Recipe search endpoint - accepts ingredients and returns recipes (different path)
	r.HandleFunc("/api/recipes", recipeHandler.GetRecipesByIngredients).Methods("GET", "POST", "OPTIONS")

	// Setup CORS
	allowedOrigins := []string{"http://localhost:3000", "http://localhost:3001"} // Default origins
	if origins := os.Getenv("ALLOWED_ORIGINS"); origins != "" {
		allowedOrigins = strings.Split(origins, ",")
		// Trim whitespace from each origin
		for i, origin := range allowedOrigins {
			allowedOrigins[i] = strings.TrimSpace(origin)
		}
	}
	
	c := cors.New(cors.Options{
		AllowedOrigins: allowedOrigins,
		AllowedMethods: []string{"GET", "POST", "OPTIONS"},
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
	fmt.Printf("📚 Health check: http://localhost:%s/api/v1/health\n", port)
	fmt.Printf("🍽️  Recipe search: POST http://localhost:%s/api/recipes\n", port)
	fmt.Printf("🔍 Recipe details: GET http://localhost:%s/api/v1/recipes/{id}\n", port)
	
	// Walk through all routes for debugging
	r.Walk(func(route *mux.Route, router *mux.Router, ancestors []*mux.Route) error {
		template, _ := route.GetPathTemplate()
		methods, _ := route.GetMethods()
		fmt.Printf("📋 Route: %v %s\n", methods, template)
		return nil
	})
	
	log.Fatal(http.ListenAndServe(":"+port, handler))
} 