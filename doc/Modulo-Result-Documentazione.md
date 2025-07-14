# Documentazione Modulo Result - Email Spam Detector

## Indice
1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Componenti Principali](#componenti-principali)
4. [Interfacce e Tipi](#interfacce-e-tipi)
5. [Funzionalità](#funzionalità)
6. [Algoritmi di Scoring](#algoritmi-di-scoring)
7. [Sistema di Decisione](#sistema-di-decisione)
8. [API Endpoints](#api-endpoints)
9. [Configurazione](#configurazione)
10. [Esempio di Utilizzo](#esempio-di-utilizzo)
11. [Limitazioni e Considerazioni](#limitazioni-e-considerazioni)

## Panoramica

Il modulo Result è il componente finale dell'Email Spam Detector che aggrega e processa i risultati di tutti gli altri moduli di analisi (Technical, NLP, Behavioral) per produrre una valutazione finale di spam/ham con scoring, livello di rischio e raccomandazioni.

### Obiettivi Principali
- **Aggregazione Risultati**: Combinare output di tutti i moduli di analisi
- **Scoring Multi-dimensionale**: Calcolare punteggi tecnici, NLP e comportamentali
- **Decisione Finale**: Determinare se un'email è spam o legittima
- **Valutazione Rischio**: Classificare il livello di rischio (low/medium/high)
- **Generazione Raccomandazioni**: Fornire consigli di sicurezza specifici
- **Normalizzazione Punteggi**: Convertire punteggi grezzi in percentuali comprensibili

## Architettura

Il modulo Result è strutturato secondo il pattern architetturale di NestJS:

```
src/modules/result/
├── result.module.ts           # Modulo principale NestJS
├── result.controller.ts       # Controller REST API
├── result.service.ts          # Logica di business e algoritmi di scoring
├── result.controller.spec.ts  # Test del controller
└── result.service.spec.ts     # Test del service
```

### Dipendenze
- **ConfigModule**: Per accesso alle configurazioni di scoring e soglie
- **Types Module**: Per le interfacce dei risultati di analisi
- **Behavioral Service**: Per le interfacce dei risultati comportamentali

## Componenti Principali

### 1. ResultModule (`result.module.ts`)
**Percorso**: `backend/src/modules/result/result.module.ts:6-11`

Modulo NestJS che configura e esporta il servizio Result:
- Importa il `ConfigModule` per accedere alle configurazioni di scoring
- Registra `ResultController` e `ResultService`
- Esporta `ResultService` per l'uso nel pipeline principale

### 2. ResultController (`result.controller.ts`)
**Percorso**: `backend/src/modules/result/result.controller.ts:5-89`

Controller REST che espone endpoint di test:
- Endpoint: `GET /result/test`
- Fornisce un endpoint di test con dati mock per tutti i moduli
- Implementa error handling completo
- Utile per verificare il funzionamento del sistema di scoring

### 3. ResultService (`result.service.ts`)
**Percorso**: `backend/src/modules/result/result.service.ts:11-438`

Servizio principale che implementa tutta la logica di scoring e decisione:
- Metodo principale `generateResult()` per aggregare tutti i risultati
- Algoritmi di scoring specializzati per ogni modulo
- Sistema di decisione pesata configurable
- Generazione automatica di summary e raccomandazioni

## Interfacce e Tipi

### SpamAnalysisResult
**Percorso**: `backend/src/utils/types.ts:131-149`

Interfaccia principale che definisce il risultato finale dell'analisi:

```typescript
interface SpamAnalysisResult {
  overallScore: number;                    // Punteggio finale [0, 1]
  riskLevel: 'low' | 'medium' | 'high';   // Livello di rischio
  summary: string;                         // Riassunto della valutazione
  details: {                               // Dettagli delle analisi
    technical: EmailTechnicalMetrics;
    nlp: NlpAnalysisResult;
    behavioral?: BehavioralAnalysisResult;
  };
  recommendations: string[];               // Raccomandazioni di sicurezza
  scores: {                               // Punteggi dettagliati
    technicalScore: number;               // Punteggio tecnico grezzo
    nlpScore: number;                     // Punteggio NLP grezzo
    behavioralScore?: number;             // Punteggio comportamentale grezzo
    technicalPercentage: number;         // Percentuale tecnica
    nlpPercentage: number;                // Percentuale NLP
    behavioralPercentage?: number;        // Percentuale comportamentale
  };
}
```

### DecisionMetrics
**Percorso**: `backend/src/utils/types.ts:123-129`

Interfaccia per le metriche di decisione intermediate:

```typescript
interface DecisionMetrics {
  techScore: number;        // Punteggio tecnico calcolato
  nlpScore: number;         // Punteggio NLP calcolato
  behavioralScore?: number; // Punteggio comportamentale
  finalScore: number;       // Punteggio finale pesato
  finalPrediction: string;  // Predizione finale (spam/ham)
}
```

### BehavioralAnalysisResult
**Percorso**: `backend/src/modules/behavioral/behavioral.service.ts:19-34`

Interfaccia per i risultati dell'analisi comportamentale:

```typescript
interface BehavioralAnalysisResult {
  from: string;                      // Email del mittente
  isNewSender: boolean;              // Primo invio da questo mittente
  emailCountLast24h: number;         // Conteggio email ultime 24h
  emailCountLast7d: number;          // Conteggio email ultimi 7 giorni
  burstRatio: number;                // Rapporto di burst sending
  avgRecipients: number;             // Media destinatari per email
  hourOfDay: number;                 // Ora dell'invio
  dayOfWeek: string;                 // Giorno della settimana
  contentSimilarityRate: number;     // Tasso similarità contenuto
  subjectChangeRate: number;         // Tasso cambiamento subject
  reputationScore: number;           // Punteggio reputazione
  firstSeenDate?: string;            // Prima data di contatto
  timeAnomalyScore: number;          // Punteggio anomalia temporale
  massMailingIndicator: boolean;     // Indicatore di mass mailing
}
```

## Funzionalità

### 1. Generazione Risultato Principale
**Metodo**: `generateResult()` (`backend/src/modules/result/result.service.ts:14-51`)

Funzione principale che orchestrar tutto il processo:
1. **Calcolo punteggi**: Invoca i metodi di scoring per ogni modulo
2. **Normalizzazione**: Converte il punteggio finale su scala 0-1
3. **Determinazione rischio**: Classifica il livello di rischio
4. **Aggregazione dati**: Combina tutti i risultati in un'unica struttura
5. **Generazione output**: Produce summary e raccomandazioni

### 2. Calcolo Punteggio Tecnico
**Metodo**: `calculateTechnicalScore()` (`backend/src/modules/result/result.service.ts:53-201`)

Algoritmo complesso che valuta 60+ metriche tecniche:

#### Categorie di Metriche Analizzate:
- **Metriche Base**: Link ratio, domini, tracking pixel, allegati
- **Autenticazione Email**: SPF, DKIM, DMARC
- **Metriche Header**: Received headers, date header, mail client
- **Metriche Mittente**: Nome sospetto, dominio disposable, destinatari multipli
- **Metriche Campagna**: Identificatori campagna, feedback loop
- **Metriche Testuali**: Maiuscole, esclamazioni, urgency words
- **Offuscamento**: Testo offuscato, URL accorciati, link encodati
- **Metriche MIME**: Content types misti, multipart nested
- **Rilevazione Spam**: Promesse finanziarie, porte non standard
- **Metriche Legittime**: Domini fidati, eventi, newsletter

#### Sistema di Penalità e Bonus:
```typescript
// Esempio di calcolo penalità
if (metrics.linkRatio > thresholds.links.highRatio)
  score += penalties.links.highRatio;

// Esempio di bonus legittimità
if (metrics.isFromTrustedDomain) {
  legitimacyBonus += 6; // Forte riduzione per domini fidati
}

// Super bonus per pattern spam evidenti
if (spamIndicators >= 3) score += 6; // Clear spam pattern
```

### 3. Calcolo Punteggio NLP
**Metodo**: `calculateNlpScore()` (`backend/src/modules/result/result.service.ts:203-261`)

Valutazione basata sull'analisi del linguaggio naturale:

#### Fattori di Scoring:
- **Parole Spam**: Penalità basata sul rapporto di parole spam
- **Predizione Modello**: Bonus significativo per predizione "spam"
- **Tossicità**: Penalità per contenuto tossico
- **Sentiment**: Penalità per sentiment molto negativo
- **Riduzione Legittimità**: Attenuazione per email da fonti fidate

#### Logica di Riduzione:
```typescript
// Riduzione per email legittime
if (legitimacyDetected) {
  score += 2; // Molto ridotto invece di 10
} else {
  score += 10; // Base bonus for spam prediction
}
```

### 4. Calcolo Punteggio Comportamentale
**Metodo**: `calculateBehavioralScore()` (`backend/src/modules/result/result.service.ts:263-349`)

Analisi del comportamento del mittente nel tempo:

#### Fattori Comportamentali (0-10 punti totali):
- **Nuovo Mittente**: +2 punti se primo invio
- **Volume Alto**: +2/+3/+4 punti per >10/20/50 email/24h
- **Burst Ratio**: +1/+2/+3 punti per ratio >3/5/10
- **Similarità Contenuto**: +1/+2/+3 punti per >50%/70%/90%
- **Anomalia Temporale**: +1/+2 punti per orari insoliti
- **Cambiamento Subject**: +1/+2 punti per alta variazione
- **Mass Mailing**: +2 punti se rilevato
- **Bassa Reputazione**: +1/+2/+3 punti per <0.6/0.4/0.2

### 5. Sistema di Decisione Pesata
**Metodo**: `calculateResult()` (`backend/src/modules/result/result.service.ts:351-397`)

Aggregazione finale con pesi configurabili:

#### Formula di Calcolo:
```typescript
const finalScore = techScore * weights.technical + 
                   nlpScore * weights.nlp + 
                   behavioralScore * weights.behavioral;

// Pesi default: technical=0.6, nlp=0.25, behavioral=0.15
```

#### Soglia di Decisione:
```typescript
const isSpam = finalScore > 8; // Soglia bilanciata
```

### 6. Determinazione Livello di Rischio
**Metodo**: `determineRiskLevel()` (`backend/src/modules/result/result.service.ts:399-409`)

Classificazione basata su soglie configurabili:
- **Low**: score < 0.3
- **Medium**: 0.3 ≤ score < 0.7  
- **High**: score ≥ 0.7

### 7. Generazione Summary Automatica
**Metodo**: `generateSummary()` (`backend/src/modules/result/result.service.ts:411-420`)

Descrizioni automatiche basate sul livello di rischio:
- **Low**: "Email appears to be legitimate with low spam indicators"
- **Medium**: "Email shows some suspicious characteristics, exercise caution"
- **High**: "Email has high spam/phishing indicators, handle with extreme caution"

### 8. Generazione Raccomandazioni
**Metodo**: `generateRecommendations()` (`backend/src/modules/result/result.service.ts:422-437`)

Consigli di sicurezza progressivi:
- **Score > low**: "Verify sender identity through alternative means"
- **Score > medium**: "Do not click on any links or download attachments"
- **Score > medium*1.4**: "Consider reporting this email as spam/phishing"

## Algoritmi di Scoring

### 1. Algoritmo di Scoring Tecnico

**Principi di Design**:
- **Penalità Graduate**: Diverse intensità per diversi livelli di sospetto
- **Bonus Legittimità**: Riduzioni significative per indicatori di legittimità
- **Super Bonus Spam**: Penalità extra per combinazioni di indicatori spam
- **Normalizzazione Contesto**: Aggiustamenti basati sul tipo di email

**Esempio di Calcolo**:
```typescript
// Penalità base per link ratio alto
if (metrics.linkRatio > 0.1) score += 3;

// Bonus per dominio fidato
if (metrics.isFromTrustedDomain) legitimacyBonus += 6;

// Super bonus per pattern spam evidenti
if (spamIndicators >= 3) score += 6;

// Applicazione finale
score = Math.max(0, score - legitimacyBonus);
```

### 2. Algoritmo di Scoring NLP

**Principi di Design**:
- **Peso Predizione**: Il modello ML ha peso maggiore
- **Correzione Contesto**: Riduzione per email da domini fidati
- **Moltiplicatori Configurabili**: Pesi personalizzabili per ogni metrica

**Esempio di Calcolo**:
```typescript
// Penalità per parole spam
const spamWordPenalty = nlpMetrics.spamWordRatio * 10 * multipliers.spamWords;

// Riduzione per legittimità rilevata
score += legitimacyDetected ? spamWordPenalty * 0.3 : spamWordPenalty;

// Bonus per predizione spam del modello
if (nlpOutput?.prediction === 'spam') score += 10;
```

### 3. Algoritmo di Scoring Comportamentale

**Principi di Design**:
- **Soglie Progressive**: Penalità crescenti per comportamenti sempre più sospetti
- **Analisi Temporale**: Valutazione di pattern temporali anomali
- **Indicatori Multipli**: Combinazione di più fattori comportamentali

**Range di Punteggi**:
- **Mittenti Nuovi**: 0-2 punti
- **Volume**: 0-4 punti
- **Burst**: 0-3 punti
- **Similarità**: 0-3 punti
- **Anomalie Temporali**: 0-2 punti
- **Reputazione**: 0-3 punti

## Sistema di Decisione

### 1. Aggregazione Pesata

Il sistema utilizza pesi configurabili per bilanciare l'importanza di ogni modulo:

```typescript
const weights = {
  technical: 0.6,    // 60% - Peso maggiore per metriche tecniche
  nlp: 0.25,         // 25% - Peso medio per analisi linguistica
  behavioral: 0.15   // 15% - Peso minore per analisi comportamentale
};
```

### 2. Normalizzazione Punteggi

Il punteggio finale viene normalizzato per ottenere un valore 0-1:

```typescript
const overallScore = Math.min(finalScore / 22, 1);
```

Dove 22 è il valore massimo teorico del punteggio pesato.

### 3. Soglie di Decisione

**Soglia Spam/Ham**: `finalScore > 8`
- Valore bilanciato che evita falsi positivi
- Può essere configurata tramite config

**Soglie Livello Rischio**:
- **Low**: `score < 0.3`
- **Medium**: `0.3 ≤ score < 0.7`
- **High**: `score ≥ 0.7`

## API Endpoints

### GET /result/test
**Controller**: `ResultController.testResult()` (`backend/src/modules/result/result.controller.ts:9-89`)

Endpoint di test che genera un risultato con dati mock:

**Risposta**:
```json
{
  "overallScore": 0.12,
  "riskLevel": "low",
  "summary": "Email appears to be legitimate with low spam indicators",
  "details": {
    "technical": { /* metriche tecniche complete */ },
    "nlp": { /* risultati analisi NLP */ },
    "behavioral": { /* risultati analisi comportamentale */ }
  },
  "recommendations": [
    "Verify sender identity through alternative means"
  ],
  "scores": {
    "technicalScore": 2,
    "nlpScore": 1,
    "behavioralScore": 0,
    "technicalPercentage": 10.0,
    "nlpPercentage": 4.0,
    "behavioralPercentage": 0.0
  }
}
```

**Gestione Errori**:
- Status 400 per errori di elaborazione
- Messaggio di errore dettagliato nella risposta

## Configurazione

### Struttura di Configurazione

Il servizio accede alla configurazione tramite `ConfigService` con la seguente struttura:

```typescript
interface Config {
  technical: {
    penalties: {
      links: { highRatio: number, excessive: number },
      domains: { excessive: number, externalExcessive: number },
      tracking: { hasTrackingPixel: number },
      headers: { replyToDiffers: number, excessiveReceived: number },
      // ... altri penalties
    },
    thresholds: {
      links: { highRatio: number, excessive: number },
      domains: { excessive: number, externalExcessive: number },
      bodyLength: { veryShort: number, short: number },
      // ... altre soglie
    }
  },
  nlp: {
    multipliers: {
      spamWords: number,
      toxicity: number,
      sentiment: { negative: number }
    },
    thresholds: {
      spamWordRatio: number,
      toxicity: { medium: number },
      sentiment: { negative: number }
    }
  },
  scoring: {
    weights: {
      technical: number,  // default: 0.6
      nlp: number,        // default: 0.25
      behavioral: number  // default: 0.15
    },
    riskLevels: {
      low: number,       // default: 0.3
      medium: number     // default: 0.7
    }
  }
}
```

### Parametri Chiave

**Pesi dei Moduli**:
- Technical: 60% (analisi tecnica headers, domini, link)
- NLP: 25% (analisi linguistica, sentiment, tossicità)
- Behavioral: 15% (pattern di invio, reputazione mittente)

**Soglie di Rischio**:
- Low Risk: score < 0.3 (30%)
- Medium Risk: 0.3 ≤ score < 0.7 (30-70%)
- High Risk: score ≥ 0.7 (70%+)

**Soglia Spam/Ham**: finalScore > 8 (su scala pesata)

## Esempio di Utilizzo

### 1. Integrazione nel Pipeline Principale

```typescript
// Nel PipelineService
const technicalResult = await this.technicalService.analyzeTechnical(parsedEmail);
const nlpResult = await this.nlpService.analyzeNlp(parsedEmail);
const behavioralResult = await this.behavioralService.analyzeBehavioral(fromEmail);

// Generazione del risultato finale
const finalResult = this.resultService.generateResult(
  technicalResult,
  nlpResult,
  behavioralResult
);

// Output finale con scoring, livello di rischio e raccomandazioni
console.log(`Risk Level: ${finalResult.riskLevel}`);
console.log(`Overall Score: ${finalResult.overallScore}`);
console.log(`Summary: ${finalResult.summary}`);
```

### 2. Analisi dei Punteggi

```typescript
// Accesso ai punteggi dettagliati
const scores = finalResult.scores;
console.log(`Technical: ${scores.technicalPercentage}%`);
console.log(`NLP: ${scores.nlpPercentage}%`);
console.log(`Behavioral: ${scores.behavioralPercentage}%`);

// Accesso ai dati grezzi per debugging
console.log(`Raw Technical Score: ${scores.technicalScore}/20`);
console.log(`Raw NLP Score: ${scores.nlpScore}/25`);
console.log(`Raw Behavioral Score: ${scores.behavioralScore}/10`);
```

### 3. Gestione Raccomandazioni

```typescript
// Le raccomandazioni sono generate automaticamente
finalResult.recommendations.forEach(recommendation => {
  console.log(`⚠️ ${recommendation}`);
});

// Esempi di raccomandazioni basate sul rischio:
// - "Verify sender identity through alternative means"
// - "Do not click on any links or download attachments" 
// - "Consider reporting this email as spam/phishing"
```

### 4. Debugging e Logging

Il servizio include logging dettagliato per il debugging:

```typescript
// Output automatico durante il calcolo
console.log('📦 Technical Score:', techScore);
console.log('🧠 NLP Score:', nlpScore);
console.log('🎭 Behavioral Score:', behavioralScore);
console.log('📊 Final Score:', finalScore);
console.log('📌 Final Prediction:', finalPrediction);
console.log('📈 Overall Score (normalized):', finalScore / 22);
```

## Limitazioni e Considerazioni

### 1. Prestazioni
- **Calcolo Intensivo**: Il scoring richiede valutazione di 60+ metriche tecniche
- **Dipendenza I/O**: Accesso a configurazioni esterne per ogni calcolo
- **Memoria**: Logging dettagliato può generare output consistente

### 2. Configurabilità
- **Pesi Statici**: I pesi dei moduli sono configurabili ma non auto-adattivi
- **Soglie Fisse**: Le soglie di rischio richiedono tuning manuale
- **Dipendenza Config**: Il sistema dipende fortemente dalla configurazione esterna

### 3. Accuratezza
- **Bias Domini Fidati**: Forte riduzione per domini trusted potrebbe mascherare attacchi sofisticati
- **Soglia Unica**: Una sola soglia spam/ham potrebbe non essere ottimale per tutti i contesti
- **Pesi Fissi**: I pesi potrebbero richiedere aggiustamenti per diversi tipi di email

### 4. Scalabilità
- **Calcolo Sincrono**: Tutti i calcoli sono eseguiti in sequenza
- **Configurazione Globale**: Stessa configurazione per tutti gli utenti
- **Logging Dettagliato**: Output di debug può impattare performance in produzione

### 5. Robustezza
- **Gestione Dati Mancanti**: Graceful handling per moduli behavioral opzionali
- **Normalizzazione**: Punteggi sono sempre normalizzati nell'intervallo [0,1]
- **Error Handling**: Gestione eccezioni nel controller

### 6. Manutenibilità
- **Soglie Hardcoded**: Alcune soglie sono embedded nel codice
- **Algoritmo Complesso**: La logica di scoring tecnico è molto articolata
- **Dipendenze Multiple**: Integrazione con tutti gli altri moduli del sistema

### 7. Evoluzione
- **Tuning Manuale**: Richiede aggiustamento manuale di pesi e soglie
- **Feedback Loop**: Non implementato sistema di apprendimento automatico
- **Metriche Statiche**: Nuove metriche richiedono modifiche al codice

### 8. Sicurezza
- **Decision Transparency**: Logging dettagliato espone la logica di decisione
- **Bypass Potenziali**: Domini fidati potrebbero essere sfruttati per aggirare controlli
- **Threshold Exposure**: Soglie note potrebbero essere sfruttate per evasion attacks