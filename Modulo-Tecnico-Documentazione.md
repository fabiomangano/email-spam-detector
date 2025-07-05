# Documentazione Modulo Tecnico - Email Spam Detection

## Overview

Il modulo tecnico (`backend/src/modules/technical/technical.service.ts`) è il cuore dell'analisi spam, responsabile dell'analisi di **oltre 90 metriche tecniche** per identificare email spam. Questo modulo pesa il **60%** del punteggio finale di classificazione, rendendolo il componente più importante del sistema.

## Architettura

```
ParsedEmail → TechnicalService → EmailTechnicalMetrics → Scoring
```

Il servizio analizza l'email parsata e produce un oggetto `EmailTechnicalMetrics` contenente tutte le metriche tecniche, che vengono poi elaborate dal sistema di scoring.

## Categorie di Metriche

### 1. **Metriche di Base del Contenuto**

#### `bodyLength` - Lunghezza del corpo email
- **Calcolo**: Lunghezza totale del testo (HTML o plaintext)
- **Soglie**: 
  - Corto: < 100 caratteri (penalità: +2)
  - Molto corto: < 50 caratteri (penalità: +3)
- **Razionale**: Email spam spesso hanno contenuto molto breve o eccessivamente lungo

#### `numLinks` - Numero di link
- **Calcolo**: Conta tutti i link `http://` e `https://` nel testo
- **Soglie**: 
  - Eccessivo: > 10 link (penalità: +3)
- **Razionale**: Email spam contengono spesso molti link per aumentare il traffico

#### `linkRatio` - Rapporto link/contenuto
- **Calcolo**: `numLinks / lunghezza_testo`
- **Soglie**: 
  - Ratio alto: > 0.01 (penalità: +2)
- **Razionale**: Email legittime hanno più testo che link

#### `numImages` - Numero di immagini
- **Calcolo**: Conta tag `<img>` nel contenuto HTML
- **Soglie**: 
  - Eccessivo: > 5 immagini (penalità: +2)
- **Razionale**: Spam spesso usa molte immagini per eludere filtri testuali

#### `hasTrackingPixel` - Presenza pixel di tracking
- **Calcolo**: Rileva immagini 1x1 pixel o nascoste
- **Pattern**: `<img[^>]*(width="?1"?|height="?1"?|style="[^"]*(display:\s*none|opacity:\s*0))`
- **Penalità**: +4 (alta)
- **Razionale**: I pixel di tracking sono comuni nelle email spam per confermare la lettura

### 2. **Metriche di Autenticazione Email**

#### `spfResult` - Risultato SPF (Sender Policy Framework)
- **Calcolo**: Estrae risultato da header `authentication-results`
- **Penalità**: 
  - Fail: +7 (molto alta)
  - Softfail: +4
- **Razionale**: SPF previene spoofing del dominio mittente

#### `dkimResult` - Risultato DKIM (DomainKeys Identified Mail)
- **Calcolo**: Estrae risultato da header `authentication-results`
- **Penalità**: Fail: +5
- **Razionale**: DKIM garantisce integrità e autenticità del messaggio

#### `dmarcResult` - Risultato DMARC (Domain-based Message Authentication)
- **Calcolo**: Estrae risultato da header `authentication-results`
- **Penalità**: Fail: +8 (massima)
- **Razionale**: DMARC è la protezione più forte contro spoofing

#### `ipSender` - IP del mittente
- **Calcolo**: Estrae IP dal primo header `Received`
- **Utilizzo**: Per blacklist IP e geolocalizzazione

### 3. **Metriche di Header Email**

#### `numReceivedHeaders` - Numero di header "Received"
- **Calcolo**: Conta header `Received` nella catena SMTP
- **Soglie**: 
  - Eccessivo: > 10 hop (penalità: +2)
- **Razionale**: Troppi hop possono indicare routing sospetto o proxy

#### `hasOutlookReceivedPattern` - Presenza server Outlook
- **Calcolo**: Cerca pattern `outlook.com` negli header `Received`
- **Utilizzo**: Indica flusso email legittimo tramite Microsoft

#### `xMailerBrand` - Software mittente
- **Calcolo**: Estrae valore da header `X-Mailer` o `User-Agent`
- **Penalità**: +3 per software sospetto
- **Razionale**: Certi software sono noti per essere usati da spammer

