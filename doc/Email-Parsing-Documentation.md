# Email Parsing Documentation

## Overview

This document explains how the email parsing functionality works in the spam detection application. The system uses a comprehensive multi-layered approach to parse, analyze, and classify emails as spam or legitimate.

## Architecture Overview

```
Email Input (File/Text)
    ↓
Upload Service (storage)
    ↓
Parsing Service (mailparser)
    ↓
Pipeline Service (orchestration)
    ├── Technical Analysis
    ├── NLP Analysis
    ├── Behavioral Analysis
    └── LLM Analysis (optional)
    ↓
Result Service (scoring & classification)
    ↓
Final Spam/Ham Decision
```

## Core Components

### 1. Email Upload (`backend/src/email-upload/upload.controller.ts`)

**Supported Formats:**
- `.eml` files (standard email format)
- `.msg` files (Outlook format)
- `.txt` files (plain text)
- Direct text input

**Features:**
- File size limit: 5MB
- Temporary storage in `storage/` directory
- Timestamped filenames for uniqueness
- File validation and type checking

**Frontend Hook:** `frontend/src/hooks/useEmailUpload.ts`
- Manages upload state and progress
- Handles both file upload and text input modes
- Sequential processing: upload → parsing → analysis

### 2. Email Parsing (`backend/src/modules/parsing/parsing.service.ts`)

**Core Library:** Uses `mailparser` with `simpleParser()` function

**Key Functions:**
- `parseEmailFile(filename)` - Parses uploaded email files
- `parseEmailContent(content)` - Parses direct text input
- `parseSingleEmail()` - Main parsing logic

**Extracted Data:**
- **Headers:** From, To, Subject, Date, Received chains
- **Content:** Plain text and HTML versions
- **Attachments:** File information and metadata
- **Technical Metadata:** MIME structure, encoding, etc.

**Validation:** Generates warnings for missing critical fields:
- Subject line
- Sender information
- Recipient information
- Plain text content

### 3. Analysis Pipeline (`backend/src/pipeline/pipeline.service.ts`)

The parsed email goes through a comprehensive analysis pipeline:

#### Phase 1: Technical Analysis (`backend/src/modules/technical/technical.service.ts`)
Analyzes **90+ technical metrics**:

**Header Analysis:**
- SPF/DKIM/DMARC authentication results
- Number of "Received" headers (email hops)
- Missing or suspicious headers
- Reply-To vs From discrepancies

**Content Analysis:**
- Body length and structure
- Link count and external link ratio
- Image analysis and tracking pixels
- Domain diversity analysis

**Spam Detection Patterns:**
- Financial promise detection (money amounts, inheritance schemes)
- URL shortener detection
- Obfuscation techniques (Unicode escapes, URL encoding)
- Mass mailing indicators

#### Phase 2: NLP Analysis (`backend/src/modules/nlp/nlp.service.ts`)
Natural Language Processing features:

- **Text Preprocessing:** Stemming, stopword removal
- **TF-IDF Vectorization:** Feature extraction
- **Bayes Classifier:** Spam prediction (requires trained model)
- **Sentiment Analysis:** Positive/negative scoring
- **Language Detection:** English, Italian, Spanish, French
- **Toxicity Scoring:** Content pattern analysis
- **Keyword Extraction:** Topic classification

#### Phase 3: Behavioral Analysis (`backend/src/modules/behavioral/behavioral.service.ts`)
Sender behavior pattern analysis:

- **Email Frequency:** 24h and 7-day windows
- **Burst Activity:** Hourly distribution analysis
- **Content Similarity:** MD5 hashing for duplicate detection
- **Subject Change Rate:** Pattern analysis
- **Time Anomalies:** Unusual sending times
- **Mass Mailing Indicators:** Bulk email detection
- **Reputation Scoring:** Historical behavior analysis

#### Phase 4: LLM Analysis (`backend/src/modules/llm/llm.service.ts`)
Optional AI-powered analysis:

**Supported Providers:**
- OpenAI GPT models
- Anthropic Claude
- Local models (Ollama, LM Studio)

**Features:**
- Configurable prompts for spam analysis
- JSON response parsing with fallback
- Context-aware threat detection

### 4. Configuration System (`backend/config/spam-config.json`)

**Scoring Weights:**
- Technical Analysis: 60%
- NLP Analysis: 25%
- Behavioral Analysis: 15%

**Risk Thresholds:**
- Low Risk: < 0.3
- Medium Risk: < 0.5
- High Risk: ≥ 0.5

**Domain Lists:**
- Disposable email providers
- Suspicious TLDs
- URL shorteners
- Legitimate event keywords

## Data Structures

### ParsedEmail Interface
```typescript
interface ParsedEmail {
  messageId: string;
  subject: string;
  from: EmailAddress;
  to: EmailAddress[];
  date: Date;
  text: string;
  html: string;
  headers: Headers;
  attachments: Attachment[];
}
```

### Analysis Results
```typescript
interface EmailAnalysisResult {
  technicalScore: number;
  nlpScore: number;
  behavioralScore: number;
  finalScore: number;
  classification: 'spam' | 'ham';
  riskLevel: 'low' | 'medium' | 'high';
  confidence: number;
}
```

## Frontend Components

### Email Input Panel (`frontend/src/components/EmailInputPanel.tsx`)
- Drag-and-drop file upload
- Text area for direct input
- Real-time validation
- File type checking
- Progress indicators

### Analysis Results Display
- Risk level visualization
- Detailed metric breakdown
- Technical analysis results
- NLP insights
- Behavioral patterns

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/upload/file` | POST | Upload email file |
| `/api/upload/text` | POST | Submit email text |
| `/api/parse/:filename` | GET | Parse uploaded email |
| `/api/pipeline/:filename` | GET | Full analysis pipeline |

## Advanced Features

### Real-time Learning
- Behavioral analysis learns from sender patterns
- Adaptive thresholds based on historical data
- Continuous improvement of detection accuracy

### Extensible Architecture
- Modular services for easy expansion
- Plugin-based analysis modules
- Configurable scoring weights

### Modern Spam Detection
- Advanced obfuscation detection
- Social engineering pattern recognition
- Sophisticated phishing detection
- Multi-language support

## Performance Considerations

- **Parsing Speed:** Optimized for large email processing
- **Memory Usage:** Efficient handling of attachments
- **Scalability:** Modular design for horizontal scaling
- **Caching:** Results caching for repeated analysis

## Error Handling

- Graceful handling of malformed emails
- Detailed error logging and reporting
- Fallback mechanisms for missing data
- Validation warnings for incomplete emails

## Security Features

- File type validation
- Size limits for uploads
- Sanitization of email content
- Secure temporary file handling

## Future Enhancements

- Machine learning model training
- Real-time threat intelligence integration
- Advanced attachment analysis
- Email reputation services integration

---

This documentation provides a comprehensive overview of the email parsing functionality. For specific implementation details, refer to the individual service files in the backend modules.