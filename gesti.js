// =============================================================
// gesti.js — Riconoscimento dei gesti con MediaPipe (Google, open source)
// Tutto gira nel browser: il video della webcam NON esce dal computer.
//
//   ✋ mano aperta tenuta 1,2 s = AIUTO      👍 pollice su tenuto 1 s = STO BENE
//
// La mano aperta viene riconosciuta in due modi, per essere più affidabile:
//   1. dal modello di Google (gesto "Open_Palm")
//   2. dalla posizione delle dita (tutte e cinque distese)
// =============================================================

const VERSIONE = '1.2.0';
const LIBRERIA = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSIONE}`;
const MODELLO = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

// ---------------- impostazioni da tarare ----------------
const REGOLE = {
  Open_Palm: { evento: 'accanto:sos', tenere: 1200, soglia: 0.45, etichetta: '✋ Mano aperta → aiuto' },
  Thumb_Up:  { evento: 'accanto:ok',  tenere: 1000, soglia: 0.55, etichetta: '👍 Pollice su → sto bene' },
};
const TOLLERANZA = 450;          // ms: se il gesto "sparisce" per meno di così, il conteggio continua
const PAUSA_DOPO_SEGNALE = 4000; // ms prima di poter rilanciare lo stesso segnale
const MOSTRA_DEBUG = true;       // true = disegna la mano e scrive cosa vede (utile per le prove)
// ---------------------------------------------------------

function invia(nome, dati) {
  window.dispatchEvent(new CustomEvent(nome, { detail: dati }));
}

// Distanza tra due punti della mano
function distanza(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Mano aperta guardando le dita: ogni punta deve essere più lontana dal polso
// della sua articolazione centrale (funziona con la mano dritta o inclinata).
function manoAperta(p) {
  const polso = p[0];
  const dita = [[8, 6], [12, 10], [16, 14], [20, 18]]; // [punta, articolazione] di indice, medio, anulare, mignolo
  const ditaDistese = dita.filter(([punta, giunto]) => distanza(p[punta], polso) > distanza(p[giunto], polso) * 1.12).length;
  const pollice = distanza(p[4], p[17]) > distanza(p[3], p[17]); // punta del pollice lontana dal mignolo
  return ditaDistese === 4 && pollice;
}

// Disegno della mano e scritta di debug sopra il riquadro della webcam
let tela = null;
let scritta = null;
function preparaDebug(video) {
  if (!MOSTRA_DEBUG || tela) return;
  const contenitore = video.parentElement;
  tela = document.createElement('canvas');
  tela.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;transform:scaleX(-1);pointer-events:none';
  scritta = document.createElement('div');
  scritta.style.cssText = 'position:absolute;top:4px;left:4px;padding:2px 6px;border-radius:8px;background:rgba(0,0,0,.6);color:#fff;font:600 10px sans-serif;pointer-events:none';
  contenitore.appendChild(tela);
  contenitore.appendChild(scritta);
}
function disegnaDebug(video, punti, testo, riconosciuto) {
  if (!MOSTRA_DEBUG || !tela) return;
  tela.width = video.videoWidth;
  tela.height = video.videoHeight;
  const ctx = tela.getContext('2d');
  ctx.clearRect(0, 0, tela.width, tela.height);
  if (punti) {
    ctx.fillStyle = riconosciuto ? '#22c55e' : '#facc15';
    for (const punto of punti) {
      ctx.beginPath();
      ctx.arc(punto.x * tela.width, punto.y * tela.height, 7, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  scritta.textContent = testo;
}

window.avviaGesti = async function (video) {
  invia('accanto:gesto', { stato: 'avvio' });

  // 1. accende la webcam (se non è già accesa)
  if (!video.srcObject) {
    video.srcObject = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480, facingMode: 'user' },
      audio: false,
    });
  }
  await video.play();

  // 2. carica il modello (scheda grafica se possibile, altrimenti processore)
  const { FilesetResolver, GestureRecognizer } = await import(`${LIBRERIA}/vision_bundle.mjs`);
  const fileset = await FilesetResolver.forVisionTasks(`${LIBRERIA}/wasm`);
  const opzioni = (delegate) => ({
    baseOptions: { modelAssetPath: MODELLO, delegate },
    runningMode: 'VIDEO',
    numHands: 1,
    minHandDetectionConfidence: 0.4,
    minHandPresenceConfidence: 0.4,
    minTrackingConfidence: 0.4,
  });
  let riconoscitore;
  try {
    riconoscitore = await GestureRecognizer.createFromOptions(fileset, opzioni('GPU'));
  } catch {
    riconoscitore = await GestureRecognizer.createFromOptions(fileset, opzioni('CPU'));
  }
  preparaDebug(video);
  invia('accanto:gesto', { stato: 'pronto' });

  // 3. analizza ogni fotogramma
  let ultimoTempo = -1;
  let gestoInCorso = null;
  let inizioGesto = 0;
  let ultimaVolta = 0;   // ultimo istante in cui il gesto è stato visto
  let ultimoSegnale = 0;

  function analizza() {
    if (video.readyState >= 2 && video.currentTime !== ultimoTempo) {
      ultimoTempo = video.currentTime;
      const adesso = performance.now();
      const risultato = riconoscitore.recognizeForVideo(video, adesso);
      const punti = risultato.landmarks?.[0];
      const categoria = risultato.gestures?.[0]?.[0];

      // quale gesto vediamo?
      let nome = null;
      let testo = punti ? 'mano vista' : 'nessuna mano';
      if (categoria && categoria.categoryName !== 'None') {
        testo = `${categoria.categoryName} ${Math.round(categoria.score * 100)}%`;
        const regola = REGOLE[categoria.categoryName];
        if (regola && categoria.score >= regola.soglia) nome = categoria.categoryName;
      }
      if (!nome && punti && manoAperta(punti)) {
        nome = 'Open_Palm';
        testo = 'mano aperta (dita)';
      }
      disegnaDebug(video, punti, testo, Boolean(nome));

      const inPausa = adesso - ultimoSegnale < PAUSA_DOPO_SEGNALE;

      if (inPausa) {
        gestoInCorso = null;
        invia('accanto:gesto', { stato: 'inviato', progresso: 0 });
      } else if (nome) {
        if (gestoInCorso !== nome) { gestoInCorso = nome; inizioGesto = adesso; }
        ultimaVolta = adesso;
        const regola = REGOLE[nome];
        const progresso = Math.min(1, (adesso - inizioGesto) / regola.tenere);
        invia('accanto:gesto', { stato: 'in_corso', etichetta: regola.etichetta, progresso });
        if (progresso >= 1) {
          ultimoSegnale = adesso;
          gestoInCorso = null;
          invia(regola.evento, { fonte: 'gesto' });
        }
      } else if (gestoInCorso && adesso - ultimaVolta < TOLLERANZA) {
        // il gesto è sparito per un attimo: non azzeriamo il conteggio
        const regola = REGOLE[gestoInCorso];
        const progresso = Math.min(0.99, (adesso - inizioGesto) / regola.tenere);
        invia('accanto:gesto', { stato: 'in_corso', etichetta: regola.etichetta, progresso });
      } else {
        gestoInCorso = null;
        invia('accanto:gesto', { stato: 'pronto', progresso: 0 });
      }
    }
    requestAnimationFrame(analizza);
  }
  requestAnimationFrame(analizza);
};
