import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, doc, getDoc, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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
    const progressText = document.getElementById('progress-text');
    const progressBar = document.getElementById('progress-bar');

    try {
        // Get target count
        const configDocRef = doc(db, "config", "settings");
        const configDoc = await getDoc(configDocRef);
        const targetCount = configDoc.exists() ? configDoc.data().targetUserCount : 0;

        // Get current approved user count
        const q = query(collection(db, "people"), where("approved", "==", true));
        const querySnapshot = await getDocs(q);
        const currentCount = querySnapshot.size;

        if (targetCount > 0) {
            const percentage = Math.min((currentCount / targetCount) * 100, 100);
            progressText.textContent = `${currentCount} / ${targetCount} 명 등록 완료`;
            progressBar.style.width = `${percentage}%`;
            progressBar.textContent = `${Math.round(percentage)}%`;
        } else {
            progressText.textContent = "목표가 아직 설정되지 않았습니다.";
            progressBar.style.width = `0%`;
        }

    } catch (error) {
        console.error("Error loading progress:", error);
        progressText.textContent = "진행 상황을 불러오는 데 실패했습니다.";
    }

    const shareBtn = document.getElementById('share-btn');

    if (navigator.share) {
        shareBtn.addEventListener('click', async () => {
            try {
                await navigator.share({
                    title: 'Mindtracker의 놀라움을 느껴보세요.',
                    text: 'Mindtracker에 정보를 등록하고 친구들이 당신을 맞추게 해보세요.',
                    url: window.location.origin,
                });
            } catch (error) {
                console.error('Error sharing:', error);
            }
        });
    } else {
        // Fallback for browsers that don't support Web Share API
        shareBtn.addEventListener('click', () => {
            const textToCopy = `Mindtracker에 너의 정보를 등록해서 친구들이 너를 맞추게 해봐! ${window.location.origin}`;
            navigator.clipboard.writeText(textToCopy)
                .then(() => {
                    alert('초대 링크가 클립보드에 복사되었습니다!');
                })
                .catch(err => {
                    console.error('Failed to copy: ', err);
                    alert('링크 복사에 실패했습니다.');
                });
        });
    }
});
