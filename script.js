// Data

// Global variables
let products = []
let categories = []
let filteredProducts = []
let selectedCategory = 'all'
let searchTerm = ''

// Initialize app
async function init() {
	try {
		// Ma'lumotlarni fetch qilamiz
		const response = await fetch('/data.json')
		const data = await response.json()

		products = data.products
		categories = data.categories
		filteredProducts = products

		renderCategories()
		renderProducts()
		setupEventListeners()

		// Loading tugadi
		document.getElementById('loadingScreen').classList.add('hidden')
		document.getElementById('mainContent').classList.remove('hidden')
	} catch (error) {
		console.error("Ma'lumotlarni yuklashda xatolik:", error)
	}
}
// Format price
function formatPrice(price) {
	return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

// Render categories
function renderCategories() {
	const container = document.getElementById('categoriesContainer')
	container.innerHTML = ''

	categories.forEach((category, index) => {
		const button = document.createElement('button')
		button.className = `category-btn px-6 py-3 rounded-2xl font-semibold shadow-lg ${
			selectedCategory === category.id
				? 'active'
				: 'bg-white text-gray-700 hover:bg-gray-50'
		}`
		button.style.animationDelay = `${index * 100}ms`
		button.innerHTML = `
                    <span class="mr-2 text-xl">${category.icon}</span>
                    ${category.name}
                `
		button.addEventListener('click', () => selectCategory(category.id))
		container.appendChild(button)
	})
}

// Render products
function renderProducts() {
	const container = document.getElementById('productsContainer')
	const title = document.getElementById('productsTitle')
	const noProductsDiv = document.getElementById('noProductsFound')

	title.textContent = `Mahsulotlar (${filteredProducts.length})`

	if (filteredProducts.length === 0) {
		container.innerHTML = ''
		noProductsDiv.classList.remove('hidden')
		return
	}

	noProductsDiv.classList.add('hidden')
	container.innerHTML = ''

	filteredProducts.forEach((product, index) => {
		const productCard = document.createElement('div')
		productCard.className =
			'card-hover bg-white rounded-3xl shadow-lg overflow-hidden group animate-fadeInUp'
		productCard.style.animationDelay = `${index * 100}ms`

		productCard.innerHTML = `
                    <div class="relative overflow-hidden">
                        <img
                            src="${product.image}"
                            alt="${product.name}"
                            class="image-hover w-full h-64 object-cover"
                            onerror="this.src='/placeholder.svg?height=300&width=300'"
                        />
                        <div class="star-icon absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                            <svg class="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                            </svg>
                        </div>
                    </div>
                    <div class="p-6">
                        <h3 class="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                            ${product.name}
                        </h3>
                        <p class="text-gray-600 mb-4 text-sm">${
													product.description
												}</p>
                        <div class="flex items-center justify-between">
                            <span class="text-2xl font-bold gradient-text">
                                ${formatPrice(product.price)}
                            </span>
                          
                        </div>
                    </div>
                `

		container.appendChild(productCard)
	})
}

// Filter products
function filterProducts() {
	let filtered = products

	// Filter by category
	if (selectedCategory !== 'all') {
		filtered = filtered.filter(product => product.category === selectedCategory)
	}

	// Filter by search term
	if (searchTerm) {
		filtered = filtered.filter(
			product =>
				product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
				product.description.toLowerCase().includes(searchTerm.toLowerCase())
		)
	}

	filteredProducts = filtered
	renderProducts()
}

// Select category
function selectCategory(categoryId) {
	selectedCategory = categoryId
	renderCategories()
	filterProducts()
}

// Setup event listeners
function setupEventListeners() {
	const searchInput = document.getElementById('searchInput')
	searchInput.addEventListener('input', e => {
		searchTerm = e.target.value
		filterProducts()
	})
}

// Start the app
init()
