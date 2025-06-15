// Stopwords for text preprocessing
export const STOPWORDS = [
  'a', 'an', 'the', 'and', 'or', 'but', 'because', 'so', 'of', 'in', 'on', 
  'at', 'by', 'with', 'for', 'about', 'against', 'between', 'into', 'through', 
  'during', 'before', 'after', 'above', 'below'
];

// Spammy words for detection
export const SPAM_WORDS = [
  'free', 'win', 'offer', 'click', 'cash', 'prize', 'urgent', 'act now', 'buy now'
];

// Model path for NLP classifier
export const MODEL_PATH = '../../model/classifier.json';