package services

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	BaseURL = "https://api.spoonacular.com/recipes"
)

// getSpoonacularAPIKey returns the API key from environment variables
func getSpoonacularAPIKey() string {
	apiKey := os.Getenv("SPOONACULAR_API_KEY")
	if apiKey == "" {
		// Fallback to hardcoded key for backward compatibility (not recommended for production)
		apiKey = "612eda099bd3478bbc9fc8866d0369c9"
	}
	return apiKey
}

// getCacheDuration returns the cache duration from environment variables
func getCacheDuration() time.Duration {
	if hours := os.Getenv("CACHE_DURATION_HOURS"); hours != "" {
		if h, err := strconv.Atoi(hours); err == nil {
			return time.Duration(h) * time.Hour
		}
	}
	return 24 * time.Hour // Default to 24 hours
}

// getAPITimeout returns the API timeout from environment variables
func getAPITimeout() time.Duration {
	if seconds := os.Getenv("API_TIMEOUT_SECONDS"); seconds != "" {
		if s, err := strconv.Atoi(seconds); err == nil {
			return time.Duration(s) * time.Second
		}
	}
	return 30 * time.Second // Default to 30 seconds
}

// SpoonacularService handles interactions with the Spoonacular API
type SpoonacularService struct {
	client    *http.Client
	cache     map[string]*CacheEntry
	cacheMux  sync.RWMutex
	storage   *StorageService
}

// CacheEntry represents a cached API response
type CacheEntry struct {
	Data      interface{}
	ExpiresAt time.Time
}

// SpoonacularRecipe represents the recipe structure from Spoonacular API
type SpoonacularRecipe struct {
	ID                     int                    `json:"id"`
	Title                  string                 `json:"title"`
	Image                  string                 `json:"image"`
	ImageType              string                 `json:"imageType"`
	UsedIngredientCount    int                    `json:"usedIngredientCount"`
	MissedIngredientCount  int                    `json:"missedIngredientCount"`
	MissedIngredients      []SpoonacularIngredient `json:"missedIngredients"`
	UsedIngredients        []SpoonacularIngredient `json:"usedIngredients"`
	UnusedIngredients      []SpoonacularIngredient `json:"unusedIngredients"`
	Likes                  int                    `json:"likes"`
}

// SpoonacularIngredient represents an ingredient from Spoonacular API
type SpoonacularIngredient struct {
	ID           int     `json:"id"`
	Amount       float64 `json:"amount"`
	Unit         string  `json:"unit"`
	UnitLong     string  `json:"unitLong"`
	UnitShort    string  `json:"unitShort"`
	Aisle        string  `json:"aisle"`
	Name         string  `json:"name"`
	Original     string  `json:"original"`
	OriginalName string  `json:"originalName"`
	Meta         []string `json:"meta"`
	Image        string  `json:"image"`
}

// SpoonacularRecipeInfo represents detailed recipe information
type SpoonacularRecipeInfo struct {
	ID                        int                    `json:"id"`
	Title                     string                 `json:"title"`
	Image                     string                 `json:"image"`
	ImageType                 string                 `json:"imageType"`
	Servings                  int                    `json:"servings"`
	ReadyInMinutes           int                    `json:"readyInMinutes"`
	PreparationMinutes       int                    `json:"preparationMinutes"`
	CookingMinutes           int                    `json:"cookingMinutes"`
	SourceUrl                string                 `json:"sourceUrl"`
	SpoonacularSourceUrl     string                 `json:"spoonacularSourceUrl"`
	HealthScore              float64                `json:"healthScore"`
	SpoonacularScore         float64                `json:"spoonacularScore"`
	PricePerServing          float64                `json:"pricePerServing"`
	AnalyzedInstructions     []interface{}          `json:"analyzedInstructions"`
	Cheap                    bool                   `json:"cheap"`
	CreditsText              string                 `json:"creditsText"`
	Cuisines                 []string               `json:"cuisines"`
	DairyFree                bool                   `json:"dairyFree"`
	Diets                    []string               `json:"diets"`
	Gaps                     string                 `json:"gaps"`
	GlutenFree               bool                   `json:"glutenFree"`
	Instructions             string                 `json:"instructions"`
	Ketogenic                bool                   `json:"ketogenic"`
	LowFodmap                bool                   `json:"lowFodmap"`
	Occasions                []string               `json:"occasions"`
	Sustainable              bool                   `json:"sustainable"`
	Vegan                    bool                   `json:"vegan"`
	Vegetarian               bool                   `json:"vegetarian"`
	VeryHealthy              bool                   `json:"veryHealthy"`
	VeryPopular              bool                   `json:"veryPopular"`
	Whole30                  bool                   `json:"whole30"`
	WeightWatcherSmartPoints int                    `json:"weightWatcherSmartPoints"`
	Dishypes                 []string               `json:"dishTypes"`
	ExtendedIngredients      []SpoonacularIngredient `json:"extendedIngredients"`
	Summary                  string                 `json:"summary"`
	WinePairing              interface{}            `json:"winePairing"`
}

