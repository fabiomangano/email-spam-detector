# 📁 Fonti
## 📂 Cartella drive
## 📂 Progetto spam-filter
## 📂 SpamAssassin
## 📓 Quaderno (V)

<br><br>

# ✅ Requisiti

---

## 🖥️ Frontend  
> _NTH = Nice to Have_

### 🧱 App Shell
- Implementare logo  
- Implementare menù di navigazione

### 📤 Pagina Upload
- Implementare form di caricamento testo  
- Implementare form di caricamento file  
- Implementare form di caricamento dati  
- Implementare form caricamento interazione utente  
- Implementare note utente  

### 📈 Pagina Risultato
- Implementare tabs o stepper  
- Implementare sezione risultati modulo parsing  
- Implementare sezione risultati modulo tecnico  
- Implementare sezione risultati modulo comportamentale  
- Implementare sezione risultati modulo NLP  
- Implementare sezione risultati modulo LLM  
- Implementare sezione modulo rischio  
- Implementare feedback manuale _(NTH)_

### ⚙️ Pagina Settings
- Implementare form per i settings

### 📖 Pagina Guida

---

## 🧠 Backend

### 🔐 Login _(NTH)_
- Sistema di login  
- Sincronizzazione con provider email  

### 🧪 Modulo Training Modello
- Pipeline per il training del modello  
- Riaddestramento su feedback utente (training incrementale)  

### ✉️ Modulo Parsing
- Gestione caricamento e parsing `.eml`, `.txt`, `.msg`  

#### 📥 Input Formati Supportati
- `.msg`  
- `.eml`  
- `.mime`

---

## 🛠️ Obiettivo Parsing

Lo **step 1** ha il compito di trasformare l’e-mail in input in una struttura JSON uniforme e facilmente analizzabile, estraendo corpo e metadati rilevanti per i successivi moduli della pipeline.

---

## 🔍 Output del Parsing

### ✉️ Headers

| Campo           | Descrizione                                                              |
|-----------------|---------------------------------------------------------------------------|
| `from`          | Mittente dichiarato                                                       |
| `return_path`   | Indirizzo di ritorno per bounce email                                     |
| `received`      | Catena di server attraversati (analisi IP)                                |
| `spf_result`    | Esito autenticazione SPF (`pass`, `fail`, ecc.)                           |
| `dkim_result`   | Esito verifica DKIM                                                       |
| `dmarc_result`  | Esito verifica DMARC                                                      |
| `ip_sender`     | IP del mittente reale (estratto da header `Received`)                     |
| `user-agent`    | Informazioni sul client mittente                                          |

📌 **Utilità**: autenticazione mittente, tracciamento origine reale, verifica path SMTP

---

### 📄 Corpo del Messaggio

| Campo         | Descrizione                                       |
|---------------|---------------------------------------------------|
| `text_plain`  | Corpo in `text/plain`                             |
| `text_html`   | Corpo in `text/html`                              |
| `mime_type`   | Tipo MIME complessivo (es. `multipart/alternative`)|

---

### 📊 Metadati Estratti

| Campo                | Descrizione                                                   |
|----------------------|---------------------------------------------------------------|
| `text_length`        | Lunghezza del testo `plain`                                   |
| `html_length`        | Lunghezza del testo `html`                                    |
| `num_links`          | Numero totale di link presenti (`http/https`)                 |
| `link_ratio`         | Rapporto link/testo normalizzato                              |
| `num_images`         | Numero immagini nel contenuto HTML                            |
| `num_attachments`    | Numero totale di allegati                                     |
| `has_tracking_pixel` | Presenza di pixel di tracciamento (1x1, opacity: 0, ecc.)     |

---

### 🧪 Esempio di Output JSON

```json
{
  "from": "conferma-spedizione@amazon.it",
  "return_path": "bounces.amazon.it",
  "spf_result": "pass",
  "dkim_result": "pass",
  "dmarc_result": "pass",
  "ip_sender": "54.240.1.76",
  "num_links": 8,
  "link_ratio": 0.75,
  "num_images": 3,
  "num_attachments": 0,
  "has_tracking_pixel": true,
  "text_plain": "Your package was dispatched!...",
  "text_html": "<html>...</html>",
  "mime_type": "multipart/alternative"
}
```

