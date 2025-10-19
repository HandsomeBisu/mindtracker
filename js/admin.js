// Admin Authentication Check
if (sessionStorage.getItem('isAdminAuthenticated') !== 'true') {
    window.location.href = 'admin-login.html';
}

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs, orderBy, query, doc, getDoc, updateDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

// Keep a reference to the last opened user's data
let currentModalUserId = null;

document.addEventListener('DOMContentLoaded', async () => {
    await loadUsers();
    await loadGameSettings();

    const modal = document.getElementById('user-modal');
    const closeButton = document.querySelector('.close-button');
    closeButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    const saveTargetBtn = document.getElementById('save-target-btn');
    saveTargetBtn.addEventListener('click', saveGameSettings);

    // Handle the form submission for adding a question to a person
    const addPersonQuestionForm = document.getElementById('add-person-question-form');
    addPersonQuestionForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!currentModalUserId) return;

        const questionTextEl = document.getElementById('new-person-question-text');
        const answerEl = document.getElementById('new-person-question-answer');
        const newQuestion = questionTextEl.value.trim();
        const newAnswer = answerEl.value;

        if (newQuestion) {
            const userDocRef = doc(db, "people", currentModalUserId);
            try {
                const userDoc = await getDoc(userDocRef);
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    const updatedAnswers = { ...userData.answers, [newQuestion]: newAnswer };

                    await updateDoc(userDocRef, { answers: updatedAnswers });

                    // Also update the 'users' collection for consistency
                    const usersCollectionDocRef = doc(db, "users", currentModalUserId);
                    await updateDoc(usersCollectionDocRef, { answers: updatedAnswers });

                    alert('질문이 성공적으로 추가되었습니다.');
                    questionTextEl.value = '';
                    // Refresh the modal content to show the new question
                    populateModal(currentModalUserId);
                }
            } catch (error) {
                console.error("인물 질문 추가 실패: ", error);
                alert("질문 추가에 실패했습니다.");
            }
        }
    });
});

async function loadGameSettings() {
    const targetCountInput = document.getElementById('target-count');
    try {
        const configDocRef = doc(db, "config", "settings");
        const configDoc = await getDoc(configDocRef);
        if (configDoc.exists() && configDoc.data().targetUserCount) {
            targetCountInput.value = configDoc.data().targetUserCount;
        }
    } catch (error) {
        console.error("Error loading game settings:", error);
    }
}

async function saveGameSettings() {
    const targetCountInput = document.getElementById('target-count');
    const statusMessage = document.getElementById('save-status-message');
    const count = parseInt(targetCountInput.value, 10);

    if (isNaN(count) || count < 0) {
        statusMessage.textContent = "유효한 숫자를 입력하세요.";
        statusMessage.style.color = "#ff4d4d";
        setTimeout(() => { statusMessage.textContent = ""; }, 3000);
        return;
    }

    const saveBtn = document.getElementById('save-target-btn');
    saveBtn.disabled = true;

    try {
        const configDocRef = doc(db, "config", "settings");
        await setDoc(configDocRef, { targetUserCount: count });
        statusMessage.textContent = "설정이 저장되었습니다!";
        statusMessage.style.color = "#4CAF50";
    } catch (error) {
        console.error("Error saving game settings:", error);
        statusMessage.textContent = "저장에 실패했습니다.";
        statusMessage.style.color = "#ff4d4d";
    } finally {
        saveBtn.disabled = false;
        setTimeout(() => { statusMessage.textContent = ""; }, 3000);
    }
}

async function loadUsers() {
    const userTableBody = document.getElementById('user-list');
    const userCountElement = document.getElementById('user-count');
    userTableBody.innerHTML = '';

    try {
        const q = query(collection(db, "people"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        
        userCountElement.textContent = `총 ${querySnapshot.size}명의 사용자가 등록되었습니다.`;
        querySnapshot.forEach(doc => {
            const user = doc.data();
            const row = document.createElement('tr');
            row.dataset.userId = doc.id;
            
            const registrationDate = user.createdAt.toDate().toLocaleDateString('ko-KR');
            const approvalStatus = user.approved ? `<span class="status-approved">승인됨</span>` : `<span class="status-pending">대기중</span>`;

            let actionButtons = `<button class="detail-btn" data-userid="${doc.id}">보기</button>`;
            if (!user.approved) {
                actionButtons += `<button class="approve-btn" data-userid="${doc.id}">승인</button>`;
            }

            row.innerHTML = `
                <td>${user.name}</td>
                <td>${user.userType === 'student' ? '학생' : '교사'}</td>
                <td>${registrationDate}</td>
                <td>${approvalStatus}</td>
                <td class="action-cell">${actionButtons}</td>
            `;
            userTableBody.appendChild(row);
        });

        addEventListeners();

    } catch (error) {
        console.error("사용자 정보 로드 실패: ", error);
        alert("사용자 정보를 불러오는 데 실패했습니다.");
    }
}

function addEventListeners() {
    document.querySelectorAll('.detail-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.dataset.userid;
            populateModal(userId);
        });
    });

    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', async (e) => {
            const btn = e.target;
            const userId = btn.dataset.userid;
            const userName = btn.closest('tr').querySelector('td').textContent;
            if (confirm(`'${userName}' 님을 게임에 추가하시겠습니까?`)) {
                try {
                    const userDocRef = doc(db, "people", userId);
                    await updateDoc(userDocRef, { approved: true });
                    
                    const row = btn.closest('tr');
                    const statusCell = row.querySelector('.status-pending');
                    if(statusCell) {
                        statusCell.innerHTML = `<span class="status-approved">승인됨</span>`;
                        statusCell.classList.remove('status-pending');
                    }
                    btn.remove();

                } catch (error) {
                    console.error("승인 처리 실패: ", error);
                    alert("사용자 승인에 실패했습니다.");
                }
            }
        });
    });
}

async function populateModal(userId) {
    currentModalUserId = userId;
    const userDocRef = doc(db, "people", userId);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
        const userData = userDoc.data();
        const modalUserName = document.getElementById('modal-user-name');
        const modalUserAnswers = document.getElementById('modal-user-answers');
        
        modalUserName.textContent = `${userData.name}님의 정보`;
        
        let answersHtml = '<ul>';
        for (const [question, answer] of Object.entries(userData.answers)) {
            answersHtml += `<li><strong>${question}:</strong> ${answer}</li>`;
        }
        answersHtml += '</ul>';
        modalUserAnswers.innerHTML = answersHtml;
        document.getElementById('user-modal').style.display = 'block';
    }
}