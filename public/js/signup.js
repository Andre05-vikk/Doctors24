document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    
    // Debounce function for input validation
    const debounce = (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    };

    // Real-time validation
    const validateEmail = debounce(async (email) => {
        try {
            const response = await fetch('/auth/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();
            
            if (!data.available) {
                showError('email', 'This email is already registered');
            }
        } catch (error) {
            console.error('Error checking email:', error);
        }
    }, 1000);

    const validatePassword = (password) => {
        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSpecialChar = /[!@#$%^&*]/.test(password);

        if (password.length < minLength) {
            showError('password', 'Password must be at least 8 characters long');
            return false;
        }
        if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
            showError('password', 'Password must contain uppercase, lowercase, numbers, and special characters');
            return false;
        }
        return true;
    };

    // Input event listeners
    const emailInput = signupForm.querySelector('[name="email"]');
    emailInput.addEventListener('input', (e) => validateEmail(e.target.value));

    const passwordInput = signupForm.querySelector('[name="password"]');
    passwordInput.addEventListener('input', (e) => validatePassword(e.target.value));

    // Form submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        clearErrors();

        const formData = new FormData(e.target);
        const userData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/auth/signup', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'CSRF-Token': userData._csrf
                },
                body: JSON.stringify(userData),
                credentials: 'same-origin'
            });

            const data = await response.json();

            if (response.ok) {
                const modal = bootstrap.Modal.getInstance(document.getElementById('signup-modal'));
                modal.hide();
                alert('Please check your email to verify your account.');
                signupForm.reset();
            } else {
                showError('general', data.message || 'Registration failed');
            }
        } catch (error) {
            console.error('Error:', error);
            showError('general', 'An unexpected error occurred');
        }
    });

    // Helper functions
    function showError(field, message) {
        const errorElement = signupForm.querySelector(`.${field}-error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    function clearErrors() {
        const errorElements = signupForm.querySelectorAll('.text-danger');
        errorElements.forEach(element => {
            element.textContent = '';
            element.style.display = 'none';
        });
    }
}); 