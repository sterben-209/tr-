document.addEventListener('DOMContentLoaded', () => {
    const steps = document.querySelectorAll('.step');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const progressBar = document.getElementById('progress');
    const surveyForm = document.getElementById('survey-form');
    const successView = document.getElementById('success-view');
    const optionCards = document.querySelectorAll('.option-card');

    let currentStep = 1;
    const totalSteps = steps.length;

    function updateStep() {
        // Update Steps Visibility
        steps.forEach(step => {
            step.classList.remove('active');
            if (parseInt(step.dataset.step) === currentStep) {
                step.classList.add('active');
            }
        });

        // Update Progress Bar
        const progressPercent = (currentStep / totalSteps) * 100;
        progressBar.style.width = `${progressPercent}%`;

        // Update Buttons
        if (currentStep === 1) {
            prevBtn.classList.add('opacity-0', 'pointer-events-none');
        } else {
            prevBtn.classList.remove('opacity-0', 'pointer-events-none');
        }

        if (currentStep === totalSteps) {
            nextBtn.classList.add('hidden');
            submitBtn.classList.remove('hidden');
        } else {
            nextBtn.classList.remove('hidden');
            submitBtn.classList.add('hidden');
        }

        // Scroll to top of form
        surveyForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Option Card Selection Logic
    optionCards.forEach(card => {
        card.addEventListener('click', () => {
            const name = card.dataset.name;
            const value = card.dataset.value;
            
            // Unselect others in the same group
            document.querySelectorAll(`.option-card[data-name="${name}"]`).forEach(c => {
                c.classList.remove('selected');
            });
            
            // Select this one
            card.classList.add('selected');
            
            // Update hidden input
            const input = document.querySelector(`input[name="${name}"]`);
            if (input) input.value = value;
        });
    });

    nextBtn.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateStep();
        } else {
            alert('Vui lòng điền đủ thông tin trước khi tiếp tục nha!');
        }
    });

    prevBtn.addEventListener('click', () => {
        if (currentStep > 1) {
            currentStep--;
            updateStep();
        }
    });

    function validateStep(step) {
        const activeStep = document.querySelector(`.step[data-step="${step}"]`);
        const requiredInputs = activeStep.querySelectorAll('[required]');
        
        for (let input of requiredInputs) {
            if (!input.value) return false;
        }
        return true;
    }

    surveyForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(surveyForm);
        const data = {
            action: "SURVEY_INSIGHT",
            timestamp: new Date().toLocaleString()
        };
        
        formData.forEach((value, key) => {
            data[key] = value;
        });

        // Show loading state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner animate-spin"></i> ĐANG GỬI...';

        try {
            const success = await sendToDatabase(data);
            if (success) {
                surveyForm.classList.add('hidden');
                successView.classList.remove('hidden');
                progressBar.parentElement.classList.add('hidden');
            } else {
                alert('Có lỗi xảy ra. Bạn vui lòng thử lại nhé!');
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'GỬI KẾT QUẢ';
            }
        } catch (error) {
            console.error('Survey Error:', error);
            alert('Lỗi kết nối database.');
            submitBtn.disabled = false;
        }
    });
});
