// Physics constants for smooth movement
const LERP_FACTOR = 0.1;
let mouseX = window.innerWidth / 2;
let mouseY = window.innerHeight / 2;
let currentTiltX = 0;
let currentTiltY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function updateMascot() {
    const mascot = document.getElementById('mascot');
    const eyes = document.querySelectorAll('.eye-l');
    
    // Calculate mascot center
    const mRect = mascot.getBoundingClientRect();
    const mCenterX = mRect.left + mRect.width / 2;
    const mCenterY = mRect.top + mRect.height / 2;

    // Smooth Tilt with Lerp
    const targetTiltX = (mouseX - mCenterX) / 60;
    const targetTiltY = (mouseY - mCenterY) / 60;
    
    currentTiltX += (targetTiltX - currentTiltX) * LERP_FACTOR;
    currentTiltY += (targetTiltY - currentTiltY) * LERP_FACTOR;
    
    mascot.style.transform = `rotateX(${-currentTiltY}deg) rotateY(${currentTiltX}deg)`;

    // Eyes movement
    eyes.forEach(eye => {
        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        const deltaX = mouseX - eyeCenterX;
        const deltaY = mouseY - eyeCenterY;
        const angle = Math.atan2(deltaY, deltaX);
        
        // Synchronized movement constants
        const maxEyeDist = 8; 
        const distRatio = Math.min(1, Math.hypot(deltaX, deltaY) / 200);
        
        const moveX = Math.cos(angle) * maxEyeDist * distRatio;
        const moveY = Math.sin(angle) * maxEyeDist * distRatio;

        // Move the main eye oval
        eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
        
        // Move the glint in perfect sync (slighly less for parallax effect)
        const glint = eye.querySelector('.glint-l');
        if (glint) {
            glint.style.transform = `translate(${moveX * 0.3}px, ${moveY * 0.3}px)`;
        }
    });

    requestAnimationFrame(updateMascot);
}

// Start the animation loop
updateMascot();

// Artistic Click Interaction
document.getElementById('mascot').addEventListener('click', function() {
    this.classList.add('jiggle');
    
    // Blink effect
    const eyes = document.querySelectorAll('.eye-l');
    eyes.forEach(eye => {
        eye.style.transition = 'height 0.1s ease';
        eye.style.height = '2px';
    });
    
    setTimeout(() => {
        this.classList.remove('jiggle');
        eyes.forEach(eye => {
            eye.style.height = '60px';
        });
    }, 400);

    // Create a little heart particle
    createHeart(mouseX, mouseY);
});

function createHeart(x, y) {
    const heart = document.createElement('div');
    heart.innerHTML = '❤️';
    heart.style.position = 'fixed';
    heart.style.left = x + 'px';
    heart.style.top = y + 'px';
    heart.style.pointerEvents = 'none';
    heart.style.fontSize = '20px';
    heart.style.zIndex = '2000';
    heart.style.animation = 'floatUp 1s ease-out forwards';
    document.body.appendChild(heart);
    
    setTimeout(() => heart.remove(), 1000);
}

// Add animation for heart particle
const style = document.createElement('style');
style.innerHTML = `
@keyframes floatUp {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-100px) scale(1.5); opacity: 0; }
}
`;
document.head.appendChild(style);