#### `missingDateHeader` - Header Date mancante
- **Calcolo**: Verifica presenza header `Date`
- **Penalità**: +3
- **Razionale**: Email malformate spesso mancano di header obbligatori

#### `replyToDiffersFromFrom` - Reply-To diverso da From
- **Calcolo**: Confronta header `Reply-To` con `From`
- **Penalità**: +2
- **Razionale**: Spammer usano Reply-To per nascondere identità reale

### 4. **Metriche del Mittente**

#### `fromNameSuspicious` - Nome mittente sospetto
- **Calcolo**: Rileva pattern sospetti:
  - Tutto maiuscolo (> 10 caratteri)
  - Caratteri speciali: `[*#@$%^&+=<>{}[\]|\\]`
  - Prefissi sistem: `OWNER-`, `NOLIST-`, `ADMIN-`, `SYSTEM-`
- **Penalità**: +3
- **Razionale**: Nomi generici/strani mascherano identità reale

#### `fromDomainIsDisposable` - Dominio temporaneo
- **Calcolo**: Verifica contro lista domini temporanei
- **Lista**: mailinator.com, 10minutemail.com, tempmail.org, etc.
- **Penalità**: +5
- **Razionale**: Domini temporanei sono spesso usati per spam

#### `hasSuspiciousFromName` - Pattern nome mittente
- **Calcolo**: Rileva pattern automatici:
  - `^[a-z]{4,8}\d{8,16}$` (es: suz0123893616943)
  - `^[a-z]{2,5}\d{4,}$` (brevi con molti numeri)
  - `^[bcdfghjklmnpqrstvwxyz]{4,}$` (solo consonanti)
  - Nomi > 15 caratteri
  - 8+ cifre consecutive
- **Penalità**: +5
- **Razionale**: Account generati automaticamente per spam

#### `sentToMultiple` - Email a più destinatari
- **Calcolo**: Conta indirizzi in header `To` e `Cc`
- **Penalità**: +1
- **Razionale**: Email personali raramente hanno molti destinatari visibili

### 5. **Metriche di Campagne e Mailing List**

#### `campaignIdentifierPresent` - Header di campagna
- **Calcolo**: Cerca header: `x-rpcampaign`, `list-help`, `feedback-id`, `list-unsubscribe`
- **Penalità**: +1
- **Razionale**: Indica mailing list o campagne massive

#### `containsFeedbackLoopHeader` - Header FBL
- **Calcolo**: Cerca header: `x-csa-complaints`, `cfbl-address`, `feedback-id`, `x-abuse`
- **Penalità**: +2
- **Razionale**: Email commerciale ma da provider autoregolamentato

#### `mailingListSpam` - Spam mascherato da mailing list
- **Calcolo**: Verifica se ha header mailing list MA contenuto spam
- **Pattern spam**: "guaranteed to lose", "fight the risk", "free legal advice"
- **Penalità**: +6
- **Razionale**: Spammer hijackano mailing list legittime

### 6. **Metriche Testuali e Semantiche**

#### `uppercaseRatio` - Rapporto maiuscole
- **Calcolo**: `caratteri_maiuscoli / caratteri_totali`
- **Soglie**: 
  - Eccessivo: > 0.3 (30%) (penalità: +4)
- **Razionale**: MAIUSCOLE eccessive indicano comunicazione aggressiva

#### `excessiveExclamations` - Punti esclamativi eccessivi
- **Calcolo**: Cerca pattern `!{3,}` (3+ punti esclamativi consecutivi)
- **Penalità**: +3
- **Razionale**: Tecnica classica per attirare attenzione

#### `containsUrgencyWords` - Parole di urgenza
- **Calcolo**: Cerca parole come "urgente", "immediato", "scadenza", "now", "urgent"
- **Penalità**: +3
- **Razionale**: Linguaggio pressante tipico di phishing/scam

#### `containsElectionTerms` - Termini elettorali
- **Calcolo**: Cerca parole come "voto", "delegati", "elezioni", "candidati"
- **Penalità**: +1
- **Razionale**: Campagne massive o phishing tematico

### 7. **Metriche di Offuscamento e Link**

#### `containsObfuscatedText` - Testo offuscato
- **Calcolo**: Rileva tecniche di offuscamento:
  - Escape Unicode: `\\u[0-9A-Fa-f]{4}`
  - Encoding percentuale: `%[0-9A-Fa-f]{2}`
  - Caratteri a larghezza zero: `[\u200B\u200C\u200D\uFEFF]`
