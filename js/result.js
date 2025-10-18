import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', async () => {
    const personId = sessionStorage.getItem('resultId');
    const personNameEl = document.getElementById('person-name');
    const feedbackSection = document.getElementById('feedback-section');
    const thankYouMessage = document.getElementById('thank-you-message');
    const yesBtn = document.getElementById('feedback-yes');
    const noBtn = document.getElementById('feedback-no');

    if (personId) {
        try {
            const docRef = doc(db, "people", personId);
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                const person = docSnap.data();
                personNameEl.textContent = person.name;
            } else {
                personNameEl.textContent = "결과를 찾을 수 없습니다.";
                feedbackSection.style.display = 'none';
            }
        } catch (error) {
            console.error("결과 로드 실패:", error);
            personNameEl.textContent = "오류가 발생했습니다.";
            feedbackSection.style.display = 'none';
        }
    } else {
        personNameEl.textContent = "오류가 발생했습니다.";
        feedbackSection.style.display = 'none';
    }

    const handleFeedback = async (wasCorrect) => {
        yesBtn.disabled = true;
        noBtn.disabled = true;

        try {
            await addDoc(collection(db, "feedback"), {
                personId: personId,
                correct: wasCorrect,
                timestamp: new Date()
            });
            feedbackSection.style.display = 'none';
            thankYouMessage.style.display = 'block';
        } catch (error) {
            console.error("피드백 저장 실패: ", error);
            alert("피드백 저장에 실패했습니다. 다시 시도해주세요.");
            yesBtn.disabled = false;
            noBtn.disabled = false;
        }
    };

    yesBtn.addEventListener('click', () => handleFeedback(true));
    noBtn.addEventListener('click', () => handleFeedback(false));
});