// Recipe represents our internal recipe structure
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

// SpoonacularIngredientSearch represents ingredient search results from Spoonacular
type SpoonacularIngredientSearch struct {
	Results []IngredientSearchResult `json:"results"`
}

// IngredientSearchResult represents a single ingredient search result
type IngredientSearchResult struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

// Ingredient represents our internal ingredient structure
type Ingredient struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Image string `json:"image"`
}

// NewSpoonacularService creates a new Spoonacular service
func NewSpoonacularService() *SpoonacularService {
	return &SpoonacularService{
		client: &http.Client{
			Timeout: getAPITimeout(),
		},
		cache:   make(map[string]*CacheEntry),
		storage: NewStorageService(),
	}
}

// SearchRecipesByIngredients searches for recipes using the provided ingredients
func (s *SpoonacularService) SearchRecipesByIngredients(ingredients []string) ([]Recipe, error) {
	// Create search query string for storage
	searchQuery := strings.Join(ingredients, ",")
	
	// Create cache key
	cacheKey := fmt.Sprintf("search_%s", searchQuery)
	
	// Check memory cache first (fastest)
	if cachedData := s.getFromCache(cacheKey); cachedData != nil {
		if recipes, ok := cachedData.([]Recipe); ok {
			fmt.Printf("⚡ Using memory cache for ingredients: %v\n", ingredients)
			return recipes, nil
		}
	}

	// Check persistent storage (still faster than API call)
	if storedRecipes, err := s.storage.LoadRecipes(searchQuery); err == nil && storedRecipes != nil {
		// Also cache in memory for faster subsequent access
		s.setCache(cacheKey, storedRecipes)
		return storedRecipes, nil
	}

	// If no ingredients provided, return popular recipes
	if len(ingredients) == 0 {
		return s.getPopularRecipes()
	}

	// Build API URL
	ingredientsStr := strings.Join(ingredients, ",")
	apiURL := fmt.Sprintf("%s/findByIngredients?apiKey=%s&ingredients=%s&number=12&ranking=1&ignorePantry=true",
		BaseURL, getSpoonacularAPIKey(), url.QueryEscape(ingredientsStr))

	fmt.Printf("🌐 Making Spoonacular API call for ingredients: %v\n", ingredients)

	// Make API request
	resp, err := s.client.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make API request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var spoonacularRecipes []SpoonacularRecipe
	if err := json.NewDecoder(resp.Body).Decode(&spoonacularRecipes); err != nil {
		return nil, fmt.Errorf("failed to decode API response: %v", err)
	}

	// Convert to our recipe format
	recipes := make([]Recipe, 0, len(spoonacularRecipes))
	for _, sr := range spoonacularRecipes {
		recipe := s.convertSpoonacularRecipe(sr, ingredients)
		recipes = append(recipes, recipe)
	}

	// Sort by match count (highest first)
	sort.Slice(recipes, func(i, j int) bool {
		return recipes[i].MatchCount > recipes[j].MatchCount
	})

	// Save to persistent storage
	if err := s.storage.SaveRecipes(recipes, searchQuery); err != nil {
		fmt.Printf("⚠️  Warning: Could not save recipes to storage: %v\n", err)
	}

	// Cache the results in memory
	s.setCache(cacheKey, recipes)

	fmt.Printf("✅ Found %d recipes from Spoonacular API\n", len(recipes))
	return recipes, nil
}

