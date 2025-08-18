window.addEventListener('DOMContentLoaded', () => {
    yotsuba(30);
});

yotsuba = (count) => {
    const body = document.body;

    for (let i = 0; i < count; i++) {
        const elem = document.createElement('div');
        elem.className = 'yotsuba';
        body.appendChild(elem);
        const xpos = Math.random() * window.screen.width;
        const ypos = Math.random() * window.screen.height;
        const delay = Math.random() * 8;
        const duration = Math.random() * 10 + 15;
        elem.style.left = `${xpos}px`;
        elem.style.top = `${ypos}px`;
        elem.style.animationDelay = `${delay}s`;
        elem.style.animationDuration = `${duration}s`
    }
}