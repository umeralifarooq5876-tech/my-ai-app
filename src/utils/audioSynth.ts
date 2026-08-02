// Web Audio API Ambient Sound & Focus Generator for Obsidian Apex

let audioCtx: AudioContext | null = null;
let activeNodes: { stop: () => void }[] = [];

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export type SoundMode = "binaural" | "lofi" | "rain" | "hum" | "off";

export function playAmbientSound(mode: SoundMode) {
  stopAmbientSound();
  if (mode === "off") return;

  const ctx = getAudioContext();

  if (mode === "binaural") {
    // 10Hz Alpha wave binaural beat for deep focus
    const oscLeft = ctx.createOscillator();
    const oscRight = ctx.createOscillator();
    const merger = ctx.createChannelMerger(2);
    const masterGain = ctx.createGain();

    oscLeft.frequency.value = 200; // Left ear 200 Hz
    oscRight.frequency.value = 210; // Right ear 210 Hz (10Hz Alpha difference)

    oscLeft.connect(merger, 0, 0);
    oscRight.connect(merger, 0, 1);

    masterGain.gain.value = 0.15;
    merger.connect(masterGain);
    masterGain.connect(ctx.destination);

    oscLeft.start();
    oscRight.start();

    activeNodes.push({
      stop: () => {
        try {
          oscLeft.stop();
          oscRight.stop();
          oscLeft.disconnect();
          oscRight.disconnect();
        } catch {}
      },
    });
  } else if (mode === "hum") {
    // Warm deep focus drone hum
    const osc = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.value = 55; // A1 low frequency
    osc2.type = "sine";
    osc2.frequency.value = 110;

    filter.type = "lowpass";
    filter.frequency.value = 180;

    gain.gain.value = 0.08;

    osc.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc2.start();

    activeNodes.push({
      stop: () => {
        try {
          osc.stop();
          osc2.stop();
        } catch {}
      },
    });
  } else if (mode === "rain") {
    // Pink noise rain simulator
    const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      data[i] *= 0.11; // scale down
      b6 = white * 0.115926;
    }

    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    noiseNode.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.15;

    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noiseNode.start();

    activeNodes.push({
      stop: () => {
        try {
          noiseNode.stop();
        } catch {}
      },
    });
  } else if (mode === "lofi") {
    // Gentle relaxing warm lofi synth chords
    const freqList = [130.81, 164.81, 196.0, 246.94]; // C3 Major7
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.06;
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 400;

    const oscs = freqList.map((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      osc.connect(filter);
      osc.start();
      return osc;
    });

    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    activeNodes.push({
      stop: () => {
        oscs.forEach((osc) => {
          try {
            osc.stop();
          } catch {}
        });
      },
    });
  }
}

export function stopAmbientSound() {
  activeNodes.forEach((node) => node.stop());
  activeNodes = [];
}

export function playTimerCompletionChime() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(523.25, now); // C5
    osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6 bell pitch

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + 1.2);
  } catch {}
}
