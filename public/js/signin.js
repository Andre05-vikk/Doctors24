document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const signinModal = document.getElementById('signin-modal');
    const forgotPasswordModal = document.getElementById('forgotPasswordModal');

    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', async (e) => {
            e.preventDefault();
            
            // Hide signin modal
            const bsSigninModal = bootstrap.Modal.getInstance(signinModal);
            bsSigninModal.hide();

            // Show forgot password modal
            const bsForgotModal = new bootstrap.Modal(forgotPasswordModal);
            
            try {
                const response = await fetch('/auth/signup', {
                    method: 'GET',
                    credentials: 'same-origin'
                });
                const data = await response.json();
                document.getElementById('forgotCsrfToken').value = data.csrfToken;
            } catch (error) {
                console.error('Error fetching CSRF token:', error);
            }

            bsForgotModal.show();
        });
    }
}); 