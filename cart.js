document.addEventListener('DOMContentLoaded', () => {
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
            cartItemsContainer.innerHTML = '<p>Giỏ hàng của bạn đang trống.</p>';
            return;
        }

        cart.forEach(item => {
            const cartItemHTML = `
                <div class="cart-item" data-name="${item.name}" data-price="${item.price}">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="item-info">
                        <h3 class="font-serif">${item.name}</h3>
                        <button class="remove-item"><i class="fas fa-trash"></i> Xóa</button>
                    </div>
                    <div class="item-price">${formatCurrency(item.price)}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn minus">-</button>
                        <input type="text" value="${item.quantity}" readonly>
                        <button class="quantity-btn plus">+</button>
                    </div>
                    <div class="item-total">${formatCurrency(item.price * item.quantity)}</div>
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
        
        let shippingFee = 30000;
        if (subtotal >= 200000) {
            shippingFee = 0;
        }
        
        subtotalElement.innerText = formatCurrency(subtotal);
        shippingFeeElement.innerText = formatCurrency(shippingFee);
        grandTotalElement.innerText = formatCurrency(subtotal + shippingFee);
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
    }


    cartItemsContainer.addEventListener('click', (event) => {
        const target = event.target;
        const cartItem = target.closest('.cart-item');
        
        if (!cartItem) return;

        const name = cartItem.dataset.name;
        
        // Quantity buttons
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

        // Remove button
        if (target.closest('.remove-item')) {
            cartItem.remove();
        }

        updateCartAndStorage();
    });

    renderCartItems();
    updateCart();
});

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cart-badge');
    if (badge) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        if (totalItems > 0) {
            badge.innerText = totalItems;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

// Update badge on all pages
document.addEventListener('DOMContentLoaded', updateCartBadge);
