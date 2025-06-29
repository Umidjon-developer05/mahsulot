// Admin credentials
const ADMIN_CREDENTIALS = {
	username: 'admin',
	password: 'admin123',
}

// Data will be loaded from server API
let orders = []
let products = []
let categories = []

// Current state
let currentUser = null
let currentTab = 'orders'
let selectedOrder = null
let selectedProduct = null
let isEditingProduct = false

// DOM Elements
const loginContainer = document.getElementById('loginContainer')
const adminPanel = document.getElementById('adminPanel')
const loginForm = document.getElementById('loginForm')
const loginError = document.getElementById('loginError')
const logoutBtn = document.getElementById('logoutBtn')
const ordersContainer = document.getElementById('ordersContainer')
const orderModal = document.getElementById('orderModal')
const productModal = document.getElementById('productModal')
const productForm = document.getElementById('productForm')

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
	checkAuthStatus()
	setupEventListeners()
	checkServerStatus()
	loadOrdersFromServer()
	loadProductsFromServer()
})

// Check server status
async function checkServerStatus() {
	try {
		console.log('🔍 Checking server status...')
		const response = await fetch('/api/orders')

		if (response.ok) {
			document.getElementById('statusDot').className =
				'w-3 h-3 bg-green-500 rounded-full'
			document.getElementById('statusText').textContent = 'Server online'
			console.log('✅ Server is online')
			return true
		} else {
			throw new Error(`Server returned ${response.status}`)
		}
	} catch (error) {
		document.getElementById('statusDot').className =
			'w-3 h-3 bg-red-500 rounded-full'
		document.getElementById('statusText').textContent =
			'Server offline: ' + error.message
		console.error('❌ Server status check failed:', error)
		return false
	}
}

// Check if user is already logged in
function checkAuthStatus() {
	const savedUser = localStorage.getItem('adminUser')
	if (savedUser) {
		currentUser = JSON.parse(savedUser)
		showAdminPanel()
	}
}

// Load orders from server API
async function loadOrdersFromServer() {
	try {
		console.log('📡 Loading orders from server API...')

		const response = await fetch('/api/orders')

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const result = await response.json()

		if (result.success) {
			orders = result.data.orders || []
			console.log('✅ Orders loaded from server:', orders.length, 'orders')
		} else {
			throw new Error(result.error || 'Failed to load orders')
		}

		if (currentUser) {
			renderOrders()
			updateStats()
		}

		document.getElementById('statusDot').className =
			'w-3 h-3 bg-green-500 rounded-full'
		document.getElementById('statusText').textContent = 'JSON fayli yuklandi'
	} catch (error) {
		console.error('❌ Error loading orders from server:', error)
		document.getElementById('statusDot').className =
			'w-3 h-3 bg-red-500 rounded-full'
		document.getElementById('statusText').textContent =
			'Server xatolik: ' + error.message
		showNotification(
			'❌ Buyurtmalarni yuklashda xatolik: ' + error.message,
			'error'
		)
		orders = []
		if (currentUser) {
			renderOrders()
			updateStats()
		}
	}
}

// Load products from server API
async function loadProductsFromServer() {
	try {
		console.log('📡 Loading products from server API...')

		const response = await fetch('/api/products')

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const result = await response.json()

		if (result.success) {
			products = result.data.products || []
			categories = result.data.categories || []
			console.log(
				'✅ Products loaded from server:',
				products.length,
				'products'
			)
		} else {
			throw new Error(result.error || 'Failed to load products')
		}

		if (currentUser) {
			renderProducts()
			updateStats()
		}
	} catch (error) {
		console.error('❌ Error loading products from server:', error)
		showNotification(
			'❌ Mahsulotlarni yuklashda xatolik: ' + error.message,
			'error'
		)
		products = []
		if (currentUser) {
			renderProducts()
			updateStats()
		}
	}
}

