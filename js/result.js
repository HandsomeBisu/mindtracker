import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBx91CgP8V4tkiGKoByZklI_m2QjXBWOUI",
    authDomain: "dpmindtracker.firebaseapp.com",
    projectId: "dpmindtracker",
    storageBucket: "dpmindtracker.appspot.com",
    messagingSenderId: "375016654269",
    appId: "1:375016654269:web:400b27ef1bd037cba23ed4",
    measurementId: "G-4D4PYC5EY9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const personId = urlParams.get('id');

    if (personId) {
        const docRef = doc(db, "people", personId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const person = docSnap.data();
            document.getElementById('person-name').textContent = person.name;

        } else {
            console.log("No such document!");
            document.getElementById('person-name').textContent = "결과를 찾을 수 없습니다.";
        }
    } else {
        document.getElementById('person-name').textContent = "오류가 발생했습니다.";
    }
});
