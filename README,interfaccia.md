# Baymax — Accanto

Sistema di assistenza per anziani che vivono da soli, anche con demenza.
Il progetto ha due parti:

1. **Il prodotto:** il tablet dell'anziano e l'app del familiare (caretaker), come saranno davvero.
2. **La demo tecnica:** due "telefoni" affiancati per mostrare dal vivo riconoscimento dei gesti e della voce.

| Pagina | Cosa mostra | Link |
|---|---|---|
| `vetrina.html` | **Prodotto:** tablet e app del familiare affiancati e collegati | https://jj-droid23.github.io/Baymax/vetrina.html |
| `tablet.html` | Solo il tablet dell'anziano (da aprire su un tablet) | https://jj-droid23.github.io/Baymax/tablet.html |
| `familiare.html` | Solo l'app del familiare (da aprire sul telefono) | https://jj-droid23.github.io/Baymax/familiare.html |
| `index.html` | **Demo tecnica:** gesti, voce e allarme | https://jj-droid23.github.io/Baymax/ |

Serve **Google Chrome**, con **internet**, webcam e microfono.

---

## 1. Il prodotto

### Tablet dell'anziano (`tablet.html`)
Schermo orizzontale, essenziale, diviso in due:

- **Calendario (sinistra):** l'impegno di adesso e quello successivo.
  Quando è ora di una medicina compare in grande con il tasto **✓ PRESA**: toccandolo sparisce e il familiare riceve la conferma.
- **Oggi (destra):** giorno della settimana, data, anno, orario e momento della giornata
  (mattina, ora di pranzo, pomeriggio, sera, notte). I colori cambiano con il momento della giornata e di notte lo schermo diventa scuro.
- **Tasto di aiuto (in basso):** sul tablet vero è un tasto fisico. Premendolo compaiono due scelte giganti,
  **chiamare il familiare** o **chiamare i soccorsi**, che si possono scegliere toccandole o a voce.

**Domande a voce** (il tablet ascolta sempre e risponde ad alta voce, con i sottotitoli):

| Si dice | Il tablet risponde |
|---|---|
| «Ho preso la medicina?» | «Sì, l'hai già presa» oppure «Non ancora, è ora di prendere…» |
| «Che giorno è?» | Giorno e data |
| «Che ore sono?» | Orario e momento della giornata |
| «Cosa devo fare?» | Impegno di adesso e il prossimo |
| «Aiuto» | Apre la scelta su chi chiamare |
| «Marco» / «soccorsi» / «annulla» | Mentre è aperta la scelta: chiama o annulla |

Quando è ora di una medicina, il tablet la ricorda anche a voce e ripete il promemoria in base al livello di autonomia.

### App del familiare (`familiare.html`)
- **Dashboard:** dove si trova l'anziano, stato (tutto ok / medicina da prendere / richiesta di aiuto),
  medicine prese oggi, prossimo impegno e lo **storico delle notifiche**.
- **📅 Calendario:** aggiungere impegni e medicine, segnarli come fatti o prese, eliminarli. Il tablet si aggiorna subito.
- **📹 Video:** mappa della casa con la stanza in cui si trova l'anziano. Il video passa da solo alla telecamera
  di quella stanza, ma si può scegliere un'altra stanza toccandola. In bagno non c'è telecamera, solo un sensore di presenza.
  Sul tablet compare l'avviso «Marco ti sta guardando».
- **🎙️ Micro:** tenendo premuto si parla dall'altoparlante del tablet, senza chiamare.
  Ci sono anche messaggi rapidi o scritti, che il tablet legge ad alta voce.
- **⚙️ Impostazioni:** il **livello di autonomia** decide quanto il tablet aiuta, in base a quanto è avanzata la demenza:

| Livello | Come si comporta il tablet |
|---|---|
| Autonoma | Risposte complete, promemoria ogni 30 minuti, sceglie sempre lei chi chiamare |
| Parzialmente autonoma | Frasi semplici e rassicuranti, promemoria ogni 10 minuti |
| Assistita | Frasi brevissime e lente, promemoria ogni 5 minuti; se non sceglie chi chiamare entro 10 secondi, chiama il familiare |

  Si possono anche cambiare i nomi, il numero di emergenza e l'avviso se una medicina non viene presa entro 30 minuti.