// Setup event listeners
function setupEventListeners() {
	// Login form
	loginForm.addEventListener('submit', handleLogin)

	// Logout button
	logoutBtn.addEventListener('click', handleLogout)

	// Tab navigation
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.addEventListener('click', e => {
			switchTab(e.target.dataset.tab)
		})
	})

	// Status filter
	document
		.getElementById('statusFilter')
		.addEventListener('change', filterOrders)

	// Refresh buttons
	document
		.getElementById('refreshOrders')
		.addEventListener('click', async () => {
			showNotification('📡 Buyurtmalar yangilanmoqda...', 'info')
			await loadOrdersFromServer()
			showNotification('✅ Buyurtmalar yangilandi!', 'success')
		})

	document
		.getElementById('refreshProducts')
		.addEventListener('click', async () => {
			showNotification('📡 Mahsulotlar yangilanmoqda...', 'info')
			await loadProductsFromServer()
			showNotification('✅ Mahsulotlar yangilandi!', 'success')
		})

	// Product management
	document
		.getElementById('addProductBtn')
		.addEventListener('click', openAddProductModal)
	document
		.getElementById('closeProductModal')
		.addEventListener('click', closeProductModal)
	document
		.getElementById('cancelProductBtn')
		.addEventListener('click', closeProductModal)
	productForm.addEventListener('submit', handleProductSubmit)

	// Order modal
	document
		.getElementById('closeOrderModal')
		.addEventListener('click', closeOrderModal)
	document
		.getElementById('updateStatusBtn')
		.addEventListener('click', updateOrderStatus)
	document
		.getElementById('deleteOrderBtn')
		.addEventListener('click', deleteOrder)

	// Close modals when clicking outside
	orderModal.addEventListener('click', e => {
		if (e.target === orderModal) {
			closeOrderModal()
		}
	})

	productModal.addEventListener('click', e => {
		if (e.target === productModal) {
			closeProductModal()
		}
	})
}

// Handle login
function handleLogin(e) {
	e.preventDefault()

	const username = document.getElementById('username').value
	const password = document.getElementById('password').value

	if (
		username === ADMIN_CREDENTIALS.username &&
		password === ADMIN_CREDENTIALS.password
	) {
		currentUser = { username, loginTime: new Date() }
		localStorage.setItem('adminUser', JSON.stringify(currentUser))
		showAdminPanel()
		hideLoginError()
	} else {
		showLoginError("Noto'g'ri foydalanuvchi nomi yoki parol!")
	}
}

// Handle logout
function handleLogout() {
	currentUser = null
	localStorage.removeItem('adminUser')
	showLoginForm()
}

// Show admin panel
function showAdminPanel() {
	loginContainer.classList.add('hidden')
	adminPanel.classList.remove('hidden')
	document.getElementById('adminName').textContent = currentUser.username
	loadOrdersFromServer()
	loadProductsFromServer()
	startOrderMonitoring()
}

// Show login form
function showLoginForm() {
	adminPanel.classList.add('hidden')
	loginContainer.classList.remove('hidden')
	loginForm.reset()
}

// Show/hide login error
function showLoginError(message) {
	loginError.textContent = message
	loginError.classList.remove('hidden')
}

function hideLoginError() {
	loginError.classList.add('hidden')
}

// Switch tabs
function switchTab(tabName) {
	// Update navigation
	document.querySelectorAll('.nav-btn').forEach(btn => {
		btn.classList.remove('active', 'border-white')
		btn.classList.add('text-white/70', 'border-transparent')
	})

	document
		.querySelector(`[data-tab="${tabName}"]`)
		.classList.add('active', 'border-white')
	document
		.querySelector(`[data-tab="${tabName}"]`)
		.classList.remove('text-white/70', 'border-transparent')

	// Show/hide content
	document.querySelectorAll('.tab-content').forEach(content => {
		content.classList.add('hidden')
	})

	document.getElementById(`${tabName}Tab`).classList.remove('hidden')
	currentTab = tabName

	// Load data for the active tab
	if (tabName === 'orders') {
		renderOrders()
	} else if (tabName === 'products') {
		renderProducts()
	} else if (tabName === 'stats') {
		updateStats()
	}
}

// Format price
function formatPrice(price) {
	return new Intl.NumberFormat('uz-UZ').format(price) + " so'm"
}

