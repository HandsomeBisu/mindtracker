import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, applyActionCode } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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

const titleEl = document.getElementById('verification-title');
const messageEl = document.getElementById('verification-message');
const loginLinkContainer = document.getElementById('login-link-container');

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const actionCode = urlParams.get('oobCode');

    if (mode === 'verifyEmail' && actionCode) {
        try {
            await applyActionCode(auth, actionCode);
            titleEl.textContent = '인증 성공';
            messageEl.textContent = '이메일 주소가 성공적으로 인증되었습니다. 이제 로그인할 수 있습니다.';
            loginLinkContainer.style.display = 'block';
        } catch (error) {
            titleEl.textContent = '인증 실패';
            switch (error.code) {
                case 'auth/expired-action-code':
                    messageEl.textContent = '인증 링크가 만료되었습니다. 다시 회원가입을 시도해주세요.';
                    break;
                case 'auth/invalid-action-code':
                    messageEl.textContent = '인증 링크가 유효하지 않습니다. 링크를 복사하여 사용하셨다면, 전체 링크가 올바르게 복사되었는지 확인해주세요.';
                    break;
                case 'auth/user-disabled':
                    messageEl.textContent = '이 계정은 비활성화되었습니다.';
                    break;
                default:
                    messageEl.textContent = '오류가 발생했습니다. 다시 시도해주세요.';
                    break;
            }
        }
    } else {
        titleEl.textContent = '잘못된 접근';
        messageEl.textContent = '유효하지 않은 인증 링크입니다.';
    }
});
