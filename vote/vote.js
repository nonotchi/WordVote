let url = new URL(window.location.href);
let params = url.searchParams;
let voteId = params.get('id');

let ws = new WebSocket('wss://uyur613b6d.execute-api.ap-northeast-1.amazonaws.com/v1');

const modalBack = document.getElementById('modal-back');
const modal = document.getElementById('modal');

document.getElementById('copy').addEventListener('click', (e) => {
    const oldStr = e.target.textContent;

    let url = new URL(window.location.href);
    let params = url.searchParams;
    params.delete('name');

    navigator.clipboard.writeText(url);
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

let words = [];
let oldWords = [];
let idCount = 5;

update = () => {
    const board = document.getElementById('board');
    board.innerHTML = '';

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

        if (words[i].isVoted) {
            voteBtn.disabled = true;
        }

        voteBtn.addEventListener('click', () => {
            words[i].isVoted = true;
            if (ws) {
                ws.send(JSON.stringify({
                    action: "sendmessage",
                    type: 'vote',
                    voteid: voteId,
                    wordid: words[i].id
                }));
            }
        });
        
        elem.appendChild(wordStr);
        elem.appendChild(votesCount);
        elem.appendChild(voteBtn);

        if (oldWords[i] == void 0) {
            elem.style.animationDelay = `${String(i * 0.07)}s`;
        } else if (words[i].rank != oldWords[i].rank) {
            elem.style.animation = 'word .3s forwards';
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
    const txtbx = document.getElementById('word');

    if (!txtbx.value) {
        return;
    }

    for (let i = 0; i < words.length; i++) {
        if (words[i].str === txtbx.value) {
            // 重複
            alert(`「${txtbx.value}」はすでに存在しています`);
            return;
        }
    }
    
    words.push({
        id: `test${idCount}`,
        str: txtbx.value,
        votes: 0,
        isVoted: false,
        rank: 0,
    });


    if (ws) {
        ws.send(JSON.stringify({
            action: "sendmessage",
            type: 'add',
            voteid: voteId,
            word: txtbx.value
        }));
    }

    txtbx.value = '';

    modalBack.style.display = 'none';
    modal.style.display = 'none';
});

ws.onopen = (event) => {
    let url = new URL(window.location.href);
    let params = url.searchParams;
    if (params.has('name')) {
        ws.send(JSON.stringify({
            action: "sendmessage",
            type: 'start',
            voteid: voteId,
            name: params.get('name')
        }));
    }

    ws.send(JSON.stringify({
        action: "sendmessage",
        type: 'get',
        voteid: voteId,
    }));
}

ws.onmessage = (event) => {
    if (event.data === 'Not found') {
        document.getElementById('title').textContent = '存在しない投票です';
    } else {
        const data = JSON.parse(event.data);
        if (data[0].wordid !== void 0) {
            for (let i = 0; i < data.length; i++) {
                if (data[i].wordid === '-') {
                    document.title = `${data[i].word} - WordVote`;
                    document.getElementById('title').textContent = data[i].word;
                } else {
                    for (let j = 0; j < words.length; j++) {
                        if (words[j].id === data[i].wordid) {
                            words[j].votes = data[i].votes
                        } else {
                            words.push({
                                id: data[i].wordid,
                                str: data[i].word,
                                votes: data[i].votes,
                                isVoted: false,
                                rank: 0
                            });
                        }
                    }                    
                }
            }
            update();
        }
    }
}