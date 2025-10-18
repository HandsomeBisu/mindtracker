document.addEventListener('DOMContentLoaded', () => {
    const startGameBtn = document.getElementById('start-game-btn');
    const mainPageBtn = document.getElementById('main-page-btn');

    if(startGameBtn) {
        startGameBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'play.html';
        });
    }

    if(mainPageBtn) {
        mainPageBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'index.html';
        });
    }
});