// Format date
function formatDate(date) {
	return new Intl.DateTimeFormat('uz-UZ', {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(date))
}

// Get status badge HTML
function getStatusBadge(status) {
	const statusMap = {
		new: { text: 'Yangi', class: 'status-new' },
		processing: { text: 'Jarayonda', class: 'status-processing' },
		completed: { text: 'Tugallangan', class: 'status-completed' },
		cancelled: { text: 'Bekor qilingan', class: 'status-cancelled' },
	}

	const statusInfo = statusMap[status] || statusMap['new']
	return `<span class="px-3 py-1 rounded-full text-sm font-medium ${statusInfo.class}">${statusInfo.text}</span>`
}

// Render orders
function renderOrders() {
	const container = document.getElementById('ordersContainer')
	const noOrdersDiv = document.getElementById('noOrders')
	const statusFilter = document.getElementById('statusFilter').value

	let filteredOrders = orders
	if (statusFilter !== 'all') {
		filteredOrders = orders.filter(order => order.status === statusFilter)
	}

	if (filteredOrders.length === 0) {
		container.innerHTML = ''
		noOrdersDiv.classList.remove('hidden')
		return
	}

	noOrdersDiv.classList.add('hidden')

	container.innerHTML = filteredOrders
		.map(
			order => `
		  <div class="order-card glass-effect rounded-xl p-6 cursor-pointer" onclick="showOrderDetails('${
				order.id
			}')">
			  <div class="flex items-center justify-between mb-4">
				  <div>
					  <h3 class="text-lg font-semibold text-white">Buyurtma #${
							order.orderId || order.id
						}</h3>
					  <p class="text-white/70">${formatDate(order.orderDate)}</p>
					  <p class="text-white/60 text-sm">Tel ID: ${order.phoneId || 'N/A'}</p>
				  </div>
				  ${getStatusBadge(order.status)}
			  </div>
			  
			  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
				  <div>
					  <p class="text-white/70 text-sm">Mijoz</p>
					  <p class="text-white font-medium">${order.customerName}</p>
				  </div>
				  <div>
					  <p class="text-white/70 text-sm">Telefon</p>
					  <p class="text-white font-medium">${order.customerPhone}</p>
				  </div>
			  </div>
			  
			  <div class="flex items-center justify-between">
				  <div>
					  <p class="text-white/70 text-sm">Mahsulotlar soni</p>
					  <p class="text-white font-medium">${order.products.length} ta</p>
				  </div>
				  <div class="text-right">
					  <p class="text-white/70 text-sm">Jami summa</p>
					  <p class="text-white font-bold text-lg">${formatPrice(order.totalAmount)}</p>
				  </div>
			  </div>
		  </div>
	  `
		)
		.join('')
}

// Filter orders
function filterOrders() {
	renderOrders()
}

// Render products
function renderProducts() {
	const container = document.getElementById('productsGrid')
	const noProductsDiv = document.getElementById('noProducts')

	if (products.length === 0) {
		container.innerHTML = ''
		noProductsDiv.classList.remove('hidden')
		return
	}

	noProductsDiv.classList.add('hidden')

	container.innerHTML = products
		.map(
			product => `
		  <div class="product-card glass-effect rounded-xl p-6">
			  <div class="relative mb-4">
				  <img src="${product.image || '/placeholder.svg?height=200&width=300'}" alt="${
				product.name
			}" class="w-full h-48 object-cover rounded-lg">
				  <div class="absolute top-2 right-2 flex space-x-2">
					  <button onclick="editProduct(${
							product.id
						})" class="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-lg">
						  ✏️
					  </button>
					  <button onclick="deleteProduct(${
							product.id
						})" class="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg">
						  🗑️
					  </button>
				  </div>
			  </div>
			  
			  <h3 class="text-lg font-semibold text-white mb-2">${product.name}</h3>
			  <p class="text-white/70 mb-2">Kategoriya: ${product.category}</p>
			  <p class="text-white/70 mb-2">Omborda: ${product.stock} ta</p>
			  <p class="text-white font-bold text-xl mb-2">${formatPrice(product.price)}</p>
			  
			  ${
					product.description
						? `<p class="text-white/60 text-sm">${product.description}</p>`
						: ''
				}
			  
			  <div class="mt-4 text-white/50 text-xs">
				  <p>Yaratilgan: ${formatDate(product.createdAt)}</p>
				  ${
						product.updatedAt !== product.createdAt
							? `<p>Yangilangan: ${formatDate(product.updatedAt)}</p>`
							: ''
					}
			  </div>
		  </div>
	  `
		)
		.join('')
}

// Product management functions
function openAddProductModal() {
	isEditingProduct = false
	selectedProduct = null
	document.getElementById('productModalTitle').textContent = "Mahsulot qo'shish"
	document.getElementById('productSubmitText').textContent = "Mahsulot qo'shish"
	productForm.reset()
	productModal.classList.remove('hidden')
}

function editProduct(productId) {
	isEditingProduct = true
	selectedProduct = products.find(p => p.id === productId)
	if (!selectedProduct) return

	document.getElementById('productModalTitle').textContent =
		'Mahsulotni tahrirlash'
	document.getElementById('productSubmitText').textContent =
		'Mahsulotni yangilash'

	// Fill form with existing data
	document.getElementById('productName').value = selectedProduct.name
	document.getElementById('productCategory').value = selectedProduct.category
	document.getElementById('productPrice').value = selectedProduct.price
	document.getElementById('productStock').value = selectedProduct.stock
	document.getElementById('productImage').value = selectedProduct.image || ''
	document.getElementById('productDescription').value =
		selectedProduct.description || ''

	productModal.classList.remove('hidden')
}

function closeProductModal() {
	productModal.classList.add('hidden')
	productForm.reset()
	isEditingProduct = false
	selectedProduct = null
}

async function handleProductSubmit(e) {
	e.preventDefault()

	const productData = {
		name: document.getElementById('productName').value,
		category: document.getElementById('productCategory').value,
		price: Number.parseInt(document.getElementById('productPrice').value),
		stock: Number.parseInt(document.getElementById('productStock').value),
		image: document.getElementById('productImage').value || null,
		description: document.getElementById('productDescription').value || null,
	}

	try {
		let response
		if (isEditingProduct && selectedProduct) {
			// Update existing product
			response = await fetch(`/api/products/${selectedProduct.id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(productData),
			})
		} else {
			// Create new product
			response = await fetch('/api/products', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(productData),
			})
		}

		const result = await response.json()

		if (result.success) {
			showNotification(
				`✅ Mahsulot ${isEditingProduct ? 'yangilandi' : "qo'shildi"}!`,
				'success'
			)
			closeProductModal()
			await loadProductsFromServer()
			renderProducts()
			updateStats()
		} else {
			throw new Error(result.error || 'Mahsulotni saqlashda xatolik')
		}
	} catch (error) {
		console.error('❌ Error saving product:', error)
		showNotification('❌ Mahsulotni saqlashda xatolik!', 'error')
	}
}

async function deleteProduct(productId) {
	if (!confirm("Mahsulotni o'chirishga ishonchingiz komilmi?")) return

	try {
		const response = await fetch(`/api/products/${productId}`, {
			method: 'DELETE',
		})

		const result = await response.json()

		if (result.success) {
			showNotification("✅ Mahsulot o'chirildi!", 'success')
			await loadProductsFromServer()
			renderProducts()
			updateStats()
		} else {
			throw new Error(result.error || "Mahsulotni o'chirishda xatolik")
		}
	} catch (error) {
		console.error('❌ Error deleting product:', error)
		showNotification("❌ Mahsulotni o'chirishda xatolik!", 'error')
	}
}

// Order management functions
function showOrderDetails(orderId) {
	selectedOrder = orders.find(order => order.id === orderId)
	if (!selectedOrder) return

	const detailsContainer = document.getElementById('orderDetails')

	detailsContainer.innerHTML = `
		  <div class="space-y-4">
			  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				  <div>
					  <label class="block text-white/70 text-sm mb-1">Buyurtma ID</label>
					  <p class="text-white font-medium">#${
							selectedOrder.orderId || selectedOrder.id
						}</p>
				  </div>
				  <div>
					  <label class="block text-white/70 text-sm mb-1">Telefon ID</label>
					  <p class="text-white font-medium">${selectedOrder.phoneId || 'N/A'}</p>
				  </div>
			  </div>
			  
			  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				  <div>
					  <label class="block text-white/70 text-sm mb-1">Mijoz ismi</label>
					  <p class="text-white font-medium">${selectedOrder.customerName}</p>
				  </div>
				  <div>
					  <label class="block text-white/70 text-sm mb-1">Telefon raqami</label>
					  <p class="text-white font-medium">${selectedOrder.customerPhone}</p>
				  </div>
			  </div>
			  
			  <div>
				  <label class="block text-white/70 text-sm mb-1">Manzil</label>
				  <p class="text-white font-medium">${selectedOrder.address}</p>
			  </div>
			  
			  <div>
				  <label class="block text-white/70 text-sm mb-1">Buyurtma sanasi</label>
				  <p class="text-white font-medium">${formatDate(selectedOrder.orderDate)}</p>
			  </div>
			  
			  <div>
				  <label class="block text-white/70 text-sm mb-1">Holat</label>
				  <div class="mb-2">${getStatusBadge(selectedOrder.status)}</div>
				  <select id="newStatus" class="bg-white/20 text-white border border-white/30 rounded-lg px-3 py-2">
					  <option value="new" ${
							selectedOrder.status === 'new' ? 'selected' : ''
						}>Yangi</option>
					  <option value="processing" ${
							selectedOrder.status === 'processing' ? 'selected' : ''
						}>Jarayonda</option>
					  <option value="completed" ${
							selectedOrder.status === 'completed' ? 'selected' : ''
						}>Tugallangan</option>
					  <option value="cancelled" ${
							selectedOrder.status === 'cancelled' ? 'selected' : ''
						}>Bekor qilingan</option>
				  </select>
			  </div>
			  
			  <div>
				  <label class="block text-white/70 text-sm mb-2">Mahsulotlar</label>
				  <div class="space-y-2">
					  ${selectedOrder.products
							.map(
								product => `
						  <div class="bg-white/10 rounded-lg p-3 flex justify-between items-center">
							  <div>
								  <p class="text-white font-medium">${product.name}</p>
								  <p class="text-white/70 text-sm">Miqdor: ${product.quantity}</p>
							  </div>
							  <p class="text-white font-bold">${formatPrice(
									product.price * product.quantity
								)}</p>
						  </div>
					  `
							)
							.join('')}
				  </div>
			  </div>
			  
			  <div class="border-t border-white/20 pt-4">
				  <div class="flex justify-between items-center">
					  <span class="text-white font-bold text-lg">Jami summa:</span>
					  <span class="text-white font-bold text-xl">${formatPrice(
							selectedOrder.totalAmount
						)}</span>
				  </div>
			  </div>
		  </div>
	  `

	orderModal.classList.remove('hidden')
}

function closeOrderModal() {
	orderModal.classList.add('hidden')
	selectedOrder = null
}

async function updateOrderStatus() {
	if (!selectedOrder) return

	const newStatus = document.getElementById('newStatus').value

	try {
		console.log('📝 Updating order status:', selectedOrder.id, 'to', newStatus)

		const response = await fetch(`/api/orders/${selectedOrder.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ status: newStatus }),
		})

		const result = await response.json()

		if (result.success) {
			console.log('✅ Order status updated successfully')
			await loadOrdersFromServer()
			renderOrders()
			closeOrderModal()
			showNotification(
				"✅ Buyurtma holati muvaffaqiyatli o'zgartirildi!",
				'success'
			)
		} else {
			throw new Error(result.error || 'Failed to update order status')
		}
	} catch (error) {
		console.error('❌ Error updating order status:', error)
		showNotification('❌ Buyurtma holatini yangilashda xatolik!', 'error')
	}
}

