package services

import (
	"crypto/md5"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

// StorageService handles persistent storage of recipes
type StorageService struct {
	dataDir   string
	fileMutex sync.RWMutex
}

// StoredRecipe represents a recipe with metadata for storage
type StoredRecipe struct {
	Recipe
	StoredAt         time.Time `json:"storedAt"`
	SearchQuery      string    `json:"searchQuery"`      // The original ingredients used to find this recipe
	NormalizedQuery  string    `json:"normalizedQuery"`  // The normalized/sorted ingredients
	Source           string    `json:"source"`           // "spoonacular"
	Filename         string    `json:"filename"`         // The hash-based filename for reference
}

// StoredIngredient represents an ingredient with metadata for storage
type StoredIngredient struct {
	Ingredient
	StoredAt    time.Time `json:"storedAt"`
	SearchQuery string    `json:"searchQuery"` // The query used to find this ingredient
	Source      string    `json:"source"`      // "spoonacular"
	Filename    string    `json:"filename"`    // The hash-based filename for reference
}

// IngredientStorage represents the storage structure for ingredients
type IngredientStorage struct {
	Ingredients []StoredIngredient `json:"ingredients"`
	LastUpdated time.Time          `json:"lastUpdated"`
	SearchQuery string             `json:"searchQuery"`
}

// RecipeStorage represents the structure of our JSON storage files
type RecipeStorage struct {
	LastUpdated time.Time      `json:"lastUpdated"`
	Recipes     []StoredRecipe `json:"recipes"`
}



// NewStorageService creates a new storage service
func NewStorageService() *StorageService {
	dataDir := "data"
	
	// Create data directory if it doesn't exist
	if err := os.MkdirAll(dataDir, 0755); err != nil {
		fmt.Printf("⚠️  Warning: Could not create data directory: %v\n", err)
	}

	return &StorageService{
		dataDir: dataDir,
	}
}

// SaveRecipes saves recipes to persistent storage
func (s *StorageService) SaveRecipes(recipes []Recipe, searchQuery string) error {
	s.fileMutex.Lock()
	defer s.fileMutex.Unlock()

	// Create filename based on search query
	filename := s.getFilename(searchQuery)
	filepath := filepath.Join(s.dataDir, filename)
	normalizedQuery := s.normalizeSearchQuery(searchQuery)

	// Convert recipes to stored format
	storedRecipes := make([]StoredRecipe, len(recipes))
	for i, recipe := range recipes {
		storedRecipes[i] = StoredRecipe{
			Recipe:          recipe,
			StoredAt:        time.Now(),
			SearchQuery:     searchQuery,
			NormalizedQuery: normalizedQuery,
			Source:          "spoonacular",
			Filename:        filename,
		}
	}

	// Create storage structure
	storage := RecipeStorage{
		LastUpdated: time.Now(),
		Recipes:     storedRecipes,
	}

	// Write to file
	data, err := json.MarshalIndent(storage, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal recipes: %v", err)
	}

	if err := os.WriteFile(filepath, data, 0644); err != nil {
		return fmt.Errorf("failed to write recipes to file: %v", err)
	}

	fmt.Printf("💾 Saved %d recipes to %s (query: %s)\n", len(recipes), filename, searchQuery)
	return nil
}

// LoadRecipes loads recipes from persistent storage
func (s *StorageService) LoadRecipes(searchQuery string) ([]Recipe, error) {
	s.fileMutex.RLock()
	defer s.fileMutex.RUnlock()

	filename := s.getFilename(searchQuery)
	filepath := filepath.Join(s.dataDir, filename)

	// Check if file exists
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		return nil, nil // No stored data, not an error
	}

	// Read file
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to read recipes file: %v", err)
	}

	// Parse JSON
	var storage RecipeStorage
	if err := json.Unmarshal(data, &storage); err != nil {
		return nil, fmt.Errorf("failed to parse recipes file: %v", err)
	}

	// Check if data is still fresh (within 7 days)
	if time.Since(storage.LastUpdated) > 7*24*time.Hour {
		fmt.Printf("📅 Stored data for '%s' is older than 7 days, will refresh\n", searchQuery)
		return nil, nil // Data too old, treat as no data
	}

	// Convert back to Recipe format
	recipes := make([]Recipe, len(storage.Recipes))
	for i, storedRecipe := range storage.Recipes {
		recipes[i] = storedRecipe.Recipe
	}

	fmt.Printf("📂 Loaded %d recipes from %s (query: %s)\n", len(recipes), filename, searchQuery)
	return recipes, nil
}

