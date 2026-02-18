const candle = document.getElementById('candle');
const flameWrap = document.getElementById('flameWrap');
const flame = document.getElementById('flame');
const smoke = document.getElementById('smoke');

let isBlown = false;
let isAnimating = false;
let isListening = false;
let blowStage = 1; // 1 = รอบแรก, 2 = รอบสุดท้าย

const startBtn = document.getElementById('startBtn');
const birthdaySong = document.getElementById('birthdaySong');

let songStarted = false;

let blowPower = 0;
const extinguishThreshold = 600; // แรงลมที่ต้องการเพื่อดับเทียน
/* ========================= */
/* 🎤 MIC SETUP */
/* ========================= */

async function initMic() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioCtx.createMediaStreamSource(stream);

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 256;

        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        isListening = true;

        function detect() {
            if (!isListening || isBlown) return;

            analyser.getByteFrequencyData(dataArray);

            let sum = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sum += dataArray[i];
            }

            const volume = sum / dataArray.length;

            handleBlow(volume);

            requestAnimationFrame(detect);
        }

        detect();

    } catch (err) {
        console.warn("Mic permission denied");
    }
}

/* ========================= */
/* 💨 BLOW LOGIC */
/* ========================= */

function handleBlow(volume) {
    if (!songStarted || birthdaySong.currentTime < birthdaySong.duration) return;

    if (isAnimating || isBlown) return;

    // ปรับ sensitivity ให้เห็นผลทันที
    const sensitivity = 0.08;

    if (volume > 50) {

        blowPower += volume * sensitivity;

        // จำกัดไม่ให้เกิน
        if (blowPower > extinguishThreshold) {
            blowPower = extinguishThreshold;
        }

    } else {
        // ค่อยๆ ฟื้น
        blowPower *= 0.9;
    }

    // ทำให้จางทันทีตามค่า blowPower
    const opacity = 1 - (blowPower / extinguishThreshold);
    flame.style.opacity = Math.max(opacity, 0);

    if (blowPower >= extinguishThreshold) {
        if (blowStage === 1) {
            firstBlowFail();
        } else {
            triggerBlowOut();
        }
    }
}

/* ========================= */
/* 🔥 FINAL BLOW OUT */
/* ========================= */

function firstBlowFail() {

    isAnimating = true;

    instructions.textContent = "เธอยังเป่าไม่แรงอะ เป่าแรงกว่านี้อีก 😤";

    setTimeout(() => {

        blowPower = 0;
        flame.style.opacity = 1;
        flame.style.transform = "";

        blowStage = 2; // เปลี่ยนเป็นรอบสุดท้าย
        isAnimating = false;

    }, 1000);
}


function triggerBlowOut() {

    isAnimating = true;
    isListening = false;

    flameWrap.classList.add('blowing-out');

    setTimeout(() => {

        flameWrap.classList.remove('blowing-out');
        flameWrap.classList.add('blown-out');

        smoke.classList.add('visible', 'puffing');

        // รอควันจบ
        setTimeout(() => {

            smoke.classList.remove('visible', 'puffing');
            instructions.style.whiteSpace = 'pre-line';

            if (candle) {
                candle.classList.add('lifting');
                const sprinkleContainer = document.querySelector('.sprinkle');

                const newSprinkle = document.createElement('span');
                newSprinkle.style.setProperty('--x', '9.8em');
                newSprinkle.style.setProperty('--y', '4em');
                newSprinkle.style.setProperty('--r', '-100deg');
                newSprinkle.style.background = 'rgb(104, 58, 255)';

                sprinkleContainer.appendChild(newSprinkle);
            }

            instructions.textContent = `ป้ะ กินเค้กกัน แต่ตัดเค้กแบ่งก่อนเดะเธออ้วน 🐷
            กดตัดเค้กเลย`;
            knife.classList.add('show');

        }, 1500);

        isBlown = true;
        isAnimating = false;

    }, 600);
}

/* ========================= */
/* START */
/* ========================= */

startBtn.addEventListener('click', async () => {

    if (songStarted) return;

    try {
        await birthdaySong.play();
        songStarted = true;

        instructions.textContent = "ร้องเพลงให้จบก่อน แล้วค่อยเป่าเค้กนะ 🎶";
        instructions.classList.remove('hidden');
        startBtn.style.display = "none";

        // รอเพลงจบก่อนเปิดไมค์
        birthdaySong.addEventListener('ended', () => {
            instructions.textContent = "อธิษฐานแล้วเป่าเค้กดูสิ 🎂";
            initMic();
        });

    } catch (err) {
        console.log("Play blocked:", err);
    }
});


const instructions = document.getElementById('instructions');

/* ========================= */
/* Knife */
/* ========================= */
const knife = document.getElementById('knife');
const cake = document.querySelector('.cake');
const miniEnvelope = document.querySelector('.mini-envelope');
let cakeCut = false;
cake.addEventListener('click', () => {

    if (!isBlown || cakeCut) return;

    cakeCut = true;


    knife.classList.remove('show');
    knife.classList.add('cut');

    setTimeout(() => {
        knife.classList.remove('cut');
        cake.classList.add('cutting');
        miniEnvelope.style.display = 'block';

        const sprinkles = document.querySelectorAll('.sprinkle span');
        sprinkles.forEach(span => {
            const x = span.style.getPropertyValue('--x');
            const y = span.style.getPropertyValue('--y');
            const r = span.style.getPropertyValue('--r');

            if (x === '11.4em' && y === '5em' && r === '45deg') {
                span.remove();
            }
        });
        setTimeout(() => {
            cake.classList.add('cut-done');
            sprinkles.forEach(span => {
            const x = span.style.getPropertyValue('--x');
            const y = span.style.getPropertyValue('--y');
            const r = span.style.getPropertyValue('--r');

            if (x === '11.4em' && y === '5em' && r === '45deg') {
                span.remove();
            }
            
            instructions.textContent = `หึ้ย อะไรอยู่ในเค้กเธออะเราไม่รู้เลย
            ติดมาได้ไงเนี่ยยยยยยยยยยยยยยยยยยยย`;
        });
        }, 600);
    }, 600);

});


const envelopeWrapper = document.querySelector('.envelope-wrapper');
const bigEnvelope = document.getElementById('bigEnvelope');
let envelopeOpen = false;

miniEnvelope.addEventListener('click', (e) => {
    e.stopPropagation();
    
    if (envelopeWrapper && bigEnvelope) {
        envelopeWrapper.style.display = 'flex';
        envelopeWrapper.style.zIndex = '9999';
        bigEnvelope.style.display = 'block';
        
        if (envelopeOpen) return;
        else {
            envelopeOpen = true;
            setTimeout(() => {
                bigEnvelope.classList.add('open');
            }, 10);
        }
    }
});

bigEnvelope.addEventListener('click', () => {
    envelopeWrapper.style.display = 'none';
    bigEnvelope.style.display = 'none';
    instructions.textContent = `หมดมุกแล้วรักเธอนะคับ 💗`;
});