---

### 🧰 Modulo Tecnico

- Recupero blacklist domini e persistenza  
- Job per il recupero automatico  

#### 📈 Metriche Tecniche

| Metrica             | Tipo       | Descrizione                                                | Perché è utile                                                                 |
|---------------------|------------|------------------------------------------------------------|---------------------------------------------------------------------------------|
| `bodyLength`        | number     | Lunghezza totale `plainText` + `htmlText`                  | Spam molto corte (scam) o insolitamente lunghe (obfuscation)                   |
| `numLinks`          | number     | Numero di link presenti                                    | Più link = più sospetto                                                        |
| `linkRatio`         | number     | Rapporto `numLinks / bodyLength`                           | Misura densità sospetta dei link                                               |
| `numImages`         | number     | Numero di immagini nel contenuto HTML                      | Molte immagini e poco testo → spam pubblicitario/scam                          |
| `hasTrackingPixel`  | boolean    | Presenza di pixel di tracking                              | Tipico di spam marketing o phishing                                            |
| `hasAttachments`    | boolean    | Se l’email contiene allegati                               | Comune in spam/malware                                                         |
| `numAttachments`    | number     | Numero totale di allegati                                  | Anomalie con troppi allegati                                                   |
| `attachmentTypes`   | string[]   | Tipi MIME degli allegati (`pdf`, `exe`, `zip`, ecc.)       | Eseguibili o script sono spesso pericolosi                                     |

---

## 🔐 Metriche Tecniche (Header)

| Metrica         | Tipo     | Descrizione                                                   | Perché è utile                                      |
|-----------------|----------|---------------------------------------------------------------|-----------------------------------------------------|
| `spfResult`     | string   | Valore SPF da `Authentication-Results`                        | SPF fail → spoofing                                 |
| `dkimResult`    | string   | Valore DKIM                                                   | Firma del contenuto fallita → contenuto falsificato |
| `dmarcResult`   | string   | Valore DMARC                                                  | Fallimento policy → messaggio sospetto              |
| `ipSender`      | string   | IP da header `Received:`                                      | Reputazione IP, blacklist, geolocalizzazione        |

---

## ⚠️ Metriche Aggiuntive

| Metrica                  | Tipo     | Descrizione                                          | Perché è utile                                      |
|--------------------------|----------|------------------------------------------------------|-----------------------------------------------------|
| `isHtmlOnly`             | boolean  | Solo HTML, senza plain text                          | Tecnica usata per nascondere contenuto reale        |
| `numDomains`             | number   | Numero domini diversi nei link                       | Tanti domini = scam multi-target                    |
| `replyToDiffersFromFrom`| boolean  | `Reply-To` diverso da `From`                         | Tecnica comune nel phishing                         |

---

### 🧾 Interfaccia TypeScript

```ts
interface EmailTechnicalMetrics {
  bodyLength: number;
  numLinks: number;
  linkRatio: number;
  numImages: number;
  hasTrackingPixel: boolean;
  hasAttachments: boolean;
  numAttachments: number;
  attachmentTypes: string[];
  spfResult?: string;
  dkimResult?: string;
  dmarcResult?: string;
  ipSender?: string;
}
```

---

### 🧠 Modulo NLP

_(In sviluppo)_

---

### 🧠 Modulo Comportamentale

_(In sviluppo)_

---

### 🤖 Modulo LLM

- Implementare MCP (Model Context Protocol) _(NTH)_  
- Integrazione con LLM cloud (es. OpenAI, Claude, ecc.)

---

### ⚙️ Gestione Settings

- Customizzazione prompt  
- Customizzazione parametri  
- Scelta provider LLM  
- Intervallo sincronizzazione blacklist  

---

### 📌 Modulo Risultato

- Algoritmo di decisione (pesato o classificatore)  
- Generazione PDF _(NTH)_

---

### 📄 Sistema Logging

- Sistema di logging minimale

---

## 📊 Confronto: Mio vs SpamAssassin

### 🔍 LLM

_(Da approfondire)_

### 🔧 Altri punti...

_(Da definire)_