- **Penalità**: +4
- **Razionale**: Usato per evadere filtri anti-spam

#### `numExternalDomains` - Domini esterni
- **Calcolo**: Conta domini unici nei link
- **Soglie**: 
  - Eccessivo: > 3 (penalità: +2)
- **Razionale**: Molti domini esterni suggeriscono redirect o phishing

#### `linkDisplayMismatch` - Link ingannevoli
- **Calcolo**: Verifica se testo link diverso da URL reale
- **Pattern**: `<a href="url1">testo_diverso</a>`
- **Penalità**: +3
- **Razionale**: Tecnica classica di inganno

#### `containsShortenedUrls` - URL accorciati
- **Calcolo**: Cerca servizi come bit.ly, t.co, tinyurl.com
- **Penalità**: +2
- **Razionale**: Mascherano reale destinazione

#### `usesEncodedUrls` - URL codificati
- **Calcolo**: Cerca encoding percentuale nei link
- **Penalità**: +2
- **Razionale**: Può mascherare redirect fraudolenti

#### `linkToImageRatio` - Rapporto link/immagini
- **Calcolo**: `numLinks / numImages` (se images > 0)
- **Soglie**: 
  - Alto: > 5 (penalità: valutazione)
- **Razionale**: Email spam hanno spesso troppi link rispetto al contenuto visivo

### 8. **Metriche MIME e Struttura**

#### `hasMixedContentTypes` - MIME misti
- **Calcolo**: Rileva `multipart/mixed` in Content-Type
- **Penalità**: +1
- **Razionale**: Struttura complessa può nascondere contenuti

#### `hasNestedMultipart` - MIME annidati
- **Calcolo**: Rileva multipart dentro multipart
- **Penalità**: +2
- **Razionale**: Può mascherare allegati o codice

#### `boundaryAnomaly` - Boundary MIME anomali
- **Calcolo**: Verifica lunghezza (> 50 caratteri) e caratteri strani
- **Penalità**: +2
- **Razionale**: Boundary casuali indicano generazione automatica

#### `hasFakeMultipartAlternative` - Multipart alternativo falso
- **Calcolo**: Ha `multipart/alternative` ma manca plaintext
- **Penalità**: +3
- **Razionale**: Finge compatibilità ma nasconde contenuti

### 9. **Metriche di Spam Avanzato**

#### `containsFinancialPromises` - Promesse finanziarie
- **Calcolo**: Rileva oltre 50 pattern finanziari:
  - Importi: `$100,000`, `1000 dollars`
  - Promesse: "guaranteed income", "make money"
  - Eredità: "inheritance", "beneficiary"
  - MLM: "network marketing", "pyramid"
  - Prestiti: "mortgage", "loan", "credit"
- **Penalità**: +8 (massima)
- **Razionale**: Principale contenuto delle email spam

#### `hasNonStandardPorts` - Porte non standard
- **Calcolo**: Rileva URL con porte diverse da 80, 443, 25, 587, 993, 995
- **Penalità**: +4
- **Razionale**: Può indicare server compromessi o proxy

#### `containsSuspiciousDomains` - Domini sospetti
- **Calcolo**: Verifica contro lista domini/TLD sospetti
- **Lista**: .cn, .tk, .ml, btamail.net, adclick.ws, etc.
- **Penalità**: +6
- **Razionale**: Certi domini sono noti per hosting spam

#### `hasSpammySubject` - Oggetto spam
- **Calcolo**: Rileva pattern nell'oggetto:
  - "guaranteed to win/lose"
  - "free money/cash"
  - Importi monetari
  - "urgent", "act now"
  - "amazing offer"
- **Penalità**: +7
- **Razionale**: L'oggetto è spesso il primo indicatore di spam

#### `isImageHeavy` - Email pesanti di immagini
- **Calcolo**: > 5 immagini E testo < 500 caratteri
- **Penalità**: +3
- **Razionale**: Spam usa immagini per eludere filtri testuali

#### `hasRepeatedLinks` - Link ripetuti
- **Calcolo**: > 3 link che puntano allo stesso dominio
- **Penalità**: +3
- **Razionale**: Tecnica per aumentare traffico verso un sito

### 10. **Metriche di Rilevamento Email Legittime**

#### `isFromTrustedDomain` - Dominio fidato
- **Calcolo**: Verifica contro lista domini fidati
- **Effetto**: Riduce punteggio spam
- **Razionale**: Domini aziendali noti sono raramente spam

