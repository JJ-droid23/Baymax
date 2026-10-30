# Baymax — Accanto

Demo di un sistema di assistenza per anziani che vivono da soli.
Sullo stesso schermo si vedono due "telefoni":

- **Telefono di Anna (anziana):** orologio grande, promemoria del farmaco, pulsante SOS,
  riconoscimento dei gesti con la webcam e ascolto della parola «aiuto».
- **App di Marco (figlio):** notifiche, allarme a tutto schermo con sirena,
  storico della giornata e visione della fotocamera di Anna.

👉 **Demo online:** https://jj-droid23.github.io/Baymax/

## Come provarla

1. Apri il link della demo con **Google Chrome**.
2. Premi **▶ Avvia demo**.
3. Consenti **fotocamera** e **microfono** quando Chrome lo chiede.
4. Aspetta qualche secondo che il modello dei gesti si carichi.

| Cosa fai | Cosa succede |
|---|---|
| ✋ Mano aperta verso la webcam per 1,5 secondi | Allarme rosso con sirena sull'app di Marco |
| 👍 Pollice su per 1 secondo | Notifica «Anna sta bene» |
| Dici **«aiuto»** ad alta voce | Allarme sull'app di Marco, con la frase sentita |
| Premi **SOS** sul telefono di Anna | Allarme sull'app di Marco |
| Premi **L'ho presa** sul promemoria | Notifica «Farmaco preso» a Marco |
| Marco preme **Sto arrivando** o **Chiama** | Il telefono di Anna lo mostra e lo dice a voce |
| Marco preme **📹 Vedi la fotocamera di Anna** | Marco vede la webcam dal vivo; sul telefono di Anna compare «Marco ti sta vedendo» |

### Tasti di riserva per la presentazione
Se qualcosa non funziona dal vivo:

- `S` = SOS
- `O` = sto bene
- `R` = ricomincia da capo

## Requisiti
- **Google Chrome** (il riconoscimento vocale funziona solo lì).
- **Internet**: servono per caricare il modello dei gesti e per il riconoscimento vocale.
- Webcam e microfono.

## File del progetto

| File | Cosa contiene | Chi lo modifica |
|---|---|---|
| `index.html` | I due telefoni, grafica, notifiche, allarme, fotocamera per Marco | Grafica e app |
| `gesti.js` | Riconoscimento dei gesti con MediaPipe | Gesti |
| `voce.js` | Ascolto continuo della parola «aiuto» | Voce |
| `README.md` | Questa pagina | Tutti |

Ognuno modifica **solo il proprio file**, così non vi sovrascrivete.
I file comunicano tra loro con questi eventi:

- `accanto:sos` → richiesta di aiuto (`fonte`: gesto, voce o pulsante)
- `accanto:ok` → sto bene
- `accanto:gesto` → stato del riconoscimento gesti (per la barra gialla)
- `accanto:voce` → stato del microfono e frase sentita

## Tecnologie
- **HTML, CSS e JavaScript** nel browser, senza installare niente.
- **MediaPipe Gesture Recognizer** (Google, open source): riconosce i gesti
  direttamente nel browser, il video della webcam non viene inviato a nessun server.
- **Web Speech API** di Chrome: riconoscimento vocale in italiano.
- **GitHub Pages**: pubblica la demo online con indirizzo `https://`.

## Regolare i gesti
In cima a `gesti.js`:

- `SICUREZZA_MINIMA` (da 0 a 1): più è alta, meno falsi allarmi ma serve un gesto più chiaro.
- `tenere`: per quanti millisecondi va tenuto il gesto prima di far partire il segnale.

## Prima della presentazione
- [ ] Demo provata dal link sul computer della presentazione
- [ ] Gesti provati con la luce della sala
- [ ] Permessi di fotocamera e microfono già concessi in Chrome
- [ ] Volume del computer alto (sirena e voce)
- [ ] Hotspot del telefono pronto se il Wi-Fi della sala non funziona
- [ ] Video di riserva della demo registrato