// GetAllStoredRecipes returns all stored recipes for browsing
func (s *StorageService) GetAllStoredRecipes() ([]StoredRecipe, error) {
	s.fileMutex.RLock()
	defer s.fileMutex.RUnlock()

	var allRecipes []StoredRecipe

	// Read all JSON files in data directory
	files, err := os.ReadDir(s.dataDir)
	if err != nil {
		return nil, fmt.Errorf("failed to read data directory: %v", err)
	}

	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
			filepath := filepath.Join(s.dataDir, file.Name())
			
			data, err := os.ReadFile(filepath)
			if err != nil {
				continue // Skip files we can't read
			}

			var storage RecipeStorage
			if err := json.Unmarshal(data, &storage); err != nil {
				continue // Skip files we can't parse
			}

			allRecipes = append(allRecipes, storage.Recipes...)
		}
	}

	return allRecipes, nil
}

// GetStorageStats returns statistics about stored data
func (s *StorageService) GetStorageStats() (map[string]interface{}, error) {
	s.fileMutex.RLock()
	defer s.fileMutex.RUnlock()

	stats := map[string]interface{}{
		"totalFiles":   0,
		"totalRecipes": 0,
		"oldestEntry":  time.Now(),
		"newestEntry":  time.Time{},
		"searchQueries": []string{},
	}

	files, err := os.ReadDir(s.dataDir)
	if err != nil {
		return stats, fmt.Errorf("failed to read data directory: %v", err)
	}

	var searchQueries []string
	totalRecipes := 0
	oldestEntry := time.Now()
	newestEntry := time.Time{}

	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
			stats["totalFiles"] = stats["totalFiles"].(int) + 1
			
			filepath := filepath.Join(s.dataDir, file.Name())
			data, err := os.ReadFile(filepath)
			if err != nil {
				continue
			}

			var storage RecipeStorage
			if err := json.Unmarshal(data, &storage); err != nil {
				continue
			}

			totalRecipes += len(storage.Recipes)
			
			if storage.LastUpdated.Before(oldestEntry) {
				oldestEntry = storage.LastUpdated
			}
			if storage.LastUpdated.After(newestEntry) {
				newestEntry = storage.LastUpdated
			}

			// Extract search query from filename
			query := s.getSearchQueryFromFilename(file.Name())
			if query != "" {
				searchQueries = append(searchQueries, query)
			}
		}
	}

	stats["totalRecipes"] = totalRecipes
	stats["oldestEntry"] = oldestEntry
	stats["newestEntry"] = newestEntry
	stats["searchQueries"] = searchQueries

	return stats, nil
}

// CleanOldData removes data older than specified days
func (s *StorageService) CleanOldData(olderThanDays int) error {
	s.fileMutex.Lock()
	defer s.fileMutex.Unlock()

	cutoffTime := time.Now().AddDate(0, 0, -olderThanDays)
	
	files, err := os.ReadDir(s.dataDir)
	if err != nil {
		return fmt.Errorf("failed to read data directory: %v", err)
	}

	removedCount := 0
	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" {
			filepath := filepath.Join(s.dataDir, file.Name())
			
			data, err := os.ReadFile(filepath)
			if err != nil {
				continue
			}

			var storage RecipeStorage
			if err := json.Unmarshal(data, &storage); err != nil {
				continue
			}

			if storage.LastUpdated.Before(cutoffTime) {
				if err := os.Remove(filepath); err == nil {
					removedCount++
					fmt.Printf("🗑️  Removed old data file: %s\n", file.Name())
				}
			}
		}
	}

	if removedCount > 0 {
		fmt.Printf("🧹 Cleaned %d old data files\n", removedCount)
	}

	return nil
}

// getFilename generates a safe filename from search query using hash
func (s *StorageService) getFilename(searchQuery string) string {
	if searchQuery == "" {
		return "popular_recipes.json"
	}
	
	// Normalize the search query for consistent hashing
	normalized := s.normalizeSearchQuery(searchQuery)
	
	// Create MD5 hash of normalized query
	hasher := md5.New()
	hasher.Write([]byte(normalized))
	hash := hex.EncodeToString(hasher.Sum(nil))
	
	// Use first 12 characters of hash for shorter filenames
	shortHash := hash[:12]
	
	return fmt.Sprintf("recipes_%s.json", shortHash)
}

