import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Firebase configuration
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

let allQuestions = [];
let askedQuestions = new Set();
let candidates = [];
let totalPeople = 0;

document.addEventListener('DOMContentLoaded', async () => {
    const querySnapshot = await getDocs(collection(db, "people"));
    if (querySnapshot.empty) {
        alert("등록된 인물이 없습니다. 관리자 페이지에서 인물을 추가해주세요.");
        window.location.href = 'admin.html';
        return;
    }
    
    querySnapshot.forEach((doc) => {
        const person = { id: doc.id, ...doc.data() };
        candidates.push(person);
        if(allQuestions.length === 0) {
            allQuestions = Object.keys(person.answers);
        }
    });
    totalPeople = candidates.length;
    displayNextQuestion();
});

function findBestQuestion() {
    let bestQuestion = null;
    let minDifference = Infinity;

    const availableQuestions = allQuestions.filter(q => !askedQuestions.has(q));

    for (const question of availableQuestions) {
        const counts = {
            yes: 0,
            no: 0,
            idk: 0
        };

        for (const person of candidates) {
            counts[person.answers[question]]++;
        }

        // 가장 균등하게 나누는 질문을 찾음 (yes와 no의 차이가 가장 적은 것)
        const difference = Math.abs(counts.yes - counts.no);
        if (difference < minDifference) {
            minDifference = difference;
            bestQuestion = question;
        }
    }
    return bestQuestion;
}

function displayNextQuestion() {
    if (candidates.length <= 1 || askedQuestions.size === allQuestions.length) {
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
    
    if (answer !== 'idk') {
        candidates = candidates.filter(person => person.answers[currentQuestion] === answer);
    }

    bubble.classList.add('is-changing');

    setTimeout(() => {
        if (candidates.length === 1) {
            window.location.href = `result.html?id=${candidates[0].id}`;
        } else if (candidates.length === 0) {
            alert("조건에 맞는 인물이 없습니다. 처음으로 돌아갑니다.");
            window.location.href = 'index.html';
        } else {
            displayNextQuestion();
            bubble.classList.remove('is-changing');
        }
    }, 300); // CSS transition과 시간을 맞춥니다.
}

function endGame() {
    if (candidates.length > 0) {
        // 여러명이 남았을 경우, 가장 가능성 높은 한명을 보여줌
        window.location.href = `result.html?id=${candidates[0].id}`;
    } else {
        alert("조건에 맞는 인물이 없습니다. 처음으로 돌아갑니다.");
        window.location.href = 'index.html';
    }
}

function updateProgressBar() {
    const progress = (askedQuestions.size / allQuestions.length) * 100;
    document.getElementById('progress-bar').style.width = `${progress}%`;
}

document.getElementById('yes-btn').addEventListener('click', () => filterCandidates('yes'));
document.getElementById('no-btn').addEventListener('click', () => filterCandidates('no'));
document.getElementById('idk-btn').addEventListener('click', () => filterCandidates('idk'));