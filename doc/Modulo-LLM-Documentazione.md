# Documentazione Modulo LLM - Email Spam Detector

## Indice
1. [Panoramica](#panoramica)
2. [Architettura](#architettura)
3. [Componenti Principali](#componenti-principali)
4. [Provider LLM Supportati](#provider-llm-supportati)
5. [Interfacce e Tipi](#interfacce-e-tipi)
6. [Funzionalità](#funzionalità)
7. [API Endpoints](#api-endpoints)
8. [Sistema di Configurazione](#sistema-di-configurazione)
9. [Frontend Interface](#frontend-interface)
10. [Esempi di Utilizzo](#esempi-di-utilizzo)
11. [Gestione Errori](#gestione-errori)
12. [Limitazioni e Considerazioni](#limitazioni-e-considerazioni)

## Panoramica

Il modulo LLM (Large Language Model) rappresenta la componente più avanzata dell'Email Spam Detector, integrando modelli di intelligenza artificiale per l'analisi sofisticata del contenuto email. Questo modulo supporta multiple piattaforme AI per fornire analisi contestuali avanzate che vanno oltre le tradizionali tecniche di NLP.

### Obiettivi Principali
- **Analisi Contextuale Avanzata**: Utilizzo di LLM per comprendere il contesto e l'intento dell'email
- **Multi-Provider Support**: Integrazione con OpenAI, Anthropic e modelli locali (Ollama)
- **Configurazione Flessibile**: Sistema di configurazione dinamica per provider e modelli
- **Fallback Robusto**: Gestione graceful dei fallimenti con analisi testuale di backup
- **Test di Connettività**: Verifica automatica delle configurazioni dei provider
- **Sicurezza**: Gestione sicura delle API keys e configurazioni sensibili

## Architettura

Il modulo LLM è strutturato secondo il pattern architetturale di NestJS con integrazione frontend dedicata:

### Backend Structure
```
src/modules/llm/
├── llm.module.ts           # Modulo principale NestJS
├── llm.controller.ts       # Controller REST API
└── llm.service.ts          # Logica di business e integrazione provider
```

### Frontend Structure
```
frontend/src/pages/
├── LLM.tsx                 # Configurazione provider LLM
├── LLMUpload.tsx          # Upload e analisi email
└── LLMReport.tsx          # Visualizzazione risultati analisi
```

### Dipendenze
- **ConfigModule**: Per la gestione delle configurazioni dei provider
- **ParsingModule**: Per il preprocessing delle email prima dell'analisi
- **Axios**: Per le chiamate HTTP ai provider LLM
- **Frontend Context**: Per la gestione dello stato tra le pagine

## Componenti Principali

### 1. LLMModule (`llm.module.ts`)
**Percorso**: `backend/src/modules/llm/llm.module.ts:7-12`

Modulo NestJS che configura e coordina il servizio LLM:
- Importa `ConfigModule` per accesso alle configurazioni
- Importa `ParsingModule` per preprocessing email
- Registra `LLMController` e `LLMService`
- Esporta `LLMService` per integrazione con altri moduli

### 2. LLMService (`llm.service.ts`)
**Percorso**: `backend/src/modules/llm/llm.service.ts:17-473`

Servizio principale che gestisce tutta la logica di integrazione LLM:
- **Orchestrazione Provider**: Selezione automatica del provider abilitato
- **Preparazione Contenuto**: Preprocessing e formatting dell'email per l'analisi
- **Chiamate API**: Integrazione con multiple piattaforme LLM
- **Parsing Risposta**: Elaborazione e normalizzazione delle risposte LLM
- **Test Connettività**: Verifica dello stato dei provider configurati

### 3. LLMController (`llm.controller.ts`)
**Percorso**: `backend/src/modules/llm/llm.controller.ts:6-269`

Controller REST che espone API complete per la gestione LLM:
- **Analisi Email**: Endpoint per analisi diretta di contenuto email
- **Gestione Configurazione**: CRUD completo per configurazioni provider
- **Test Connessioni**: Verifica stato dei provider configurati
- **Reset Configurazione**: Ripristino valori di default

## Provider LLM Supportati

### 1. OpenAI
**Integrazione**: `callOpenAI()` (`backend/src/modules/llm/llm.service.ts:141-167`)

Supporto completo per i modelli OpenAI:
- **Modelli Supportati**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Autenticazione**: Bearer Token (API Key)
- **Parametri**: Temperature 0.1, max_tokens 500
- **Formato**: Chat Completions API con sistema e user messages

#### Configurazione
```typescript
openai: {
  enabled: boolean,
  model: "gpt-4" | "gpt-4-turbo" | "gpt-3.5-turbo",
  apiKey: string,
  temperature: number,
  baseUrl: string // Default: https://api.openai.com/v1
}
```

### 2. Anthropic (Claude)
**Integrazione**: `callAnthropic()` (`backend/src/modules/llm/llm.service.ts:169-193`)

Supporto per i modelli Claude di Anthropic:
- **Modelli Supportati**: Claude 3 Sonnet, Claude 3 Haiku, Claude 3 Opus
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Autenticazione**: x-api-key header
- **Parametri**: Temperature 0.1, max_tokens 500
- **Versione API**: 2023-06-01

#### Configurazione
```typescript
anthropic: {
  enabled: boolean,
  model: "claude-3-sonnet-20240229" | "claude-3-haiku-20240307" | "claude-3-opus-20240229",
  apiKey: string,
  temperature: number,
  baseUrl: string // Default: https://api.anthropic.com
}
```

### 3. Local LLM (Ollama)
**Integrazione**: `callLocalLLM()` (`backend/src/modules/llm/llm.service.ts:195-243`)

Supporto per modelli locali tramite Ollama e altre piattaforme:
- **Provider Ollama**: Endpoint `/api/generate` per modelli locali
- **Provider Generici**: Endpoint OpenAI-compatible per LM Studio, text-generation-webui
- **Modelli**: Configurabili, esempi: llama3, mistral, codellama
- **Endpoint Default**: `http://localhost:11434` (Ollama)

#### Configurazione
```typescript
local: {
  enabled: boolean,
  model: string,
  provider: "ollama" | "generic",
  endpoint: string, // Default: http://localhost:11434
  baseUrl: string   // Alias per endpoint
}
```

## Interfacce e Tipi

### LLMAnalysisResult
**Percorso**: `backend/src/modules/llm/llm.service.ts:6-15`

Interfaccia principale per i risultati dell'analisi LLM:

```typescript
interface LLMAnalysisResult {
  provider: string;           // Nome del provider utilizzato
  model: string;              // Modello specifico utilizzato
  is_spam: boolean;           // Classificazione spam/ham
  confidence: number;         // Livello di confidenza (0-100)
  reasoning: string;          // Spiegazione del ragionamento AI
  risk_factors: string[];     // Lista di fattori di rischio identificati
  response_time_ms: number;   // Tempo di risposta in millisecondi
  error?: string;             // Messaggio di errore se presente
}
```

### Frontend LLMAnalysisResult
**Percorso**: `frontend/src/pages/LLMUpload.tsx:21-32`

Interfaccia utilizzata dal frontend per la comunicazione:

```typescript
interface LLMAnalysisResult {
  success: boolean;
  analysis?: {
    spamProbability: number;    // Probabilità spam (0-1)
    reasoning: string;          // Ragionamento AI
    confidence: number;         // Confidenza (0-1)
    keyIndicators: string[];    // Indicatori chiave
  };
  error?: string;
  provider?: string;
  model?: string;
  timestamp?: string;
  parsing?: {                   // Informazioni email parseata
    subject?: string;
    from?: string;
    contentLength?: number;
  };
}
```

### LLMConfig (Frontend)
**Percorso**: `frontend/src/pages/LLM.tsx:26-49`

Configurazione completa dei provider per il frontend:

```typescript
interface LLMConfig {
  providers: {
    openai: {
      enabled: boolean;
      model: string;
      apiKey?: string;
      temperature?: number;
    };
    anthropic: {
      enabled: boolean;
      model: string;
      apiKey?: string;
      temperature?: number;
    };
    local: {
      enabled: boolean;
      model: string;
      provider: string;
      endpoint?: string;
    };
  };
  activeProvider: 'openai' | 'anthropic' | 'local';
  systemPrompt?: string;
}
```

## Funzionalità

### 1. Analisi Email Principale
**Metodo**: `analyzeEmail()` (`backend/src/modules/llm/llm.service.ts:23-81`)

Orchestrazione completa dell'analisi email:

#### Processo di Analisi:
1. **Validazione Configurazione**: Verifica presenza e validità dei provider configurati
2. **Selezione Provider**: Identifica il primo provider abilitato
3. **Preparazione Contenuto**: Formatta l'email per l'analisi LLM
4. **Chiamata LLM**: Esegue la richiesta al provider selezionato
5. **Elaborazione Risposta**: Parsa e normalizza il risultato
6. **Gestione Errori**: Fallback graceful in caso di problemi

#### Logging Dettagliato:
```typescript
this.logger.debug('Starting LLM analysis...');
this.logger.debug(`Using provider: ${enabledProvider.name} with model: ${enabledProvider.config.model}`);
this.logger.debug(`Prepared email content (${emailContent.length} characters)`);
this.logger.debug(`LLM analysis completed in ${responseTime}ms`);
```

### 2. Preparazione Contenuto Email
**Metodo**: `prepareEmailContent()` (`backend/src/modules/llm/llm.service.ts:94-120`)

Preprocessing ottimizzato per l'analisi LLM:

#### Operazioni di Preprocessing:
- **Estrazione Metadata**: Subject, From, To dall'email parseata
- **Gestione Contenuto**: Priorità plain text, fallback HTML con strip tag
- **Limitazione Lunghezza**: Truncation a 4000 caratteri per token limits
- **Formattazione Strutturata**: Template consistente per l'analisi

#### Template di Output:
```
EMAIL TO ANALYZE:

Subject: [subject]
From: [from]
To: [to]

Content:
[content]

---
Please analyze this email for spam/phishing indicators.
```

### 3. Parsing Intelligente delle Risposte
**Metodo**: `parseResponse()` (`backend/src/modules/llm/llm.service.ts:245-294`)

Sistema robusto di interpretazione delle risposte LLM:

#### Strategia di Parsing:
1. **Parsing JSON**: Ricerca e parse di oggetti JSON nelle risposte
2. **Compatibilità Formati**: Supporto per formati response diversi
3. **Normalizzazione Valori**: Conversione confidence (0-1 o 0-100)
4. **Fallback Testuale**: Analisi semplice per risposte non strutturate

#### Gestione Formati Multipli:
```typescript
// Supporto sia per formato nuovo che legacy
const isSpam = parsed.is_spam !== undefined 
  ? Boolean(parsed.is_spam)
  : parsed.classification === 'SPAM';
```

### 4. Test di Connettività Avanzato
**Metodo**: `testConnection()` (`backend/src/modules/llm/llm.service.ts:296-472`)

Sistema completo di verifica dei provider:

#### Test OpenAI:
- Verifica API key presence
- Test chiamata con messaggio mock
- Gestione errori specifici (401, 429, ENOTFOUND)
- Ritorno dettagli modello e usage

#### Test Anthropic:
- Validazione API key
- Test endpoint Messages API
- Gestione timeout e rate limits
- Verifica formato risposta

#### Test Ollama:
- Verifica endpoint health (`/api/tags`)
- Controllo disponibilità modelli
- Validazione modello richiesto
- Test generazione con timeout esteso

### 5. Gestione Provider Dinamica
**Metodo**: `getEnabledProvider()` (`backend/src/modules/llm/llm.service.ts:83-92`)

Selezione automatica del provider attivo:
- Iterazione sui provider configurati
- Selezione del primo provider con `enabled: true`
- Fallback graceful se nessun provider disponibile

## API Endpoints

### POST /llm/analyze
**Controller**: `analyzeEmailContent()` (`backend/src/modules/llm/llm.controller.ts:14-72`)

Analisi di contenuto email grezzo:

**Request Body**:
```json
{
  "content": "From: sender@example.com\nTo: recipient@example.com\nSubject: Test\n\nEmail content..."
}
```

**Response Success**:
```json
{
  "success": true,
  "parsing": {
    "subject": "Test",
    "from": "sender@example.com",
    "contentLength": 150
  },
  "analysis": {
    "spamProbability": 0.15,
    "confidence": 0.85,
    "reasoning": "Email appears legitimate with proper headers...",
    "keyIndicators": ["Proper authentication", "Known sender"]
  },
  "provider": "openai",
  "model": "gpt-4",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Response Error**:
```json
{
  "success": false,
  "error": "LLM analysis failed - no result returned"
}
```

### GET /llm/analyze/:filename
**Controller**: `analyzeEmailFile()` (`backend/src/modules/llm/llm.controller.ts:74-127`)

Analisi di file email dal storage:

**Response**: Identico a `/llm/analyze` ma include `filename` nel response

### GET /llm/config
**Controller**: `getLLMConfig()` (`backend/src/modules/llm/llm.controller.ts:129-170`)

Recupero configurazione LLM (senza API keys per sicurezza):

**Response**:
```json
{
  "providers": {
    "openai": {
      "enabled": true,
      "model": "gpt-4",
      "temperature": 0.7
    },
    "anthropic": {
      "enabled": false,
      "model": "claude-3-sonnet-20240229",
      "temperature": 0.7
    },
    "local": {
      "enabled": false,
      "model": "llama3",
      "provider": "ollama",
      "endpoint": "http://localhost:11434"
    }
  },
  "activeProvider": "openai",
  "systemPrompt": "You are an expert email security analyst..."
}
```

### POST /llm/config
**Controller**: `saveLLMConfig()` (`backend/src/modules/llm/llm.controller.ts:172-216`)

Salvataggio configurazione LLM completa:

**Request Body**: Configurazione completa incluso API keys

**Response Success**:
```json
{
  "success": true,
  "message": "LLM configuration saved successfully"
}
```

### POST /llm/config/reset
**Controller**: `resetLLMConfig()` (`backend/src/modules/llm/llm.controller.ts:218-247`)

Reset configurazione ai valori di default:

**Response**:
```json
{
  "success": true,
  "message": "LLM configuration reset to defaults"
}
```

### POST /llm/test
**Controller**: `testLLMConnection()` (`backend/src/modules/llm/llm.controller.ts:249-268`)

Test connettività provider specifico:

**Request Body**:
```json
{
  "provider": "openai",
  "config": {
    "apiKey": "sk-...",
    "model": "gpt-4"
  }
}
```

**Response Success**:
```json
{
  "success": true,
  "message": "OpenAI connection successful",
  "details": {
    "model": "gpt-4",
    "usage": { "prompt_tokens": 10, "completion_tokens": 5 }
  }
}
```

**Response Error**:
```json
{
  "success": false,
  "message": "Invalid OpenAI API key"
}
```

## Sistema di Configurazione

### Struttura di Configurazione

Il sistema supporta configurazione multi-livello:

```typescript
interface LLMConfiguration {
  llm: {
    providers: {
      openai: {
        enabled: boolean;
        model: string;
        apiKey: string;
        temperature: number;
        baseUrl?: string;
      };
      anthropic: {
        enabled: boolean;
        model: string;
        apiKey: string;
        temperature: number;
        baseUrl?: string;
      };
      local: {
        enabled: boolean;
        model: string;
        provider: "ollama" | "generic";
        endpoint: string;
      };
    };
    activeProvider: string;
    prompts: {
      spam_analysis: string;
    };
  };
}
```

### System Prompt di Default

Il modulo include un prompt di sistema completo per analisi spam:

**Percorso**: `frontend/src/pages/LLM.tsx:531-608`

#### Caratteristiche del Prompt:
- **Analisi Tecnica**: SPF, DKIM, DMARC, header anomalies
- **Analisi Contenuto**: Financial promises, urgency language, obfuscation
- **Pattern Comportamentali**: Volume, frequency, sender reputation
- **Fattori Contestuali**: Business communications, events, transactions
- **Linee Guida**: Criteri specifici per classificazione SPAM/HAM
- **Formato Output**: JSON strutturato con reasoning e indicators

#### Template JSON di Risposta:
```json
{
  "classification": "SPAM" | "HAM",
  "confidence": 0.85,
  "reasoning": "Brief explanation of key factors",
  "risk_indicators": ["List of specific spam indicators"],
  "legitimacy_factors": ["List of factors suggesting legitimacy"],
  "recommendation": "Specific action recommendation"
}
```

## Frontend Interface

### 1. Pagina di Configurazione (LLM.tsx)
**Percorso**: `frontend/src/pages/LLM.tsx:51-632`

Interfaccia completa per la gestione dei provider LLM:

#### Funzionalità:
- **Gestione Provider**: Switch enable/disable per ogni provider
- **Configurazione Modelli**: Select dropdown con modelli supportati
- **Gestione API Keys**: Input sicuri per le chiavi API
- **Test Connettività**: Verifica immediata delle configurazioni
- **System Prompt**: Editor avanzato con template di default
- **Refresh/Reset**: Controlli per aggiornamento e ripristino

#### Features Avanzate:
- **Auto-save**: Persistenza automatica delle modificazioni
- **Notifiche**: Feedback immediato per operazioni
- **Validazione**: Controlli real-time delle configurazioni
- **Loading States**: Indicatori di stato per operazioni async

### 2. Pagina di Upload (LLMUpload.tsx)
**Percorso**: `frontend/src/pages/LLMUpload.tsx:34-251`

Interfaccia per analisi email con LLM:

#### Caratteristiche:
- **Editor Email**: Textarea con syntax highlighting
- **Auto-save**: Persistenza automatica del contenuto
- **Contatori**: Caratteri e righe in tempo reale
- **Analisi Immediata**: Invio diretto al backend per elaborazione
- **Navigation**: Reindirizzamento automatico ai risultati

#### Gestione Stati:
- **Loading**: Overlay durante analisi
- **Error Handling**: Notifiche dettagliate per errori
- **Success Flow**: Navigation automatica ai risultati

### 3. Pagina Report (LLMReport.tsx)
**Percorso**: `frontend/src/pages/LLMReport.tsx:52-472`

Visualizzazione avanzata dei risultati analisi:

#### Sezioni del Report:
- **Risultati Principali**: Probabilità spam con progress bar e badge risk level
- **Confidenza Modello**: Indicatore grafico della confidenza AI
- **Informazioni Email**: Metadata dell'email analizzata
- **Ragionamento AI**: Spiegazione dettagliata del processo decisionale
- **Indicatori Chiave**: Lista bullet dei fattori identificati
- **Dettagli Tecnici**: Provider, modello, timestamp, status

#### Features Visuali:
- **Color Coding**: Rosso/Giallo/Verde per livelli di rischio
- **Progress Bars**: Indicatori grafici percentuali
- **Badge System**: Categorizzazione visuale dei risultati
- **Responsive Layout**: Adattamento automatico schermo
- **Scroll Area**: Gestione contenuto dinamico

## Esempi di Utilizzo

### 1. Configurazione Provider OpenAI

```typescript
// Configurazione via API
const config = {
  providers: {
    openai: {
      enabled: true,
      model: "gpt-4",
      apiKey: "sk-your-api-key-here",
      temperature: 0.1
    }
  },
  activeProvider: "openai",
  systemPrompt: "You are an expert email security analyst..."
};

// Salvataggio configurazione
const response = await fetch('/api/llm/config', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(config)
});
```

### 2. Analisi Email con LLM

```typescript
// Analisi contenuto email
const emailContent = `
From: suspicious@example.com
To: victim@company.com
Subject: URGENT: Verify Your Account Now!

Dear user,
Your account will be suspended unless you verify immediately.
Click here: http://phishing-site.com/verify
`;

const response = await fetch('/api/llm/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ content: emailContent })
});

const result = await response.json();
// {
//   success: true,
//   analysis: {
//     spamProbability: 0.95,
//     confidence: 0.88,
//     reasoning: "High spam probability due to urgency language, suspicious domain...",
//     keyIndicators: ["Urgency language", "Suspicious domain", "Phishing attempt"]
//   },
//   provider: "openai",
//   model: "gpt-4"
// }
```

### 3. Test di Connettività

```typescript
// Test provider OpenAI
const testResult = await fetch('/api/llm/test', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'openai',
    config: {
      apiKey: 'sk-test-key',
      model: 'gpt-4'
    }
  })
});

const result = await testResult.json();
// {
//   success: true,
//   message: "OpenAI connection successful",
//   details: { model: "gpt-4", usage: {...} }
// }
```

### 4. Integrazione con Ollama

```typescript
// Configurazione Ollama locale
const ollamaConfig = {
  providers: {
    local: {
      enabled: true,
      model: "llama3",
      provider: "ollama",
      endpoint: "http://localhost:11434"
    }
  },
  activeProvider: "local"
};

// Test disponibilità modelli
const testResponse = await fetch('/api/llm/test', {
  method: 'POST',
  body: JSON.stringify({
    provider: 'local',
    config: ollamaConfig.providers.local
  })
});
```

### 5. Gestione Frontend Context

```typescript
// Nel componente LLMUpload
const { setLlmAnalysisResult } = useAnalysis();

const analyzeEmail = async () => {
  const result = await fetch('/api/llm/analyze', {...});
  
  if (result.success) {
    // Store in context and sessionStorage
    setLlmAnalysisResult(result);
    sessionStorage.setItem('llmAnalysisResult', JSON.stringify(result));
    
    // Navigate to results
    navigate('/llm-report');
  }
};
```

## Gestione Errori

### 1. Errori di Configurazione

```typescript
// Provider non configurato
if (!config.llm?.providers) {
  this.logger.debug('LLM providers not configured');
  return null;
}

// Nessun provider abilitato
const enabledProvider = this.getEnabledProvider(config.llm.providers);
if (!enabledProvider) {
  this.logger.warn('No LLM provider enabled');
  return null;
}
```

### 2. Errori di Connettività

```typescript
// Gestione errori OpenAI
catch (error: any) {
  if (error.response?.status === 401) {
    return { success: false, message: 'Invalid OpenAI API key' };
  } else if (error.response?.status === 429) {
    return { success: false, message: 'OpenAI rate limit exceeded' };
  } else if (error.code === 'ENOTFOUND') {
    return { success: false, message: 'Unable to connect to OpenAI API' };
  }
  return { success: false, message: `OpenAI API error: ${error.message}` };
}
```

### 3. Fallback per Parsing

```typescript
// Fallback analisi testuale se JSON parsing fallisce
catch (error) {
  this.logger.warn(`Failed to parse LLM JSON response: ${error.message}`);
}

// Analisi semplice basata su keywords
const lowerContent = content.toLowerCase();
const isSpam = lowerContent.includes('spam') || 
               lowerContent.includes('phishing') || 
               lowerContent.includes('malicious');

return {
  provider,
  model,
  is_spam: isSpam,
  confidence: isSpam ? 70 : 30,
  reasoning: content.substring(0, 200) + '...',
  risk_factors: isSpam ? ['Text analysis detected spam indicators'] : []
};
```

### 4. Gestione Timeout

```typescript
// Timeout specifici per ogni provider
const response = await axios.post(endpoint, payload, {
  timeout: 15000,  // 15 secondi per Ollama
  timeout: 10000   // 10 secondi per provider cloud
});
```

## Limitazioni e Considerazioni

### 1. Prestazioni
- **Latenza Provider**: OpenAI/Anthropic 2-5s, Ollama variabile (1-30s)
- **Rate Limits**: Limiti API provider cloud
- **Token Limits**: Truncation contenuto a 4000 caratteri
- **Timeout**: Configurazioni specifiche per provider

### 2. Costi
- **OpenAI**: $0.03-0.06 per 1K tokens (GPT-4)
- **Anthropic**: $0.015-0.075 per 1K tokens (Claude 3)
- **Ollama**: Gratuito ma richiede risorse hardware locali
- **Monitoraggio**: Nessun tracking automatico usage/costi

### 3. Sicurezza
- **API Keys**: Storage in configurazione, non crittografate
- **Transmission**: HTTPS per provider cloud
- **Local Models**: Nessuna trasmissione dati esterni
- **Logging**: Possibile esposizione contenuto email in log

### 4. Accuratezza
- **Model Dependence**: Qualità dipende dal modello utilizzato
- **Prompt Engineering**: Risultati sensibili al system prompt
- **Context Window**: Limitazioni lunghezza email analizzabili
- **Language Support**: Ottimizzato per inglese

### 5. Configurazione
- **Provider Setup**: Richiede configurazione manuale
- **Model Availability**: Dipendenza da provider esterni
- **Local Dependencies**: Ollama richiede installazione locale
- **Network Requirements**: Connettività per provider cloud

### 6. Scalabilità
- **Concurrent Requests**: Limitata da rate limits provider
- **Stateless Design**: Nessun caching risultati
- **Resource Usage**: Ollama può essere resource-intensive
- **High Availability**: Nessun failover automatico tra provider

### 7. Manutenibilità
- **Provider Updates**: Possibili breaking changes API
- **Model Deprecation**: Lifecycle management modelli
- **Configuration Drift**: Gestione manuale configurazioni
- **Error Monitoring**: Logging dettagliato ma nessun alerting

### 8. Compliance e Privacy
- **Data Processing**: Email inviate a provider esterni
- **GDPR Considerations**: Possibili implicazioni privacy
- **Local Alternative**: Ollama per processing locale
- **Audit Trail**: Logging completo delle operazioni

### 9. Robustezza
- **Graceful Degradation**: Fallback a analisi testuale
- **Error Recovery**: Gestione completa degli errori
- **Configuration Validation**: Verifica configurazioni
- **Provider Fallback**: Nessun sistema automatico di failover

Il modulo LLM rappresenta l'integrazione più sofisticata dell'Email Spam Detector, offrendo capacità di analisi avanzate attraverso modelli di intelligenza artificiale all'avanguardia, pur mantenendo flessibilità e robustezza nell'implementazione.