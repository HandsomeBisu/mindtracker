import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let allQuestions = [];
let askedQuestions = new Set();
let candidates = [];

onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, proceed with game logic
        initializeGame();
    } else {
        // No user is signed in, redirect to login page
        window.location.href = 'login.html';
    }
});

async function initializeGame() {
    try {
        const peopleQuery = query(collection(db, "people"), where("approved", "==", true));
        const peopleSnapshot = await getDocs(peopleQuery);

        if (peopleSnapshot.empty) {
            alert("승인된 사용자가 없습니다. 관리자가 사용자를 승인할 때까지 기다려주세요.");
            window.location.href = 'index.html';
            return;
        }

        const questionSet = new Set();
        peopleSnapshot.forEach((doc) => {
            const person = { id: doc.id, ...doc.data() };
            candidates.push(person);
            // Gather all unique questions from every approved person
            Object.keys(person.answers).forEach(q => questionSet.add(q));
        });
        allQuestions = Array.from(questionSet);

        displayNextQuestion();

    } catch (error) {
        console.error("게임 데이터 로드 실패:", error);
        alert("게임을 시작할 수 없습니다. 문제가 지속되면 관리자에게 문의하세요.");
    }
}


function findBestQuestion() {
    const availableQuestions = allQuestions.filter(q => !askedQuestions.has(q));
    if (availableQuestions.length === 0) return null;

    let bestQuestion = null;
    let minDifference = Infinity;

    // Find the question that best splits the remaining candidates
    for (const question of availableQuestions) {
        const counts = { yes: 0, no: 0 };

        for (const person of candidates) {
            const answer = person.answers[question];
            if (answer === '예') {
                counts.yes++;
            } else if (answer === '아니요') {
                counts.no++;
            }
        }

        // Skip questions that don't apply to the remaining candidates
        if (counts.yes === 0 && counts.no === 0) continue;

        const difference = Math.abs(counts.yes - counts.no);
        if (difference < minDifference) {
            minDifference = difference;
            bestQuestion = question;
        }
    }

    return bestQuestion || availableQuestions[0]; // Fallback to any available question
}

function displayNextQuestion() {
    if (candidates.length <= 1) {
        endGame();
        return;
    }

    const bestQuestion = findBestQuestion();
    if (!bestQuestion) {
        endGame();
        return;
    }

    askedQuestions.add(bestQuestion);
    document.getElementById('question-text').textContent = bestQuestion;
    document.getElementById('question-title').textContent = `질문 ${askedQuestions.size}`;
}

function filterCandidates(answer) {
    const currentQuestion = Array.from(askedQuestions).pop();
    const bubble = document.querySelector('.question-bubble');
    
    if (answer !== '모르겠습니다') {
        candidates = candidates.filter(person => {
            // If a person doesn't have an answer, they are filtered out
            return person.answers[currentQuestion] === answer;
        });
    }

    bubble.classList.add('is-changing');

    setTimeout(() => {
        if (candidates.length === 1) {
            sessionStorage.setItem('resultId', candidates[0].id);
            window.location.href = `result.html`;
        } else if (candidates.length === 0) {
            alert("조건에 맞는 인물이 없습니다. 처음으로 돌아갑니다.");
            window.location.href = 'index.html';
        } else {
            displayNextQuestion();
            bubble.classList.remove('is-changing');
        }
    }, 300);
}

function endGame() {
    if (candidates.length > 0) {
        sessionStorage.setItem('resultId', candidates[0].id);
        window.location.href = `result.html`;
    } else {
        alert("조건에 맞는 인물이 없습니다. 처음으로 돌아갑니다.");
        window.location.href = 'index.html';
    }
}

document.getElementById('yes-btn').addEventListener('click', () => filterCandidates('예'));
document.getElementById('no-btn').addEventListener('click', () => filterCandidates('아니요'));
document.getElementById('idk-btn').addEventListener('click', () => filterCandidates('모르겠습니다'));

document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            signOut(auth).then(() => {
                window.location.href = 'login.html';
            }).catch((error) => {
                console.error('Sign Out Error', error);
            });
        });
    }
});