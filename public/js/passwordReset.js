document.addEventListener('DOMContentLoaded', () => {
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = forgotPasswordForm.querySelector('[name="email"]').value;

            try {
                const response = await fetch('/auth/forgot-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': document.getElementById('forgotCsrfToken').value
                    },
                    body: JSON.stringify({ email }),
                    credentials: 'same-origin'
                });

                const data = await response.json();
                alert(data.message);
                forgotPasswordForm.reset();
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to process password reset request');
            }
        });
    }

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(resetPasswordForm);
            const password = formData.get('password');
            const confirmPassword = formData.get('confirmPassword');

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            const token = window.location.pathname.split('/').pop();

            try {
                const response = await fetch(`/auth/reset-password/${token}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'CSRF-Token': document.getElementById('resetCsrfToken').value
                    },
                    body: JSON.stringify({ password }),
                    credentials: 'same-origin'
                });

                const data = await response.json();
                alert(data.message);
                if (response.ok) {
                    window.location.href = '/';
                }
            } catch (error) {
                console.error('Error:', error);
                alert('Failed to reset password');
            }
        });
    }
}); 