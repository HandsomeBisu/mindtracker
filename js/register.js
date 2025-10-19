import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

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

let currentUser = null;
let questions = [];
let currentQuestionIndex = 0;
let answers = {};

const questionTitleEl = document.getElementById('question-title');
const questionTextEl = document.getElementById('question-text');
const answerOptionsEl = document.getElementById('answer-options');
const registerErrorMsg = document.getElementById('register-error-message');
const backBtn = document.getElementById('back-btn');
const nextBtn = document.getElementById('next-btn');

onAuthStateChanged(auth, (user) => {
    if (user) {
        currentUser = user;
        loadQuestions();
    } else {
        window.location.href = 'index.html';
    }
});

async function loadQuestions() {
    try {
        const response = await fetch('question.txt');
        const text = await response.text();
        parseStudentQuestions(text);
        
        if (questions.length > 0) {
            displayQuestion();
        } else {
            throw new Error("학생용 질문을 찾을 수 없습니다.");
        }
    } catch (error) {
        console.error("질문 파일을 불러오는 데 실패했습니다:", error);
        answerOptionsEl.innerHTML = `<p style="color: red;">질문 파일을 불러오는 데 실패했습니다. 관리자에게 문의하세요.</p>`;
    }
}

function parseStudentQuestions(text) {
    const lines = text.split('\n').map(l => l.trim());
    const studentHeaderIndex = lines.findIndex(line => line.includes('학생용 질문'));
    const teacherHeaderIndex = lines.findIndex(line => line.includes('교사용 질문'));

    if (studentHeaderIndex === -1) return;

    const studentLines = lines.slice(studentHeaderIndex, teacherHeaderIndex === -1 ? undefined : teacherHeaderIndex);
    questions = studentLines.map(parseQuestionLine).filter(Boolean);
}

