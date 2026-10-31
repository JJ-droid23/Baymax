// =============================================================
// stato.js — Dati condivisi tra il tablet dell'anziano e l'app del familiare.
// I dati restano nel browser (localStorage) e le pagine aperte sullo stesso
// computer si parlano in tempo reale (BroadcastChannel).
// Nel prodotto vero questo file verrebbe sostituito da un server.
// =============================================================
(function () {
  const CHIAVE = 'accanto-stato-v1';
  const canale = 'BroadcastChannel' in window ? new BroadcastChannel('accanto') : null;
  const ascoltatori = {};

  // Livelli di autonomia: decidono quanto e come il tablet aiuta l'anziano
  const LIVELLI = {
    1: {
      nome: 'Autonoma',
      fase: 'Demenza lieve o nessuna',
      descrizione: 'Risposte complete, un promemoria a voce ogni 30 minuti, sceglie sempre lei chi chiamare.',
      velocitaVoce: 1.0,
      ripetiPromemoria: 30,
      chiamataAutomatica: false,
    },
    2: {
      nome: 'Parzialmente autonoma',
      fase: 'Demenza moderata',
      descrizione: 'Frasi semplici e rassicuranti, promemoria ripetuto ogni 10 minuti.',
      velocitaVoce: 0.92,
      ripetiPromemoria: 10,
      chiamataAutomatica: false,
    },
    3: {
      nome: 'Assistita',
      fase: 'Demenza avanzata',
      descrizione: 'Frasi brevissime e lente, promemoria ogni 5 minuti. Se non sceglie chi chiamare entro 10 secondi, chiama il familiare.',
      velocitaVoce: 0.82,
      ripetiPromemoria: 5,
      chiamataAutomatica: true,
    },
  };

  const STANZE = {
    soggiorno: { nome: 'Soggiorno', telecamera: true },
    cucina: { nome: 'Cucina', telecamera: true },
    camera: { nome: 'Camera da letto', telecamera: true },
    bagno: { nome: 'Bagno', telecamera: false },
    ingresso: { nome: 'Ingresso', telecamera: true },
  };

  // ---------- utilità sul tempo ----------
  function hhmm(data = new Date()) {
    return data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }
  function minuti(testoOra) {
    const [h, m] = testoOra.split(':').map(Number);
    return h * 60 + m;
  }
  function minutiAdesso() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
  function oggi() {
    const d = new Date();
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }
  function momentoDellaGiornata(data = new Date()) {
    const h = data.getHours() + data.getMinutes() / 60;
    if (h >= 6 && h < 12) return { nome: 'Mattina', icona: '🌅', classe: 'mattina' };
    if (h >= 12 && h < 14.5) return { nome: 'Ora di pranzo', icona: '🍽️', classe: 'pranzo' };
    if (h >= 14.5 && h < 18) return { nome: 'Pomeriggio', icona: '☀️', classe: 'pomeriggio' };
    if (h >= 18 && h < 22) return { nome: 'Sera', icona: '🌇', classe: 'sera' };
    return { nome: 'Notte', icona: '🌙', classe: 'notte' };
  }

  // ---------- dati di partenza per la demo ----------
  function orarioRelativo(minutiDaAdesso) {
    let t = minutiAdesso() + minutiDaAdesso;
    t = Math.max(5, Math.min(23 * 60 + 50, t)); // resta dentro la giornata
    return `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
  }
  function datiIniziali() {
    const eventi = [
      { tipo: 'impegno', titolo: 'Colazione', dettaglio: 'Latte e biscotti', min: -150, fatto: true },
      { tipo: 'medicina', titolo: 'Vitamina D', dettaglio: '10 gocce in un bicchiere d\'acqua', min: -120, fatto: true },
      { tipo: 'medicina', titolo: 'Cardioaspirina', dettaglio: '1 compressa con un bicchiere d\'acqua', min: -1, fatto: false },
      { tipo: 'impegno', titolo: 'Telefonata con Lucia', dettaglio: 'La nipote chiama per salutarti', min: 45, fatto: false },
      { tipo: 'impegno', titolo: 'Passeggiata in giardino', dettaglio: 'Con la vicina Rosa', min: 120, fatto: false },
      { tipo: 'medicina', titolo: 'Melatonina', dettaglio: '1 compressa prima di dormire', min: 240, fatto: false },
    ].map((e, i) => ({
      id: 'e' + i,
      tipo: e.tipo,
      titolo: e.titolo,
      dettaglio: e.dettaglio,
      ora: orarioRelativo(e.min),
      fatto: e.fatto,
      fattoAlle: e.fatto ? orarioRelativo(e.min + 3) : null,
    }));
    return {
      data: oggi(),
      nomeAnziano: 'Anna',
      nomeFamiliare: 'Marco',
      numeroEmergenza: '112',
      livello: 2,
      avvisaMedicineNonPrese: true,
      stanza: 'soggiorno',
      eventi,
      storico: [{ icona: '🟢', testo: 'Sistema attivo, sensori collegati', ora: hhmm(), tono: '' }],
    };
  }

  // ---------- lettura e salvataggio ----------
  function carica() {
    try {
      const salvato = JSON.parse(localStorage.getItem(CHIAVE));
      if (salvato && salvato.data === oggi()) return salvato;
    } catch (e) { /* dati assenti o rovinati */ }
    const nuovo = datiIniziali();
    try { localStorage.setItem(CHIAVE, JSON.stringify(nuovo)); } catch (e) { /* storage non disponibile */ }
    return nuovo;
  }
  let stato = carica();

  function emettiQui(tipo, dati) {
    (ascoltatori[tipo] || []).forEach((cb) => cb(dati));
  }

  function salva(nuovo) {
    stato = nuovo;
    try { localStorage.setItem(CHIAVE, JSON.stringify(nuovo)); } catch (e) { /* storage non disponibile */ }
    emettiQui('stato', stato);
    if (canale) canale.postMessage({ tipo: 'stato' });
  }

  if (canale) {
    canale.onmessage = (e) => {
      if (e.data.tipo === 'stato') {
        stato = carica();
        emettiQui('stato', stato);
      } else {
        emettiQui(e.data.tipo, e.data.dati);
      }
    };
  }

  window.Accanto = {
    LIVELLI,
    STANZE,
    hhmm,
    minuti,
    minutiAdesso,
    momentoDellaGiornata,
    get stato() { return stato; },

    // Modifica i dati e avvisa tutte le pagine aperte
    aggiorna(modifica) {
      const copia = JSON.parse(JSON.stringify(stato));
      modifica(copia);
      salva(copia);
    },

    // Aggiunge una riga allo storico del familiare
    registra(icona, testo, tono = '') {
      this.aggiorna((s) => {
        s.storico.unshift({ icona, testo, ora: hhmm(), tono });
        s.storico = s.storico.slice(0, 40);
      });
    },

    // Messaggi istantanei verso le ALTRE pagine (chiamate, audio, video...)
    invia(tipo, dati = {}) {
      if (canale) canale.postMessage({ tipo, dati });
    },
    on(tipo, cb) {
      (ascoltatori[tipo] = ascoltatori[tipo] || []).push(cb);
    },

    ripristina() {
      salva(datiIniziali());
    },

    // ---------- calendario ----------
    eventiOrdinati() {
      return [...stato.eventi].sort((a, b) => minuti(a.ora) - minuti(b.ora));
    },
    // Medicina da prendere adesso (orario passato e non ancora presa)
    medicinaDaPrendere() {
      const adesso = minutiAdesso();
      return this.eventiOrdinati().find((e) => e.tipo === 'medicina' && !e.fatto && minuti(e.ora) <= adesso) || null;
    },
    // Impegno in corso (iniziato da meno di un'ora)
    impegnoAdesso() {
      const adesso = minutiAdesso();
      return this.eventiOrdinati().filter((e) => e.tipo === 'impegno' && !e.fatto && minuti(e.ora) <= adesso && adesso - minuti(e.ora) < 60).pop() || null;
    },
    prossimoEvento() {
      const adesso = minutiAdesso();
      return this.eventiOrdinati().find((e) => !e.fatto && minuti(e.ora) > adesso) || null;
    },
    ultimaMedicinaPresa() {
      return this.eventiOrdinati().filter((e) => e.tipo === 'medicina' && e.fatto).pop() || null;
    },
    segnaFatto(id, fatto = true) {
      this.aggiorna((s) => {
        const e = s.eventi.find((x) => x.id === id);
        if (e) { e.fatto = fatto; e.fattoAlle = fatto ? hhmm() : null; }
      });
    },
  };
})();
