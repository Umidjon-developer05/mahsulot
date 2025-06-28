// Admin credentials
const ADMIN_CREDENTIALS = {
	username: 'admin',
	password: 'admin123',
}

// Orders will be loaded from server API
let orders = []

// Sample products data
const products = []

// Current state
let currentUser = null
let currentTab = 'orders'
let selectedOrder = null

// DOM Elements
const loginContainer = document.getElementById('loginContainer')
const adminPanel = document.getElementById('adminPanel')
const loginForm = document.getElementById('loginForm')
const loginError = document.getElementById('loginError')
const logoutBtn = document.getElementById('logoutBtn')
const ordersContainer = document.getElementById('ordersContainer')
const orderModal = document.getElementById('orderModal')

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
	checkAuthStatus()
	setupEventListeners()
	checkServerStatus()
	loadOrdersFromServer()
})

// Check server status - yangilangan versiya
async function checkServerStatus() {
	try {
		console.log('🔍 Checking server status...')
		const response = await fetch('/api/orders', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
		})

		console.log('🌐 Server response status:', response.status)

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

// Load orders from server API (data/orders.json) - debug bilan
async function loadOrdersFromServer() {
	try {
		console.log('📡 Loading orders from server API...')
		console.log('🌐 API URL:', window.location.origin + '/api/orders')

		const response = await fetch('/api/orders', {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'same-origin',
		})

		console.log('📡 Response status:', response.status)
		console.log('📡 Response ok:', response.ok)

		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`)
		}

		const result = await response.json()
		console.log('📦 API Response:', result)

		if (result.success) {
			orders = result.data.orders || []
			console.log('✅ Orders loaded from server:', orders.length, 'orders')
			console.log('📄 Orders data:', orders)

			// Update last updated time
			if (result.data.lastUpdated) {
				console.log('🕒 Last updated:', result.data.lastUpdated)
			}
		} else {
			throw new Error(result.error || 'Failed to load orders')
		}

		// If admin panel is visible, update the display
		if (currentUser) {
			renderOrders()
			updateStats()
		}

		// Update server status
		document.getElementById('statusDot').className =
			'w-3 h-3 bg-green-500 rounded-full'
		document.getElementById('statusText').textContent = 'JSON fayli yuklandi'
	} catch (error) {
		console.error('❌ Error loading orders from server:', error)

		// Update server status
		document.getElementById('statusDot').className =
			'w-3 h-3 bg-red-500 rounded-full'
		document.getElementById('statusText').textContent =
			'Server xatolik: ' + error.message

		// Show detailed error
		showNotification(
			"❌ Server bilan bog'lanishda xatolik: " + error.message,
			'error'
		)

		orders = []
		if (currentUser) {
			renderOrders()
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

	// Refresh orders - Server API dan yangilash
	document
		.getElementById('refreshOrders')
		.addEventListener('click', async () => {
			showNotification('📡 Server dan yangilanmoqda...', 'info')
			await loadOrdersFromServer()
			showNotification(
				'✅ Buyurtmalar data/orders.json dan yangilandi!',
				'success'
			)
		})

	// Modal close
	document
		.getElementById('closeModal')
		.addEventListener('click', closeOrderModal)

	// Update status button
	document
		.getElementById('updateStatusBtn')
		.addEventListener('click', updateOrderStatus)

	// Delete order button
	document
		.getElementById('deleteOrderBtn')
		.addEventListener('click', deleteOrder)

	// Close modal when clicking outside
	orderModal.addEventListener('click', e => {
		if (e.target === orderModal) {
			closeOrderModal()
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
	loadOrdersFromServer() // Load fresh data from server
	renderProducts()
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
	const container = ordersContainer
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

// Show order details
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

// Close order modal
function closeOrderModal() {
	orderModal.classList.add('hidden')
	selectedOrder = null
}

// Update order status - Server API orqali
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
			// Reload orders from server
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

// Delete order - Server API orqali
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
				// Reload orders from server
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

// Render products
function renderProducts() {
	const container = document.getElementById('productsGrid')

	container.innerHTML = products
		.map(
			product => `
		  <div class="glass-effect rounded-xl p-6">
			  <img src="${product.image}" alt="${
				product.name
			}" class="w-full h-48 object-cover rounded-lg mb-4">
			  <h3 class="text-lg font-semibold text-white mb-2">${product.name}</h3>
			  <p class="text-white/70 mb-2">Kategoriya: ${product.category}</p>
			  <p class="text-white/70 mb-2">Omborda: ${product.stock} ta</p>
			  <p class="text-white font-bold text-xl">${formatPrice(product.price)}</p>
		  </div>
	  `
		)
		.join('')
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

// Check for new orders periodically - Server API orqali
function startOrderMonitoring() {
	setInterval(async () => {
		console.log('🔄 Checking for new orders from server...')
		await loadOrdersFromServer() // Server dan qayta yuklash
	}, 5000) // Har 5 soniyada tekshirish
}

// Global function to make it accessible from onclick
window.showOrderDetails = showOrderDetails