// normalizeSearchQuery normalizes ingredients for consistent hashing
func (s *StorageService) normalizeSearchQuery(searchQuery string) string {
	if searchQuery == "" {
		return ""
	}
	
	// Split by comma, trim spaces, convert to lowercase, and sort
	ingredients := strings.Split(searchQuery, ",")
	normalized := make([]string, 0, len(ingredients))
	
	for _, ingredient := range ingredients {
		trimmed := strings.TrimSpace(strings.ToLower(ingredient))
		if trimmed != "" {
			normalized = append(normalized, trimmed)
		}
	}
	
	// Sort ingredients to ensure consistent order
	sort.Strings(normalized)
	
	// Join back with commas
	return strings.Join(normalized, ",")
}

// getSearchQueryFromFilename extracts search query from stored recipe data
func (s *StorageService) getSearchQueryFromFilename(filename string) string {
	if filename == "popular_recipes.json" {
		return "popular"
	}
	
	// For hash-based filenames, we need to read the file to get the search query
	filepath := filepath.Join(s.dataDir, filename)
	data, err := os.ReadFile(filepath)
	if err != nil {
		return "unknown"
	}

	var storage RecipeStorage
	if err := json.Unmarshal(data, &storage); err != nil {
		return "unknown"
	}

	// Return the original search query from the first recipe
	if len(storage.Recipes) > 0 {
		return storage.Recipes[0].SearchQuery
	}

	return "unknown"
}

// CreateFilenameMapping creates a mapping file for easier debugging
func (s *StorageService) CreateFilenameMapping() error {
	s.fileMutex.RLock()
	defer s.fileMutex.RUnlock()

	mapping := make(map[string]interface{})
	
	files, err := os.ReadDir(s.dataDir)
	if err != nil {
		return fmt.Errorf("failed to read data directory: %v", err)
	}

	for _, file := range files {
		if !file.IsDir() && filepath.Ext(file.Name()) == ".json" && file.Name() != "filename_mapping.json" {
			filepath := filepath.Join(s.dataDir, file.Name())
			data, err := os.ReadFile(filepath)
			if err != nil {
				continue
			}

			var storage RecipeStorage
			if err := json.Unmarshal(data, &storage); err != nil {
				continue
			}

			if len(storage.Recipes) > 0 {
				mapping[file.Name()] = map[string]interface{}{
					"searchQuery":     storage.Recipes[0].SearchQuery,
					"normalizedQuery": storage.Recipes[0].NormalizedQuery,
					"recipeCount":     len(storage.Recipes),
					"lastUpdated":     storage.LastUpdated,
				}
			}
		}
	}

	// Write mapping file
	mappingData, err := json.MarshalIndent(mapping, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal mapping: %v", err)
	}

	mappingPath := filepath.Join(s.dataDir, "filename_mapping.json")
	if err := os.WriteFile(mappingPath, mappingData, 0644); err != nil {
		return fmt.Errorf("failed to write mapping file: %v", err)
	}

	fmt.Printf("📋 Created filename mapping with %d entries\n", len(mapping))
	return nil
}

// SaveIngredients saves ingredients to persistent storage with caching
func (s *StorageService) SaveIngredients(ingredients []Ingredient, searchQuery string) error {
	s.fileMutex.Lock()
	defer s.fileMutex.Unlock()

	// Create filename based on search query
	filename := s.getIngredientFilename(searchQuery)
	filepath := filepath.Join(s.dataDir, filename)

	// Convert ingredients to stored format
	storedIngredients := make([]StoredIngredient, len(ingredients))
	for i, ingredient := range ingredients {
		storedIngredients[i] = StoredIngredient{
			Ingredient:  ingredient,
			StoredAt:    time.Now(),
			SearchQuery: searchQuery,
			Source:      "spoonacular",
			Filename:    filename,
		}
	}

	// Create storage structure
	storage := IngredientStorage{
		Ingredients: storedIngredients,
		LastUpdated: time.Now(),
		SearchQuery: searchQuery,
	}

	// Write to file
	data, err := json.MarshalIndent(storage, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal ingredients: %v", err)
	}

	if err := os.WriteFile(filepath, data, 0644); err != nil {
		return fmt.Errorf("failed to write ingredients file: %v", err)
	}

	fmt.Printf("💾 Saved %d ingredients to %s (query: %s)\n", len(ingredients), filename, searchQuery)
	return nil
}

