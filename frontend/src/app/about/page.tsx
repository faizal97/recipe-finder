import Link from 'next/link'

export default function About() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="text-center mb-8 sm:mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 sm:mb-6">About Recipe Finder</h1>
        <p className="text-lg sm:text-xl text-foreground/80 max-w-3xl mx-auto">
          A modern, intelligent recipe discovery platform that helps you find perfect recipes based on ingredients you have at home.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 mb-12 sm:mb-16">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">How It Works</h2>
          <div className="space-y-4 text-foreground/90">
            <div className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">1</span>
              <p className="text-sm sm:text-base"><strong>Add Your Ingredients:</strong> Simply type in the ingredients you have available in your kitchen.</p>
            </div>
            <div className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">2</span>
              <p className="text-sm sm:text-base"><strong>Smart Recipe Matching:</strong> Our system finds recipes that match your ingredients and shows you how many ingredients you already have.</p>
            </div>
            <div className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">3</span>
              <p className="text-sm sm:text-base"><strong>Save Your Favorites:</strong> Keep track of recipes you love with our built-in favorites system.</p>
            </div>
            <div className="flex items-start">
              <span className="bg-orange-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">4</span>
              <p className="text-sm sm:text-base"><strong>Get Detailed Instructions:</strong> View complete recipes with ingredients, instructions, nutrition info, and cooking times.</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Key Features</h2>
          <ul className="space-y-3 text-foreground/90">
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg flex-shrink-0">🔍</span>
              <div className="text-sm sm:text-base">
                <strong>Ingredient-Based Search:</strong> Find recipes using ingredients you already have
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg flex-shrink-0">💾</span>
              <div className="text-sm sm:text-base">
                <strong>Smart Caching:</strong> Fast loading with intelligent data caching and storage
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg flex-shrink-0">❤️</span>
              <div className="text-sm sm:text-base">
                <strong>Save Favorites:</strong> Personal recipe collection stored locally
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg flex-shrink-0">📱</span>
              <div className="text-sm sm:text-base">
                <strong>Responsive Design:</strong> Works perfectly on desktop, tablet, and mobile
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg flex-shrink-0">🚀</span>
              <div className="text-sm sm:text-base">
                <strong>Real-time Search:</strong> Instant ingredient suggestions as you type
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-orange-500 mr-3 text-lg flex-shrink-0">📊</span>
              <div className="text-sm sm:text-base">
                <strong>Match Percentage:</strong> See how many ingredients you have for each recipe
              </div>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-foreground/5 rounded-lg p-6 sm:p-8 mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6 text-center">Technology Stack</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Frontend</h3>
            <ul className="space-y-2 text-foreground/90 text-sm sm:text-base">
              <li><strong>Next.js 15:</strong> React framework with App Router</li>
              <li><strong>TypeScript:</strong> Type-safe development</li>
              <li><strong>Tailwind CSS:</strong> Modern utility-first styling</li>
              <li><strong>Lucide React:</strong> Beautiful icons</li>
              <li><strong>Local Storage:</strong> Client-side data persistence</li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Backend</h3>
            <ul className="space-y-2 text-foreground/90 text-sm sm:text-base">
              <li><strong>Go (Golang):</strong> High-performance server</li>
              <li><strong>Gorilla Mux:</strong> HTTP routing and middleware</li>
              <li><strong>Spoonacular API:</strong> Recipe and ingredient data</li>
              <li><strong>JSON Storage:</strong> Persistent file-based caching</li>
              <li><strong>CORS Support:</strong> Cross-origin resource sharing</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-16">
        <div className="text-center">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Fast & Efficient</h3>
          <p className="text-foreground/80 text-sm sm:text-base">Three-tier caching system ensures lightning-fast recipe searches and minimal API usage.</p>
        </div>
        <div className="text-center">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">🎯</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Smart Matching</h3>
          <p className="text-foreground/80 text-sm sm:text-base">Advanced ingredient matching algorithm finds the best recipes based on what you have.</p>
        </div>
        <div className="text-center">
          <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💡</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">User-Friendly</h3>
          <p className="text-foreground/80 text-sm sm:text-base">Clean, intuitive interface designed for effortless recipe discovery and management.</p>
        </div>
      </div>

      <div className="bg-orange-50 dark:bg-orange-950/20 rounded-lg p-6 sm:p-8 mb-12 sm:mb-16">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4">Data & Privacy</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-foreground/90">
          <div>
            <h3 className="font-semibold mb-2">Recipe Data</h3>
            <p className="text-sm sm:text-base">All recipe data is sourced from the Spoonacular API, providing access to thousands of tested recipes with detailed nutritional information, cooking instructions, and ingredient lists.</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Your Privacy</h3>
            <p className="text-sm sm:text-base">Your saved recipes and preferences are stored locally in your browser. No personal data is sent to our servers, ensuring complete privacy and control over your information.</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-4 sm:mb-6">Start Cooking Today</h2>
        <p className="text-foreground/80 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
          Ready to discover your next favorite recipe? Start by adding some ingredients you have at home and let Recipe Finder do the rest.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Link href="/" className="bg-orange-500 text-white px-6 sm:px-8 py-3 rounded-lg hover:bg-orange-600 transition-colors font-semibold text-center touch-manipulation">
            Find Recipes Now
          </Link>
          <Link href="/recipes" className="border border-foreground/20 text-foreground px-6 sm:px-8 py-3 rounded-lg hover:bg-foreground/5 transition-colors font-semibold text-center touch-manipulation">
            View My Recipes
          </Link>
        </div>
      </div>
    </div>
  )
} 