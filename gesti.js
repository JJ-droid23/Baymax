// =============================================================
// gesti.js — Riconoscimento dei gesti con MediaPipe (Google, open source)
// Tutto gira nel browser: il video della webcam NON esce dal computer.
//
// Gesti riconosciuti dal modello: Open_Palm (mano aperta), Thumb_Up (pollice su),
// Thumb_Down, Closed_Fist, Pointing_Up, Victory, ILoveYou.
// Qui usiamo:  mano aperta tenuta 1,5 s = AIUTO  ·  pollice su 1 s = STO BENE
// =============================================================

const VERSIONE = '1.2.0';
const LIBRERIA = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSIONE}`;
const MODELLO = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

// ---- impostazioni da tarare con la luce della sala ----
const REGOLE = {
  Open_Palm: { evento: 'accanto:sos', tenere: 1500, etichetta: '✋ Mano aperta → aiuto' },
  Thumb_Up:  { evento: 'accanto:ok',  tenere: 1000, etichetta: '👍 Pollice su → sto bene' },
};
const SICUREZZA_MINIMA = 0.6;  // da 0 a 1: più alto = meno falsi allarmi
const PAUSA_DOPO_SEGNALE = 4000; // millisecondi prima di poter rilanciare

function invia(nome, dati) {
  window.dispatchEvent(new CustomEvent(nome, { detail: dati }));
}

window.avviaGesti = async function (video) {
  invia('accanto:gesto', { stato: 'avvio' });

  // 1. accende la webcam
  const flusso = await navigator.mediaDevices.getUserMedia({
    video: { width: 640, height: 480, facingMode: 'user' },
    audio: false,
  });
  video.srcObject = flusso;
  await video.play();

  // 2. carica il modello (scheda grafica se possibile, altrimenti processore)
  const { FilesetResolver, GestureRecognizer } = await import(`${LIBRERIA}/vision_bundle.mjs`);
  const fileset = await FilesetResolver.forVisionTasks(`${LIBRERIA}/wasm`);
  const opzioni = (delegate) => ({
    baseOptions: { modelAssetPath: MODELLO, delegate },
    runningMode: 'VIDEO',
    numHands: 1,
  });
  let riconoscitore;
  try {
    riconoscitore = await GestureRecognizer.createFromOptions(fileset, opzioni('GPU'));
  } catch {
    riconoscitore = await GestureRecognizer.createFromOptions(fileset, opzioni('CPU'));
  }
  invia('accanto:gesto', { stato: 'pronto' });

  // 3. analizza ogni fotogramma
  let ultimoTempo = -1;
  let gestoInCorso = null;
  let inizioGesto = 0;
  let ultimoSegnale = 0;

  function analizza() {
    if (video.readyState >= 2 && video.currentTime !== ultimoTempo) {
      ultimoTempo = video.currentTime;
      const adesso = performance.now();
      const risultato = riconoscitore.recognizeForVideo(video, adesso);
      const migliore = risultato.gestures?.[0]?.[0];
      const nome = migliore && migliore.score >= SICUREZZA_MINIMA ? migliore.categoryName : null;
      const regola = nome ? REGOLE[nome] : null;
      const inPausa = adesso - ultimoSegnale < PAUSA_DOPO_SEGNALE;

      if (!regola || inPausa) {
        gestoInCorso = null;
        invia('accanto:gesto', { stato: inPausa ? 'inviato' : 'pronto', progresso: 0 });
      } else {
        if (gestoInCorso !== nome) { gestoInCorso = nome; inizioGesto = adesso; }
        const progresso = Math.min(1, (adesso - inizioGesto) / regola.tenere);
        invia('accanto:gesto', { stato: 'in_corso', etichetta: regola.etichetta, progresso });
        if (progresso >= 1) {
          ultimoSegnale = adesso;
          gestoInCorso = null;
          invia(regola.evento, { fonte: 'gesto' });
        }
      }
    }
    requestAnimationFrame(analizza);
  }
  requestAnimationFrame(analizza);
};
