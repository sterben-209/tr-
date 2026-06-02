document.addEventListener('DOMContentLoaded', () => {
    const uploadBtn = document.getElementById('uploadBtn');
    const fileInput = document.getElementById('fileInput');
    const userImage = document.getElementById('userImage');
    const imageContainer = document.getElementById('imageContainer');
    const adjustmentControls = document.getElementById('adjustmentControls');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    
    const zoomRange = document.getElementById('zoomRange');
    const rotateRange = document.getElementById('rotateRange');
    const captureBtn = document.getElementById('captureBtn');
    
    const captureArea = document.getElementById('captureArea');
    const previewContainer = document.getElementById('previewContainer');
    const photoPreview = document.getElementById('photoPreview');
    const closePreview = document.getElementById('closePreview');

    let currentScale = 1;
    let currentRotation = 0;
    let currentX = 0;
    let currentY = 0;
    let isDragging = false;
    let startX, startY;

    // 1. Handle Image Upload
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                userImage.src = event.target.result;
                userImage.style.display = 'block';
                if(uploadPlaceholder) uploadPlaceholder.style.display = 'none';
                adjustmentControls.classList.remove('hidden');
                captureBtn.disabled = false;
                
                // Reset adjustments
                currentScale = 1; currentRotation = 0; currentX = 0; currentY = 0;
                zoomRange.value = 1; rotateRange.value = 0;
                updateImageTransform();
            };
            reader.readAsDataURL(file);
        }
    });

    // 2. Adjustments Logic
    function updateImageTransform() {
        userImage.style.transform = `translate(${currentX}px, ${currentY}px) scale(${currentScale}) rotate(${currentRotation}deg)`;
    }

    zoomRange.addEventListener('input', (e) => {
        currentScale = parseFloat(e.target.value);
        updateImageTransform();
    });

    rotateRange.addEventListener('input', (e) => {
        currentRotation = parseInt(e.target.value);
        updateImageTransform();
    });

    // 3. Dragging Logic
    imageContainer.addEventListener('mousedown', startDrag);
    window.addEventListener('mousemove', drag);
    window.addEventListener('mouseup', endDrag);
    imageContainer.addEventListener('touchstart', (e) => startDrag(e.touches[0]));
    window.addEventListener('touchmove', (e) => drag(e.touches[0]));
    window.addEventListener('touchend', endDrag);

    function startDrag(e) {
        if (!userImage.src || userImage.style.display === 'none') return;
        isDragging = true;
        startX = e.clientX - currentX;
        startY = e.clientY - currentY;
    }
    function drag(e) {
        if (!isDragging) return;
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
        updateImageTransform();
    }
    function endDrag() { isDragging = false; }

    // 4. Capture Logic
    captureBtn.addEventListener('click', async () => {
        captureBtn.disabled = true;
        captureBtn.innerText = "Đang xử lý...";

        try {
            const canvas = await html2canvas(captureArea, {
                backgroundColor: null,
                scale: 3, // High quality
                useCORS: true
            });

            const imageData = canvas.toDataURL('image/png');
            photoPreview.src = imageData;
            previewContainer.classList.remove('hidden');

            const link = document.createElement('a');
            link.download = `calm-diary-cup-${Date.now()}.png`;
            link.href = imageData;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            alert("Có lỗi xảy ra. Hãy thử lại!");
        } finally {
            captureBtn.disabled = false;
            captureBtn.innerText = "📸 Chụp Ảnh Ngay!";
        }
    });

    closePreview.addEventListener('click', () => {
        previewContainer.classList.add('hidden');
    });
});
