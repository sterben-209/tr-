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

// Hàm băm mật khẩu SHA-256 (Tạo mã định danh không thể dịch ngược)
async function hashPassword(password) {
    if (!window.crypto || !crypto.subtle) {
        alert("CẢNH BÁO: Trình duyệt của bạn đang chặn tính năng bảo mật (Web Crypto). Hãy chạy ứng dụng trên HTTPS hoặc Localhost để đăng nhập được nhé!");
        return password; // Fallback (không an toàn nhưng giúp debug)
    }
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const CONFIG_GOOGLE_URL = 'https://script.google.com/macros/s/AKfycbyMazoxNRys2LdyZejSPE86CeWq9aLTmEfS4Oh68ED6IUO4BiQCBoK2zZCvA2o7Bn6m/exec';

// Tự động xác định Base URL cho Link Reset (Local vs Deploy)
function getBaseURL() {
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const deployedURL = 'https://sterben-209.github.io/tr-/';
    
    if (isLocal) {
        let path = window.location.pathname;
        const sub = 'stitch_sketch_to_mobile_web/';
        
        // Nếu đang ở trong thư mục con, lùi về thư mục gốc của project
        if (path.includes(sub)) {
            path = path.substring(0, path.indexOf(sub));
        } else if (path.endsWith('.html')) {
            path = path.substring(0, path.lastIndexOf('/') + 1);
        }
        
        // Đảm bảo path kết thúc bằng /
        if (!path.endsWith('/')) path += '/';
        
        return window.location.origin + path;
    }
    return deployedURL;
}

// Xử lý gửi dữ liệu khách hàng (Google Apps Script API)
async function sendToDatabase(data) {
    try {
        const response = await fetch(CONFIG_GOOGLE_URL, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const result = await response.json();
        return result;
    } catch (e) {
        console.error('Lỗi Database:', e);
        return { result: "error", message: e.message };
    }
}

// Xử lý lấy dữ liệu có phản hồi từ Server
async function fetchFromDatabase(data) {
    console.log('--- Database Request ---', data);
    try {
        const response = await fetch(CONFIG_GOOGLE_URL, {
            method: 'POST',
            body: JSON.stringify(data),
        });
        const result = await response.json();
        console.log('--- Database Response ---', result);
        return result;
    } catch (e) {
        console.error('Lỗi Fetch Database:', e);
        return { result: "error", message: e.message };
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
                console.log('Cảm ơn bạn đã tham gia cộng đồng Emotea!');
                emailInput.value = '';
            } else {
                alert('Vui lòng nhập email hợp lệ.');
            }
        });
    }
    
    // Luôn cập nhật badge khi load
    updateCartBadge();
});








