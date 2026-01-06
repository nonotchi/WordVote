const modalBack = document.getElementById('modal-back');
const modal = document.getElementById('modal');
const text = document.getElementById('title');

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

document.getElementById('open').addEventListener('click', () => {
    modalBack.style.display = 'block';
    modal.style.display = 'block';
});

modalBack.addEventListener('focus', () => {
    modalBack.style.display = 'none';
    modal.style.display = 'none';
});

document.getElementById('start').addEventListener('click', () => {
    if (!text.value) {
        return;
    }

    if (confirm(`投票「${text.value}」を開始します。`)) {
        let random = btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(16)))).substring(0, 16);
        random = random.replace(/\+/g, '-').replace(/\//g, '_');
        setTimeout(() => {
            window.location.href = `${location.href.slice(-1) === '/' ? location.href : location.href + '/'}vote/?id=${random}&name=${text.value}`;
        }, 1000);
    }
});