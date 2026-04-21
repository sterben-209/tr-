function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartBadge = document.getElementById('cart-badge');
    if (cartBadge) {
        const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
        if (totalItems > 0) {
            cartBadge.innerText = totalItems;
            cartBadge.style.display = 'flex';
        } else {
            cartBadge.style.display = 'none';
        }
    }
}

function addToCart(name, price, img) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === name);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    console.log(`Đã thêm ${name} vào giỏ hàng!`);
}

/* --- Mobile Menu Logic cho Trang Con --- */
function initSubPageMenu() {
    const toggleBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (!toggleBtn || !mobileMenu) {
        console.log('Mobile menu elements not found in this page');
        return;
    }

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const isHidden = mobileMenu.classList.contains('translate-x-full');
        
        if (isHidden) {
            mobileMenu.classList.remove('translate-x-full');
            mobileMenu.style.visibility = 'visible';
            if (menuIcon) menuIcon.classList.add('hidden');
            if (closeIcon) closeIcon.classList.remove('hidden');
            console.log('Sub-page menu opened');
        } else {
            mobileMenu.classList.add('translate-x-full');
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
            console.log('Sub-page menu closed');
        }
    });

    // Đóng menu khi bấm vào link
    const links = mobileMenu.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.add('translate-x-full');
            if (menuIcon) menuIcon.classList.remove('hidden');
            if (closeIcon) closeIcon.classList.add('hidden');
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Giỏ hàng
    const addToCartButton = document.getElementById('add-to-cart-btn');
    if (addToCartButton) {
        addToCartButton.addEventListener('click', () => {
            const productName = addToCartButton.dataset.name;
            const productPrice = parseFloat(addToCartButton.dataset.price);
            const productImg = addToCartButton.dataset.img;
            if (productName && productPrice && productImg) {
                addToCart(productName, productPrice, productImg);
            }
        });
    }

    // 2. Cập nhật Badge
    updateCartBadge();

    // 3. Khởi tạo Menu
    initSubPageMenu();
});