### Presentare il prodotto (`vetrina.html`)
1. Apri `vetrina.html` in Chrome e **tocca una volta lo schermo del tablet** (serve al browser per attivare voce e microfono).
2. Consenti il microfono, e la fotocamera quando apri il Video.
3. Il **tasto rosso** sotto lo schermo del tablet è il tasto fisico di aiuto (anche la barra spaziatrice).
4. La barra in basso simula i sensori: **«Anna va in: Cucina…»** sposta l'anziano tra le stanze. `H` la nasconde.
5. **Ripristina demo** riporta tutti i dati all'inizio.

**Copione consigliato:**
1. Tablet: è ora della medicina → tocca **PRESA** → sull'app arriva la notifica.
2. Chiedi al tablet «Ho preso la medicina?» → risponde «Sì, l'hai già presa».
3. Premi il **tasto rosso** → scegli «Marco» (o dillo a voce) → sul telefono arriva la chiamata → **Rispondi**.
4. App: **Calendario** → aggiungi una medicina all'ora attuale → compare sul tablet.
5. App: **Video** → cambia stanza dalla barra in basso e mostra che il video la segue; mostra il bagno senza telecamera.
6. App: **Micro** → tocca «Arrivo tra 10 minuti» → il tablet lo legge ad alta voce.
7. App: **Impostazioni** → scegli «Assistita» → premi il tasto rosso → dopo 10 secondi chiama Marco da solo.

> Nella demo tablet e app si parlano solo se sono aperti **sullo stesso computer** (come in `vetrina.html`).
> Nel prodotto vero si collegherebbero tramite un server.

---

## 2. La demo tecnica (`index.html`)

1. Apri https://jj-droid23.github.io/Baymax/ con Chrome e premi **▶ Avvia demo**.
2. Consenti fotocamera e microfono e aspetta che il modello dei gesti si carichi.

| Cosa fai | Cosa succede |
|---|---|
| ✋ Mano aperta verso la webcam per circa 1 secondo | Allarme rosso con sirena sull'app di Marco |
| 👍 Pollice su per 1 secondo | Notifica «Anna sta bene» |
| Dici **«aiuto»** ad alta voce | Allarme sull'app di Marco, con la frase sentita |
| Premi **SOS** | Allarme sull'app di Marco |
| Premi **L'ho presa** | Notifica «Farmaco preso» a Marco |
| Marco preme **Sto arrivando** o **Chiama** | Il telefono di Anna lo mostra e lo dice a voce |
| Marco preme **📹 Vedi la fotocamera di Anna** | Marco vede la webcam; su Anna compare «Marco ti sta vedendo» |

Tasti di riserva: `S` = SOS · `O` = sto bene · `R` = ricomincia.

### Regolare i gesti
In cima a `gesti.js`: `soglia` (da 0 a 1) e `tenere` (millisecondi) per ogni gesto,
`TOLLERANZA` e `MOSTRA_DEBUG` (disegna i punti della mano e scrive cosa vede).

---

## File del progetto

| File | Cosa contiene |
|---|---|
| `vetrina.html` | Tablet e telefono affiancati per la presentazione del prodotto |
| `tablet.html` | Interfaccia del tablet dell'anziano |
| `familiare.html` | App del familiare |
| `stato.js` | Dati condivisi (calendario, storico, impostazioni) e collegamento tra tablet e app |
| `index.html` | Demo tecnica con i due telefoni |
| `gesti.js` | Riconoscimento dei gesti con MediaPipe (demo tecnica) |
| `voce.js` | Ascolto della parola «aiuto» (demo tecnica) |
| `README.md` | Questa pagina |

## Tecnologie
- **HTML, CSS e JavaScript** nel browser, senza installare niente.
- **MediaPipe Gesture Recognizer** (Google, open source): gesti riconosciuti nel browser, il video non va su nessun server.
- **Web Speech API** di Chrome: riconoscimento vocale e voce in italiano.
- **BroadcastChannel e localStorage:** collegano tablet e app aperti sullo stesso computer.
- **GitHub Pages:** pubblica il progetto online con indirizzo `https://`.

## Prima della presentazione
- [ ] `vetrina.html` e `index.html` provate dal link sul computer della presentazione
- [ ] Gesti provati con la luce della sala
- [ ] Permessi di fotocamera e microfono già concessi in Chrome
- [ ] Volume del computer alto
- [ ] Hotspot del telefono pronto se il Wi-Fi della sala non funziona
- [ ] Video di riserva registrato
