# Documentazione Modulo Behavioral - Email Spam Detection

## Overview

Il modulo behavioral (`backend/src/modules/behavioral/behavioral.service.ts`) analizza i pattern comportamentali dei mittenti email per identificare attività sospette. Questo modulo rappresenta il **15-20%** del punteggio finale di classificazione spam e si basa sull'apprendimento e l'analisi di pattern storici per ogni mittente.

## Architettura del Sistema

```
Email Input → Behavioral Analysis → Sender History Update → Behavioral Score
     ↓                ↓                      ↓                    ↓
Store History → Calculate Metrics → Pattern Analysis → Final Classification
```

## Componenti Principali

### 1. **Strutture Dati**

#### `EmailRecord` - Record Storico Email
```typescript
interface EmailRecord {
  date: string;           // Data di invio
  subject: string;        // Oggetto dell'email
  recipientsCount: number; // Numero destinatari
  contentHash: string;    // Hash MD5 del contenuto
  hourOfDay: number;      // Ora di invio (0-23)
  dayOfWeek: string;      // Giorno della settimana
}
```

#### `SenderHistory` - Storico per Mittente
```typescript
interface SenderHistory {
  [senderEmail: string]: EmailRecord[];
}
```

#### `BehavioralAnalysisResult` - Risultato Analisi
```typescript
interface BehavioralAnalysisResult {
  from: string;                    // Email mittente
  isNewSender: boolean;            // Nuovo mittente
  emailCountLast24h: number;       // Email ultime 24h
  emailCountLast7d: number;        // Email ultimi 7 giorni
  burstRatio: number;              // Rapporto concentrazione
  avgRecipients: number;           // Media destinatari
  hourOfDay: number;               // Ora corrente
  dayOfWeek: string;               // Giorno corrente
  contentSimilarityRate: number;   // Tasso similarità contenuto
  subjectChangeRate: number;       // Tasso cambio oggetto
  reputationScore: number;         // Punteggio reputazione
  firstSeenDate?: string;          // Prima volta visto
  timeAnomalyScore: number;        // Punteggio anomalia temporale
  massMailingIndicator: boolean;   // Indicatore mass mailing
}
```

### 2. **Storage e Persistenza**

#### Sistema di Archiviazione
- **File**: `data/sender-history.json`
- **Formato**: JSON con storico per mittente
- **Retention**: Ultimi 100 email per mittente
- **Cleanup**: Automatico ogni 90 giorni
- **Backup**: Salvataggio automatico ad ogni aggiornamento

#### Gestione Memoria
- **Caricamento**: Al startup del servizio
- **Aggiornamento**: Real-time ad ogni email
- **Ottimizzazione**: Limite 100 record per mittente
- **Cleanup**: Rimozione automatica record obsoleti

## Metriche Comportamentali Dettagliate

### 1. **Analisi Frequenza Email**

#### `emailCountLast24h` - Conteggio 24 ore
- **Calcolo**: `history.filter(email => new Date(email.date) >= last24h).length`
- **Finestra**: Ultime 24 ore dalla data corrente
- **Uso**: Identificare invii massivi a breve termine

#### `emailCountLast7d` - Conteggio 7 giorni
- **Calcolo**: `history.filter(email => new Date(email.date) >= last7d).length`
- **Finestra**: Ultimi 7 giorni dalla data corrente
- **Uso**: Identificare campagne spam prolungate

### 2. **Analisi Burst Ratio**

#### `burstRatio` - Rapporto Concentrazione
- **Algoritmo**:
  ```typescript
  // Distribuzione oraria ultime 24h
  const hourlyCount = {};
  recentEmails.forEach(email => {
    const hour = new Date(email.date).getHours();
    hourlyCount[hour] = (hourlyCount[hour] || 0) + 1;
  });
  
  const maxCount = Math.max(...Object.values(hourlyCount));
  const avgCount = totalCount / numberOfHours;
  const burstRatio = maxCount / avgCount;
  ```
- **Interpretazione**:
  - `1.0`: Distribuzione uniforme
  - `>3.0`: Concentrazione significativa
  - `>5.0`: Burst sospetto
  - `>10.0`: Burst molto sospetto
- **Uso**: Identificare invii automatizzati concentrati

### 3. **Analisi Similarità Contenuto**

#### `contentSimilarityRate` - Tasso Similarità
- **Hash Generation**:
  ```typescript
  const contentHash = createHash('md5')
    .update(content.toLowerCase().replace(/\s+/g, ' ').trim())
    .digest('hex')
    .substring(0, 8);
  ```
- **Calcolo**:
  ```typescript
  const recentEmails = history.filter(email => 
    new Date(email.date) >= sevenDaysAgo
  );
  const similarEmails = recentEmails.filter(email => 
    email.contentHash === currentContentHash
  );
  const similarityRate = similarEmails.length / recentEmails.length;
  ```
- **Soglie**:
  - `>0.9` (90%): Mass mailing evidente
  - `>0.7` (70%): Alta similarità
  - `>0.5` (50%): Media similarità
- **Uso**: Identificare contenuti duplicati/template

