// Tự động đồng bộ giỏ hàng lên Server (Có Debounce để nhanh hơn)
let syncTimeout;
async function syncCartToServer() {
    const user = JSON.parse(localStorage.getItem('user'));
    const cart = localStorage.getItem('cart') || "[]";
    
    if (user && user.email) {
        // Xóa timeout cũ nếu người dùng vẫn đang thao tác
        clearTimeout(syncTimeout);
        
        // Đợi 1.5 giây sau khi ngừng thao tác mới gửi lên Server
        syncTimeout = setTimeout(async () => {
            const data = {
                action: "SYNC_CART",
                email: user.email,
                cart: cart
            };
            await sendToDatabase(data);
            console.log("Đã đồng bộ giỏ hàng ngầm.");
        }, 1500);
    }
}

function addToCart(name, price, img) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProductIndex = cart.findIndex(item => item.name === name);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity += 1;
    } else {
        cart.push({ name, price, img, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    
    // Đồng bộ lên database
    syncCartToServer();
}

function updateCartBadge() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const badge = document.getElementById('cart-badge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    if (badge) {
        if (totalItems > 0) {
            badge.innerText = totalItems;
            badge.style.display = 'block';
        } else {
            badge.style.display = 'none';
        }
    }
}

const CONFIG_GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbxGF3fS2a0gT7XSeo699O6LRqo3AKe-4KPNvuIg9fjnknOXvZxBkjU7-bgqsP_xh63c/exec';

// Xử lý gửi dữ liệu khách hàng (Google Apps Script API)
async function sendToDatabase(data) {
    try {
        await fetch(CONFIG_GOOGLE_URL, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return true;
    } catch (e) { 
        console.error('Lỗi Database:', e); 
        return false;
    }
}

// Lắng nghe sự kiện đăng ký cộng đồng ở Footer
document.addEventListener('DOMContentLoaded', () => {
    const joinBtn = document.getElementById('join-btn');
    const emailInput = document.getElementById('community-email');

    if (joinBtn && emailInput) {
        joinBtn.addEventListener('click', () => {
            const email = emailInput.value;
            if (email && email.includes('@')) {
                const data = {
                    email: email,
                    name: 'Đăng ký cộng đồng',
                    date: new Date().toLocaleString()
                };
                sendToDatabase(data);
                alert('Cảm ơn bạn đã tham gia cộng đồng Emotea!');
                emailInput.value = '';
            } else {
                alert('Vui lòng nhập email hợp lệ.');
            }
        });
    }
    
    // Luôn cập nhật badge khi load
    updateCartBadge();
});
