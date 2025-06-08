# 📦 NestJS Spam Detection Pipeline

Questo progetto implementa una pipeline per il rilevamento dello spam nelle email, composta da moduli indipendenti e orchestrata tramite BullMQ.  
Ogni modulo può essere richiamato singolarmente tramite API REST oppure eseguito come parte della pipeline asincrona.

---

## 📁 Struttura del progetto

```text
src/
├── app.controller.ts
├── app.module.ts

├── config/                     # Configurazione app (JSON)
│   ├── config.controller.ts
│   └── config.service.ts

├── email-upload/              # Upload file email
│   ├── upload.controller.ts
│   └── storage/               # Directory per i file caricati

├── pipeline/                  # Orchestrazione pipeline asincrona
│   ├── pipeline.controller.ts
│   ├── pipeline.processor.ts
│   └── pipeline.service.ts

├── modules/                   # Moduli riutilizzabili della pipeline
│   ├── parsing/
│   │   ├── parsing.controller.ts
│   │   └── parsing.service.ts
│   ├── technical/
│   │   ├── technical.controller.ts
│   │   └── technical.service.ts
│   ├── nlp/
│   │   ├── nlp.controller.ts
│   │   └── nlp.service.ts
│   ├── behavior/
│   │   ├── behavior.controller.ts
│   │   └── behavior.service.ts
│   ├── llm/
│   │   ├── llm.controller.ts
│   │   └── llm.service.ts
│   └── result/
│       ├── result.controller.ts
│       └── result.service.ts



---

## 🔌 API disponibili

| Metodo | Endpoint       | Descrizione                               |
|--------|----------------|-------------------------------------------|
| POST   | `/upload`      | Upload di file `.eml`, `.msg`, `.txt`     |
| POST   | `/parse`       | Parsing MIME                              |
| POST   | `/technical`   | Modulo reputazione tecnica                |
| POST   | `/nlp`         | Analisi NLP                               |
| POST   | `/behavior`    | Analisi comportamento                     |
| POST   | `/llm`         | Analisi con LLM                           |
| POST   | `/result`      | Decisione finale aggregata                |
| POST   | `/detect-spam` | Avvia la pipeline completa via BullMQ     |
| GET    | `/status/:id`  | Polling dello stato della pipeline        |
| GET    | `/config`      | Ottieni la configurazione dell'app (JSON) |
| PUT    | `/config`      | Aggiorna la configurazione (JSON)         |

---

## ⚙️ Dettagli tecnici

- **Upload**: i file vengono salvati in una directory locale (`email-upload/storage`)
- **Pipeline**: orchestrata da `PipelineService`, eseguita tramite BullMQ (Redis)
- **Modularità**: ogni modulo è isolato, riutilizzabile e testabile singolarmente
- **Configurazione**: salvata come file JSON, modificabile via API

---

## 🚀 Obiettivi futuri

- Validazione MIME e struttura file in fase di upload
- Logging avanzato con tracciamento step-by-step
- UI React per visualizzare parsing e output pipeline
- Persistenza su DB dei job completati e degli analytics

---

## 👤 Autore

Progetto sviluppato da **Fabio Mangano**  
Tesi magistrale in Informatica – Università degli Studi di Catania