### 4. **Analisi Variazione Oggetto**

#### `subjectChangeRate` - Tasso Cambio Oggetto
- **Finestra**: Ultimi 30 giorni
- **Algoritmo**:
  ```typescript
  let changes = 0;
  let prevSubject = recentEmails[0].subject;
  
  for (let i = 1; i < recentEmails.length; i++) {
    if (recentEmails[i].subject !== prevSubject) {
      changes++;
    }
    prevSubject = recentEmails[i].subject;
  }
  
  const changeRate = changes / Math.max(recentEmails.length, 1);
  ```
- **Interpretazione**:
  - `>0.9` (90%): Oggetti randomizzati (sospetto)
  - `>0.7` (70%): Alta variazione
  - `<0.3` (30%): Bassa variazione (normale)
- **Uso**: Identificare tentativi di eludere filtri

### 5. **Analisi Anomalie Temporali**

#### `timeAnomalyScore` - Punteggio Anomalia Temporale
- **Distribuzione Oraria**:
  ```typescript
  const hourDistribution = {};
  const dayDistribution = {};
  
  history.forEach(email => {
    const hour = new Date(email.date).getHours();
    const day = getDayOfWeek(new Date(email.date));
    hourDistribution[hour] = (hourDistribution[hour] || 0) + 1;
    dayDistribution[day] = (dayDistribution[day] || 0) + 1;
  });
  ```
- **Calcolo Anomalia**:
  ```typescript
  const currentHourFreq = (hourDistribution[currentHour] || 0) / totalEmails;
  const currentDayFreq = (dayDistribution[currentDay] || 0) / totalEmails;
  
  const hourAnomaly = 1 - currentHourFreq;
  const dayAnomaly = 1 - currentDayFreq;
  ```
- **Penalità Notturna**:
  ```typescript
  let nightPenalty = 0;
  if (currentHour >= 2 && currentHour <= 5) {
    const nightRatio = nightEmails / totalEmails;
    if (nightRatio < 0.1) nightPenalty = 0.5;
  }
  ```
- **Punteggio Finale**:
  ```typescript
  const timeAnomalyScore = Math.min(
    (hourAnomaly + dayAnomaly + nightPenalty) / 2, 
    1.0
  );
  ```

### 6. **Calcolo Reputation Score**

#### `reputationScore` - Punteggio Reputazione
- **Base**: 0.5 (neutro)
- **Penalità**:
  ```typescript
  let score = 0.5;
  
  // Nuovo mittente
  if (isNewSender) score -= 0.2;
  
  // Alto volume
  if (emailCountLast24h > 20) score -= 0.3;
  
  // Burst elevato
  if (burstRatio > 5) score -= 0.25;
  
  // Alta similarità (mass mailing)
  if (contentSimilarityRate > 0.8) score -= 0.2;
  
  // Anomalia temporale
  if (timeAnomalyScore > 0.7) score -= 0.15;
  
  // Oggetti randomizzati
  if (subjectChangeRate > 0.8) score -= 0.1;
  
  return Math.max(0, Math.min(1, score));
  ```

### 7. **Mass Mailing Indicator**

#### `massMailingIndicator` - Indicatore Mass Mailing
- **Criteri** (OR logico):
  ```typescript
  const massMailingIndicator = (
    emailCountLast24h > 10 ||      // >10 email/24h
    burstRatio > 3 ||              // Burst ratio >3
    contentSimilarityRate > 0.9 || // >90% similarità
    recipientsCount > 20           // >20 destinatari
  );
  ```
- **Uso**: Identificazione rapida operazioni mass mailing

## Sistema di Scoring Comportamentale

### Pesi e Penalità (`result.service.ts`)

#### 1. **Nuovo Mittente**
- **Condizione**: `behavioral.isNewSender === true`
- **Penalità**: `+2 punti`
- **Razionale**: Mittenti sconosciuti sono più rischiosi

#### 2. **Volume Email**
- **>50 email/24h**: `+4 punti` (volume molto alto)
- **>20 email/24h**: `+3 punti` (volume alto)
- **>10 email/24h**: `+2 punti` (volume medio)
- **Razionale**: Volumi elevati indicano automatizzazione

#### 3. **Burst Ratio**
- **>10**: `+3 punti` (burst molto alto)
- **>5**: `+2 punti` (burst alto)
- **>3**: `+1 punto` (burst medio)
- **Razionale**: Concentrazione temporale indica bot/script

#### 4. **Similarità Contenuto**
- **>90%**: `+3 punti` (mass mailing)
- **>70%**: `+2 punti` (alta similarità)
- **>50%**: `+1 punto` (media similarità)
- **Razionale**: Contenuti identici indicano template spam

#### 5. **Anomalie Temporali**
- **>0.8**: `+2 punti` (anomalia alta)
- **>0.5**: `+1 punto` (anomalia media)
- **Razionale**: Orari inusuali indicano automatizzazione

#### 6. **Variazione Oggetto**
- **>90%**: `+2 punti` (randomizzazione)
- **>70%**: `+1 punto` (alta variazione)
- **Razionale**: Oggetti randomizzati eludono filtri