async function deleteOrder() {
	if (!selectedOrder) return

	if (confirm("Buyurtmani o'chirishga ishonchingiz komilmi?")) {
		try {
			console.log('🗑️ Deleting order:', selectedOrder.id)

			const response = await fetch(`/api/orders/${selectedOrder.id}`, {
				method: 'DELETE',
			})

			const result = await response.json()

			if (result.success) {
				console.log('✅ Order deleted successfully')
				await loadOrdersFromServer()
				renderOrders()
				closeOrderModal()
				updateStats()
				showNotification("✅ Buyurtma muvaffaqiyatli o'chirildi!", 'success')
			} else {
				throw new Error(result.error || 'Failed to delete order')
			}
		} catch (error) {
			console.error('❌ Error deleting order:', error)
			showNotification("❌ Buyurtmani o'chirishda xatolik!", 'error')
		}
	}
}

// Update statistics
function updateStats() {
	const totalOrders = orders.length
	const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
	const totalProducts = products.length
	const totalCustomers = new Set(orders.map(order => order.customerPhone)).size

	document.getElementById('totalOrders').textContent = totalOrders
	document.getElementById('totalRevenue').textContent =
		formatPrice(totalRevenue)
	document.getElementById('totalProducts').textContent = totalProducts
	document.getElementById('totalCustomers').textContent = totalCustomers
}

// Show notification
function showNotification(message, type = 'info') {
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

// Check for new orders periodically
function startOrderMonitoring() {
	setInterval(async () => {
		console.log('🔄 Checking for new orders from server...')
		await loadOrdersFromServer()
	}, 5000)
}

// Global functions to make them accessible from onclick
window.showOrderDetails = showOrderDetails
window.editProduct = editProduct
window.deleteProduct = deleteProduct
