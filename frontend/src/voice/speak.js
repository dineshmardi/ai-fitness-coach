let lastSpoken = "";
let lastTime = 0;

export function speak(text) {
  const now = Date.now();

  // avoid repeating same message too frequently
  if (text === lastSpoken && now - lastTime < 2000) return;

  lastSpoken = text;
  lastTime = now;

  const utterance = new SpeechSynthesisUtterance(text);

  utterance.rate = 1;     // speed
  utterance.pitch = 1;    // tone
  utterance.volume = 1;   // loudness

  window.speechSynthesis.cancel(); // stop previous
  window.speechSynthesis.speak(utterance);
}