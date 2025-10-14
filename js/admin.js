import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const allQuestions = [
    "안경을 쓰나요?", "성이 '김'인가요?", "마스크를 착용하나요?", "키가 180cm 이상인가요?",
    "키가 160cm 미만인가요?", "반장, 부반장인가요?", "반장, 부반장을 했던 경험이 있나요?",
    "방송부와 관련이 있나요?", "도서부와 관련이 있나요?", "컴퓨터나 코딩에 관심이 있나요?",
    "피부가 하얀 편인가요?", "외향적인가요?", "축구를 좋아하나요?", "이름에 'ㄱ'이 들어가나요?",
    "이름에 'ㅈ'이 들어가나요?", "성이 '이'인가요?", "성이 '박'인가요?", "성이 '최'인가요?",
    "성이 '장'인가요?", "이름이 2글자 인가요?", "쌍둥이인가요?", "자주 지각하나요?",
    "생활지도를 받은 적이 있나요?", "2학년 1반인가요?", "2학년 2반인가요?", "2학년 3반인가요?",
    "2학년 4반인가요?", "2학년 5반인가요?", "2학년 6반인가요?", "말이 빠른 편인가요?",
    "목소리가 큰 편인가요?", "수업시간에 자주 자나요?", "별명이 있는 편인가요?", "머리카락이 긴가요?",
    "외국에서 거주한 경험이 있나요?", "학생인가요?", "교사인가요?", "몸무게가 무거운가요?",
    "달리기가 빠른가요?", "공부를 잘하나요?", "출석번호가 20번 이상인가요?", "출석번호가 20번 이하인가요?",
    "출석번호가 10번 이상인가요?", "출석번호가 10번 이하인가요?", "성이 '정'인가요?", "이름에 'ㅎ'이 들어가나요?"
];

const coreQuestions = [
    "안경을 쓰나요?", "마스크를 착용하나요?", "반장, 부반장인가요?", "반장, 부반장을 했던 경험이 있나요?",
    "방송부와 관련이 있나요?", "도서부와 관련이 있나요?", "컴퓨터나 코딩에 관심이 있나요?",
    "피부가 하얀 편인가요?", "외향적인가요?", "축구를 좋아하나요?", "쌍둥이인가요?", "자주 지각하나요?",
    "생활지도를 받은 적이 있나요?", "말이 빠른 편인가요?", "목소리가 큰 편인가요?", "수업시간에 자주 자나요?",
    "별명이 있는 편인가요?", "머리카락이 긴가요?", "외국에서 거주한 경험이 있나요?", "학생인가요?",
    "교사인가요?", "몸무게가 무거운가요?", "달리기가 빠른가요?", "공부를 잘하나요?"
];

document.addEventListener('DOMContentLoaded', () => {
    const coreContainer = document.getElementById('core-questions-container');
    coreQuestions.forEach((q, index) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('form-group');
        questionDiv.innerHTML = `
            <label>${q}</label>
            <div>
                <input type="radio" id="core_q${index}_yes" name="core_q${index}" value="yes" required><label for="core_q${index}_yes">예</label>
                <input type="radio" id="core_q${index}_no" name="core_q${index}" value="no"><label for="core_q${index}_no">아니오</label>
                <input type="radio" id="core_q${index}_idk" name="core_q${index}" value="idk"><label for="core_q${index}_idk">모름</label>
            </div>
        `;
        coreContainer.appendChild(questionDiv);
    });
});

function getInitialConsonants(str) {
    const initials = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    let result = [];
    for (let i = 0; i < str.length; i++) {
        const code = str.charCodeAt(i) - 44032;
        if (code > -1 && code < 11172) {
            result.push(initials[Math.floor(code / 588)]);
        }
    }
    return result;
}

document.getElementById('person-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const classNum = parseInt(document.getElementById('class-number').value);
    const attendanceNum = parseInt(document.getElementById('attendance-number').value);
    const height = parseInt(document.getElementById('height').value);

    const answers = {};

    // --- 자동 생성 답변 --- 
    // 이름 관련
    const surnames = ['김', '이', '박', '최', '장', '정'];
    surnames.forEach(surname => {
        answers[`성이 '${surname}'인가요?`] = name.startsWith(surname) ? 'yes' : 'no';
    });
    answers["이름이 2글자 인가요?"] = name.length === 2 ? 'yes' : 'no';
    const nameConsonants = getInitialConsonants(name);
    ['ㄱ', 'ㅈ', 'ㅎ'].forEach(c => {
        answers[`이름에 '${c}'이 들어가나요?`] = nameConsonants.includes(c) ? 'yes' : 'no';
    });

    // 반 관련
    for (let i = 1; i <= 6; i++) {
        answers[`2학년 ${i}반인가요?`] = (i === classNum) ? 'yes' : 'no';
    }

    // 출석번호 관련
    answers["출석번호가 10번 이상인가요?"] = attendanceNum >= 10 ? 'yes' : 'no';
    answers["출석번호가 10번 이하인가요?"] = attendanceNum <= 10 ? 'yes' : 'no';
    answers["출석번호가 20번 이상인가요?"] = attendanceNum >= 20 ? 'yes' : 'no';
    answers["출석번호가 20번 이하인가요?"] = attendanceNum <= 20 ? 'yes' : 'no';

    // 키 관련
    answers["키가 180cm 이상인가요?"] = height >= 180 ? 'yes' : 'no';
    answers["키가 160cm 미만인가요?"] = height < 160 ? 'yes' : 'no';

    // --- 핵심 질문 답변 ---
    coreQuestions.forEach((q, index) => {
        answers[q] = document.querySelector(`input[name="core_q${index}"]:checked`).value;
    });

    // 모든 질문이 채워졌는지 확인 (디버깅용)
    const missingQuestions = allQuestions.filter(q => !(q in answers));
    if (missingQuestions.length > 0) {
        alert("다음 질문에 대한 답변이 누락되었습니다: " + missingQuestions.join(", "));
        return;
    }

    try {
        await addDoc(collection(db, "people"), {
            name: name,
            class: classNum,
            attendanceNumber: attendanceNum,
            answers: answers
        });
        alert('인물이 성공적으로 등록되었습니다.');
        document.getElementById('person-form').reset();
    } catch (error) {
        console.error("Error adding document: ", error);
        alert('인물 등록에 실패했습니다.');
    }
});
