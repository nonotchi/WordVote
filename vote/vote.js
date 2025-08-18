const modalBack = document.getElementById('modal-back');
const modal = document.getElementById('modal');

document.getElementById('copy').addEventListener('click', (e) => {
    const oldStr = e.target.textContent;
    navigator.clipboard.writeText(location.href);
    e.target.textContent = 'コピーしました！';
    setTimeout(() => {
        e.target.textContent = oldStr;
    }, 1000);
});

document.getElementById('open').addEventListener('click', () => {
    modalBack.style.display = 'block';
    modal.style.display = 'block';
});

modalBack.addEventListener('focus', () => {
    modalBack.style.display = 'none';
    modal.style.display = 'none';
});