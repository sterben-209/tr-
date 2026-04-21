document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Logic ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileMenuDropdown = document.getElementById('mobile-menu-dropdown');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (mobileMenuToggle && mobileMenuDropdown) {
        mobileMenuToggle.addEventListener('click', () => {
            mobileMenuDropdown.classList.toggle('translate-x-full');
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }

    const cartItemsContainer = document.querySelector('.cart-items');
    const subtotalElement = document.getElementById('subtotal');
    const shippingFeeElement = document.getElementById('shipping-fee');
    const grandTotalElement = document.getElementById('grand-total');

    function formatCurrency(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount).replace('₫', 'đ');
    }

    function renderCartItems() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        cartItemsContainer.innerHTML = ''; // Clear existing items

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center py-12 text-stone-500">Giỏ hàng của bạn đang trống.</p>';
            return;
        }

        cart.forEach(item => {
            const cartItemHTML = `
                <div class="cart-item flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl mb-4 shadow-sm border border-stone-100" data-name="${item.name}" data-price="${item.price}">
                    <img src="${item.img}" alt="${item.name}" class="w-24 h-24 object-cover rounded-xl">
                    <div class="item-info flex-1 text-center sm:text-left">
                        <h3 class="font-serif text-xl mb-2">${item.name}</h3>
                        <button class="remove-item text-stone-400 hover:text-red-500 text-sm transition-colors"><i class="fas fa-trash mr-2"></i> Xóa</button>
                    </div>
                    <div class="item-price text-stone-500 hidden sm:block">${formatCurrency(item.price)}</div>
                    <div class="item-quantity flex items-center bg-stone-50 rounded-full p-1 border border-stone-200">
                        <button class="quantity-btn minus w-8 h-8 flex items-center justify-center hover:bg-stone-200 rounded-full transition-colors">-</button>
                        <input type="text" value="${item.quantity}" readonly class="w-12 text-center bg-transparent font-medium">
                        <button class="quantity-btn plus w-8 h-8 flex items-center justify-center hover:bg-stone-200 rounded-full transition-colors">+</button>
                    </div>
                    <div class="item-total font-bold text-stone-800 min-w-[100px] text-right">${formatCurrency(item.price * item.quantity)}</div>
                </div>
            `;
            cartItemsContainer.insertAdjacentHTML('beforeend', cartItemHTML);
        });
    }

    function updateCart() {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        let subtotal = 0;

        cart.forEach(item => {
            subtotal += item.price * item.quantity;
        });
        
        let shippingFee = subtotal > 0 ? 30000 : 0;
        if (subtotal >= 200000) {
            shippingFee = 0;
        }
        
        if (subtotalElement) subtotalElement.innerText = formatCurrency(subtotal);
        if (shippingFeeElement) shippingFeeElement.innerText = formatCurrency(shippingFee);
        if (grandTotalElement) grandTotalElement.innerText = formatCurrency(subtotal + shippingFee);
    }
    
    function updateCartAndStorage() {
        const cartItems = document.querySelectorAll('.cart-item');
        let cart = [];
        cartItems.forEach(item => {
            const name = item.dataset.name;
            const price = parseFloat(item.dataset.price);
            const quantity = parseInt(item.querySelector('.item-quantity input').value);
            const img = item.querySelector('img').src;
            cart.push({name, price, img, quantity});
        });

        localStorage.setItem('cart', JSON.stringify(cart));
        updateCart();
        updateCartBadge();
        
        if (typeof syncCartToServer === 'function') syncCartToServer();
    }

    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (event) => {
            const target = event.target;
            const cartItem = target.closest('.cart-item');
            
            if (!cartItem) return;

            const name = cartItem.dataset.name;
            
            if (target.classList.contains('quantity-btn')) {
                const input = cartItem.querySelector('input');
                let quantity = parseInt(input.value);

                if (target.classList.contains('plus')) {
                    quantity++;
                } else if (target.classList.contains('minus') && quantity > 1) {
                    quantity--;
                }
                input.value = quantity;
                cartItem.querySelector('.item-total').innerText = formatCurrency(cartItem.dataset.price * quantity);
            }

            if (target.closest('.remove-item')) {
                cartItem.remove();
            }

            updateCartAndStorage();
        });
    }

    const checkoutBtn = document.querySelector('.checkout-btn');
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', async () => {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            const user = JSON.parse(localStorage.getItem('user')); 
            
            if (cart.length === 0) {
                alert('Giỏ hàng của bạn đang trống.');
                return;
            }

            const orderDetails = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
            const totalAmount = grandTotalElement.innerText;

            const orderData = {
                action: "ORDER",
                name: user ? user.name : "Khách vãng lai",
                email: user ? user.email : "guest@example.com",
                order_details: orderDetails,
                total: totalAmount
            };

            checkoutBtn.innerText = 'ĐANG XỬ LÝ...';
            checkoutBtn.disabled = true;

            try {
                await sendToDatabase(orderData);
                console.log('Đơn hàng đã được đặt thành công.');
                localStorage.removeItem('cart');
                renderCartItems();
                updateCart();
                updateCartBadge();
            } catch (error) {
                console.error('Lỗi đặt hàng:', error);
            } finally {
                checkoutBtn.innerText = 'THANH TOÁN';
                checkoutBtn.disabled = false;
            }
        });
    }

    renderCartItems();
    updateCart();
});

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badges = document.querySelectorAll('#cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    badges.forEach(badge => {
        if (totalItems > 0) {
            badge.innerText = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    });
}

document.addEventListener('DOMContentLoaded', updateCartBadge);
