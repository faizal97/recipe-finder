#!/bin/bash

# Recipe Finder Backend Setup Script

echo "🍽️  Setting up Recipe Finder Backend..."

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.19+ first."
    echo "   Download from: https://golang.org/dl/"
    exit 1
fi

echo "✅ Go is installed: $(go version)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    if [ -f ".env.example" ]; then
        echo "📝 Copying .env.example to .env..."
        cp .env.example .env
        echo "⚠️  Please edit .env and add your Spoonacular API key!"
        echo "   Get your API key from: https://spoonacular.com/food-api"
    else
        echo "📝 Creating .env file..."
        cat > .env << 'EOF'
# Spoonacular API Configuration
SPOONACULAR_API_KEY=your_spoonacular_api_key_here

# Server Configuration
PORT=8080

# CORS Configuration (comma-separated list of allowed origins)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Cache Configuration
CACHE_DURATION_HOURS=24

# API Configuration
API_TIMEOUT_SECONDS=30
EOF
        echo "⚠️  Please edit .env and add your Spoonacular API key!"
        echo "   Get your API key from: https://spoonacular.com/food-api"
    fi
else
    echo "✅ .env file already exists"
fi

# Install dependencies
echo "📦 Installing Go dependencies..."
go mod tidy

# Build the application
echo "🔨 Building the application..."
go build -o recipe-finder-backend .

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🚀 To start the server:"
    echo "   ./recipe-finder-backend"
    echo ""
    echo "   Or run in development mode:"
    echo "   go run main.go"
    echo ""
    echo "📚 API will be available at: http://localhost:8080"
else
    echo "❌ Build failed!"
    exit 1
fi 