# Recipe Finder Web App

A full-stack web application for discovering, managing, and sharing recipes. Built with **Next.js** for the frontend and **Go** for the backend API.

## 🚀 Features

- **Recipe Management**: Create, read, update, and delete recipes
- **Advanced Search**: Search recipes by ingredients, category, difficulty, and more
- **Responsive Design**: Beautiful UI that works on all devices
- **Fast API**: Lightweight Go backend with RESTful API
- **Modern Frontend**: React-based frontend with Tailwind CSS
- **Real-time Updates**: Dynamic content loading and updates

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons

### Backend
- **Go 1.24** - Fast and efficient backend
- **Gorilla Mux** - HTTP router and URL matcher
- **CORS** - Cross-Origin Resource Sharing support

## 📁 Project Structure

```
recipe-finder/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   │   ├── page.tsx     # Homepage
│   │   │   └── recipes/     # Recipe pages
│   │   └── components/      # Reusable components
│   ├── package.json
│   └── README.md
├── backend/                  # Go backend API
│   ├── main.go              # Application entry point
│   ├── models/              # Data models
│   ├── handlers/            # HTTP handlers
│   ├── go.mod
│   └── README.md
├── README.md                # This file
└── .gitignore
```

## 🚦 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **Go** 1.19 or higher
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd recipe-finder
   ```

2. **Set up the backend**
   ```bash
   cd backend
   go mod tidy
   go run main.go
   ```
   The API will be available at `http://localhost:8080`

3. **Set up the frontend** (in a new terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The web app will be available at `http://localhost:3000`

### Quick Test

1. **Test the API**
   ```bash
   curl http://localhost:8080/api/v1/health
   ```

2. **Open the web app**
   Navigate to `http://localhost:3000` in your browser

## 🔧 Development

### Backend Development

```bash
cd backend

# Run the server
go run main.go

# Build for production
go build -o recipe-finder-api main.go

# Run tests
go test ./...
```

### Frontend Development

```bash
cd frontend

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## 📚 API Documentation

### Base URL
```
http://localhost:8080/api/v1
```

### Endpoints

#### Health Check
- `GET /health` - Check API status

#### Recipes
- `GET /recipes` - Get all recipes
- `POST /recipes` - Create a new recipe
- `GET /recipes/{id}` - Get a specific recipe
- `PUT /recipes/{id}` - Update a recipe
- `DELETE /recipes/{id}` - Delete a recipe

#### Search
- `GET /search?q={query}&category={category}&difficulty={difficulty}` - Search recipes

### Example API Usage

#### Create a Recipe
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

#### Search Recipes
```bash
curl "http://localhost:8080/api/v1/search?q=pasta&category=Italian&difficulty=medium"
```

## 🌟 Features Roadmap

### Phase 1 (Current)
- [x] Basic CRUD operations
- [x] Recipe search functionality
- [x] Responsive web interface
- [x] REST API with Go
- [x] Modern React frontend

### Phase 2 (Planned)
- [ ] User authentication and authorization
- [ ] Recipe image upload and storage
- [ ] Recipe ratings and reviews
- [ ] Advanced filtering and sorting
- [ ] Recipe collections/favorites
- [ ] Social sharing features

### Phase 3 (Future)
- [ ] Database integration (PostgreSQL)
- [ ] Recipe import from URLs
- [ ] Nutritional information
- [ ] Meal planning features
- [ ] Mobile app (React Native)
- [ ] Recipe recommendation engine

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React framework for production
- [Go](https://golang.org/) - The Go programming language
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [Lucide](https://lucide.dev/) - Beautiful & consistent icons

## 📞 Support

If you have any questions or run into issues, please:

1. Check the [Issues](../../issues) page
2. Create a new issue if your problem isn't already listed
3. Provide detailed information about your environment and the problem

---

**Happy Cooking! 👨‍🍳👩‍🍳** 