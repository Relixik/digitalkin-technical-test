# Test Technique - DigitalKin

Une API REST construite avec Node.js, Express, TypeScript et SurrealDB pour gérer des agents conversationnels.

## 🚀 Installation et démarrage

### Prérequis

- **Node.js** >= 24
- **SurrealDB** (pour la base de données)
- **npm** ou **yarn**

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd test_digitalkin
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configuration de l'environnement

Créez un fichier `.env` à la racine du projet :

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_NAMESPACE=test
DB_DATABASE=test
DB_USER=root
DB_PASS=root
OPENAI_MODEL=gpt-5
OPENAI_API_KEY=your_openai_api_key_here
```

### 4. Lancer l'application

#### Mode développement
```bash
npm run dev
```

#### Mode production
```bash
npm run build
npm start
```

L'API sera accessible sur `http://localhost:3000`

## 🛠️ Scripts disponibles

- `npm run dev` - Démarre en mode développement avec rechargement automatique
- `npm run build` - Compile le TypeScript en JavaScript
- `npm start` - Démarre l'application en mode production
- `npm run lint` - Vérifie le code avec ESLint
- `npm run lint:fix` - Corrige automatiquement les erreurs ESLint
- `npm run format` - Formate le code avec Prettier
- `npm run format:check` - Vérifie le formatage avec Prettier
- `npm run type-check` - Vérifie les types TypeScript

## 📁 Structure du projet

```
src/
├── config/           # Configuration (env, logger)
├── grpc/             # Services gRPC et modèles
│   ├── models/       # Types TypeScript pour gRPC
│   └── services/     # Implémentations des services gRPC
├── models/           # Modèles TypeScript et validation Joi
├── routes/           # Routes Express
├── services/         # Logique métier et accès données
└── index.ts          # Point d'entrée de l'application
proto/                # Fichiers Protocol Buffers (.proto)
├── digitalkin.proto
├── digitalkin.request.proto
└── digitalkin.response.proto
```

## 📚 Documentation API

### REST API (Port 3000)

La documentation complète de l'API REST est disponible dans le fichier [API_DOCUMENTATION.md](./API_DOCUMENTATION.md).

### gRPC API (Port 3002)

La documentation et guide de test gRPC avec Postman est disponible dans le fichier [GRPC_POSTMAN_GUIDE.md](./GRPC_POSTMAN_GUIDE.md).

### Endpoints principaux REST

- **GET** `/agents` - Liste tous les agents
- **POST** `/agents` - Crée un nouvel agent
- **GET** `/agents/:id` - Récupère un agent spécifique
- **PUT** `/agents/:id` - Met à jour un agent
- **DELETE** `/agents/:id` - Supprime un agent
- **POST** `/conversations` - Démarre une nouvelle conversation
- **POST** `/conversations/:id/messages` - Continue une conversation

### Services gRPC disponibles

- **AgentService** : Gestion CRUD des agents
  - `ListAgents`, `CreateAgent`, `GetAgent`, `UpdateAgent`, `DeleteAgent`
- **ConversationService** : Gestion des conversations
  - `StartConversation`, `SendMessage`

## 🧪 Test rapide

Une fois l'application démarrée, vous pouvez tester l'API :

```bash
# Créer un agent
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{"name": "Assistant IA", "description": "Un assistant intelligent"}'

# Lister les agents
curl http://localhost:3000/agents
```

## 🧪 Tests avec Postman

Une collection Postman complète est fournie dans le fichier `postman_collection.json` pour tester facilement l'API.

### Comment utiliser la collection Postman :

1. **Importer la collection** :
   - Ouvrez Postman
   - Cliquez sur "Import"
   - Sélectionnez le fichier `postman_collection.json`

2. **Variables d'environnement** :
   - La collection utilise des variables automatiques
   - `baseUrl` : URL de base de l'API (http://localhost:3000)
   - `agentId` et `conversationId` : Automatiquement définies lors des tests

3. **Exécution** :
   - Démarrez votre serveur (`npm run dev`)
   - Exécutez la collection complète avec "Run collection"
   - Ou testez les endpoints individuellement

La collection inclut des assertions automatiques qui vérifient :
- Les codes de statut HTTP corrects
- La structure des réponses JSON
- La validation des données
- La cohérence des IDs entre les requêtes

## 🔧 Technologies utilisées

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Langage typé
- **SurrealDB** - Base de données multi-modèle
- **OpenAI API** - Intelligence artificielle
- **Joi** - Validation des données
- **Winston** - Logging
- **ESLint + Prettier** - Qualité du code

## 📝 Notes de développement

- Le serveur se ferme proprement avec `CTRL+C` (gestion des signaux SIGINT)
- Les logs sont gérés par Winston avec différents niveaux
- La validation des données est effectuée avec Joi
- CORS est activé pour permettre les appels cross-origin
