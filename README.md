# 📖 IZAIA Lire Plus Web

Application web et mobile d'accompagnement éducatif pour l'entraînement de la lecture, spécialement conçue pour les enfants dyslexiques de 6 à 11 ans.

---

## 🚀 Guide de Démarrage Rapide (PC Distant 2 / Nouveaux Développeurs)

### 1. Clonage du dépôtt
```bash
git clone https://github.com/Mr2hc/izaia-lire-plus-web.git
cd izaia-lire-plus-web
```

### 2. Installation des dépendances
```bash
npm install
```

### 3. Lancement en serveur de développement local
```bash
npm run dev
```
L'application s'ouvrira sur `http://localhost:5173`.

---

## 🛠️ Commandes Principales

- `npm run dev` : Démarre le serveur local Vite avec rechargement à chaud (HMR).
- `npm run build` : Compile le projet pour la production dans le dossier `dist/`.
- `npm run preview` : Prévisualise le build de production localement.

---

## 🔄 Synchronisation avec Git

Avant de travailler :
```bash
git pull origin master
```

Après vos modifications :
```bash
git add .
git commit -m "feat: description de vos modifications"
git push origin master
```

---

## ✨ Fonctionnalités Majeures Intégrées

- **Synthèse Vocale & Synchronisation TTS** : Surlignage dynamique mot par mot et timing adaptatif par caractères.
- **Panneau d'Accessibilité Dyslexie** : Personnalisation de la police (OpenDyslexic, Lexend), de la taille, de l'interlignage et des contrastes.
- **Moteur d'Accord Grammatical** : Accord automatique au masculin/féminin selon le prénom de l'enfant dans les exercices.
- **Formatage des Prénoms** : Capitalisation automatique (Titlecase) dans l'interface.
