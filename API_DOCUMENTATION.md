# API Documentation - REST

Ce projet expose deux types d'APIs :
- **REST API** sur le port 3000 (HTTP)

## REST API

### Base URL

```
http://localhost:3000
```

## Agents

### GET /agents

Récupère la liste de tous les agents

**Response:** `200 OK`

```json
[
  {
    "id": "string",
    "name": "string",
    "description": "string",
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
]
```

### POST /agents

Crée un nouvel agent

**Request Body:**

```json
{
  "name": "string (3-100 chars, required)",
  "description": "string (max 500 chars, optional)"
}
```

**Response:** `201 Created`

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date"
}
```

### GET /agents/:id

Récupère un agent spécifique

**Response:** `200 OK` ou `404 Not Found`

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date"
}
```

### PUT /agents/:id

Met à jour un agent

**Request Body:** Même format que POST

**Response:** `200 OK`

```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date"
}
```

### DELETE /agents/:id

Supprime un agent

**Response:** `204 No Content`

## Conversations

### POST /conversations

Démarre une nouvelle conversation avec un agent

**Request Body:**

```json
{
  "agentId": "string (required)",
  "message": "string (required)"
}
```

**Response:** `201 Created`

```json
{
  "conversationId": "string",
  "message": "string (réponse de l'agent)"
}
```

### POST /conversations/:id/messages

Continue une conversation existante

**Request Body:**

```json
{
  "message": "string (required)"
}
```

**Response:** `201 Created`

```json
{
  "conversationId": "string",
  "message": "string (réponse de l'agent)"
}
```

## Codes d'erreur

- `400 Bad Request`: Données de validation incorrectes

```json
{
  "error": "\"name\" is required"
}
```

- `404 Not Found`: Ressource non trouvée

```json
{
  "error": "Agent not found"
}
```

- `500 Internal Server Error`: Erreur serveur

```json
{
  "error": "Internal Server Error"
}
```

## Exemples d'utilisation

### Créer un agent

```bash
curl -X POST http://localhost:3000/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Assistant IA",
    "description": "Un assistant intelligent pour répondre aux questions"
  }'
```

### Démarrer une conversation

```bash
curl -X POST http://localhost:3000/conversations \
  -H "Content-Type: application/json" \
  -d '{
    "agentId": "agent_id_here",
    "message": "Bonjour, comment allez-vous ?"
  }'
```

### Continuer une conversation

```bash
curl -X POST http://localhost:3000/conversations/conversation_id_here/messages \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Pouvez-vous m'\''aider avec un problème ?"
  }'
```