package models

import "time"

// Recipe represents a recipe in the system
type Recipe struct {
	ID          string    `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description string    `json:"description" db:"description"`
	Ingredients []string  `json:"ingredients" db:"ingredients"`
	Instructions []string `json:"instructions" db:"instructions"`
	PrepTime    int       `json:"prep_time" db:"prep_time"` // in minutes
	CookTime    int       `json:"cook_time" db:"cook_time"` // in minutes
	Servings    int       `json:"servings" db:"servings"`
	Difficulty  string    `json:"difficulty" db:"difficulty"` // easy, medium, hard
	Category    string    `json:"category" db:"category"`
	Tags        []string  `json:"tags" db:"tags"`
	ImageURL    string    `json:"image_url" db:"image_url"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// CreateRecipeRequest represents the request payload for creating a recipe
type CreateRecipeRequest struct {
	Title        string   `json:"title" validate:"required"`
	Description  string   `json:"description"`
	Ingredients  []string `json:"ingredients" validate:"required"`
	Instructions []string `json:"instructions" validate:"required"`
	PrepTime     int      `json:"prep_time"`
	CookTime     int      `json:"cook_time"`
	Servings     int      `json:"servings"`
	Difficulty   string   `json:"difficulty"`
	Category     string   `json:"category"`
	Tags         []string `json:"tags"`
	ImageURL     string   `json:"image_url"`
}

// UpdateRecipeRequest represents the request payload for updating a recipe
type UpdateRecipeRequest struct {
	Title        *string   `json:"title,omitempty"`
	Description  *string   `json:"description,omitempty"`
	Ingredients  *[]string `json:"ingredients,omitempty"`
	Instructions *[]string `json:"instructions,omitempty"`
	PrepTime     *int      `json:"prep_time,omitempty"`
	CookTime     *int      `json:"cook_time,omitempty"`
	Servings     *int      `json:"servings,omitempty"`
	Difficulty   *string   `json:"difficulty,omitempty"`
	Category     *string   `json:"category,omitempty"`
	Tags         *[]string `json:"tags,omitempty"`
	ImageURL     *string   `json:"image_url,omitempty"`
}

// SearchRecipeRequest represents the request parameters for searching recipes
type SearchRecipeRequest struct {
	Query      string   `json:"query"`
	Category   string   `json:"category"`
	Difficulty string   `json:"difficulty"`
	Tags       []string `json:"tags"`
	MaxPrepTime int     `json:"max_prep_time"`
	MaxCookTime int     `json:"max_cook_time"`
} 