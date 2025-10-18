// Disable right-click context menu
document.addEventListener('contextmenu', event => event.preventDefault());

// Disable text selection and dragging via CSS and JS
const style = document.createElement('style');
style.innerHTML = `
  body, * {
    -webkit-user-select: none; /* Safari */
    -ms-user-select: none; /* IE 10 and IE 11 */
    user-select: none; /* Standard syntax */
    -webkit-user-drag: none;
    -khtml-user-drag: none;
    -moz-user-drag: none;
    -o-user-drag: none;
    user-drag: none;
  }
`;
document.head.appendChild(style);

document.addEventListener('dragstart', (e) => {
  e.preventDefault();
});

// Disable developer tools shortcuts
document.addEventListener('keydown', (event) => {
    // F12
    if (event.key === 'F12') {
        event.preventDefault();
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (event.ctrlKey && event.shiftKey && ['I', 'J', 'C'].includes(event.key.toUpperCase())) {
        event.preventDefault();
    }
    // Ctrl+U
    if (event.ctrlKey && event.key.toUpperCase() === 'U') {
        event.preventDefault();
    }
});
