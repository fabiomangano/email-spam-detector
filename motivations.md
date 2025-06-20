 1. Giustificazione rispetto allo stato dell’arte
Puoi dire che il tuo lavoro nasce dall’osservazione dei limiti attuali dei sistemi antispam esistenti:

✅ Punti di forza dello stato dell’arte:
Sistemi come SpamAssassin usano regole, euristiche e punteggi combinati (rule-based + bayesiani).

I filtri dei provider come Gmail integrano analisi comportamentale, reputation analysis, e LLM proprietari.

Alcuni moderni strumenti open source (es. Rspamd, MailScanner) fanno uso di score combinati e moduli modulari.

❌ Limiti identificabili:
Opacità e chiusura dei provider commerciali: l’utente non ha visibilità né possibilità di estendere i filtri.

SpamAssassin è datato, basato su regole testuali poco efficaci con spam moderno in HTML, immagini o LLM-generated.

Difficoltà nel debugging e nella personalizzazione dei falsi positivi/negativi.

Pochi sistemi permettono di sperimentare su dataset personalizzati o integrare analisi moderne (LLM, NLP, reputation, behavior).

💡 2. Apporto originale della tua tesi
Puoi posizionare il tuo lavoro come un framework modulare e trasparente per l’analisi spam:

🎯 Approccio proposto:
Pipeline multilivello ispirata al funzionamento dei provider reali, ma completamente open e componibile.

Analisi strutturata e indipendente dei layer:

📄 Parsing MIME (corretto supporto HTML, allegati, encoding)

🧠 Analisi NLP e metriche (body length, uppercase ratio, numLinks, ecc.)

🔒 Reputazione tecnica (header Received, X-Mailer, SPF/DKIM se disponibili)

👤 Comportamento utente (pattern di interazione)

🤖 Layer LLM + regole logiche per valutazioni finali spiegabili

API NestJS RESTful per test, tuning e analisi in tempo reale o batch.

Possibilità di training supervisionato o manuale, integrabile con dataset pubblici (SpamAssassin, Enron, TREC, etc.)

🔍 Vantaggi rispetto allo stato dell’arte:
Maggiore trasparenza e modularità.

Controllo completo su ogni fase dell’analisi.

Personalizzabilità e tracciabilità delle decisioni.

Facilità di test e tuning su dataset controllati.

Possibilità di evolvere il sistema con nuove metriche, modelli o regole.

📌 Esempio di frase per la tesi:
“Rispetto allo stato dell’arte, che include sistemi consolidati ma spesso opachi o poco flessibili come SpamAssassin o i filtri dei provider di posta, il progetto propone un’architettura antispam modulare e trasparente, pensata per sperimentare strategie multilayered basate su parsing MIME, metriche NLP, reputazione tecnica e analisi LLM. Questo approccio permette un’alta personalizzazione, tracciabilità delle decisioni e flessibilità nell’adattarsi all’evoluzione delle tecniche di spam.”

Se vuoi, posso aiutarti a scrivere una sezione "Confronto con lo stato dell’arte" per la tua tesi. Vuoi una bozza?