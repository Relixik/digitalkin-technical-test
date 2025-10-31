# Guide de Test gRPC avec Postman

## Prérequis

1. **Postman Desktop** (version récente avec support gRPC)
2. **Serveur gRPC en cours d'exécution** sur `localhost:3002`

## Configuration de Postman pour gRPC

### 1. Créer une nouvelle requête gRPC

1. Ouvrir Postman
2. Cliquer sur "New" → "gRPC Request"
3. Entrer l'URL du serveur : `localhost:3002`
4. Dans l'onglet "Service definition", cliquer sur "Import a .proto file"
5. Importer le fichier `proto/digitalkin.proto`
6. Maintenant, vous verrez la liste des services disponibles.

## Tests des Services

### AgentService

#### 1. ListAgents - Lister tous les agents

**Configuration :**

- **Service:** `digitalkin.AgentService`
- **Method:** `ListAgents`
- **Message:** (vide, pas de paramètres requis)

**Body (JSON):**

```json
{}
```

**Réponse attendue :**

```json
{
    "agents": [
        {
            "id": "agent123",
            "name": "Assistant IA",
            "description": "Un assistant intelligent",
            "createdAt": "2023-10-31T10:00:00Z",
            "updatedAt": "2023-10-31T10:00:00Z"
        }
    ],
    "error": ""
}
```

#### 2. CreateAgent - Créer un nouvel agent

**Configuration :**

- **Service:** `digitalkin.AgentService`
- **Method:** `CreateAgent`

**Body (JSON):**

```json
{
    "name": "Assistant Marketing",
    "description": "Spécialisé en stratégies marketing et communication"
}
```

**Réponse attendue :**

```json
{
    "agent": {
        "id": "agent456",
        "name": "Assistant Marketing",
        "description": "Spécialisé en stratégies marketing et communication",
        "createdAt": "2023-10-31T10:00:00Z",
        "updatedAt": "2023-10-31T10:00:00Z"
    },
    "error": ""
}
```

#### 3. GetAgent - Récupérer un agent par ID

**Configuration :**

- **Service:** `digitalkin.AgentService`
- **Method:** `GetAgent`

**Body (JSON):**

```json
{
    "id": "agent123"
}
```

**Réponse attendue :**

```json
{
    "agent": {
        "id": "agent123",
        "name": "Assistant IA",
        "description": "Un assistant intelligent",
        "createdAt": "2023-10-31T10:00:00Z",
        "updatedAt": "2023-10-31T10:00:00Z"
    },
    "error": ""
}
```

#### 4. UpdateAgent - Mettre à jour un agent

**Configuration :**

- **Service:** `digitalkin.AgentService`
- **Method:** `UpdateAgent`

**Body (JSON):**

```json
{
    "id": "agent123",
    "name": "Assistant IA Avancé",
    "description": "Un assistant intelligent avec des capacités avancées"
}
```

**Réponse attendue :**

```json
{
    "agent": {
        "id": "agent123",
        "name": "Assistant IA Avancé",
        "description": "Un assistant intelligent avec des capacités avancées",
        "createdAt": "2023-10-31T10:00:00Z",
        "updatedAt": "2023-10-31T15:30:00Z"
    },
    "error": ""
}
```

#### 5. DeleteAgent - Supprimer un agent

**Configuration :**

- **Service:** `digitalkin.AgentService`
- **Method:** `DeleteAgent`

**Body (JSON):**

```json
{
    "id": "agent123"
}
```

**Réponse attendue :**

```json
{
    "success": true,
    "error": ""
}
```

### ConversationService

#### 1. StartConversation - Démarrer une conversation

**Configuration :**

- **Service:** `digitalkin.ConversationService`
- **Method:** `StartConversation`

**Body (JSON):**

```json
{
    "agentId": "agent123",
    "message": "Bonjour, comment puis-je obtenir de l'aide avec mon projet ?"
}
```

**Réponse attendue :**

```json
{
    "conversationId": "conversation456",
    "message": "Bonjour ! Je suis ravi de vous aider avec votre projet. Pouvez-vous me donner plus de détails sur ce dont vous avez besoin ?",
    "error": ""
}
```

#### 2. SendMessage - Envoyer un message dans une conversation

**Configuration :**

- **Service:** `digitalkin.ConversationService`
- **Method:** `SendMessage`

**Body (JSON):**

```json
{
    "conversationId": "conversation456",
    "message": "J'ai besoin d'aide pour optimiser les performances de mon API"
}
```

**Réponse attendue :**

```json
{
    "conversationId": "conversation456",
    "message": "Voici quelques conseils pour optimiser les performances de votre API : 1) Utilisez la mise en cache...",
    "error": ""
}
```

## Cas d'erreur

### Agent inexistant

**Request GetAgent avec ID inexistant :**

```json
{
    "id": "agent_inexistant"
}
```

**Réponse :**

```json
{
    "agent": null,
    "error": "Agent not found"
}
```

### Données invalides

**Request CreateAgent avec nom vide :**

```json
{
    "name": "",
    "description": "Description valide"
}
```

**Réponse :**

```json
{
    "agent": null,
    "error": "Validation error: name is required"
}
```
