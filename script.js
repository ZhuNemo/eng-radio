const audioData = {
    text: [
        { id: 'text-1', name: 'Unit 1', file: 'text/unit_1.mp3' },
        { id: 'text-2', name: 'Unit 2', file: 'text/unit_2.mp3' },
        { id: 'text-3', name: 'Unit 3', file: 'text/unit_3.mp3' },
        { id: 'text-4', name: 'Unit 4', file: 'text/unit_4.mp3' },
        { id: 'text-5', name: 'Unit 5', file: 'text/unit_5.mp3' },
        { id: 'text-6', name: 'Unit 6', file: 'text/unit_6.mp3' }
    ],
    test: [
        { id: 'test-1', name: 'Unit 1 综合测试题', file: 'test/01_unit_1.mp3' },
        { id: 'test-2', name: 'Unit 2 综合测试题', file: 'test/02_unit_2.mp3' },
        { id: 'test-3', name: 'Unit 3 综合测试题', file: 'test/03_unit_3.mp3' },
        { id: 'test-4', name: '期中综合测试题', file: 'test/04_middle_term.mp3' },
        { id: 'test-5', name: 'Unit 4 综合测试题', file: 'test/05_unit_4.mp3' },
        { id: 'test-6', name: 'Unit 5 综合测试题', file: 'test/06_unit_5.mp3' },
        { id: 'test-7', name: 'Unit 6 综合测试题', file: 'test/07_unit_6.mp3' },
        { id: 'test-8', name: '期末综合测试题', file: 'test/08_end_term.mp3' }
    ]
};

// 扁平顺序（正文在前、试卷在后），用于「上一首 / 下一首」
const flatPlaylist = [...audioData.text, ...audioData.test];

// 内联 SVG 图标
const svgIcons = {
    folder: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
    music: `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`
};

// Media Session 封面：data URI 中的 < > " # 等字符必须编码，
// 否则部分浏览器（如 Safari）无法解析，锁屏封面会丢失
const ARTWORK_SRC =
    'data:image/svg+xml,' +
    encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#3b82f6">' +
        '<path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>' +
        '</svg>'
    );

// 当前正在播放的 audio 元素，供 Media Session 回调使用
let currentAudio = null;

// 渲染列表
function renderPlaylist() {
    const container = document.getElementById('playlist-container');

    container.innerHTML = `
        <div class="section">
            <div class="section-title">
                ${svgIcons.folder}
                <span>正文部分 (Text)</span>
            </div>
            <div class="list-container">
                ${audioData.text.map(createAudioCard).join('')}
            </div>
        </div>
        <div class="section">
            <div class="section-title">
                ${svgIcons.folder}
                <span>试卷部分 (Test)</span>
            </div>
            <div class="list-container">
                ${audioData.test.map(createAudioCard).join('')}
            </div>
        </div>
    `;

    initAudioControl();
}

// 生成单个音频卡片 HTML
function createAudioCard(item) {
    return `
        <div class="audio-card">
            <div class="card-header">
                <div class="card-icon">
                    ${svgIcons.music}
                </div>
                <div class="card-info">
                    <div class="card-title">${item.name}</div>
                </div>
            </div>
            <div class="audio-wrapper">
                <!-- preload="metadata" 仅加载时长等元数据，不占用大量内存 -->
                <audio id="${item.id}" controls preload="metadata" src="${item.file}" aria-label="${item.name}"></audio>
            </div>
            <p class="card-error" hidden>音频加载失败，请检查网络后重试。</p>
        </div>
    `;
}

function initAudioControl() {
    const audios = Array.from(document.querySelectorAll('audio'));

    audios.forEach(audio => {
        // 1. 互斥播放逻辑
        audio.addEventListener('play', function () {
            currentAudio = audio;

            audios.forEach(otherAudio => {
                if (otherAudio !== audio && !otherAudio.paused) {
                    otherAudio.pause();
                }
            });

            updateMediaSession(audio);
            if ('mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'playing';
            }
        });

        audio.addEventListener('pause', function () {
            if (audio === currentAudio && 'mediaSession' in navigator) {
                navigator.mediaSession.playbackState = 'paused';
            }
        });

        // 2. 加载失败提示（文件缺失 / 网络异常 / 编码不支持）
        audio.addEventListener('error', function () {
            const card = audio.closest('.audio-card');
            if (!card) return;
            card.classList.add('is-error');
            const tip = card.querySelector('.card-error');
            if (tip) tip.hidden = false;
        });
    });

    // 3. Media Session 动作只注册一次，避免每次 play 都重复绑定
    setupMediaSession();
}

// 更新锁屏 / 通知栏的歌曲信息
function updateMediaSession(audio) {
    if (!('mediaSession' in navigator) || typeof MediaMetadata === 'undefined') return;

    const card = audio.closest('.audio-card');
    const titleEl = card ? card.querySelector('.card-title') : null;

    navigator.mediaSession.metadata = new MediaMetadata({
        title: titleEl ? titleEl.textContent : audio.id,
        artist: '仁爱英语 同步练测评',
        album: '九年级上册',
        artwork: [
            { src: ARTWORK_SRC, sizes: '512x512', type: 'image/svg+xml' }
        ]
    });
}

// 注册媒体按键（耳机线控 / 车机 / 锁屏）
function setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    if (typeof navigator.mediaSession.setActionHandler !== 'function') return;

    const ms = navigator.mediaSession;

    // 部分浏览器不支持某些 action，注册失败时忽略即可
    const safeSet = (action, handler) => {
        try {
            ms.setActionHandler(action, handler);
        } catch (err) {
            /* 当前浏览器不支持该 action */
        }
    };

    safeSet('play', () => {
        if (currentAudio) currentAudio.play().catch(() => {});
    });
    safeSet('pause', () => {
        if (currentAudio) currentAudio.pause();
    });
    safeSet('previoustrack', () => playRelative(-1));
    safeSet('nexttrack', () => playRelative(1));
    safeSet('seekbackward', (details) => seekBy(-(details && details.seekOffset || 10)));
    safeSet('seekforward', (details) => seekBy(details && details.seekOffset || 10));
}

// 快进 / 快退（秒）
function seekBy(offset) {
    if (!currentAudio) return;
    const duration = Number.isFinite(currentAudio.duration) ? currentAudio.duration : Infinity;
    currentAudio.currentTime = Math.min(Math.max(currentAudio.currentTime + offset, 0), duration);
}

// 切换上/下一首（在整个播放列表中循环）
function playRelative(step) {
    if (!currentAudio) return;

    const idx = flatPlaylist.findIndex(item => item.id === currentAudio.id);
    if (idx === -1) return;

    const nextIdx = (idx + step + flatPlaylist.length) % flatPlaylist.length;
    const nextAudio = document.getElementById(flatPlaylist[nextIdx].id);
    if (!nextAudio) return;

    nextAudio.play().catch(() => {});
    nextAudio.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', renderPlaylist);
