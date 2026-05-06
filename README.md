# LookFin ImpactLab - Chat (Vite + React)

Proyecto inicial con Vite + React + TypeScript. Contiene un chat simple, un sidebar de conversaciones y un modal para editar el perfil. El bot responde siempre con un mensaje fijo (eco).

Pasos rápidos:

1. Instalar dependencias

```bash
npm install
```

2. Ejecutar en desarrollo

```bash
npm run dev
```

Los datos se persisten en localStorage (conversaciones y perfil).

## Firebase Authentication

El login del frontend usa Firebase Authentication con correo y contraseña.

Variables requeridas en `Frontend-LookFin-ImpactLab/.env`:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Flujo:

1. Inicia sesión desde la pantalla de Login.
2. Firebase guarda la sesión en el navegador.
3. El token queda disponible en `localStorage` como `lf_firebase_token` para usarlo luego con el backend.
