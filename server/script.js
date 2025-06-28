// Debug mode
const DEBUG = true
function log(...args) {
	if (DEBUG) console.log('[TechStore]', ...args)
}

// Data
const productsData = {
	products: [
		{
			id: 1,
			name: 'iPhone 14 Pro',
			category: 'telefon',
			price: 15000000,
			image:
				'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=300&h=300&fit=crop',
			description: 'Eng yangi iPhone modeli',
		},
		{
			id: 2,
			name: 'Samsung Galaxy S23',
			category: 'telefon',
			price: 12000000,
			image:
				'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=300&h=300&fit=crop',
			description: 'Samsung flagman telefoni',
		},
		{
			id: 3,
			name: 'MacBook Pro M2',
			category: 'kompyuter',
			price: 25000000,
			image:
				'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&h=300&fit=crop',
			description: 'Professional laptop',
		},
		{
			id: 4,
			name: 'Dell XPS 13',
			category: 'kompyuter',
			price: 18000000,
			image:
				'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop',
			description: 'Ultrabook kompyuter',
		},
		{
			id: 5,
			name: 'Sony WH-1000XM4',
			category: 'audio',
			price: 4500000,
			image:
				'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop',
			description: 'Noise cancelling quloqchin',
		},
		{
			id: 6,
			name: 'AirPods Pro',
			category: 'audio',
			price: 3200000,
			image:
				'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=300&h=300&fit=crop',
			description: 'Apple simsiz quloqchin',
		},
	],
	categories: [
		{ id: 'all', name: 'Barchasi', icon: '🛍️' },
		{ id: 'telefon', name: 'Telefonlar', icon: '📱' },
		{ id: 'kompyuter', name: 'Kompyuterlar', icon: '💻' },
		{ id: 'audio', name: 'Audio', icon: '🎧' },
		{ id: 'planshet', name: 'Planshetlar', icon: '📱' },
		{ id: 'kamera', name: 'Kameralar', icon: '📷' },
		{ id: 'soat', name: 'Smart soatlar', icon: '⌚' },
	],
}

// Global variables
let products = []
let categories = []
let filteredProducts = []
let selectedCategory = 'all'
let searchTerm = ''

// Cart functionality
let cart = []

// Initialize app
function init() {
	log('Initializing app...')

	setTimeout(() => {
		products = productsData.products
		categories = productsData.categories
		filteredProducts = products

		// Load cart from localStorage
		loadCartFromStorage()

		renderCategories()
		renderProducts()
		setupEventListeners()
		updateCartCounter()

		// Hide loading screen and show main content
		document.getElementById('loadingScreen').classList.add('hidden')
		document.getElementById('mainContent').classList.remove('hidden')

		log('App initialized successfully')
	}, 1000)
}

// Load cart from localStorage
function loadCartFromStorage() {
	try {
		const savedCart = localStorage.getItem('techstore_cart')
		if (savedCart) {
			cart = JSON.parse(savedCart)
			log('Cart loaded from storage:', cart)
		}
	} catch (error) {
		log('Error loading cart from storage:', error)
		cart = []
	}
}

// Save cart to localStorage
function saveCartToStorage() {
	try {
		localStorage.setItem('techstore_cart', JSON.stringify(cart))
		log('Cart saved to storage:', cart)
	} catch (error) {
		log('Error saving cart to storage:', error)
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
				<p class="text-gray-600 mb-4 text-sm">${product.description}</p>
				<div class="flex items-center justify-between">
					<span class="text-2xl font-bold gradient-text">
						${formatPrice(product.price)}
					</span>
					<button onclick="addToCart(${
						product.id
					})" class="buy-btn text-white px-4 py-2 rounded-xl">
						🛒 Sotib olish
					</button>
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
	log('Setting up event listeners...')

	// Search input
	const searchInput = document.getElementById('searchInput')
	searchInput.addEventListener('input', e => {
		searchTerm = e.target.value
		filterProducts()
	})

	// Cart button - yangilangan versiya
	const cartButton = document.getElementById('cartButton')
	if (cartButton) {
		cartButton.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()
			log('Cart button clicked - opening cart')
			openCart()
		})
		log('Cart button event listener added')
	} else {
		log('ERROR: Cart button not found!')
	}

	// Cart counter ham bosilganda ochilsin
	const cartCounter = document.getElementById('cartCounter')
	if (cartCounter) {
		cartCounter.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()
			log('Cart counter clicked - opening cart')
			openCart()
		})
	}

	// Close cart button
	const closeCartBtn = document.getElementById('closeCartBtn')
	if (closeCartBtn) {
		closeCartBtn.addEventListener('click', function (e) {
			e.preventDefault()
			e.stopPropagation()
			closeCart()
		})
	}

	// Checkout button
	const checkoutBtn = document.getElementById('checkoutBtn')
	if (checkoutBtn) {
		checkoutBtn.addEventListener('click', function (e) {
			e.preventDefault()
			proceedToCheckout()
		})
	}

	// Clear cart button
	const clearCartBtn = document.getElementById('clearCartBtn')
	if (clearCartBtn) {
		clearCartBtn.addEventListener('click', function (e) {
			e.preventDefault()
			clearCart()
		})
	}

	// Close checkout button
	const closeCheckoutBtn = document.getElementById('closeCheckoutBtn')
	if (closeCheckoutBtn) {
		closeCheckoutBtn.addEventListener('click', function (e) {
			e.preventDefault()
			closeCheckout()
		})
	}

	// Close success button
	const closeSuccessBtn = document.getElementById('closeSuccessBtn')
	if (closeSuccessBtn) {
		closeSuccessBtn.addEventListener('click', function (e) {
			e.preventDefault()
			closeSuccessModal()
		})
	}

	// Checkout form
	const checkoutForm = document.getElementById('checkoutForm')
	if (checkoutForm) {
		checkoutForm.addEventListener('submit', handleCheckoutSubmit)
	}

	// Modal background clicks
	document.getElementById('cartModal').addEventListener('click', function (e) {
		if (e.target === this) {
			closeCart()
		}
	})

	document
		.getElementById('checkoutModal')
		.addEventListener('click', function (e) {
			if (e.target === this) {
				closeCheckout()
			}
		})

	document
		.getElementById('successModal')
		.addEventListener('click', function (e) {
			if (e.target === this) {
				closeSuccessModal()
			}
		})

	log('Event listeners set up successfully')
}

