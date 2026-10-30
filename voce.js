// =============================================================
// voce.js — Ascolto continuo del microfono in italiano.
// Quando sente "aiuto" (o aiutami, aiutatemi...) lancia l'allarme.
// Usa il riconoscimento vocale di Chrome: serve internet.
// =============================================================
(function () {
  const PAROLA_CHIAVE = /\baiut/i;
  const PAUSA_DOPO_SEGNALE = 5000; // millisecondi

  function invia(nome, dati) {
    window.dispatchEvent(new CustomEvent(nome, { detail: dati }));
  }

  window.avviaVoce = function () {
    const Riconoscimento = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Riconoscimento) {
      invia('accanto:voce', { stato: 'non_supportato' });
      return;
    }

    const ascolto = new Riconoscimento();
    ascolto.lang = 'it-IT';
    ascolto.continuous = true;
    ascolto.interimResults = true;

    let attivo = true;
    let ultimoSegnale = 0;

    ascolto.onresult = (evento) => {
      // mentre il telefono parla non ascoltiamo (non deve sentire se stesso)
      if (window.staParlando) return;
      for (let i = evento.resultIndex; i < evento.results.length; i++) {
        const testo = evento.results[i][0].transcript.trim();
        invia('accanto:voce', { stato: 'ascolto', testo });
        if (PAROLA_CHIAVE.test(testo) && Date.now() - ultimoSegnale > PAUSA_DOPO_SEGNALE) {
          ultimoSegnale = Date.now();
          invia('accanto:sos', { fonte: 'voce', testo });
        }
      }
    };

    // Chrome smette di ascoltare dopo un po' di silenzio: ripartiamo da soli
    ascolto.onend = () => {
      if (attivo) setTimeout(() => { try { ascolto.start(); } catch (e) { /* già attivo */ } }, 300);
    };

    ascolto.onerror = (evento) => {
      if (evento.error === 'no-speech' || evento.error === 'aborted') return;
      invia('accanto:voce', { stato: 'errore', errore: evento.error });
      if (evento.error === 'not-allowed' || evento.error === 'service-not-allowed') attivo = false;
    };

    ascolto.start();
    invia('accanto:voce', { stato: 'ascolto', testo: '' });
  };
})();
