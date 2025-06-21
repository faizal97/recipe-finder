# 🍽️ Recipe Finder

A modern, full-stack Progressive Web App (PWA) that helps you discover amazing recipes based on ingredients you have at home. Built with Next.js, Go, and the Spoonacular API.

![Recipe Finder Banner](https://via.placeholder.com/800x200/ea580c/ffffff?text=Recipe+Finder+-+Find+Perfect+Recipes)

## ✨ Features

### 🔍 Smart Recipe Search
- **Ingredient-based search**: Find recipes using ingredients you already have
- **Real-time autocomplete**: Intelligent ingredient suggestions as you type
- **Advanced filtering**: Filter by dietary restrictions, cuisine type, and more
- **Recipe details**: Comprehensive recipe information including ingredients, instructions, and nutrition

### 💾 Recipe Management
- **Save favorites**: Keep track of your favorite recipes
- **Offline access**: View saved recipes even without internet connection
- **Local storage**: All saved recipes are stored locally for quick access

### 📱 Progressive Web App (PWA)
- **Mobile install prompt**: Install the app directly to your home screen
- **Offline functionality**: Works without internet connection
- **Native app experience**: Looks and feels like a native mobile app
- **Cross-platform**: Works on iOS, Android, and desktop

### 🎨 Modern UI/UX
- **Responsive design**: Optimized for mobile, tablet, and desktop
- **Mobile-first approach**: Touch-friendly interface with intuitive navigation
- **Dark/light theme support**: Adapts to your system preferences
- **Smooth animations**: Delightful micro-interactions throughout the app

### ⚡ Performance & Caching
- **Three-tier caching system**: Memory → Persistent Storage → API
- **Smart caching**: Reduces API calls and improves response times
- **Optimized loading**: Fast page loads with efficient resource management

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Go** 1.19+
- **Spoonacular API Key** (free at [spoonacular.com](https://spoonacular.com/food-api))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recipe-finder.git
   cd recipe-finder
   ```

2. **Set up the backend**
   ```bash
   cd backend
   
   # Copy and configure environment file
   cp .env.example .env
   # Edit .env and add your Spoonacular API key
   
   # Install dependencies
   go mod tidy
   
   # Run the server
   go run main.go
   ```

3. **Set up the frontend**
   ```bash
   cd frontend
   
   # Install dependencies
   npm install
   
   # Start development server
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

## 🏗️ Architecture

### Frontend (Next.js 15)
```
frontend/
├── src/
│   ├── app/                 # App Router pages
│   │   ├── about/          # About page
│   │   ├── offline/        # PWA offline page
│   │   ├── recipes/        # Recipe management
│   │   └── layout.tsx      # Root layout with PWA setup
│   ├── components/         # Reusable UI components
│   │   ├── Navigation.tsx  # Mobile-responsive navigation
│   │   ├── RecipeCard.tsx  # Recipe display component
│   │   ├── SearchBar.tsx   # Global search functionality
│   │   ├── PWAInstallPrompt.tsx  # Install popup
│   │   └── InstallButton.tsx     # Manual install button
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── public/
│   ├── icons/             # PWA app icons
│   ├── manifest.json      # PWA manifest
│   └── sw.js             # Service worker
└── package.json
```

### Backend (Go)
```
backend/
├── handlers/              # HTTP request handlers
│   └── recipe_handler.go  # Recipe search and details
├── services/              # Business logic
│   ├── spoonacular.go     # Spoonacular API integration
│   └── storage.go         # Persistent caching system
├── models/                # Data structures
│   └── recipe.go          # Recipe model
├── data/                  # Cached data storage
└── main.go               # Server entry point
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **PWA**: Custom service worker + manifest
- **State Management**: React hooks + localStorage

### Backend
- **Language**: Go 1.19+
- **Router**: Gorilla Mux
- **HTTP Client**: Native Go net/http
- **Caching**: Multi-tier (memory + file system)
- **API Integration**: Spoonacular Food API

### External APIs
- **Spoonacular API**: Recipe data, ingredient search, nutrition info

## 📱 PWA Features

### Installation
- **Automatic prompts**: Shows install popup on mobile after 3 seconds
- **Manual installation**: Install button in navigation
- **Cross-platform**: Works on iOS (Safari) and Android (Chrome/Edge)

### Offline Capabilities
- **Cached pages**: Home, recipes, about pages work offline
- **Saved recipes**: All saved recipes available offline
- **Graceful degradation**: Offline page for uncached content

### Native App Experience
- **Standalone mode**: Launches without browser UI
- **App icons**: Custom branded icons for home screen
- **Splash screen**: Custom loading screen
- **App shortcuts**: Quick access to key features

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
# Required: Spoonacular API Configuration
SPOONACULAR_API_KEY=your_spoonacular_api_key_here

# Optional: Server Configuration
PORT=8080

# Optional: CORS Configuration (comma-separated)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Optional: Cache Configuration
CACHE_DURATION_HOURS=24

# Optional: API Configuration
API_TIMEOUT_SECONDS=30
```

#### Frontend (optional .env.local)
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8080

# PWA Configuration
NEXT_PUBLIC_APP_NAME=RecipeFinder
NEXT_PUBLIC_APP_DESCRIPTION=Find perfect recipes based on ingredients you have at home
```

> **📝 Note**: Copy `.env.example` files and rename them to `.env` to get started quickly.

### API Endpoints

#### Recipe Search
```http
POST /api/recipes
Content-Type: application/json

{
  "ingredients": ["chicken", "rice", "vegetables"],
  "number": 12
}
```

#### Recipe Details
```http
GET /api/v1/recipes/{id}
```

#### Ingredient Search
```http
GET /api/v1/ingredients/search?query=chick
```

#### Health Check
```http
GET /api/v1/health
```

## 🎯 Usage Examples

### Basic Recipe Search
1. Enter ingredients you have (e.g., "chicken, rice, onion")
2. Browse through recipe suggestions
3. Click on any recipe to view full details
4. Save recipes you like for later

### Advanced Features
- **Ingredient autocomplete**: Start typing and select from suggestions
- **Recipe filtering**: Use dietary restrictions and cuisine filters
- **Offline browsing**: Access saved recipes without internet
- **Mobile installation**: Install app to home screen for quick access

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Build the frontend
cd frontend
npm run build

# Deploy to Vercel
npx vercel --prod
```

### Backend (Railway/Heroku)
```bash
# Build the Go binary
cd backend
go build -o recipe-finder-backend .

# Deploy using your preferred platform
```

### Docker (Optional)
```dockerfile
# Dockerfile example for backend
FROM golang:1.19-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o main .

FROM alpine:latest
RUN apk add --no-cache ca-certificates
WORKDIR /root/
COPY --from=builder /app/main .
CMD ["./main"]
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed
- Ensure mobile responsiveness for UI changes

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Spoonacular API** for providing comprehensive recipe data
- **Next.js team** for the amazing React framework
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide** for the beautiful icon set

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/recipe-finder/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/recipe-finder/discussions)
- **Email**: your.email@example.com

## 🗺️ Roadmap

- [ ] User authentication and profiles
- [ ] Recipe sharing and social features
- [ ] Meal planning and shopping lists
- [ ] Nutrition tracking and dietary goals
- [ ] Recipe rating and review system
- [ ] Multi-language support
- [ ] Recipe import from URLs
- [ ] Voice search functionality

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/yourusername">Your Name</a></p>
  <p>
    <a href="#-recipe-finder">Back to top</a>
  </p>
</div> 