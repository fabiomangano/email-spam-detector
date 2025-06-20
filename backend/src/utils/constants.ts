// Stopwords for text preprocessing
export const STOPWORDS = [
  'a', 'an', 'the', 'and', 'or', 'but', 'because', 'so', 'of', 'in', 'on', 
  'at', 'by', 'with', 'for', 'about', 'against', 'between', 'into', 'through', 
  'during', 'before', 'after', 'above', 'below'
];

// Spammy words for detection
export const SPAM_WORDS = [
  'free', 'win', 'offer', 'click', 'cash', 'prize', 'urgent', 'act now', 'buy now',
  'money', 'earn', 'income', 'profit', 'sale', 'discount', 'limited', 'exclusive',
  'guarantee', 'risk-free', 'refund', 'bonus', 'reward', 'lottery', 'winner',
  'congratulations', 'selected', 'opportunity', 'deal', 'cheap', 'lowest',
  'amazing', 'incredible', 'fantastic', 'unbelievable', 'revolutionary',
  'breakthrough', 'secret', 'hidden', 'exposed', 'revealed', 'trick',
  'method', 'system', 'formula', 'solution', 'magic', 'miracle',
  'instant', 'immediate', 'fast', 'quick', 'easy', 'simple', 'effortless',
  'automatic', 'guaranteed', 'certified', 'approved', 'verified',
  'eliminate', 'remove', 'lose', 'weight', 'diet', 'supplement',
  'medication', 'prescription', 'pharmacy', 'viagra', 'cialis',
  'mortgage', 'loan', 'credit', 'debt', 'refinance', 'investment',
  'stocks', 'trading', 'bitcoin', 'cryptocurrency', 'mlm', 'pyramid',
  'work from home', 'make money online', 'get rich', 'financial freedom',
  'million', 'thousand', 'dollars', '$', 'usd', 'gbp', 'eur', 'pounds',
  'beneficiary', 'inheritance', 'fund', 'transfer', 'bank', 'account',
  'attorney', 'lawyer', 'legal', 'claim', 'compensation', 'settlement'
];

// Model path for NLP classifier
export const MODEL_PATH = 'model/classifier.json';