# Recipe Finder Backend

A Go-based REST API for managing recipes with search functionality.

## Features

- ✅ CRUD operations for recipes
- 🔍 Recipe search functionality
- 🏷️ Category and tag filtering
- ⚡ Fast and lightweight
- 🔒 CORS enabled for frontend integration

## Prerequisites

- Go 1.19 or higher
- Git

## Quick Start

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   go mod tidy
   ```

3. **Run the server**
   ```bash
   go run main.go
   ```

4. **Test the API**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

## API Endpoints

### Health Check
- `GET /api/v1/health` - Check if the API is running

### Recipes
- `GET /api/v1/recipes` - Get all recipes
- `POST /api/v1/recipes` - Create a new recipe
- `GET /api/v1/recipes/{id}` - Get a specific recipe
- `PUT /api/v1/recipes/{id}` - Update a recipe
- `DELETE /api/v1/recipes/{id}` - Delete a recipe

### Search
- `GET /api/v1/search?q={query}&category={category}&difficulty={difficulty}` - Search recipes

## Example Usage

### Create a Recipe
```bash
curl -X POST http://localhost:8080/api/v1/recipes \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Spaghetti Carbonara",
    "description": "Classic Italian pasta dish",
    "ingredients": ["spaghetti", "eggs", "bacon", "parmesan", "black pepper"],
    "instructions": ["Cook pasta", "Fry bacon", "Mix eggs and cheese", "Combine all"],
    "prep_time": 15,
    "cook_time": 20,
    "servings": 4,
    "difficulty": "medium",
    "category": "Italian",
    "tags": ["pasta", "quick", "dinner"]
  }'
```

### Search Recipes
```bash
curl "http://localhost:8080/api/v1/search?q=pasta&category=Italian&difficulty=medium"
```

## Environment Variables

- `PORT` - Server port (default: 8080)

## Project Structure

```
backend/
├── main.go              # Application entry point
├── models/              # Data models
│   └── recipe.go
├── handlers/            # HTTP handlers
│   └── recipe_handler.go
├── go.mod              # Go module file
├── go.sum              # Go dependencies
└── README.md           # This file
```

## Development

### Building
```bash
go build -o recipe-finder-api main.go
```

### Running the binary
```bash
./recipe-finder-api
```

### Testing
```bash
go test ./...
```

## Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Recipe image upload
- [ ] Recipe ratings and reviews
- [ ] Advanced search with filters
- [ ] Recipe import from URLs
- [ ] Nutritional information
- [ ] Meal planning features

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test your changes
5. Submit a pull request

## License

This project is licensed under the MIT License. 