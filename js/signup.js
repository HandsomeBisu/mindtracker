import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBx91CgP8V4tkiGKoByZklI_m2QjXBWOUI",
    authDomain: "dpmindtracker.firebaseapp.com",
    projectId: "dpmindtracker",
    storageBucket: "dpmindtracker.appspot.com",
    messagingSenderId: "375016654269",
    appId: "1:375016654269:web:400b27ef1bd037cba23ed4",
    measurementId: "G-4D4PYC5EY9"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const signupForm = document.getElementById('signup-form');
const signupBtn = document.getElementById('signup-btn');
const errorMessage = document.getElementById('error-message');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const passwordConfirm = document.getElementById('signup-password-confirm').value;
    const agreementCheckbox = document.getElementById('agreement-checkbox');

    if (!name) {
        errorMessage.textContent = '이름을 입력해주세요.';
        return;
    }

    if (password.length < 6) {
        errorMessage.textContent = '비밀번호는 6자리 이상이어야 합니다.';
        return;
    }

    if (password !== passwordConfirm) {
        errorMessage.textContent = '비밀번호가 일치하지 않습니다.';
        return;
    }

    if (!agreementCheckbox.checked) {
        errorMessage.textContent = '이용약관 및 개인정보처리방침에 동의해야 합니다.';
        return;
    }

    signupBtn.disabled = true;
    signupBtn.classList.add('loading');
    errorMessage.textContent = '';

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Update user profile with name
        await updateProfile(user, { displayName: name });

        // Send verification email
        const actionCodeSettings = {
            url: `${window.location.origin}/verify-email.html`,
            handleCodeInApp: true,
        };
        await sendEmailVerification(user, actionCodeSettings);

        // Redirect to verification info page
        window.location.href = 'email-verification.html';

    } catch (error) {
        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage.textContent = '이미 사용 중인 이메일입니다.';
                break;
            case 'auth/invalid-email':
                errorMessage.textContent = '유효하지 않은 이메일 주소입니다.';
                break;
            case 'auth/weak-password':
                errorMessage.textContent = '비밀번호는 6자리 이상이어야 합니다.';
                break;
            default:
                errorMessage.textContent = `가입에 실패했습니다: ${error.message}`;
                break;
        }
    } finally {
        signupBtn.disabled = false;
        signupBtn.classList.remove('loading');
    }
});