// LoadIngredients loads ingredients from persistent storage
func (s *StorageService) LoadIngredients(searchQuery string) ([]Ingredient, error) {
	s.fileMutex.RLock()
	defer s.fileMutex.RUnlock()

	// Create filename based on search query
	filename := s.getIngredientFilename(searchQuery)
	filepath := filepath.Join(s.dataDir, filename)

	// Check if file exists
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		return nil, fmt.Errorf("ingredients file not found")
	}

	// Read file
	data, err := os.ReadFile(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to read ingredients file: %v", err)
	}

	// Parse JSON
	var storage IngredientStorage
	if err := json.Unmarshal(data, &storage); err != nil {
		return nil, fmt.Errorf("failed to parse ingredients file: %v", err)
	}

	// Check if data is fresh (within 7 days)
	if time.Since(storage.LastUpdated) > 7*24*time.Hour {
		return nil, fmt.Errorf("ingredients data is stale")
	}

	// Convert back to our ingredient format
	ingredients := make([]Ingredient, len(storage.Ingredients))
	for i, stored := range storage.Ingredients {
		ingredients[i] = stored.Ingredient
	}

	fmt.Printf("📂 Loaded %d ingredients from %s (query: %s)\n", len(ingredients), filename, searchQuery)
	return ingredients, nil
}

// getIngredientFilename generates a safe filename for ingredient search queries
func (s *StorageService) getIngredientFilename(searchQuery string) string {
	// Normalize the search query for consistent hashing
	normalized := strings.ToLower(strings.TrimSpace(searchQuery))
	
	// Create MD5 hash of normalized query
	hasher := md5.New()
	hasher.Write([]byte(normalized))
	hash := hex.EncodeToString(hasher.Sum(nil))
	
	// Use first 12 characters of hash for shorter filenames
	shortHash := hash[:12]
	
	return fmt.Sprintf("ingredients_%s.json", shortHash)
}

// SaveRecipeDetails saves detailed recipe information to persistent storage
func (s *StorageService) SaveRecipeDetails(recipeDetails *RecipeDetails, recipeID string) error {
	s.fileMutex.Lock()
	defer s.fileMutex.Unlock()

	// Ensure data directory exists
	if err := s.ensureDataDir(); err != nil {
		return err
	}

	// Create filename for recipe details
	filename := fmt.Sprintf("recipe_details_%s.json", recipeID)
	filepath := filepath.Join(s.dataDir, filename)

	// Create storage data structure
	data := RecipeDetailsStorage{
		RecipeDetails: recipeDetails,
		Metadata: StorageMetadata{
			Timestamp:   time.Now(),
			RecipeID:    recipeID,
			Source:      "spoonacular_details",
			Filename:    filename,
		},
	}

	// Write to file
	file, err := os.Create(filepath)
	if err != nil {
		return fmt.Errorf("failed to create recipe details file: %v", err)
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	encoder.SetIndent("", "  ")
	if err := encoder.Encode(data); err != nil {
		return fmt.Errorf("failed to encode recipe details: %v", err)
	}

	fmt.Printf("💾 Saved recipe details to %s\n", filename)
	return nil
}

// LoadRecipeDetails loads detailed recipe information from persistent storage
func (s *StorageService) LoadRecipeDetails(recipeID string) (*RecipeDetails, error) {
	s.fileMutex.RLock()
	defer s.fileMutex.RUnlock()

	// Create filename for recipe details
	filename := fmt.Sprintf("recipe_details_%s.json", recipeID)
	filepath := filepath.Join(s.dataDir, filename)

	// Check if file exists
	if _, err := os.Stat(filepath); os.IsNotExist(err) {
		return nil, fmt.Errorf("recipe details file not found")
	}

	// Read file
	file, err := os.Open(filepath)
	if err != nil {
		return nil, fmt.Errorf("failed to open recipe details file: %v", err)
	}
	defer file.Close()

	// Decode data
	var data RecipeDetailsStorage
	if err := json.NewDecoder(file).Decode(&data); err != nil {
		return nil, fmt.Errorf("failed to decode recipe details: %v", err)
	}

	// Check if data is fresh (within 7 days)
	if time.Since(data.Metadata.Timestamp) > 7*24*time.Hour {
		return nil, fmt.Errorf("recipe details data is stale")
	}

	fmt.Printf("📂 Loaded recipe details from storage for recipe %s\n", recipeID)
	return data.RecipeDetails, nil
}

// RecipeDetailsStorage represents the storage structure for recipe details
type RecipeDetailsStorage struct {
	RecipeDetails *RecipeDetails    `json:"recipe_details"`
	Metadata      StorageMetadata   `json:"metadata"`
}

// StorageMetadata represents the metadata for stored data
type StorageMetadata struct {
	Timestamp   time.Time `json:"timestamp"`
	RecipeID    string    `json:"recipeID"`
	Source      string    `json:"source"`
	Filename    string    `json:"filename"`
}

// ensureDataDir ensures the data directory exists
func (s *StorageService) ensureDataDir() error {
	if err := os.MkdirAll(s.dataDir, 0755); err != nil {
		return fmt.Errorf("failed to ensure data directory: %v", err)
	}
	return nil
} 