// getPopularRecipes gets popular recipes when no ingredients are specified
func (s *SpoonacularService) getPopularRecipes() ([]Recipe, error) {
	cacheKey := "popular_recipes"
	searchQuery := "" // Empty string for popular recipes
	
	// Check memory cache first
	if cachedData := s.getFromCache(cacheKey); cachedData != nil {
		if recipes, ok := cachedData.([]Recipe); ok {
			fmt.Printf("⚡ Using memory cache for popular recipes\n")
			return recipes, nil
		}
	}

	// Check persistent storage
	if storedRecipes, err := s.storage.LoadRecipes(searchQuery); err == nil && storedRecipes != nil {
		// Also cache in memory for faster subsequent access
		s.setCache(cacheKey, storedRecipes)
		return storedRecipes, nil
	}

	// Build API URL for popular recipes
	apiURL := fmt.Sprintf("%s/random?apiKey=%s&number=12",
		BaseURL, getSpoonacularAPIKey())

	fmt.Printf("🌐 Making Spoonacular API call for popular recipes\n")

	// Make API request
	resp, err := s.client.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make API request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("API request failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var randomResponse struct {
		Recipes []SpoonacularRecipeInfo `json:"recipes"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&randomResponse); err != nil {
		return nil, fmt.Errorf("failed to decode API response: %v", err)
	}

	// Convert to our recipe format
	recipes := make([]Recipe, 0, len(randomResponse.Recipes))
	for _, sr := range randomResponse.Recipes {
		recipe := s.convertSpoonacularRecipeInfo(sr)
		recipes = append(recipes, recipe)
	}

	// Save to persistent storage
	if err := s.storage.SaveRecipes(recipes, searchQuery); err != nil {
		fmt.Printf("⚠️  Warning: Could not save popular recipes to storage: %v\n", err)
	}

	// Cache the results in memory
	s.setCache(cacheKey, recipes)

	fmt.Printf("✅ Found %d popular recipes from Spoonacular API\n", len(recipes))
	return recipes, nil
}

// convertSpoonacularRecipe converts a Spoonacular recipe to our internal format
func (s *SpoonacularService) convertSpoonacularRecipe(sr SpoonacularRecipe, userIngredients []string) Recipe {
	// Extract ingredients
	ingredients := make([]string, 0)
	for _, ing := range sr.UsedIngredients {
		ingredients = append(ingredients, ing.Name)
	}
	for _, ing := range sr.MissedIngredients {
		ingredients = append(ingredients, ing.Name)
	}

	// Remove HTML tags from title if any
	title := strings.ReplaceAll(sr.Title, "<b>", "")
	title = strings.ReplaceAll(title, "</b>", "")

	return Recipe{
		ID:          strconv.Itoa(sr.ID),
		Title:       title,
		Description: fmt.Sprintf("A delicious recipe that uses %d of your ingredients", sr.UsedIngredientCount),
		Ingredients: ingredients,
		PrepTime:    "15 min", // Default since not provided in search API
		CookTime:    "30 min", // Default since not provided in search API
		Servings:    4,        // Default since not provided in search API
		ImageURL:    sr.Image,
		MatchCount:  sr.UsedIngredientCount,
	}
}

// convertSpoonacularRecipeInfo converts detailed recipe info to our internal format
func (s *SpoonacularService) convertSpoonacularRecipeInfo(sr SpoonacularRecipeInfo) Recipe {
	// Extract ingredients
	ingredients := make([]string, 0, len(sr.ExtendedIngredients))
	for _, ing := range sr.ExtendedIngredients {
		ingredients = append(ingredients, ing.Name)
	}

	// Format cooking times
	prepTime := "15 min"
	if sr.PreparationMinutes > 0 {
		prepTime = fmt.Sprintf("%d min", sr.PreparationMinutes)
	}

	cookTime := "30 min"
	if sr.CookingMinutes > 0 {
		cookTime = fmt.Sprintf("%d min", sr.CookingMinutes)
	} else if sr.ReadyInMinutes > 0 {
		cookTime = fmt.Sprintf("%d min", sr.ReadyInMinutes)
	}

	// Clean summary for description
	description := sr.Summary
	if len(description) > 150 {
		description = description[:150] + "..."
	}
	// Remove HTML tags
	description = strings.ReplaceAll(description, "<b>", "")
	description = strings.ReplaceAll(description, "</b>", "")
	description = strings.ReplaceAll(description, "<a href=\"", "")
	description = strings.ReplaceAll(description, "\">", "")
	description = strings.ReplaceAll(description, "</a>", "")

	return Recipe{
		ID:          strconv.Itoa(sr.ID),
		Title:       sr.Title,
		Description: description,
		Ingredients: ingredients,
		PrepTime:    prepTime,
		CookTime:    cookTime,
		Servings:    sr.Servings,
		ImageURL:    sr.Image,
		MatchCount:  0, // Will be calculated based on user ingredients
	}
}

// getFromCache retrieves data from cache if it exists and is not expired
func (s *SpoonacularService) getFromCache(key string) interface{} {
	s.cacheMux.RLock()
	defer s.cacheMux.RUnlock()

	entry, exists := s.cache[key]
	if !exists || time.Now().After(entry.ExpiresAt) {
		return nil
	}

	return entry.Data
}

// setCache stores data in cache with expiration
func (s *SpoonacularService) setCache(key string, data interface{}) {
	s.cacheMux.Lock()
	defer s.cacheMux.Unlock()

	s.cache[key] = &CacheEntry{
		Data:      data,
		ExpiresAt: time.Now().Add(getCacheDuration()),
	}
}

// CalculateMatchCount calculates how many user ingredients match recipe ingredients
func (s *SpoonacularService) CalculateMatchCount(userIngredients []string, recipeIngredients []string) int {
	count := 0
	for _, userIng := range userIngredients {
		for _, recipeIng := range recipeIngredients {
			if strings.EqualFold(strings.TrimSpace(userIng), strings.TrimSpace(recipeIng)) {
				count++
				break
			}
		}
	}
	return count
}

// SearchIngredients searches for ingredients by name with caching and persistence
func (s *SpoonacularService) SearchIngredients(query string) ([]Ingredient, error) {
	if query == "" {
		return []Ingredient{}, nil
	}

	// Create cache key
	cacheKey := fmt.Sprintf("ingredients_%s", strings.ToLower(query))
	
	// Check memory cache first (fastest)
	if cachedData := s.getFromCache(cacheKey); cachedData != nil {
		if ingredients, ok := cachedData.([]Ingredient); ok {
			fmt.Printf("⚡ Using memory cache for ingredient search: %s\n", query)
			return ingredients, nil
		}
	}

	// Check persistent storage (still faster than API call)
	if storedIngredients, err := s.storage.LoadIngredients(query); err == nil && storedIngredients != nil {
		// Also cache in memory for faster subsequent access
		s.setCache(cacheKey, storedIngredients)
		return storedIngredients, nil
	}

	// Build API URL for ingredient search
	apiURL := fmt.Sprintf("https://api.spoonacular.com/food/ingredients/search?apiKey=%s&query=%s&number=10&metaInformation=false",
		getSpoonacularAPIKey(), url.QueryEscape(query))

	fmt.Printf("🌐 Making Spoonacular API call for ingredient search: %s\n", query)

	// Make API request
	resp, err := s.client.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make ingredient search API request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("ingredient search API request failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var searchResponse SpoonacularIngredientSearch
	if err := json.NewDecoder(resp.Body).Decode(&searchResponse); err != nil {
		return nil, fmt.Errorf("failed to decode ingredient search API response: %v", err)
	}

	// Convert to our ingredient format
	ingredients := make([]Ingredient, 0, len(searchResponse.Results))
	for _, result := range searchResponse.Results {
		ingredient := Ingredient{
			ID:    result.ID,
			Name:  result.Name,
			Image: fmt.Sprintf("https://spoonacular.com/cdn/ingredients_100x100/%s", result.Image),
		}
		ingredients = append(ingredients, ingredient)
	}

	// Save to persistent storage
	if err := s.storage.SaveIngredients(ingredients, query); err != nil {
		fmt.Printf("⚠️  Warning: Could not save ingredients to storage: %v\n", err)
	}

	// Cache the results in memory
	s.setCache(cacheKey, ingredients)

	fmt.Printf("✅ Found %d ingredients from Spoonacular API\n", len(ingredients))
	return ingredients, nil
}

// GetRecipeDetails fetches detailed recipe information by ID
func (s *SpoonacularService) GetRecipeDetails(recipeID string) (*RecipeDetails, error) {
	// Create cache key
	cacheKey := fmt.Sprintf("recipe_details_%s", recipeID)
	
	// Check memory cache first (fastest)
	if cachedData := s.getFromCache(cacheKey); cachedData != nil {
		if recipeDetails, ok := cachedData.(*RecipeDetails); ok {
			fmt.Printf("⚡ Using memory cache for recipe details: %s\n", recipeID)
			return recipeDetails, nil
		}
	}

	// Check persistent storage (still faster than API call)
	if storedRecipe, err := s.storage.LoadRecipeDetails(recipeID); err == nil && storedRecipe != nil {
		// Also cache in memory for faster subsequent access
		s.setCache(cacheKey, storedRecipe)
		return storedRecipe, nil
	}

	// Build API URL for detailed recipe information
	apiURL := fmt.Sprintf("%s/%s/information?apiKey=%s&includeNutrition=false",
		BaseURL, recipeID, getSpoonacularAPIKey())

	fmt.Printf("🌐 Making Spoonacular API call for recipe details: %s\n", recipeID)

	// Make API request
	resp, err := s.client.Get(apiURL)
	if err != nil {
		return nil, fmt.Errorf("failed to make recipe details API request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("recipe details API request failed with status: %d", resp.StatusCode)
	}

	// Parse response
	var recipeInfo SpoonacularRecipeInfo
	if err := json.NewDecoder(resp.Body).Decode(&recipeInfo); err != nil {
		return nil, fmt.Errorf("failed to decode recipe details API response: %v", err)
	}

	// Convert to our detailed recipe format
	recipeDetails := s.convertToRecipeDetails(recipeInfo)

	// Save to persistent storage
	if err := s.storage.SaveRecipeDetails(recipeDetails, recipeID); err != nil {
		fmt.Printf("⚠️  Warning: Could not save recipe details to storage: %v\n", err)
	}

	// Cache the results in memory
	s.setCache(cacheKey, recipeDetails)

	fmt.Printf("✅ Found recipe details from Spoonacular API\n")
	return recipeDetails, nil
}

// RecipeDetails represents detailed recipe information
type RecipeDetails struct {
	ID                   string                `json:"id"`
	Title                string                `json:"title"`
	Description          string                `json:"description"`
	Summary              string                `json:"summary"`
	Ingredients          []DetailedIngredient  `json:"ingredients"`
	Instructions         []Instruction         `json:"instructions"`
	PrepTime             string                `json:"prepTime"`
	CookTime             string                `json:"cookTime"`
	TotalTime            string                `json:"totalTime"`
	Servings             int                   `json:"servings"`
	ImageURL             string                `json:"imageUrl"`
	SourceURL            string                `json:"sourceUrl"`
	SpoonacularURL       string                `json:"spoonacularUrl"`
	HealthScore          float64               `json:"healthScore"`
	PricePerServing      float64               `json:"pricePerServing"`
	Cuisines             []string              `json:"cuisines"`
	DishTypes            []string              `json:"dishTypes"`
	Diets                []string              `json:"diets"`
	Occasions            []string              `json:"occasions"`
	IsVegetarian         bool                  `json:"isVegetarian"`
	IsVegan              bool                  `json:"isVegan"`
	IsGlutenFree         bool                  `json:"isGlutenFree"`
	IsDairyFree          bool                  `json:"isDairyFree"`
	IsVeryHealthy        bool                  `json:"isVeryHealthy"`
	IsCheap              bool                  `json:"isCheap"`
	IsPopular            bool                  `json:"isPopular"`
	IsSustainable        bool                  `json:"isSustainable"`
}

// DetailedIngredient represents a detailed ingredient with measurements
type DetailedIngredient struct {
	ID           int      `json:"id"`
	Name         string   `json:"name"`
	OriginalName string   `json:"originalName"`
	Amount       float64  `json:"amount"`
	Unit         string   `json:"unit"`
	UnitLong     string   `json:"unitLong"`
	Original     string   `json:"original"`
	Aisle        string   `json:"aisle"`
	Image        string   `json:"image"`
	Meta         []string `json:"meta"`
}

// Instruction represents a cooking instruction step
type Instruction struct {
	Number int    `json:"number"`
	Step   string `json:"step"`
}

// convertToRecipeDetails converts SpoonacularRecipeInfo to our detailed format
func (s *SpoonacularService) convertToRecipeDetails(sr SpoonacularRecipeInfo) *RecipeDetails {
	// Extract detailed ingredients
	ingredients := make([]DetailedIngredient, 0, len(sr.ExtendedIngredients))
	for _, ing := range sr.ExtendedIngredients {
		ingredient := DetailedIngredient{
			ID:           ing.ID,
			Name:         ing.Name,
			OriginalName: ing.OriginalName,
			Amount:       ing.Amount,
			Unit:         ing.Unit,
			UnitLong:     ing.UnitLong,
			Original:     ing.Original,
			Aisle:        ing.Aisle,
			Image:        fmt.Sprintf("https://spoonacular.com/cdn/ingredients_100x100/%s", ing.Image),
			Meta:         ing.Meta,
		}
		ingredients = append(ingredients, ingredient)
	}

	// Extract instructions
	instructions := make([]Instruction, 0)
	if len(sr.AnalyzedInstructions) > 0 {
		if instructionMap, ok := sr.AnalyzedInstructions[0].(map[string]interface{}); ok {
			if steps, ok := instructionMap["steps"].([]interface{}); ok {
				for _, step := range steps {
					if stepMap, ok := step.(map[string]interface{}); ok {
						if number, ok := stepMap["number"].(float64); ok {
							if stepText, ok := stepMap["step"].(string); ok {
								instructions = append(instructions, Instruction{
									Number: int(number),
									Step:   stepText,
								})
							}
						}
					}
				}
			}
		}
	}

	// If no analyzed instructions, try to parse the instructions string
	if len(instructions) == 0 && sr.Instructions != "" {
		// Split by periods or line breaks and create simple instructions
		instructionText := strings.ReplaceAll(sr.Instructions, "<ol>", "")
		instructionText = strings.ReplaceAll(instructionText, "</ol>", "")
		instructionText = strings.ReplaceAll(instructionText, "<li>", "")
		instructionText = strings.ReplaceAll(instructionText, "</li>", "\n")
		
		lines := strings.Split(instructionText, "\n")
		for i, line := range lines {
			line = strings.TrimSpace(line)
			if line != "" {
				instructions = append(instructions, Instruction{
					Number: i + 1,
					Step:   line,
				})
			}
		}
	}

	// Format cooking times
	prepTime := "15 min"
	if sr.PreparationMinutes > 0 {
		prepTime = fmt.Sprintf("%d min", sr.PreparationMinutes)
	}

	cookTime := "30 min"
	if sr.CookingMinutes > 0 {
		cookTime = fmt.Sprintf("%d min", sr.CookingMinutes)
	}

	totalTime := fmt.Sprintf("%d min", sr.ReadyInMinutes)
	if sr.ReadyInMinutes == 0 {
		totalTime = "45 min"
	}

	// Clean summary and description
	summary := sr.Summary
	// Remove HTML tags
	summary = strings.ReplaceAll(summary, "<b>", "")
	summary = strings.ReplaceAll(summary, "</b>", "")
	summary = strings.ReplaceAll(summary, "<a href=\"", "")
	summary = strings.ReplaceAll(summary, "\">", " ")
	summary = strings.ReplaceAll(summary, "</a>", "")
	summary = strings.ReplaceAll(summary, "<i>", "")
	summary = strings.ReplaceAll(summary, "</i>", "")

	description := summary
	if len(description) > 200 {
		description = description[:200] + "..."
	}

	return &RecipeDetails{
		ID:                strconv.Itoa(sr.ID),
		Title:             sr.Title,
		Description:       description,
		Summary:           summary,
		Ingredients:       ingredients,
		Instructions:      instructions,
		PrepTime:          prepTime,
		CookTime:          cookTime,
		TotalTime:         totalTime,
		Servings:          sr.Servings,
		ImageURL:          sr.Image,
		SourceURL:         sr.SourceUrl,
		SpoonacularURL:    sr.SpoonacularSourceUrl,
		HealthScore:       sr.HealthScore,
		PricePerServing:   sr.PricePerServing,
		Cuisines:          sr.Cuisines,
		DishTypes:         sr.Dishypes,
		Diets:             sr.Diets,
		Occasions:         sr.Occasions,
		IsVegetarian:      sr.Vegetarian,
		IsVegan:           sr.Vegan,
		IsGlutenFree:      sr.GlutenFree,
		IsDairyFree:       sr.DairyFree,
		IsVeryHealthy:     sr.VeryHealthy,
		IsCheap:           sr.Cheap,
		IsPopular:         sr.VeryPopular,
		IsSustainable:     sr.Sustainable,
	}
} 