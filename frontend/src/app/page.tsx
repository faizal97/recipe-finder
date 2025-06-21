import Link from 'next/link'
import { Search, ChefHat, Clock, Users } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Recipe Finder</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/recipes" className="text-gray-600 hover:text-orange-600 transition-colors">
                Recipes
              </Link>
              <Link href="/search" className="text-gray-600 hover:text-orange-600 transition-colors">
                Search
              </Link>
              <Link href="/add-recipe" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors">
                Add Recipe
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-4xl font-bold text-gray-900 sm:text-6xl">
            Discover Amazing
            <span className="text-orange-600"> Recipes</span>
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Find, save, and share your favorite recipes. From quick weeknight dinners to impressive weekend feasts, 
            we've got something for every taste and skill level.
          </p>
          
          {/* Search Bar */}
          <div className="mt-10 max-w-xl mx-auto">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for recipes..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-orange-600 text-white px-4 py-1.5 rounded-md hover:bg-orange-700 transition-colors">
                Search
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <Clock className="h-12 w-12 text-orange-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Quick Meals</h3>
              <p className="mt-2 text-gray-600">Find recipes you can make in 30 minutes or less</p>
              <Link href="/search?filter=quick" className="mt-4 inline-block text-orange-600 hover:text-orange-700 font-medium">
                Browse Quick Recipes →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <Users className="h-12 w-12 text-orange-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Family Favorites</h3>
              <p className="mt-2 text-gray-600">Crowd-pleasing recipes perfect for family dinners</p>
              <Link href="/search?filter=family" className="mt-4 inline-block text-orange-600 hover:text-orange-700 font-medium">
                Browse Family Recipes →
              </Link>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <ChefHat className="h-12 w-12 text-orange-600 mx-auto" />
              <h3 className="mt-4 text-xl font-semibold text-gray-900">Chef's Special</h3>
              <p className="mt-2 text-gray-600">Impressive recipes for special occasions</p>
              <Link href="/search?filter=special" className="mt-4 inline-block text-orange-600 hover:text-orange-700 font-medium">
                Browse Special Recipes →
              </Link>
            </div>
          </div>

          {/* Featured Categories */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Popular Categories</h3>
            <div className="flex flex-wrap justify-center gap-4">
              {['Italian', 'Mexican', 'Asian', 'Mediterranean', 'American', 'Indian', 'French', 'Thai'].map((category) => (
                <Link
                  key={category}
                  href={`/search?category=${category.toLowerCase()}`}
                  className="bg-white px-6 py-3 rounded-full shadow-sm hover:shadow-md transition-shadow text-gray-700 hover:text-orange-600 font-medium"
                >
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <ChefHat className="h-8 w-8 text-orange-600" />
              <h3 className="ml-2 text-2xl font-bold">Recipe Finder</h3>
            </div>
            <p className="text-gray-400 mb-8">
              Your ultimate destination for discovering and sharing amazing recipes.
            </p>
            <div className="flex justify-center space-x-8">
              <Link href="/about" className="text-gray-400 hover:text-white transition-colors">About</Link>
              <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link>
              <Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Terms</Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-400 text-sm">
              © 2024 Recipe Finder. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