// Add to cart
function addToCart(productId) {
	log('Adding product to cart:', productId)

	const product = products.find(p => p.id === productId)
	if (!product) {
		log('Product not found:', productId)
		showNotification('Mahsulot topilmadi!', 'error')
		return
	}

	const existingItem = cart.find(item => item.id === productId)

	if (existingItem) {
		existingItem.quantity += 1
		log('Updated existing item quantity:', existingItem)
	} else {
		const newItem = {
			id: product.id,
			name: product.name,
			price: product.price,
			image: product.image,
			quantity: 1,
		}
		cart.push(newItem)
		log('Added new item to cart:', newItem)
	}

	saveCartToStorage()
	updateCartCounter()
	showNotification(`${product.name} savatga qo'shildi!`, 'success')

	log('Cart after adding:', cart)
}

// Update cart counter
function updateCartCounter() {
	const counter = document.getElementById('cartCounter')
	const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
	counter.textContent = totalItems

	log('Cart counter updated:', totalItems)

	if (totalItems > 0) {
		counter.classList.remove('bg-red-500')
		counter.classList.add('bg-green-500')
	} else {
		counter.classList.remove('bg-green-500')
		counter.classList.add('bg-red-500')
	}
}

// Toggle cart modal
function toggleCart() {
	const modal = document.getElementById('cartModal')
	log(
		'Toggling cart modal, current state:',
		modal.classList.contains('hidden') ? 'hidden' : 'visible'
	)

	if (modal.classList.contains('hidden')) {
		openCart()
	} else {
		closeCart()
	}
}

// Open cart
function openCart() {
	log('Opening cart modal')
	const modal = document.getElementById('cartModal')

	if (modal) {
		renderCartItems()
		modal.classList.remove('hidden')
		document.body.style.overflow = 'hidden'
		log('Cart modal opened successfully')
	} else {
		log('ERROR: Cart modal not found!')
	}
}

// Close cart
function closeCart() {
	log('Closing cart modal')
	document.getElementById('cartModal').classList.add('hidden')
	document.body.style.overflow = 'auto'
}

// Render cart items
function renderCartItems() {
	log('Rendering cart items:', cart)

	const container = document.getElementById('cartItems')
	const emptyCart = document.getElementById('emptyCart')
	const cartTotal = document.getElementById('cartTotal')
	const cartActions = document.getElementById('cartActions')

	if (cart.length === 0) {
		container.innerHTML = ''
		emptyCart.classList.remove('hidden')
		cartTotal.classList.add('hidden')
		cartActions.classList.add('hidden')
		return
	}

	emptyCart.classList.add('hidden')
	cartTotal.classList.remove('hidden')
	cartActions.classList.remove('hidden')

	container.innerHTML = cart
		.map(
			item => `
		<div class="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
			<img src="${item.image}" alt="${
				item.name
			}" class="w-16 h-16 object-cover rounded-lg">
			<div class="flex-1">
				<h4 class="font-semibold text-gray-800">${item.name}</h4>
				<p class="text-purple-600 font-bold">${formatPrice(item.price)}</p>
			</div>
			<div class="flex items-center space-x-2">
				<button onclick="updateQuantity(${
					item.id
				}, -1)" class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center">-</button>
				<span class="w-8 text-center font-semibold">${item.quantity}</span>
				<button onclick="updateQuantity(${
					item.id
				}, 1)" class="bg-gray-200 hover:bg-gray-300 w-8 h-8 rounded-full flex items-center justify-center">+</button>
			</div>
			<button onclick="removeFromCart(${
				item.id
			})" class="text-red-500 hover:text-red-700 ml-2">🗑️</button>
		</div>
	`
		)
		.join('')

	updateCartTotal()
}

