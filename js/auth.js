import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged, 
    signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
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
const googleProvider = new GoogleAuthProvider();

// Function to handle successful login for any method
async function handleSuccessfulLogin(user) {
    try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            window.location.href = 'play.html';
        } else {
            window.location.href = 'register.html';
        }
    } catch (error) {
        console.error("Error checking user document:", error);
        document.getElementById('error-message').textContent = "로그인 처리 중 오류가 발생했습니다.";
    }
}

// 1. Google Login Handler
document.getElementById('google-login-btn').addEventListener('click', async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        await handleSuccessfulLogin(result.user);
    } catch (error) {
        console.error("Google 로그인 실패:", error);
        document.getElementById('error-message').textContent = "Google 로그인에 실패했습니다.";
    }
});

// 2. Email/Password Login Handler
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMessage = document.getElementById('error-message');
    errorMessage.textContent = '';

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        if (!user.emailVerified) {
            errorMessage.textContent = '이메일 인증이 필요합니다. 받은 편지함을 확인해주세요.';
            return;
        }

        await handleSuccessfulLogin(user);

    } catch (error) {
        switch (error.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                errorMessage.textContent = '이메일 또는 비밀번호가 잘못되었습니다.';
                break;
            default:
                errorMessage.textContent = `로그인 실패: ${error.message}`;
                break;
        }
    }
});

// 3. Auth State Observer (for page protection)
onAuthStateChanged(auth, (user) => {
    const protectedPages = ['play.html', 'register.html', 'result.html', 'admin.html'];
    const isProtected = protectedPages.some(page => window.location.pathname.includes(page));

    if (user && !user.emailVerified && isProtected) {
        // Allow access to register page even if not verified
        if (!window.location.pathname.includes('register.html')) {
            console.log("Redirecting to index: user not verified");
            window.location.href = 'index.html';
        }
    } else if (!user && isProtected) {
        console.log("Redirecting to index: user not logged in");
        window.location.href = 'index.html';
    }
});