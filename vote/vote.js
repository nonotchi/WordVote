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

let words = [
    {
        id: "test1",
        str: "これはテストです",
        votes: 0,
        isVoted: false,
        rank: 0,
    },
    {
        id: "test2",
        str: "これはテストだよ。",
        votes: 2,
        isVoted: true,
        rank: 0,
    },
    {
        id: "test3",
        str: "てすとだよーん",
        votes: 0,
        isVoted: false,
        rank: 0,
    },
    {
        id: "test4",
        str: "This is a test.",
        votes: 4,
        isVoted: true,
        rank: 0,
    },
];

let oldWords = [];
let idCount = 5;

update = () => {
    const board = document.getElementById('board');
    board.innerHTML = '';

    // TODO: IPアドレスで複数投票を制限

    // ランキング更新
    let sorted = [...words].sort((a, b) => b.votes - a.votes);
    
    let currentRank = 1;
    let lastVotes = null;
    let rankMap = new Map();

    sorted.forEach((item, index) => {
        if (item.votes !== lastVotes) {
            currentRank = index + 1; // 新しい順位
            lastVotes = item.votes;
        }
        rankMap.set(item.id, currentRank);
    });

    // rankを反映
    words = words.map(item => ({
        ...item,
        rank: rankMap.get(item.id)
    }));

    // 表示

    for (let i = 0; i < words.length; i++) {
        const elem = document.createElement('div');
        elem.className = 'word';
        elem.setAttribute('count', words[i].rank == 0 ? '' : String(words[i].rank) + '位');

        const wordStr = document.createElement('div');
        wordStr.className = 'str';
        wordStr.innerText = words[i].str;

        const votesCount = document.createElement('div');
        votesCount.className = 'count';
        votesCount.innerText = `${words[i].votes}票`;

        const voteBtn = document.createElement('button');
        voteBtn.className = 'vote-button';
        voteBtn.innerText = `投票する！`;

        // TODO: 複数回投票できないようにするには、ここのコメントを外す
        /*if (words[i].isVoted) {
            voteBtn.disabled = true;
        }*/

        voteBtn.addEventListener('click', () => {
            words[i].votes += 1;
            words[i].isVoted = true;
            update();
        });
        
        elem.appendChild(wordStr);
        elem.appendChild(votesCount);
        elem.appendChild(voteBtn);

        if (oldWords[i] == void 0 || words[i].rank != oldWords[i].rank) {
            elem.style.animation = 'word .3s forwards';
            elem.style.animationDelay = `${String(i * 0.07)}s`;
        } else {
            elem.style.animation = 'none';
            elem.style.opacity = 1;
        }
     
        board.appendChild(elem);
    }
    
    oldWords = words;
}

window.addEventListener('DOMContentLoaded', update);

document.getElementById('add').addEventListener('click', () => {
    if (!document.getElementById('word').value) {
        return;
    }
    
    words.push({
        id: `test${idCount}`,
        str: document.getElementById('word').value,
        votes: 0,
        isVoted: false,
        rank: 0,
    });

    document.getElementById('word').value = '';
    update();

    modalBack.style.display = 'none';
    modal.style.display = 'none';
});