// Update quantity
function updateQuantity(productId, change) {
	log('Updating quantity for product:', productId, 'change:', change)

	const item = cart.find(item => item.id === productId)
	if (!item) return

	item.quantity += change

	if (item.quantity <= 0) {
		removeFromCart(productId)
	} else {
		saveCartToStorage()
		renderCartItems()
		updateCartCounter()
	}
}

// Remove from cart
function removeFromCart(productId) {
	log('Removing product from cart:', productId)

	cart = cart.filter(item => item.id !== productId)
	saveCartToStorage()
	renderCartItems()
	updateCartCounter()
	showNotification('Mahsulot savatdan olib tashlandi', 'info')
}

// Clear cart
function clearCart() {
	if (confirm('Savatni tozalashga ishonchingiz komilmi?')) {
		log('Clearing cart')
		cart = []
		saveCartToStorage()
		renderCartItems()
		updateCartCounter()
		showNotification('Savat tozalandi', 'info')
	}
}

// Update cart total
function updateCartTotal() {
	const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
	document.getElementById('totalPrice').textContent = formatPrice(total)
	document.getElementById('checkoutTotal').textContent = formatPrice(total)
}

// Proceed to checkout
function proceedToCheckout() {
	if (cart.length === 0) {
		showNotification("Savat bo'sh!", 'error')
		return
	}

	log('Proceeding to checkout')
	closeCart()
	document.getElementById('checkoutModal').classList.remove('hidden')
	updateCartTotal()
}

// Close checkout
function closeCheckout() {
	log('Closing checkout modal')
	document.getElementById('checkoutModal').classList.add('hidden')
}

// Handle checkout form submission
function handleCheckoutSubmit(e) {
	e.preventDefault()
	log('Submitting checkout form')

	const orderData = {
		customerName: document.getElementById('customerName').value,
		customerPhone: document.getElementById('customerPhone').value,
		address: document.getElementById('customerAddress').value,
		products: cart.map(item => ({
			name: item.name,
			price: item.price,
			quantity: item.quantity,
		})),
		totalAmount: cart.reduce(
			(sum, item) => sum + item.price * item.quantity,
			0
		),
		notes: document.getElementById('orderNotes').value,
	}

	log('Order data:', orderData)

	// Save order to localStorage
	saveOrderToAdmin(orderData)

	// Clear cart
	cart = []
	saveCartToStorage()
	updateCartCounter()

	// Close checkout modal and show success
	closeCheckout()
	document.getElementById('successModal').classList.remove('hidden')

	// Reset form
	document.getElementById('checkoutForm').reset()

	showNotification('Buyurtma muvaffaqiyatli yuborildi!', 'success')
}

// Save order to admin panel
function saveOrderToAdmin(orderData) {
	try {
		// Get existing orders from JSON structure
		let ordersData = JSON.parse(
			localStorage.getItem('techstore_orders_json') || '{"orders":[]}'
		)

		const newOrder = {
			id: Date.now(),
			...orderData,
			status: 'new',
			orderDate: new Date().toISOString(),
		}

		// Add to orders array
		ordersData.orders.unshift(newOrder)
		ordersData.lastUpdated = new Date().toISOString()

		// Save back to JSON structure
		localStorage.setItem('techstore_orders_json', JSON.stringify(ordersData))

		console.log('Order saved to JSON:', newOrder)

		// Notify admin panel if available
		if (window.addNewOrderToJSON) {
			window.addNewOrderToJSON(orderData)
		}
	} catch (error) {
		console.error('Error saving order to JSON:', error)
	}
}

// Close success modal
function closeSuccessModal() {
	log('Closing success modal')
	document.getElementById('successModal').classList.add('hidden')
}

// Show notification
function showNotification(message, type = 'info') {
	log('Showing notification:', message, type)

	const notification = document.createElement('div')
	notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white animate-fadeIn ${
		type === 'success'
			? 'bg-green-500'
			: type === 'error'
			? 'bg-red-500'
			: 'bg-blue-500'
	}`
	notification.textContent = message

	document.body.appendChild(notification)

	setTimeout(() => {
		notification.remove()
	}, 3000)
}

// Start the app
document.addEventListener('DOMContentLoaded', function () {
	log('DOM loaded, starting app...')
	init()
})

// Global functions for onclick handlers
window.addToCart = addToCart
window.updateQuantity = updateQuantity
window.removeFromCart = removeFromCart
