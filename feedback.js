document.addEventListener('DOMContentLoaded', () => {
    const feedbackTrigger = document.getElementById('feedback-trigger');
    const feedbackModal = document.getElementById('feedback-modal');
    const feedbackOverlay = document.getElementById('feedback-overlay');
    const closeFeedback = document.getElementById('close-feedback');
    const feedbackForm = document.getElementById('feedback-form');
    const emojis = document.querySelectorAll('.emoji-btn');
    const ratingInput = document.getElementById('rating-input');
    const ratingError = document.getElementById('rating-error');
    const feelingText = document.getElementById('feeling-text');
    
    // Nhãn cảm xúc tương ứng với từng mức độ
    const feelings = ["Quá tồi tệ", "Hơi buồn một chút", "Cũng bình thường", "Rất vui & Hài lòng", "Tuyệt đỉnh Cú Mèo!"];

    // Open Modal
    feedbackTrigger.addEventListener('click', () => {
        feedbackModal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent scroll
    });

    // Close Modal
    const closeModal = () => {
        feedbackModal.classList.remove('active');
        document.body.style.overflow = '';
    };

    closeFeedback.addEventListener('click', closeModal);
    feedbackOverlay.addEventListener('click', closeModal);

    // Emoji Rating
    emojis.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            emojis.forEach(e => e.classList.remove('active'));
            btn.classList.add('active');
            ratingInput.value = btn.getAttribute('data-value');
            ratingError.classList.add('hidden');
            feelingText.textContent = feelings[index];
            feelingText.classList.remove('opacity-0');
        });
    });

    // Form Submit
    feedbackForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        if (!ratingInput.value) {
            ratingError.classList.remove('hidden');
            document.getElementById('emoji-rating').animate([
                { transform: 'translateX(0)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(-10px)' },
                { transform: 'translateX(10px)' },
                { transform: 'translateX(0)' }
            ], { duration: 400 });
            return;
        }

        const submitBtn = feedbackForm.querySelector('button[type="submit"]');
        const originalBtnContent = submitBtn.innerHTML;
        
        // Trạng thái đang gửi
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="flex items-center justify-center gap-2"><i class="fas fa-spinner animate-spin"></i> Đang gửi...</span>';

        // Lấy dữ liệu từ form
        const feedbackData = {
            action: "FEEDBACK",
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            rating: ratingInput.value,
            message: document.getElementById('message').value
        };

        // Gửi qua hàm có sẵn trong utils.js
        const success = await sendToDatabase(feedbackData);

        if (success) {
            // Hiệu ứng chuyển màn hình thành công
            const formContainer = document.getElementById('feedback-form-container');
            const successMsg = document.getElementById('success-message');
            
            formContainer.style.opacity = '0';
            formContainer.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                formContainer.classList.add('hidden');
                successMsg.classList.remove('hidden');
                successMsg.classList.add('fade-in');
            }, 300);
        } else {
            console.error('Có lỗi xảy ra khi gửi góp ý.');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnContent;
        }
    });

    // Reset Form
    window.resetFeedbackForm = function() {
        feedbackForm.reset();
        ratingInput.value = '';
        feelingText.classList.add('opacity-0');
        emojis.forEach(e => e.classList.remove('active'));
        
        const formContainer = document.getElementById('feedback-form-container');
        const successMsg = document.getElementById('success-message');

        successMsg.classList.add('hidden');
        successMsg.classList.remove('fade-in');
        
        formContainer.classList.remove('hidden');
        setTimeout(() => {
            formContainer.style.opacity = '1';
            formContainer.style.transform = 'scale(1)';
        }, 50);
    }
});