function parseQuestionLine(line) {
    if (!line || line.includes('용 질문')) return null;
    const question = { text: '', type: 'yes-no', note: '' };
    const noteMatch = line.match(/#별도 안내: \"(.+)\"/);
    if (noteMatch) {
        question.note = noteMatch[1];
        line = line.replace(/#별도 안내: \"(.+)\"/, '').trim();
    }
    const typeMatch = line.match(/\((.+?)\)/);
    if (typeMatch) {
        const typeStr = typeMatch[1];
        if (typeStr === '주관식' || typeStr === '드롭다운') question.type = typeStr;
        line = line.replace(/\((.+?)\)/, '').trim();
    } else if (line.includes('예 / 아니요')) {
        question.type = 'yes-no';
        line = line.replace('(예 / 아니요)', '').trim();
    }
    question.text = line.replace(/^\d+\.\s*/, '').trim();
    return question.text ? question : null;
}

function displayQuestion() {
    registerErrorMsg.textContent = ''; // Clear previous error messages
    const question = questions[currentQuestionIndex];
    if (!question) return;

    questionTitleEl.textContent = `질문 ${currentQuestionIndex + 1}/${questions.length}`;
    questionTextEl.textContent = question.text;
    answerOptionsEl.innerHTML = '';

    if (question.note) {
        const noteEl = document.createElement('blockquote');
        noteEl.className = 'question-note';
        noteEl.textContent = question.note;
        answerOptionsEl.appendChild(noteEl);
    }

    const savedAnswer = answers[question.text];
    switch (question.type) {
        case '주관식':
            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.className = 'text-answer';
            textInput.placeholder = '답변을 입력하세요...';
            textInput.value = savedAnswer || '';
            answerOptionsEl.appendChild(textInput);
            break;
        case '드롭다운':
            const selectInput = document.createElement('select');
            selectInput.className = 'select-answer';
            for (let i = 1; i <= 6; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.text = `${i}반`;
                selectInput.appendChild(option);
            }
            selectInput.value = savedAnswer || '1';
            answerOptionsEl.appendChild(selectInput);
            break;
        default: // yes-no
            const options = [{ value: '예', text: '예' }, { value: '아니요', text: '아니요' }];
            options.forEach(opt => {
                const container = document.createElement('div');
                container.className = 'radio-option';
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = 'answer';
                radioInput.value = opt.value;
                radioInput.id = `q-${opt.value}`;
                if (savedAnswer === opt.value) radioInput.checked = true;
                const label = document.createElement('label');
                label.htmlFor = `q-${opt.value}`;
                label.textContent = opt.text;
                container.appendChild(radioInput);
                container.appendChild(label);
                answerOptionsEl.appendChild(container);
            });
            break;
    }
    updateButtons();
}

function saveCurrentAnswer() {
    const question = questions[currentQuestionIndex];
    let answer;
    switch (question.type) {
        case '주관식':
            answer = answerOptionsEl.querySelector('.text-answer').value;
            break;
        case '드롭다운':
            answer = answerOptionsEl.querySelector('.select-answer').value;
            break;
        default:
            const selectedRadio = answerOptionsEl.querySelector('input[name="answer"]:checked');
            if (!selectedRadio) {
                registerErrorMsg.textContent = '답변을 선택해주세요.';
                return false;
            }
            answer = selectedRadio.value;
            break;
    }

    if (!answer || (typeof answer === 'string' && answer.trim() === '')) {
        registerErrorMsg.textContent = '답변을 입력해주세요.';
        return false;
    }

    // Custom validation based on question
    if (question.text === '학번') {
        const num = parseInt(answer, 10);
        if (isNaN(num) || !/^\d+$/.test(answer) || num < 1 || num > 25) {
            registerErrorMsg.textContent = '학번은 1에서 25 사이의 숫자만 입력할 수 있습니다.';
            return false;
        }
    }

    if (question.text === '키') {
        if (isNaN(parseInt(answer, 10)) || !/^\d+$/.test(answer)) {
            registerErrorMsg.textContent = '키는 숫자만 입력할 수 있습니다.';
            return false;
        }
    }

    answers[question.text] = answer;
    return true;
}

function updateButtons() {
    backBtn.style.display = currentQuestionIndex === 0 ? 'none' : 'inline-block';
    nextBtn.textContent = currentQuestionIndex === questions.length - 1 ? '제출' : '다음';
}

backBtn.addEventListener('click', () => {
    if (currentQuestionIndex > 0) {
        const bubble = document.querySelector('.question-bubble');
        bubble.classList.add('is-changing');

        setTimeout(() => {
            currentQuestionIndex--;
            displayQuestion();
            bubble.classList.remove('is-changing');
        }, 300);
    }
});

nextBtn.addEventListener('click', () => {
    if (!saveCurrentAnswer()) return;

    const bubble = document.querySelector('.question-bubble');
    bubble.classList.add('is-changing');

    setTimeout(() => {
        if (currentQuestionIndex >= questions.length - 1) {
            submitAnswers(); // This navigates away, so no need to remove the class
        } else {
            currentQuestionIndex++;
            displayQuestion();
            bubble.classList.remove('is-changing');
        }
    }, 300);
});

async function submitAnswers() {
    if (!currentUser) { alert("로그인이 필요합니다."); return; }

    nextBtn.disabled = true;
    nextBtn.textContent = '저장 중...';

    try {
        const finalAnswers = { ...answers };
        const displayName = finalAnswers['이름'] || currentUser.displayName;
        
        const commonData = {
            answers: finalAnswers,
            userType: 'student', // Always student
            createdAt: new Date()
        };

        const userData = { ...commonData, displayName: displayName, email: currentUser.email };
        const peopleData = { ...commonData, name: displayName, approved: false };

        await setDoc(doc(db, "users", currentUser.uid), userData);
        await setDoc(doc(db, "people", currentUser.uid), peopleData);

        window.location.href = 'register-success.html';
    } catch (error) {
        console.error("정보 저장 실패:", error);
        alert("정보를 저장하는 데 실패했습니다. 다시 시도해주세요.");
        nextBtn.disabled = false;
        nextBtn.textContent = '제출';
    }
}
