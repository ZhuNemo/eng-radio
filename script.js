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

// 内联 SVG 图标
const svgIcons = {
    folder: `<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`,
    music: `<svg viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>`
};

// 渲染列表
function renderPlaylist() {
    const container = document.getElementById('playlist-container');
    let html = '';

    // 渲染正文部分
    html += `
        <div class="section">
            <div class="section-title">
                ${svgIcons.folder}
                <span>正文部分 (Text)</span>
            </div>
            <div class="list-container">
                ${audioData.text.map(item => createAudioCard(item)).join('')}
            </div>
        </div>
    `;

    // 渲染试卷部分
    html += `
        <div class="section">
            <div class="section-title">
                ${svgIcons.folder}
                <span>试卷部分 (Test)</span>
            </div>
            <div class="list-container">
                ${audioData.test.map(item => createAudioCard(item)).join('')}
            </div>
        </div>
    `;

    container.innerHTML = html;
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
                <audio id="${item.id}" controls preload="metadata" src="${item.file}"></audio>
            </div>
        </div>
    `;
}

function initAudioControl() {
    const audios = document.querySelectorAll('audio');
    
    audios.forEach(audio => {
        // 1. 互斥播放逻辑
        audio.addEventListener('play', function() {
            audios.forEach(otherAudio => {
                if (otherAudio !== audio && !otherAudio.paused) {
                    otherAudio.pause();
                }
            });

            // 2. 获取当前播放音频的标题和封面
            const card = audio.closest('.audio-card');
            const title = card.querySelector('.card-title').textContent;
            
            // 3. 接入 Media Session API
            if ('mediaSession' in navigator) {
                navigator.mediaSession.metadata = new MediaMetadata({
                    title: title,
                    artist: '仁爱英语 同步练测评',
                    album: '九年级上册',
                    artwork: [
                        { src: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%233b82f6"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>', sizes: '512x512', type: 'image/svg+xml' }
                    ]
                });

                navigator.mediaSession.setActionHandler('play', () => audio.play());
                navigator.mediaSession.setActionHandler('pause', () => audio.pause());
                // 可选：上一首/下一首
                // navigator.mediaSession.setActionHandler('previoustrack', () => { ... });
            }
        });
    });
}

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', renderPlaylist);