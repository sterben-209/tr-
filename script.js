// Easing functions - chọn loại animation khác nhau
function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuad(t) {
    return 1 - (1 - t) * (1 - t);
}

window.addEventListener('scroll', function() {
    const logo2 = document.querySelector('.sub2-logo');
    let scrollPosition = window.scrollY;
    let windowHeight = window.innerHeight;
    
    // Tính progress từ 0 đến 1
    let progress = Math.min(scrollPosition / windowHeight, 1);
    
    // Áp dụng easing function mượt nhất (easeInOutCubic)
    let easedProgress = easeInOutCubic(progress);
    
    // Opacity mờ dần từ 1 về 0 với transition mượt
    logo2.style.opacity = 1 - easedProgress;
    logo2.style.transition = 'opacity 0.1s ease-out';
    
    const navbar = document.querySelector('.nav');
    navbar.style.opacity = easedProgress;
    navbar.style.transition = 'opacity 0.1s ease-out';
});