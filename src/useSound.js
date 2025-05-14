// Custom hook for playing sound effects
const useSound = () => {
  // Create audio context when needed (to avoid autoplay restrictions)
  let audioContext = null;

  const initAudio = () => {
    if (audioContext === null) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContext;
  };

  // Synthesize sounds programmatically
  const playSound = (type) => {
    try {
      const context = initAudio();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(context.destination);
      
      // Different sound settings based on type
      switch (type) {
        case 'flip':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(600, context.currentTime + 0.1);
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.1);
          break;
          
        case 'match':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.2);
          
          // Add second tone for match (pleasant chord)
          setTimeout(() => {
            const osc2 = context.createOscillator();
            const gain2 = context.createGain();
            
            osc2.connect(gain2);
            gain2.connect(context.destination);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(600, context.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 0.2);
            gain2.gain.setValueAtTime(0.1, context.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            osc2.start();
            osc2.stop(context.currentTime + 0.3);
          }, 100);
          break;
          
        case 'wrong':
          oscillator.type = 'sawtooth';
          oscillator.frequency.setValueAtTime(300, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(150, context.currentTime + 0.2);
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.2);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.2);
          break;
          
        case 'start':
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(400, context.currentTime);
          oscillator.frequency.exponentialRampToValueAtTime(800, context.currentTime + 0.3);
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.3);
          
          // Add more tones for game start
          setTimeout(() => {
            const osc2 = context.createOscillator();
            const gain2 = context.createGain();
            
            osc2.connect(gain2);
            gain2.connect(context.destination);
            
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(500, context.currentTime);
            osc2.frequency.exponentialRampToValueAtTime(1000, context.currentTime + 0.3);
            gain2.gain.setValueAtTime(0.1, context.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            osc2.start();
            osc2.stop(context.currentTime + 0.3);
          }, 100);
          
          setTimeout(() => {
            const osc3 = context.createOscillator();
            const gain3 = context.createGain();
            
            osc3.connect(gain3);
            gain3.connect(context.destination);
            
            osc3.type = 'sine';
            osc3.frequency.setValueAtTime(600, context.currentTime);
            osc3.frequency.exponentialRampToValueAtTime(1200, context.currentTime + 0.3);
            gain3.gain.setValueAtTime(0.1, context.currentTime);
            gain3.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.3);
            osc3.start();
            osc3.stop(context.currentTime + 0.3);
          }, 200);
          break;
          
        case 'win':
          // Complex win sound with multiple notes
          [0, 200, 400, 550, 700].forEach((delay, i) => {
            setTimeout(() => {
              const osc = context.createOscillator();
              const gain = context.createGain();
              
              osc.connect(gain);
              gain.connect(context.destination);
              
              const baseFreq = 400 + (i * 100);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(baseFreq, context.currentTime);
              osc.frequency.exponentialRampToValueAtTime(baseFreq + 200, context.currentTime + 0.3);
              gain.gain.setValueAtTime(0.15, context.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.4);
              osc.start();
              osc.stop(context.currentTime + 0.4);
            }, delay);
          });
          break;
          
        default:
          // Default sound
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(440, context.currentTime);
          gainNode.gain.setValueAtTime(0.1, context.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.1);
          oscillator.start();
          oscillator.stop(context.currentTime + 0.1);
      }
    } catch (error) {
      console.log("Sound error:", error);
    }
  };

  return { playSound };
};

export default useSound;
