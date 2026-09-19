// Web Audio API & Vibration synthesizer for authentic warehouse barcode scanner feedback
// Works 100% offline with zero external assets on both Android and PC browsers

let audioCtx: AudioContext | null = null;

export const playScannerBeep = (type: 'success' | 'alert' | 'double' = 'success') => {
  try {
    // 1. Trigger haptic vibration on Android / mobile devices
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      if (type === 'success') {
        navigator.vibrate(60);
      } else if (type === 'double') {
        navigator.vibrate([40, 60, 40]);
      } else {
        navigator.vibrate([100, 50, 100]);
      }
    }

    // 2. Synthesize Honeywell / Zebra warehouse scanner optical beep
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx || audioCtx.state === 'suspended') {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'success') {
      // Crisp 1760Hz (A6 note) classic warehouse optical laser beep
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.085);
    } else if (type === 'double') {
      // Double chirp (confirmation of batch reconciliation)
      [0, 0.1].forEach((delay) => {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2093, now + delay); // C7 note

        gain.gain.setValueAtTime(0.2, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.06);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now + delay);
        osc.stop(now + delay + 0.065);
      });
    } else {
      // Low dual warning buzzer (440Hz -> 220Hz)
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.18);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.2);
    }
  } catch {
    // Audio contexts may occasionally be blocked if user hasn't interacted yet; fail silently
  }
};
