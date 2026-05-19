/* SHOPPING CART & CHECKOUT LOGIC - KIMCHI FOOD */

let cart = JSON.parse(localStorage.getItem('kimchi_cart')) || [];
const DELIVERY_FEE = 10000; // Flat rate for Luque / Central (10.000 Gs.)

// DOM Elements cache
const cartDrawer = document.getElementById('cartDrawer');
const bodyOverlay = document.getElementById('bodyOverlay');
const cartItemsContainer = document.getElementById('cartItemsContainer');
const cartCountElements = document.querySelectorAll('.cart-count');
const cartSubtotalElement = document.getElementById('cartSubtotal');
const cartDiscountContainer = document.getElementById('cartDiscountContainer');
const cartDiscountElement = document.getElementById('cartDiscount');
const cartDeliveryElement = document.getElementById('cartDelivery');
const cartTotalElement = document.getElementById('cartTotal');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const deliveryDateInput = document.getElementById('deliveryDate');
const dateValidationNotice = document.getElementById('dateValidationNotice');
const submitBtnText = document.getElementById('submitBtnText');

// Save cart to local storage and update all UI elements
function updateCart() {
    localStorage.setItem('kimchi_cart', JSON.stringify(cart));
    renderCart();
    updateCartCount();
}

// Calculate the item counts
function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCountElements.forEach(el => {
        el.textContent = totalItems;
        el.style.display = totalItems > 0 ? 'flex' : 'none';
    });
}

// Open / Close Drawer functions
function openCartDrawer() {
    cartDrawer.classList.add('open');
    bodyOverlay.classList.add('open');
}

function closeCartDrawer() {
    cartDrawer.classList.remove('open');
    bodyOverlay.classList.remove('open');
}

// Open / Close Checkout Modal
function openCheckoutModal() {
    if (cart.length === 0) {
        showToast('Tu carrito está vacío. ¡Agrega delicias coreanas primero!', 'info');
        return;
    }
    closeCartDrawer();
    checkoutModal.classList.add('open');
    bodyOverlay.classList.add('open');
    
    // Set minimum date of tomorrow (24h pre-order requirement)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    deliveryDateInput.min = `${yyyy}-${mm}-${dd}`;
}

function closeCheckoutModal() {
    checkoutModal.classList.remove('open');
    bodyOverlay.classList.remove('open');
}

// Add item to cart
function addToCart(productId) {
    const product = MENU_DATA.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.product.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ product, quantity: 1 });
    }
    
    updateCart();
    showToast(`¡${product.name} agregado al carrito!`, 'success');
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.product.id === productId);
    if (!item) return;
    
    item.quantity += change;
    
    if (item.quantity <= 0) {
        cart = cart.filter(item => item.product.id !== productId);
    }
    
    updateCart();
}

// Remove completely from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.product.id !== productId);
    updateCart();
    showToast('Producto eliminado del carrito.', 'info');
}

// Calculate cart totals including dynamic promos based on delivery date
function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    
    // Get date discount
    const selectedDateVal = deliveryDateInput ? deliveryDateInput.value : '';
    let discountPercent = 0;
    let discountText = "";
    
    if (selectedDateVal) {
        const dateObj = new Date(selectedDateVal + 'T00:00:00'); // Prevent timezone issues
        const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
        
        if (dayOfWeek === 1) { // Monday
            discountPercent = 0.10;
            discountText = "10% OFF Lunes de K-Drama \u{1F3AC}";
        } else if (dayOfWeek === 3) { // Wednesday
            discountPercent = 0.10;
            discountText = "10% OFF Mi\u{00E9}rcoles de K-POP \u{1F3B5}";
        } else if (dayOfWeek === 5) { // Friday
            discountPercent = 0.15;
            discountText = "15% OFF Seoul Night Friday \u{1F30C}";
        }
    }
    
    const discountAmount = subtotal * discountPercent;
    const delivery = subtotal > 0 ? DELIVERY_FEE : 0;
    const total = subtotal - discountAmount + delivery;
    
    return {
        subtotal,
        discountAmount,
        discountText,
        delivery,
        total
    };
}

