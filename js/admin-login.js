
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    const errorMessageEl = document.getElementById('error-message');

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // WARNING: Hardcoding credentials in client-side code is highly insecure.
        // This is for demonstration purposes only and should not be used in production.
        const ADMIN_ID = 'admin';
        const ADMIN_PASS = 'wjstksqhdks';

        const enteredId = document.getElementById('admin-id').value;
        const enteredPassword = document.getElementById('admin-password').value;

        if (enteredId === ADMIN_ID && enteredPassword === ADMIN_PASS) {
            // Use sessionStorage to keep the user logged in for the duration of the browser session.
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            window.location.href = 'admin.html';
        } else {
            errorMessageEl.textContent = '아이디 또는 비밀번호가 잘못되었습니다.';
        }
    });
});
