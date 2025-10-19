import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

const emailLoginForm = document.getElementById('email-login-form');
const emailLoginBtn = emailLoginForm.querySelector('button'); // Get the button
const googleLoginBtn = document.getElementById('google-login');
const errorMessageEl = document.getElementById('error-message');

// Set persistence to 'session'
setPersistence(auth, browserSessionPersistence)
    .then(() => {
        // Existing onAuthStateChanged listener
        onAuthStateChanged(auth, (user) => {
            if (user) {
                checkUserRegistrationAndRedirect(user);
            }
        });
    })
    .catch((error) => {
        console.error("Error setting persistence:", error);
    });

// Email/Password Login
emailLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    errorMessageEl.textContent = '';

    emailLoginBtn.classList.add('loading');
    emailLoginBtn.disabled = true;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        // onAuthStateChanged will handle the redirect
    } catch (error) {
        console.error("Login failed:", error);
        errorMessageEl.textContent = '계정을 찾을 수 없거나 이메일 또는 비밀번호가 잘못되었습니다.';
        emailLoginBtn.classList.remove('loading');
        emailLoginBtn.disabled = false;
    }
});

// Google Login
googleLoginBtn.addEventListener('click', async () => {
    const provider = new GoogleAuthProvider();
    errorMessageEl.textContent = '';

    googleLoginBtn.classList.add('loading');
    googleLoginBtn.disabled = true;

    try {
        const result = await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle the redirect
    } catch (error) {
        console.error("Google login failed:", error);
        errorMessageEl.textContent = 'Google 로그인에 실패했습니다. 다시 시도해주세요.';
    } finally {
        googleLoginBtn.classList.remove('loading');
        googleLoginBtn.disabled = false;
    }
});

async function checkUserRegistrationAndRedirect(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            // User has registered their info
            window.location.href = 'play.html';
        } else {
            // User has not registered, send to registration page
            window.location.href = 'register.html';
        }
    } catch (error) {
        console.error("Error checking user registration:", error);
        // Optional: handle this error, maybe sign the user out or show a message
        errorMessageEl.textContent = '사용자 정보를 확인하는 중 오류가 발생했습니다.';
    }
}