// Render the cart items in the drawer
function renderCart() {
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-view">
                <i class="fas fa-shopping-basket"></i>
                <p>Tu carrito está vacío.<br>¿Qué te apetece hoy?</p>
            </div>
        `;
        cartSubtotalElement.textContent = formatGuarani(0);
        cartDiscountContainer.style.display = 'none';
        cartDeliveryElement.textContent = formatGuarani(0);
        cartTotalElement.textContent = formatGuarani(0);
        return;
    }
    
    cartItemsContainer.innerHTML = '';
    cart.forEach(item => {
        const cartItemEl = document.createElement('div');
        cartItemEl.className = 'cart-item';
        cartItemEl.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-img">
            <div class="cart-item-info">
                <h4 class="cart-item-name">${item.product.name}</h4>
                <div class="cart-item-price">${formatGuarani(item.product.price)}</div>
            </div>
            <div class="cart-item-qty-control">
                <button class="qty-btn" onclick="updateQuantity('${item.product.id}', -1)">-</button>
                <span class="qty-num">${item.quantity}</span>
                <button class="qty-btn" onclick="updateQuantity('${item.product.id}', 1)">+</button>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart('${item.product.id}')">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        cartItemsContainer.appendChild(cartItemEl);
    });
    
    // Calculate and display prices
    const prices = calculateTotals();
    cartSubtotalElement.textContent = formatGuarani(prices.subtotal);
    
    if (prices.discountAmount > 0) {
        cartDiscountContainer.style.display = 'flex';
        cartDiscountElement.textContent = `-${formatGuarani(prices.discountAmount)} (${prices.discountText})`;
    } else {
        cartDiscountContainer.style.display = 'none';
    }
    
    cartDeliveryElement.textContent = formatGuarani(prices.delivery);
    cartTotalElement.textContent = formatGuarani(prices.total);
}

// Validate Selected Delivery Date
function handleDateChange() {
    const dateVal = deliveryDateInput.value;
    if (!dateVal) return;
    
    const dateObj = new Date(dateVal + 'T00:00:00');
    const dayOfWeek = dateObj.getDay(); // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    
    // We only deliver Lunes (1), Miércoles (3), Viernes (5)
    const isValidDay = (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5);
    
    if (!isValidDay) {
        dateValidationNotice.style.color = 'var(--accent-red)';
        dateValidationNotice.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i> 
            Error: Solo entregamos Lunes, Miércoles y Viernes de 18:00 a 00:00.
        `;
        submitBtnText.textContent = "Selecciona un día de entrega válido";
        return false;
    }
    
    // If valid, show promotional discount notice!
    dateValidationNotice.style.color = 'var(--accent-green)';
    let promoMsg = "";
    if (dayOfWeek === 1) {
        promoMsg = "\u{00A1}Genial! Lunes K-Drama: 10% de Descuento aplicado \u{1F389}";
    } else if (dayOfWeek === 3) {
        promoMsg = "\u{00A1}Genial! Mi\u{00E9}rcoles K-POP: 10% de Descuento aplicado \u{1F3A7}";
    } else if (dayOfWeek === 5) {
        promoMsg = "\u{00A1}Espectacular! Viernes Seoul Night: 15% de Descuento aplicado \u{1F303}";
    }
    
    dateValidationNotice.innerHTML = `
        <i class="fas fa-check-circle"></i> 
        ${promoMsg}
    `;
    
    submitBtnText.textContent = "Confirmar Pedido v\u{00ED}a WhatsApp \u{1F962}";
    renderCart(); // Refresh discount totals
    return true;
}

// Submit Checkout Form
function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    if (cart.length === 0) return;
    
    // Re-validate date
    const dateVal = deliveryDateInput.value;
    const dateObj = new Date(dateVal + 'T00:00:00');
    const dayOfWeek = dateObj.getDay();
    const isValidDay = (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5);
    
    if (!isValidDay) {
        showToast("Por favor, selecciona una fecha de entrega válida (Lunes, Miércoles o Viernes).", "info");
        return;
    }
    
    // Gather form details
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const address = document.getElementById('clientAddress').value;
    const hour = document.getElementById('deliveryHour').value;
    const payment = document.getElementById('paymentMethod').value;
    const notes = document.getElementById('orderNotes').value || "Ninguna";
    
    // Formatted delivery date
    const dateString = dateObj.toLocaleDateString('es-PY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    // Calculate final pricing structures
    const prices = calculateTotals();
    
    // Compile items list for message
    let itemsText = "";
    cart.forEach(item => {
        itemsText += `• ${item.quantity}x ${item.product.name} (${formatGuarani(item.product.price * item.quantity)})\n`;
    });
    
    // Format WhatsApp message with emojis
    let message = `\u{1F1F0}\u{1F1F7} *NUEVO PEDIDO - KIMCHI FOOD* \u{1F1F0}\u{1F1F7}\n`;
    message += `------------------------------------\n`;
    message += `\u{1F464} *Cliente:* ${name}\n`;
    message += `\u{1F4DE} *Tel\u{00E9}fono:* ${phone}\n`;
    message += `\u{1F4CD} *Direcci\u{00F3}n:* ${address}\n`;
    message += `\u{1F5D3}\u{FE0F} *Fecha de Entrega:* ${dateString}\n`;
    message += `\u{23F0} *Hora aproximada:* ${hour} hs (18:00 - 00:00)\n`;
    message += `\u{1F4B3} *M\u{00E9}todo de Pago:* ${payment}\n`;
    message += `------------------------------------\n\n`;
    
    message += `\u{1F6D2} *DETALLE DEL PEDIDO:*\n`;
    message += `${itemsText}\n`;
    
    message += `------------------------------------\n`;
    message += `\u{1F4B5} *Subtotal:* ${formatGuarani(prices.subtotal)}\n`;
    if (prices.discountAmount > 0) {
        message += `\u{1F381} *Descuento:* -${formatGuarani(prices.discountAmount)} (${prices.discountText})\n`;
    }
    message += `\u{1F69A} *Delivery flat:* ${formatGuarani(prices.delivery)}\n`;
    message += `\u{1F4B0} *TOTAL A PAGAR:* ${formatGuarani(prices.total)}\n`;
    message += `------------------------------------\n`;
    message += `\u{1F4DD} *Notas:* ${notes}\n\n`;
    message += `\u{00A1}Cocinado artesanalmente con 24hs de anticipaci\u{00F3}n! \u{1F962}\u{2728}`;
    
    // WhatsApp URL generation
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/595991522885?text=${encodedMessage}`;
    
    // Close checkout and reset cart
    closeCheckoutModal();
    cart = [];
    updateCart();
    
    // Open WhatsApp
    window.open(whatsappUrl, '_blank');
    
    showToast("¡Pedido compilado con éxito! Se ha abierto WhatsApp para enviarlo.", "success");
}

// Listen to date changes
if (deliveryDateInput) {
    deliveryDateInput.addEventListener('change', handleDateChange);
}

// Form Submission handler
if (checkoutForm) {
    checkoutForm.addEventListener('submit', handleCheckoutSubmit);
}

// Toast Notifications System Helper
function showToast(message, type = 'info') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-info-circle';
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s ease forwards';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 4000);
}