#### `isEventEmail` - Email di eventi
- **Calcolo**: Cerca ≥ 3 parole chiave di eventi legittimi
- **Keywords**: "meeting", "conference", "webinar", "training", etc.
- **Effetto**: Riduce punteggio spam
- **Razionale**: Email di eventi sono comunicazioni legittime

#### `isNewsletterEmail` - Newsletter legittima
- **Calcolo**: Ha parole chiave newsletter + header specifici
- **Header**: `list-id`, `list-unsubscribe`, `x-mailman-version`
- **Effetto**: Riduce punteggio spam
- **Razionale**: Newsletter con header corretti sono legittime

#### `hasProperUnsubscribe` - Disiscrizione corretta
- **Calcolo**: Ha header `list-unsubscribe` + testo unsubscribe
- **Effetto**: Riduce punteggio spam
- **Razionale**: Meccanismo di disiscrizione corretto indica legittimità

## Sistema di Scoring

### Pesi delle Categorie
- **Autenticazione**: Peso massimo (SPF fail: +7, DMARC fail: +8)
- **Contenuto finanziario**: Peso alto (Financial promises: +8)
- **Oggetto spam**: Peso alto (+7)
- **Domini sospetti**: Peso alto (+6)
- **Mailing list spam**: Peso alto (+6)
- **Autenticazione fallita**: Peso alto (+5-8)

### Soglie di Rischio
- **Basso**: < 0.3 (30%)
- **Medio**: 0.3-0.5 (30-50%)
- **Alto**: ≥ 0.5 (50%+)

## Configurazione

La configurazione è centralizzata in `backend/config/spam-config.json`:

```json
{
  "technical": {
    "penalties": {
      "authentication": {
        "spfFail": 7,
        "dkimFail": 5,
        "dmarcFail": 8
      },
      "spam": {
        "financialPromises": 8,
        "spammySubject": 7,
        "suspiciousDomains": 6
      }
    },
    "thresholds": {
      "bodyLength": {
        "short": 100,
        "veryShort": 50
      },
      "links": {
        "excessive": 10,
        "highRatio": 0.01
      }
    }
  }
}
```

## Pattern di Rilevamento Avanzati

### Promesse Finanziarie (58 Pattern)
```regex
/\$[\d,]+(?:\.\d{2})?/i                    // $100,000
/guaranteed\s*income/i                      // Guaranteed income
/(?:inheritance|fund|transfer)\s*of\s*\$?[\d,]+/i  // Inheritance of $X
/work\s*(?:from|at)\s*home/i               // Work from home
/(?:mlm|network\s*marketing)/i             // MLM schemes
```

### Offuscamento
```regex
/\\u[0-9A-Fa-f]{4}/                        // Unicode escape
/%[0-9A-Fa-f]{2}/                          // Percent encoding
/[\u200B\u200C\u200D\uFEFF]/               // Zero-width characters
```

### Nomi Mittente Sospetti
```regex
/^[a-z]{4,8}\d{8,16}$/i                    // Pattern automatici
/^[bcdfghjklmnpqrstvwxyz]{4,}$/i           // Solo consonanti
/^.{15,}$/                                 // Nomi troppo lunghi
```

## Prestazioni e Ottimizzazioni

- **Caching**: Regex precompilate per pattern frequenti
- **Parallelizzazione**: Analisi indipendenti eseguibili in parallelo
- **Memoria**: Gestione efficiente di email grandi
- **Scalabilità**: Architettura modulare per aggiunta nuove metriche

## Estensibilità

Il sistema è progettato per facile estensione:

1. **Nuove metriche**: Aggiungere al tipo `EmailTechnicalMetrics`
2. **Nuovi pattern**: Aggiungere al file di configurazione
3. **Nuove penalità**: Configurare pesi in `spam-config.json`
4. **Nuovi domini**: Aggiornare liste in configurazione

## Considerazioni di Sicurezza

- **Sanitizzazione**: Tutti gli input vengono sanitizzati
- **Regex sicure**: Pattern ottimizzati per prevenire ReDoS
- **Limiti**: Soglie per prevenire DoS su email molto grandi
- **Validazione**: Controllo integrità dati in input

---

Questa documentazione copre l'intero sistema di analisi tecnica del modulo spam detection, fornendo una comprensione completa di come ogni metrica contribuisce alla classificazione finale dell'email.