import * as path from 'path';
import { BayesClassifier } from 'natural';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

const SPAM_PATH = path.join(__dirname, '../../data/spamassassin/spam');
const HAM_PATH = path.join(__dirname, '../../data/spamassassin/ham');
const MODEL_PATH = path.join(__dirname, '/../model/classifier.json');

console.log('📦 Avvio addestramento modello...');

// Leggi i file di una directory
function readEmailsFromDirectory(directory: string): string[] {
  return readdirSync(directory).map((file) =>
    readFileSync(join(directory, file), 'utf8'),
  );
}

// Leggi le email spam e ham
const spamEmails = readEmailsFromDirectory(SPAM_PATH);
const hamEmails = readEmailsFromDirectory(HAM_PATH);

console.log('📂 Spam emails trovate:', spamEmails.length);
console.log('📂 Ham emails trovate:', hamEmails.length);

// Inizializza il classificatore
const classifier = new BayesClassifier();

// Aggiungi le email al classificatore
spamEmails.forEach((email) => classifier.addDocument(email, 'spam'));
hamEmails.forEach((email) => classifier.addDocument(email, 'ham'));

// Addestra il modello
console.log('🏋️‍♂️ Addestramento in corso...');
classifier.train();

// Salva il modello
console.log('💾 Salvataggio del modello...');
try {
  classifier.save(MODEL_PATH, (err) => {
    if (err) {
      console.error('❌ Errore nel salvataggio del modello:', err);
    } else {
      console.log('✅ Modello salvato correttamente in:', MODEL_PATH);
    }
  });
} catch (err) {
  console.error('❌ Errore nel salvataggio del modello:', err);
}