#### 7. **Mass Mailing**
- **Indicatore attivo**: `+2 punti`
- **Razionale**: Identificazione diretta mass mailing

#### 8. **Reputation Score**
- **<0.2**: `+3 punti` (reputazione molto bassa)
- **<0.4**: `+2 punti` (reputazione bassa)
- **<0.6**: `+1 punto` (reputazione medio-bassa)
- **Razionale**: Reputazione storica basata su comportamento

### Punteggio Massimo Behavioral
- **Totale**: `18 punti` (massimo teorico)
- **Tipico spam**: `8-12 punti`
- **Tipico legittimo**: `0-3 punti`

## Configurazione

### Peso nel Punteggio Finale
- **spam-config.json**: `15%` (0.15)
- **default-config.json**: `20%` (0.20)

### Soglie di Classificazione
- **spam-config.json**: 
  - Basso: `<0.3` (30%)
  - Medio: `0.3-0.5` (30-50%)
  - Alto: `≥0.5` (50%+)
- **default-config.json**:
  - Basso: `<0.15` (15%)
  - Medio: `0.15-0.4` (15-40%)
  - Alto: `≥0.4` (40%+)

## Funzionalità Avanzate

### 1. **Apprendimento Continuo**
- **Aggiornamento**: Ad ogni email processata
- **Memoria**: Storico persistente per mittente
- **Evoluzione**: Pattern che si adattano nel tempo

### 2. **Pattern Recognition**
- **Burst Detection**: Rilevamento automatico burst
- **Content Fingerprinting**: Hash per similarity detection
- **Temporal Analysis**: Analisi pattern temporali
- **Reputation Tracking**: Tracciamento reputazione nel tempo

### 3. **Statistiche Mittente**
```typescript
getSenderStats(senderEmail: string): {
  totalEmails: number;
  firstSeen: string | null;
  lastSeen: string | null;
  avgEmailsPerDay: number;
}
```

### 4. **Manutenzione Automatica**
```typescript
cleanupOldData(daysToKeep: number = 90): void
```
- **Retention**: 90 giorni configurabili
- **Cleanup**: Rimozione automatica record obsoleti
- **Ottimizzazione**: Mantenimento prestazioni nel tempo

## Casi d'Uso Tipici

### 1. **Spam Campaign Detection**
- **Segnali**: Alto volume + alta similarità + nuovo mittente
- **Punteggio**: 8-12 punti
- **Esempio**: 50 email identiche in 2 ore

### 2. **Bot Detection**
- **Segnali**: Burst ratio elevato + anomalie temporali
- **Punteggio**: 6-10 punti
- **Esempio**: 30 email in 1 ora di notte

### 3. **Newsletter Legittima**
- **Segnali**: Basso change rate + media similarità + mittente noto
- **Punteggio**: 0-2 punti
- **Esempio**: Newsletter settimanale con template fisso

### 4. **Email Personali**
- **Segnali**: Basso volume + alta variazione + mittente noto
- **Punteggio**: 0-1 punto
- **Esempio**: Email personali occasionali

## Integrazione con Pipeline

### Fase 4 - Behavioral Analysis
```typescript
const behavioralResult = this.behavioralService.analyzeBehavior(
  parsedData.parsed.metadata.from || 'unknown',
  parsedData.parsed.metadata.date || new Date().toISOString(),
  parsedData.parsed.metadata.subject || '',
  this.getRecipientsCount(parsedData.parsed),
  parsedData.parsed.plainText || parsedData.parsed.htmlText || ''
);
```

### Calcolo Punteggio Finale
```typescript
const behavioralScore = this.calculateBehavioralScore(behavioralResult);
const finalScore = 
  techScore * weights.technical + 
  nlpScore * weights.nlp + 
  behavioralScore * weights.behavioral;
```

## Prestazioni e Ottimizzazioni

### 1. **Gestione Memoria**
- **Limite**: 100 email per mittente
- **Cleanup**: Automatico ogni 90 giorni
- **Compressione**: Hash MD5 per contenuti

### 2. **Ottimizzazioni Calcolo**
- **Caching**: Calcoli intermedi in memoria
- **Filtering**: Solo record rilevanti per finestra temporale
- **Indexing**: Accesso rapido per mittente

### 3. **Scalabilità**
- **File Storage**: JSON per semplicità
- **Future**: Migrazione a database per volumi elevati
- **Sharding**: Possibile partizionamento per mittente

## Sicurezza e Privacy

### 1. **Anonimizzazione**
- **Hash**: Contenuti hashati per privacy
- **Retention**: Limitata nel tempo
- **Cleanup**: Automatico per compliance

### 2. **Protezione Dati**
- **Encryption**: Considerare encryption file storage
- **Access Control**: Accesso limitato al servizio
- **Audit**: Logging operazioni sensibili

---

Questo modulo behavioral fornisce un sistema sofisticato di analisi comportamentale che impara dai pattern storici per identificare attività spam e mass mailing, complementando efficacemente l'analisi tecnica e NLP per una classificazione accurata delle email.