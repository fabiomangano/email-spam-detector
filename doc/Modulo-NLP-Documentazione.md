# Documentazione Modulo NLP - Email Spam Detector

## Indice
1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Componenti Principali](#componenti-principali)
4. [Interfacce e Tipi](#interfacce-e-tipi)
5. [Funzionalità](#funzionalità)
6. [Algoritmi Implementati](#algoritmi-implementati)
7. [API Endpoints](#api-endpoints)
8. [Configurazione](#configurazione)
9. [Esempio di Utilizzo](#esempio-di-utilizzo)
10. [Limitazioni e Considerazioni](#limitazioni-e-considerazioni)

## Panoramica

Il modulo NLP (Natural Language Processing) è un componente fondamentale dell'Email Spam Detector che si occupa dell'analisi testuale avanzata delle email per identificare contenuti spam attraverso tecniche di elaborazione del linguaggio naturale.

### Obiettivi Principali
- **Classificazione del testo**: Identificare se un'email è spam o legittima
- **Analisi del sentiment**: Determinare il tono emotivo del contenuto
- **Estrazione di parole chiave**: Identificare i termini più rilevanti
- **Rilevamento della lingua**: Identificare automaticamente la lingua del testo
- **Analisi della tossicità**: Valutare il livello di aggressività del contenuto
- **Estrazione di topic**: Categorizzare il contenuto per argomenti

## Architettura

Il modulo NLP è strutturato secondo il pattern architetturale di NestJS:

```
src/modules/nlp/
├── nlp.module.ts       # Modulo principale NestJS
├── nlp.controller.ts   # Controller REST API
├── nlp.service.ts      # Logica di business e algoritmi NLP
├── nlp.controller.spec.ts  # Test del controller
└── nlp.service.spec.ts     # Test del service
```

### Dipendenze Esterne
- **Natural**: Libreria per NLP in JavaScript con algoritmi TF-IDF, tokenizzazione e classificazione Bayesiana
- **ConfigModule**: Per la gestione della configurazione delle parole spam

## Componenti Principali

### 1. NlpModule (`nlp.module.ts`)
**Percorso**: `backend/src/modules/nlp/nlp.module.ts:6-11`

Modulo NestJS che configura e esporta il servizio NLP:
- Importa il `ConfigModule` per accedere alle configurazioni
- Registra `NlpController` e `NlpService`
- Esporta `NlpService` per l'uso in altri moduli

### 2. NlpController (`nlp.controller.ts`)
**Percorso**: `backend/src/modules/nlp/nlp.controller.ts:5-17`

Controller REST che espone l'endpoint per l'analisi NLP:
- Endpoint: `GET /nlp/:filename`
- Gestisce le richieste HTTP e la serializzazione delle risposte
- Implementa error handling per le eccezioni

### 3. NlpService (`nlp.service.ts`)
**Percorso**: `backend/src/modules/nlp/nlp.service.ts:9-488`

Servizio principale che implementa tutti gli algoritmi NLP:
- Gestisce la classificazione Bayesiana
- Implementa algoritmi di preprocessing del testo
- Calcola metriche TF-IDF
- Analizza sentiment, lingua e tossicità

## Interfacce e Tipi

### NlpAnalysisResult
**Percorso**: `backend/src/utils/types.ts:96-121`

Interfaccia principale che definisce il risultato dell'analisi NLP:

```typescript
interface NlpAnalysisResult {
  tokens: string[];                    // Token preprocessati
  tfidfVector: number[];              // Vettore TF-IDF
  nlpMetrics: {                       // Metriche calcolate
    numSpammyWords: number;
    spamWordRatio: number;
    allCapsCount: number;
    exclamationCount: number;
    tokens: string[];
  };
  prediction: string;                 // Classificazione (spam/ham)
  sentiment: {                        // Analisi sentiment
    score: number;                    // [-1, 1]
    label: string;                    // positive/negative/neutral
  };
  keywords: string[];                 // Top 10 parole chiave
  topics: string[];                   // Argomenti identificati
  language: {                         // Rilevamento lingua
    detected: string;                 // Codice lingua (en/it/es/fr)
    confidence: number;               // Confidenza [0, 1]
  };
  toxicity: {                         // Analisi tossicità
    score: number;                    // Punteggio [0, 1]
    categories: string[];             // Categorie di tossicità
  };
}
```

## Funzionalità

### 1. Preprocessing del Testo
**Metodo**: `preprocessText()` (`backend/src/modules/nlp/nlp.service.ts:94-100`)

Pipeline di preprocessing che include:
1. **Normalizzazione**: Conversione in minuscolo
2. **Pulizia**: Rimozione caratteri non alfanumerici
3. **Tokenizzazione**: Suddivisione in parole utilizzando `WordTokenizer`
4. **Rimozione stopwords**: Filtro delle parole comuni
5. **Stemming**: Riduzione alle radici con `PorterStemmer`

### 2. Calcolo Metriche NLP
**Metodo**: `calculateNlpMetrics()` (`backend/src/modules/nlp/nlp.service.ts:102-121`)

Calcola metriche specifiche per la rilevazione spam:
- **Conteggio parole spam**: Numero di parole nella lista spam
- **Rapporto parole spam**: Percentuale di parole spam sul totale
- **Conteggio maiuscole**: Sequenze di 3+ caratteri maiuscoli
- **Conteggio esclamazioni**: Numero di punti esclamativi

### 3. Analisi TF-IDF
**Metodi**: `calculateTfIdf()`, `calculateTfIdfWithInstance()` (`backend/src/modules/nlp/nlp.service.ts:123-142`)

Implementa l'algoritmo Term Frequency-Inverse Document Frequency:
- Utilizza istanze fresche di `TfIdf` per evitare contaminazione del corpus
- Calcola vettori di features numeriche per ogni token
- Supporta analisi su documenti singoli

### 4. Classificazione Bayesiana
**Metodi**: `classifyText()`, `loadModel()` (`backend/src/modules/nlp/nlp.service.ts:144-167`)

Sistema di classificazione basato su Naive Bayes:
- Carica modello pre-addestrato da `model/classifier.json`
- Fallback graceful se il modello non è disponibile
- Supporta classificazione binaria spam/ham

### 5. Analisi del Sentiment
**Metodo**: `calculateSentiment()` (`backend/src/modules/nlp/nlp.service.ts:169-238`)

Algoritmo proprietario per l'analisi del sentiment:
- **Dizionari emozionali**: Liste di parole positive e negative
- **Punteggio base**: Bilanciamento tra parole positive e negative
- **Correzioni contestuali**: Aggiustamenti basati su indicatori spam
- **Normalizzazione**: Punteggio finale nell'intervallo [-1, 1]

### 6. Estrazione Parole Chiave
**Metodo**: `extractKeywords()` (`backend/src/modules/nlp/nlp.service.ts:240-257`)

Estrae le parole più significative:
- Calcola frequenze dei token
- Filtra token troppo corti (< 3 caratteri)
- Ordina per frequenza decrescente
- Restituisce top 10 parole chiave uniche

### 7. Rilevamento Lingua
**Metodo**: `detectLanguage()` (`backend/src/modules/nlp/nlp.service.ts:259-385`)

Sistema di rilevamento lingua basato su pattern:
- **Dizionari multilingue**: Inglese, Italiano, Spagnolo, Francese
- **Matching statistico**: Conta occorrenze di parole comuni
- **Calcolo confidenza**: Scala i punteggi per la confidenza finale
- **Supporto lingue**: EN, IT, ES, FR

### 8. Estrazione Topic
**Metodo**: `extractTopics()` (`backend/src/modules/nlp/nlp.service.ts:387-443`)

Categorizzazione automatica del contenuto:
- **Topic predefiniti**: Finance, Health, Technology, Marketing, Social
- **Matching keywords**: Associazione parole chiave → argomenti
- **Classificazione primaria**: Spam vs Legitimate
- **Limite risultati**: Massimo 3 topic per email

### 9. Analisi Tossicità
**Metodi**: `calculateToxicity()`, `getToxicityCategories()` (`backend/src/modules/nlp/nlp.service.ts:445-487`)

Valutazione del livello di aggressività:
- **Fattori di tossicità**:
  - Rapporto parole spam (peso 0.4)
  - Sentiment negativo (peso 0.3)
  - Eccesso maiuscole (max 0.2)
  - Eccesso esclamazioni (max 0.1)
- **Categorie**: high-toxicity, spam-content, aggressive-language, excessive-punctuation

## Algoritmi Implementati

### 1. TF-IDF (Term Frequency-Inverse Document Frequency)
**Utilizzo**: Calcolo dell'importanza dei termini
- **TF**: Frequenza del termine nel documento
- **IDF**: Logaritmo inverso della frequenza nei documenti
- **Vettorizzazione**: Rappresentazione numerica del testo

### 2. Naive Bayes Classifier
**Utilizzo**: Classificazione binaria spam/ham
- **Probabilità condizionale**: P(classe|features)
- **Assunzione di indipendenza**: Features indipendenti
- **Addestramento**: Su dataset pre-processato

### 3. Porter Stemmer
**Utilizzo**: Riduzione morfologica
- **Rimozione suffissi**: Algoritmo deterministico
- **Normalizzazione**: Riduzione varianti morfologiche
- **Lingua**: Ottimizzato per inglese

### 4. Word Tokenizer
**Utilizzo**: Segmentazione testuale
- **Separatori**: Spazi e punteggiatura
- **Pulizia**: Rimozione caratteri speciali
- **Normalizzazione**: Conversione case

## API Endpoints

### GET /nlp/:filename
**Controller**: `NlpController.analyzeNlp()` (`backend/src/modules/nlp/nlp.controller.ts:9-17`)

Endpoint per l'analisi NLP di un'email:

**Parametri**:
- `filename`: Nome del file email da analizzare

**Risposta**:
```json
{
  "tokens": ["token1", "token2", ...],
  "tfidfVector": [0.1, 0.2, ...],
  "nlpMetrics": {
    "numSpammyWords": 5,
    "spamWordRatio": 0.1,
    "allCapsCount": 2,
    "exclamationCount": 3,
    "tokens": ["processed", "tokens"]
  },
  "prediction": "spam",
  "sentiment": {
    "score": -0.3,
    "label": "negative"
  },
  "keywords": ["keyword1", "keyword2"],
  "topics": ["spam", "finance"],
  "language": {
    "detected": "en",
    "confidence": 0.85
  },
  "toxicity": {
    "score": 0.7,
    "categories": ["high-toxicity", "spam-content"]
  }
}
```

**Gestione Errori**:
- Status 400 per errori di elaborazione
- Messaggio di errore dettagliato nella risposta

## Configurazione

### Parole Spam
**File**: `backend/src/utils/constants.ts:31-138`

Lista estensiva di 108 parole e frasi spam comuni:
- **Categorie**: Finanziarie, Mediche, Marketing, Urgenza
- **Linguaggio**: Prevalentemente inglese
- **Utilizzo**: Calcolo metriche spam word ratio

### Stopwords
**File**: `backend/src/utils/constants.ts:2-28`

Lista di 26 stopwords inglesi per il preprocessing:
- **Articoli**: a, an, the
- **Congiunzioni**: and, or, but
- **Preposizioni**: in, on, at, by, with
- **Altri**: because, so, of, for

### Percorso Modello
**Costante**: `MODEL_PATH = 'model/classifier.json'` (`backend/src/utils/constants.ts:141`)

### Configurazione Servizio
Il servizio accede alla configurazione tramite `ConfigService`:
- **Parole spam**: `config.keywords.spam`
- **Configurazioni dinamiche**: Caricamento runtime

## Esempio di Utilizzo

### 1. Analisi Completa
```typescript
// Istanza del servizio
const nlpService = new NlpService(configService);

// Dati email parseati
const parsedData = {
  plainText: "Free money! Click now to win big prizes!",
  htmlText: "<h1>FREE MONEY!</h1><p>Click now!</p>",
  metadata: {
    subject: "URGENT: You've won $1000!"
  }
};

// Esecuzione analisi
const result = await nlpService.analyzeNlp(parsedData);

// Risultato
console.log(result.prediction);     // "spam"
console.log(result.sentiment.label); // "negative"
console.log(result.toxicity.score);  // 0.8
console.log(result.keywords);        // ["free", "money", "click", "win", "prize"]
```

### 2. Integrazione con Pipeline
```typescript
// Nel PipelineService
const nlpResult = await this.nlpService.analyzeNlp(parsedEmail);
const technicalResult = await this.technicalService.analyzeTechnical(parsedEmail);

// Combinazione risultati
const finalScore = (nlpResult.prediction === 'spam' ? 0.7 : 0.3) * 0.5 +
                   technicalResult.spamScore * 0.5;
```

## Limitazioni e Considerazioni

### 1. Prestazioni
- **Modello Bayesiano**: Caricamento una tantum in memoria
- **TF-IDF**: Calcolo per ogni analisi
- **Preprocessing**: Elaborazione lineare O(n)

### 2. Accuratezza
- **Lingua**: Ottimizzato per inglese, supporto limitato per altre lingue
- **Contesto**: Analisi basata su pattern statistici, non semantica
- **Evoluzione spam**: Necessita aggiornamento periodico del modello

### 3. Configurazione
- **Dizionari**: Parole spam statiche, possibile obsolescenza
- **Soglie**: Valori fissi per sentiment e tossicità
- **Modello**: Dipendenza da file esterno per classificazione

### 4. Robustezza
- **Graceful degradation**: Fallback se modello non disponibile
- **Error handling**: Gestione eccezioni nelle operazioni NLP
- **Input validation**: Preprocessi input malformati

### 5. Sicurezza
- **Modello serializzato**: Caricamento da file JSON (rischio injection)
- **Input sanitization**: Pulizia caratteri speciali
- **Memoria**: Gestione istanze TF-IDF per evitare memory leak

### 6. Scalabilità
- **Stato condiviso**: Classificatore Bayesiano singleton
- **Concorrenza**: Thread-safe per operazioni di sola lettura
- **Cache**: Possibile implementazione caching per migliorare performance

### 7. Manutenibilità
- **Aggiornamento modelli**: Processo manuale di riaddestramento
- **Configurazione**: Hardcoded constants vs configuration dinamica
- **Monitoring**: Necessità di metriche di accuracy in produzione