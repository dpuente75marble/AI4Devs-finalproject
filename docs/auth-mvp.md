# US-001 — Login JWT y rutas protegidas — IMPLEMENTED

**Proyecto:** DeliveryOps AI  
**Vertical slice:** Authentication MVP (login + JWT en cookie HttpOnly + rutas protegidas)  
**Estado:** SPEC APPROVED / IMPLEMENTED — junio 2026  
**Referencia producto:** US-001 (User Login) en `docs/05-user-stories.md`  
**Issue GitHub:** [#8](https://github.com/dpuente75marble/AI4Devs-finalproject/issues/8) — [D2] US-001 Login JWT y rutas protegidas  
**Backlog interno:** GH-06  
**Stack actual:** monorepo pnpm · `apps/api` (NestJS + Prisma + Swagger) · `apps/web` (React + Vite + Tailwind + React Router) · Playwright (`e2e/`)  
**Prerequisitos implementados:** foundation técnica + slices US-002–US-009; endpoints de negocio **protegidos** con `JwtAuthGuard`

**Validación (local, jun 2026):** API tests **135/135** OK · Playwright **9/9** OK · `pnpm --filter api build` OK · `pnpm --filter web build` OK · `pnpm lint` global con errores preexistentes fuera de US-001

---

## 1. Objetivo funcional

Como Project Manager o Tech Lead, quiero **iniciar sesión de forma segura** en DeliveryOps AI, para que **solo usuarios autenticados** puedan acceder a la información operativa del proyecto (user stories, capacidad, análisis, refinamiento y export).

El slice introduce:

1. **Modelo `User`** persistido en PostgreSQL con contraseña hasheada con **argon2** (nunca en claro).
2. **Endpoint de login** que valida credenciales y establece un **JWT en cookie HttpOnly**.
3. **Endpoint de sesión** (`GET /api/auth/me`) para que el frontend conozca el estado de autenticación sin acceder al token.
4. **Endpoint de logout** (`POST /api/auth/logout`) que limpia la cookie desde el backend.
5. **Protección explícita de la API** mediante `JwtAuthGuard` en controllers de negocio.
6. **Pantalla de login** y **rutas protegidas** en el frontend React (sin almacenar JWT en el cliente).

No introduce registro de usuarios, roles, refresh tokens ni multi-tenant. El usuario de demo se crea con el comando dedicado **`pnpm --filter api auth:create-demo-user`** (separado del seed general de Prisma).

---

## 2. Diagrama de flujo (arquitectura MVP)

```text
┌──────────┐     POST /api/auth/login      ┌─────────────┐     Prisma      ┌────────────┐
│ Browser  │ ──────────────────────────────► │  NestJS API │ ──────────────► │ PostgreSQL │
│ (React)  │     email + password           │  AuthModule │   User lookup   │   User     │
└──────────┘                                 └──────┬──────┘   argon2 verify└────────────┘
     ▲                                              │
     │         Set-Cookie: deliveryops_access_token  │  JWT firmado (no en JSON)
     │         HttpOnly; SameSite=Lax; Path=/        │
     └──────────────────────────────────────────────┘

Flujo post-login:
┌──────────┐   GET /api/auth/me (cookie)    ┌─────────────┐     Prisma
│ LoginPage│ ─────────────────────────────► │ AuthModule  │ ───► User (email, name)
│Protected │   credentials: "include"       └─────────────┘
│  Route   │         fuente de verdad FE
└──────────┘   GET /api/user-stories (cookie) ──► JwtAuthGuard (sub) ──► UserStoriesModule ──► Prisma
```

---

## 3. Alcance MVP

| Área | Entregable MVP |
|------|----------------|
| **Prisma** | Modelo `User` (`id`, `name`, `email`, `passwordHash`, timestamps) + migración (sin mezclar usuario demo en seed general) |
| **Demo user** | Comando `pnpm --filter api auth:create-demo-user` crea usuario local de prueba |
| **Backend** | Módulo `auth`: `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`; JWT en cookie HttpOnly |
| **Seguridad** | Hash de contraseña con **argon2**; JWT firmado con `JWT_SECRET`; cookie `HttpOnly`, `SameSite=Lax`, `Secure` configurable |
| **Frontend** | Página `/login`, `AuthProvider` (sin JWT), `ProtectedRoute` vía `/api/auth/me`, cliente `authApi.ts` |
| **Navegación** | Rutas operativas requieren sesión activa; `/login` es pública |
| **API client** | Todas las llamadas autenticadas usan `credentials: "include"` (cookie enviada automáticamente) |
| **Logout** | `POST /api/auth/logout` limpia cookie en backend; frontend redirige a `/login` |
| **Swagger** | Tag `auth` con contratos login, logout y me documentados |
| **Tests backend** | Unitarios + integración: Set-Cookie, `/me`, logout, 401 sin cookie (RED → GREEN) |
| **Build** | `pnpm --filter api build` y `pnpm --filter web build` en verde |
| **E2E** | Playwright smoke con flujo real de login o mocks coherentes con cookie |

### Backend (`apps/api`)

- Nuevo módulo `auth/` siguiendo el patrón pragmático existente (controller → service → Prisma).
- `AuthService.login(email, password)`:
  1. Busca usuario por `email` (normalizado: trim + lowercase).
  2. Verifica contraseña con **argon2** (`argon2.verify` contra `passwordHash`).
  3. Emite JWT con payload mínimo `{ sub: userId }` (sin email ni otros claims).
  4. Establece cookie HttpOnly con el JWT (**no** devuelve el token en el cuerpo JSON).
- `AuthService.logout()`: limpia la cookie de sesión (`Set-Cookie` con `Max-Age=0` o valor vacío).
- `AuthService.getMe(userId)`: carga `id`, `email` y `name` desde Prisma usando `sub` del JWT.
- `JwtStrategy` extrae el JWT **desde la cookie** (`AUTH_COOKIE_NAME`), no desde header `Authorization`.
- `JwtAuthGuard` aplicado **explícitamente** con `@UseGuards(JwtAuthGuard)` en cada controller de negocio.
- **Sin** `APP_GUARD` global en esta fase.
- Rutas públicas en MVP:
  - `GET /api/health`
  - `POST /api/auth/login`
  - `POST /api/auth/logout`
  - Swagger local `/api/docs`
- `GET /api/auth/me` requiere sesión válida (guard en el propio `AuthController` o método protegido).

### Frontend (`apps/web`)

- `LoginPage` en `/login`: envía email + password; **no lee ni guarda JWT**.
- `AuthProvider` (React Context) con estado `user`, `isAuthenticated`, `loading`, `login()`, `logout()`, `refreshSession()`.
  - **No** almacena JWT ni usa `localStorage` / `sessionStorage` para el token.
  - Al montar, llama `GET /api/auth/me` con `credentials: "include"` para hidratar sesión.
  - **No** decide autorización solo con estado en memoria: siempre valida contra `/api/auth/me`.
- `ProtectedRoute` espera verificación de sesión vía backend (`/api/auth/me`); redirige a `/login` si la sesión no es verificable.
- `App.tsx`: rutas operativas envueltas en `ProtectedRoute`; `AppNav` oculto en `/login`.
- Clientes HTTP existentes (`userStoriesApi.ts`, `sprintAnalysisApi.ts`, etc.) actualizados con `credentials: "include"`.

### Usuario demo (comando dedicado)

El usuario de prueba **no** se crea en el seed general de Prisma. Se usa un comando específico del slice auth:

```bash
pnpm --filter api auth:create-demo-user
```

Comportamiento esperado del comando:

- Crea (o actualiza de forma idempotente) un único usuario demo en la tabla `User`.
- Hashea la contraseña con **argon2** (`argon2.hash`); **nunca** persiste la contraseña en claro.

| Campo | Valor demo |
|-------|------------|
| `email` | `pm@deliveryops.local` |
| `password` | `DeliveryOps123!` |
| `name` | `Demo PM` |

> Credenciales solo para entorno local/académico. En base de datos solo existe `passwordHash` argon2. Documentar el comando en `DEMO.md` (fase implementación).

---

## 4. Fuera de alcance explícito

| Área | Motivo |
|------|--------|
| Registro de usuarios (`POST /api/auth/register`) | Fuera de US-001 MVP; usuario demo vía `auth:create-demo-user` |
| Usuario demo en `prisma/seed.ts` general | Evita mezclar auth demo con seed de datos de negocio |
| Pantalla de registro | TB-022 menciona registro; se difiere a iteración futura |
| Refresh tokens / rotación de tokens | Explícitamente excluido |
| OAuth / SSO (Google, GitHub, etc.) | Explícitamente excluido |
| Roles y RBAC (`admin`, `viewer`, guards por rol) | Explícitamente excluido |
| Multi-tenant / workspaces | Explícitamente excluido |
| MFA / 2FA | Fuera de alcance MVP |
| Recuperación de contraseña / reset por email | Fuera de alcance MVP |
| Almacenar JWT en `localStorage` o `sessionStorage` | Riesgo XSS; sustituido por cookie HttpOnly |
| Header `Authorization: Bearer` en MVP | Cookie HttpOnly es el canal de sesión |
| `APP_GUARD` global | Guard explícito por controller en esta fase |
| CSRF avanzado (tokens anti-CSRF, double-submit) | MVP local; mitigación básica con `SameSite=Lax` (ver decisiones D6) |
| Rate limiting / CAPTCHA en login | Hardening futuro documentado |
| Blacklist de JWT / tabla `Session` | Logout limpia cookie; JWT stateless hasta expirar |
| `packages/shared` con tipos compartidos | Duplicación mínima FE/BE aceptable |
| TanStack Query / Zustand para auth | Context + `/api/auth/me` suficiente en MVP |
| Proteger Swagger en producción | Fuera de alcance; documentación local abierta |
| Cambiar lógica de negocio de slices US-002–US-009 | Solo se añade capa de autenticación encima |

---

## 5. Flujo funcional

### 5.1 Login válido

```text
Usuario no autenticado visita /dashboard
        │
        ▼
AuthProvider: GET /api/auth/me → 401 (sin cookie)
        │
        ▼
ProtectedRoute redirige a /login
        │
        ▼
Usuario introduce email + password correctos
        │
        ▼
POST /api/auth/login (credentials: "include")
        │
        ▼
200 { user } + Set-Cookie: deliveryops_access_token=...; HttpOnly; Path=/; SameSite=Lax
        │
        ▼
Frontend llama GET /api/auth/me para confirmar sesión (fuente de verdad backend)
        │
        ▼
Frontend actualiza user/isAuthenticated solo tras /me exitoso (sin leer el JWT)
        │
        ▼
Redirección a /dashboard
        │
        ▼
AppNav visible; llamadas API con credentials: "include"
```

### 5.2 Login inválido

```text
Usuario en /login introduce credenciales incorrectas
        │
        ▼
POST /api/auth/login → 401 Unauthorized
        │
        ▼
Sin header Set-Cookie de sesión (o cookie no establecida)
        │
        ▼
UI muestra mensaje de error visible (role="alert")
        │
        ▼
Usuario permanece en /login; isAuthenticated = false
```

**Regla de seguridad:** mensaje genérico *"Invalid email or password"* — no revelar si el email existe.

### 5.3 Acceso a rutas protegidas sin sesión

```text
Cliente sin cookie de sesión
        │
        ├─► Frontend: GET /api/auth/me → 401
        │         ProtectedRoute redirige a /login
        │
        └─► API directa: GET /api/user-stories sin cookie
                  → 401 Unauthorized (JwtAuthGuard)
```

### 5.4 Acceso a rutas protegidas con sesión válida

```text
Cliente con cookie HttpOnly válida (JWT no expirado)
        │
        ├─► Frontend: GET /api/auth/me → 200 { user }
        │         ProtectedRoute renderiza la página
        │
        └─► API: GET /api/user-stories (cookie enviada automáticamente)
                  → 200 OK (comportamiento de negocio existente)
```

### 5.5 Logout

```text
Usuario autenticado pulsa "Log out" en AppNav
        │
        ▼
POST /api/auth/logout (credentials: "include")
        │
        ▼
Backend responde 200 y limpia cookie (Set-Cookie Max-Age=0)
        │
        ▼
Frontend resetea user/isAuthenticated y redirige a /login
        │
        ▼
GET /api/auth/me → 401
GET /api/user-stories → 401
```

---

## 6. Contrato API propuesto

### Política general de sesión

- El JWT **nunca** se expone en el cuerpo JSON de las respuestas.
- El navegador almacena el token exclusivamente en la cookie HttpOnly configurada por el backend.
- El frontend **no** lee, parsea ni persiste el JWT.
- Todas las peticiones autenticadas del frontend usan `credentials: "include"`.

### Fuente de verdad (backend)

- El **backend** es siempre la fuente de verdad de la sesión mediante `GET /api/auth/me`.
- El frontend **nunca** debe tomar decisiones de autorización basándose únicamente en estado en memoria (p. ej. asumir sesión válida tras login sin revalidar).
- Tras `POST /api/auth/login`, el frontend debe confirmar sesión con `GET /api/auth/me` antes de tratar al usuario como autenticado en rutas protegidas.
- Ante **cualquier** `401`, error de red al consultar `/me`, o sesión no verificable: tratar al usuario como **no autenticado** y redirigir a `/login`.
- `isAuthenticated` en React es un reflejo de la última respuesta exitosa de `/me`, no un sustituto de la verificación backend.

### Nota de seguridad — HTTPS y cookie `Secure`

- En **producción**, HTTPS es **obligatorio**.
- `AUTH_COOKIE_SECURE=true` **solo** debe usarse con HTTPS; la cookie con flag `Secure` no se enviará por HTTP plano.
- En **local** (`http://localhost`), `AUTH_COOKIE_SECURE=false` es aceptable para desarrollo con Vite + API en HTTP.
- Nunca activar `AUTH_COOKIE_SECURE=true` en un entorno servido solo por HTTP.

### Atributos de la cookie de sesión

| Atributo | Valor MVP |
|----------|-----------|
| Nombre | `AUTH_COOKIE_NAME` → `deliveryops_access_token` |
| `HttpOnly` | `true` (obligatorio) |
| `Secure` | `AUTH_COOKIE_SECURE` — `false` en `http://localhost`; `true` en producción con HTTPS |
| `SameSite` | `Lax` (`AUTH_COOKIE_SAME_SITE=lax`) |
| `Path` | `/` |
| Contenido | JWT firmado con `JWT_SECRET` |
| TTL | `JWT_EXPIRES_IN` → `30m` |

**JWT payload (claims internos en la cookie; no expuestos al frontend):**

```json
{
  "sub": "clx00000000000000000000000"
}
```

| Claim | Descripción |
|-------|-------------|
| `sub` | `user.id` — único identificador en el token |
| `iat` | Issued at (automático, añadido por la librería JWT) |
| `exp` | Expiración (automático, `JWT_EXPIRES_IN=30m`) |

**No incluir** en el JWT: `email`, `name`, `role`, `tenantId` ni ningún otro claim de autorización o perfil. `email` y `name` se recuperan desde PostgreSQL en `GET /api/auth/me` usando `sub`.

---

### `POST /api/auth/login`

Autenticación. Cuerpo JSON. **Ruta pública** (sin `JwtAuthGuard`).

#### Request

```json
{
  "email": "pm@deliveryops.local",
  "password": "DeliveryOps123!"
}
```

| Campo | Tipo | Validación |
|-------|------|------------|
| `email` | `string` | Obligatorio, formato email, trim + lowercase en servidor |
| `password` | `string` | Obligatorio, mínimo 8 caracteres |

#### Response — `200 OK`

```json
{
  "user": {
    "id": "clx00000000000000000000000",
    "email": "pm@deliveryops.local",
    "name": "Demo PM"
  },
  "message": "Login successful"
}
```

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `user` | `object` | Usuario autenticado (sin `passwordHash`) |
| `message` | `string` | Opcional; mensaje informativo |

**Headers de respuesta:**

```http
Set-Cookie: deliveryops_access_token=<jwt>; HttpOnly; Path=/; SameSite=Lax; Max-Age=1800
```

> En producción con HTTPS: `AUTH_COOKIE_SECURE=true` añade el flag `Secure` a la cookie. En local (`http://localhost`): `AUTH_COOKIE_SECURE=false`.

#### Errores

| Caso | HTTP | Body ejemplo |
|------|------|--------------|
| Credenciales incorrectas | `401` | `{ "statusCode": 401, "message": "Invalid email or password" }` |
| Validación DTO | `400` | `{ "statusCode": 400, "message": ["email must be an email", ...] }` |
| Error interno | `500` | `{ "statusCode": 500, "message": "Internal server error" }` |

En `401` y `400`: **no** establecer cookie de sesión.

---

### `POST /api/auth/logout`

Cierra sesión. **Ruta pública** (no requiere sesión previa para invocarse; idempotente).

#### Request

Sin cuerpo. El navegador puede enviar la cookie existente con `credentials: "include"`.

#### Response — `200 OK`

```json
{
  "message": "Logout successful"
}
```

**Headers de respuesta:**

```http
Set-Cookie: deliveryops_access_token=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0
```

#### Errores

| Caso | HTTP | Body ejemplo |
|------|------|--------------|
| Éxito (con o sin cookie previa) | `200` | `{ "message": "Logout successful" }` |
| Error interno | `500` | `{ "statusCode": 500, "message": "Internal server error" }` |

---

### `GET /api/auth/me`

Devuelve el usuario de la sesión activa. **Ruta protegida** (`JwtAuthGuard`).

El guard valida el JWT de la cookie y extrae `sub`. El servicio carga `id`, `email` y `name` desde Prisma — **no** desde claims del token.

#### Request

Sin cuerpo. Requiere cookie de sesión válida.

#### Response — `200 OK`

```json
{
  "user": {
    "id": "clx00000000000000000000000",
    "email": "pm@deliveryops.local",
    "name": "Demo PM"
  }
}
```

#### Errores

| Caso | HTTP | Body ejemplo |
|------|------|--------------|
| Sin cookie / cookie inválida / JWT expirado | `401` | `{ "statusCode": 401, "message": "Unauthorized" }` |
| Error interno | `500` | `{ "statusCode": 500, "message": "Internal server error" }` |

---

### Autenticación en endpoints de negocio protegidos

Todos los controllers de negocio llevan `@UseGuards(JwtAuthGuard)`. El guard lee el JWT desde la cookie `deliveryops_access_token`.

| Caso | HTTP | Body ejemplo |
|------|------|--------------|
| Cookie ausente | `401` | `{ "statusCode": 401, "message": "Unauthorized" }` |
| Cookie malformada o firma inválida | `401` | `{ "statusCode": 401, "message": "Unauthorized" }` |
| JWT expirado | `401` | `{ "statusCode": 401, "message": "Unauthorized" }` |

#### Swagger

- Tag: `auth`
- Documentar `POST /login`, `POST /logout`, `GET /me`
- Nota: la sesión se gestiona por cookie HttpOnly; en Swagger UI puede requerir configuración manual de cookies para probar endpoints protegidos

### Variables de entorno (nuevas)

| Variable | Valor por defecto | Uso |
|----------|-------------------|-----|
| `JWT_SECRET` | *(obligatorio en runtime)* | Firma HMAC del JWT |
| `JWT_EXPIRES_IN` | `30m` | TTL del access token |
| `AUTH_COOKIE_NAME` | `deliveryops_access_token` | Nombre de la cookie de sesión |
| `AUTH_COOKIE_SECURE` | `false` (local `http://localhost`) / `true` (prod HTTPS) | Flag `Secure`; **obligatorio `true` solo con HTTPS** |
| `AUTH_COOKIE_SAME_SITE` | `lax` | Atributo `SameSite` de la cookie |

---

## 7. Cambios previstos en backend NestJS

### Estructura de archivos sugerida

```text
apps/api/src/auth/
├── auth.module.ts
├── auth.controller.ts          # POST login, POST logout, GET me
├── auth.service.ts             # validateUser, login, logout, getMe
├── auth.service.spec.ts
├── dto/
│   ├── login-request.dto.ts
│   ├── login-response.dto.ts
│   └── me-response.dto.ts
├── guards/
│   └── jwt-auth.guard.ts
├── strategies/
│   └── jwt.strategy.ts         # Extrae JWT desde cookie; payload solo { sub }
└── utils/
    ├── auth-cookie.utils.ts    # setAuthCookie, clearAuthCookie
    └── create-demo-user.ts     # Script invocado por auth:create-demo-user
```

### `AppModule` y guards

- Importar `AuthModule`.
- **No** registrar `JwtAuthGuard` como `APP_GUARD` global en esta fase.
- Aplicar `@UseGuards(JwtAuthGuard)` explícitamente en:
  - `UserStoriesController`
  - `SprintCapacityController`
  - `SprintAbsencesController`
  - `SprintAnalysisController`
  - `RefinementController`
  - Método `GET me` en `AuthController`
- Rutas sin guard (públicas):
  - `AppController` → `GET /api/health`
  - `AuthController` → `POST /api/auth/login`, `POST /api/auth/logout`
  - Swagger `/api/docs`

### Módulos existentes afectados

| Módulo | Cambio |
|--------|--------|
| `UserStoriesModule` | `@UseGuards(JwtAuthGuard)` en controller; sin cambio de lógica |
| `SprintCapacityModule` | Idem |
| `SprintAbsencesModule` | Idem |
| `SprintAnalysisModule` | Idem |
| `RefinementModule` | Idem |
| `AppController` | Sin guard (health público) |

### Dependencias npm previstas (fase implementación)

> **Nota:** no modificar `package.json` en esta fase spec. En implementación se añadirán dependencias auth y el script npm `auth:create-demo-user` en `apps/api/package.json`.

- `@nestjs/jwt`
- `@nestjs/passport`
- `passport`
- `passport-jwt`
- `argon2`
- `cookie-parser`
- `@types/passport-jwt` (dev)
- `@types/cookie-parser` (dev)

### `main.ts`

- Habilitar `cookie-parser` middleware para lectura de cookies en requests.
- CORS: mantener orígenes Vite locales y añadir `credentials: true` para permitir cookies cross-origin en desarrollo (`http://localhost:5173` → `http://localhost:3000`).

---

## 8. Cambios previstos en Prisma

### Modelo `User`

```prisma
model User {
  id           String   @id @default(cuid())
  name         String
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

- Campo `passwordHash`: hash **argon2** del password (nunca texto plano).
- Alineado con subconjunto de `docs/04-data-model.md` § 5.1.

### Migración

- Nueva migración: `add_user_model` (nombre orientativo).
- **No ejecutar en fase spec** — solo documentar intención.

### Usuario demo (sin seed general)

- **No** extender `prisma/seed.ts` con el usuario de auth.
- Comando dedicado: `pnpm --filter api auth:create-demo-user` (script en `apps/api`, hash argon2).
- Documentar comando y credenciales en `docs/DEMO.md` (fase implementación).

### Sin cambios en modelos existentes

`UserStory`, `SprintCapacity`, `SprintAbsence`, `HealthCheck` permanecen iguales. No se añade `userId` FK (ownership fuera de alcance).

---

## 9. Cambios previstos en frontend React

### Estructura de archivos sugerida

```text
apps/web/src/
├── auth/
│   ├── AuthContext.tsx         # user, isAuthenticated, loading — sin JWT
│   └── ProtectedRoute.tsx      # Redirect según isAuthenticated
├── pages/
│   └── LoginPage.tsx           # Formulario email + password
├── api/
│   └── authApi.ts              # login, logout, getMe
└── lib/
    └── fetchWithCredentials.ts # (opcional) wrapper fetch + credentials: "include"
```

### Rutas (`App.tsx`)

| Ruta | Acceso | Componente |
|------|--------|------------|
| `/login` | Público | `LoginPage` (sin `AppNav`) |
| `/` | Protegido | Redirect → `/dashboard` |
| `/dashboard` | Protegido | `DashboardPage` |
| `/user-stories` | Protegido | `UserStoriesPage` |
| `/sprint-analysis` | Protegido | `SprintAnalysisPage` |
| `/refinement` | Protegido | `RefinementPage` |
| `/settings` | Protegido | `SettingsPage` |
| `*` | Protegido | Redirect → `/dashboard` |

### `LoginPage` — UX mínima

- Título: **Sign in to DeliveryOps AI**
- Campos: email (`type="email"`), password (`type="password"`)
- Submit → `POST /api/auth/login` con `credentials: "include"`
- Tras éxito: **obligatorio** llamar `refreshSession()` → `GET /api/auth/me` antes de considerar sesión activa
- Banner de error (`role="alert"`) en 401/400/error de red
- **No** leer `document.cookie` ni almacenar token
- **No** marcar `isAuthenticated = true` solo por la respuesta de login sin confirmar `/me`

### `AuthProvider`

Estado permitido:

| Estado | Tipo | Origen |
|--------|------|--------|
| `user` | `{ id, email, name } \| null` | **Solo** `GET /api/auth/me` (backend / Prisma) |
| `isAuthenticated` | `boolean` | `true` únicamente tras `/me` → `200`; en cualquier otro caso, `false` |
| `loading` | `boolean` | Hidratación o revalidación de sesión vía `/me` |

Métodos:

- `login(email, password)` → `POST /api/auth/login` → luego `refreshSession()`
- `logout()` → `POST /api/auth/logout` + reset estado + redirect
- `refreshSession()` → `GET /api/auth/me` (fuente de verdad)

**Prohibido en AuthProvider:** almacenar JWT; usar `localStorage`/`sessionStorage`; confiar en estado en memoria sin revalidar contra `/me`.

**Regla de autorización frontend:** nunca conceder acceso a rutas protegidas basándose solo en memoria. Si `/me` falla o devuelve `401`, tratar como no autenticado y redirigir a `/login`.

### `ProtectedRoute`

- Mientras `loading === true`: spinner o pantalla de carga mínima (esperando `/api/auth/me`).
- Si `!isAuthenticated` (sesión no verificada por backend): `<Navigate to="/login" />`.
- Si autenticado (último `/me` exitoso): renderiza children.
- No renderizar contenido protegido hasta completar la verificación inicial de `/me`.

### `AppNav`

- Muestra `user.name` o `user.email`
- Botón **Log out** → `logout()`
- Oculto en `/login`

### Clientes API existentes

Todas las funciones `fetch` en `apps/web/src/api/*.ts` deben incluir:

```typescript
// Firma orientativa — no implementar en fase spec
fetch(url, {
  credentials: 'include',
  // ...headers, method, body
})
```

En respuesta `401` de endpoints protegidos o de `/me`: resetear sesión, tratar como no autenticado y redirigir a `/login`.

---

## 10. Escenarios BDD (Given / When / Then)

### Login exitoso

```gherkin
Given a registered user exists with email "pm@deliveryops.local"
And the user is on the login page
When the user submits valid credentials
Then the system sets an HttpOnly session cookie
And the system confirms the session via "GET /api/auth/me"
And the system returns the authenticated user without exposing the JWT in JSON
And the user is redirected to the dashboard
And the main navigation is visible
```

### Login con credenciales inválidas

```gherkin
Given the user is on the login page
When the user submits an invalid email or password
Then the system denies access with HTTP 401
And no session cookie is set
And an error message is displayed
```

### Consulta de sesión activa

```gherkin
Given the user has a valid session cookie
When the frontend calls "GET /api/auth/me"
Then the system responds with HTTP 200 and the authenticated user loaded from the database
```

### Sin sesión activa

```gherkin
Given the user has no session cookie
When the frontend calls "GET /api/auth/me"
Then the system responds with HTTP 401 Unauthorized
```

### Acceso a ruta protegida sin autenticación

```gherkin
Given the user is not authenticated
When the user navigates to "/user-stories"
Then the system redirects to the login page
```

### Acceso a API de negocio sin cookie

```gherkin
Given the API is running
When a client calls "GET /api/user-stories" without a session cookie
Then the system responds with HTTP 401 Unauthorized
```

### Acceso con sesión válida

```gherkin
Given the user has successfully logged in
And a valid session cookie exists in the browser
When the user navigates to "/sprint-analysis"
Then the sprint analysis page is displayed
And API requests are sent with credentials included
```

### Logout

```gherkin
Given the user is authenticated
When the user clicks "Log out"
Then the system calls "POST /api/auth/logout"
And the session cookie is cleared by the backend
And the user is redirected to the login page
And protected routes are no longer accessible without logging in again
```

### Sesión no verificable (fuente de verdad)

```gherkin
Given the frontend has stale in-memory auth state
When "GET /api/auth/me" returns HTTP 401
Then the application treats the user as not authenticated
And the user is redirected to the login page
```

### Sesión expirada

```gherkin
Given the user has an expired session cookie
When the frontend calls "GET /api/auth/me"
Then the system responds with HTTP 401
And the application treats the session as invalid
And the user is redirected to the login page
```

---

## 11. Estrategia de tests RED / GREEN

### Fase RED (escribir tests que fallen)

#### Backend — unitarios (`auth.service.spec.ts`)

| # | Escenario RED | Assert esperado tras GREEN |
|---|---------------|------------------------------|
| R1 | `login` con credenciales válidas | Retorna `user` sin `passwordHash`; JWT en cookie con payload solo `{ sub }`; **no** `accessToken` en body |
| R2 | `login` con email inexistente | Lanza `UnauthorizedException` |
| R3 | `login` con password incorrecta | Lanza `UnauthorizedException` |
| R4 | `validateUser` normaliza email | Encuentra usuario tras trim + lowercase |
| R5 | Verificación de password | Usa argon2 verify (mock); nunca compara ni almacena texto plano |
| R5b | `signToken` / JWT emitido | Payload contiene solo `sub` (+ `iat`/`exp` automáticos); sin `email` |

#### Backend — integración / controller (`auth.controller.spec.ts` o supertest)

| # | Escenario RED | Assert esperado tras GREEN |
|---|---------------|------------------------------|
| R6 | `POST /api/auth/login` válido | `200` + header `Set-Cookie` con `HttpOnly` y nombre `deliveryops_access_token` |
| R7 | `POST /api/auth/login` inválido | `401` + **sin** `Set-Cookie` de sesión |
| R8 | `GET /api/auth/me` con cookie válida | `200` + `{ user }` con `email`/`name` desde DB |
| R9 | `GET /api/auth/me` sin cookie | `401` |
| R10 | `POST /api/auth/logout` | `200` + cookie limpiada (`Max-Age=0` o valor vacío) |
| R11 | `GET /api/user-stories` sin cookie | `401` |
| R12 | `GET /api/health` sin cookie | `200` (público) |
| R13 | `POST /api/auth/login` sin cookie previa | Accesible (público); no bloqueado por guard |

#### Frontend — build smoke

| # | Comando | Estado RED esperado |
|---|---------|---------------------|
| R14 | `pnpm --filter web build` | Falla hasta existir `LoginPage`, `AuthProvider` y rutas |

### Fase GREEN (implementación mínima)

1. **Prisma:** modelo `User` + migración (sin usuario demo en seed general).
2. **Comando demo:** `auth:create-demo-user` con argon2.
3. **AuthService:** argon2 verify + sign JWT (`sub` only) + helpers de cookie → R1–R5b verdes.
4. **AuthController:** login/logout/me con Set-Cookie → R6–R10 verdes.
5. **JwtAuthGuard explícito** en controllers de negocio → R11–R13 verdes.
6. **LoginPage + AuthProvider + ProtectedRoute** (sesión vía `/me`, sin JWT en cliente) → R14 verde.
7. **`credentials: "include"`** en clientes API → flujo manual + E2E.

### Playwright — smoke (`e2e/auth-login.spec.ts`)

| Caso | Pasos |
|------|-------|
| Login OK | `auth:create-demo-user` + flujo real **o** mock `POST /login` con `Set-Cookie` + mock `/me` → submit → `/me` OK → `/dashboard` |
| Login KO | Credenciales inválidas → `401` → mensaje de error; sin cookie de sesión |
| Ruta protegida | Sin cookie → `/settings` → redirect `/login` |
| Logout | Login → `POST /logout` limpia cookie → redirect `/login` |
| API protegida | Sin cookie → `GET /api/user-stories` → `401` |

> Los mocks de Playwright deben ser **coherentes con cookie**: si se simula login exitoso, incluir header `Set-Cookie` en la respuesta mock y enviar cookie en peticiones subsiguientes, o usar `storageState` con cookies de contexto.

### Comandos de verificación

```bash
pnpm --filter api auth:create-demo-user   # usuario demo local (antes de smoke manual/E2E)
pnpm --filter api test
pnpm --filter api build
pnpm --filter web build
# Playwright (local, si aplica):
pnpm exec playwright test e2e/auth-login.spec.ts
```

---

## 12. Definition of Done

- [x] Spec `docs/auth-mvp.md` aprobada por revisión humana (v3 — revisión técnica seguridad)
- [x] Modelo Prisma `User` con migración aplicada en local
- [x] Comando `pnpm --filter api auth:create-demo-user` operativo; usuario demo **fuera** del seed general
- [x] `POST /api/auth/login` establece cookie HttpOnly; JWT payload solo `{ sub }`; **no** expone token en JSON
- [x] `POST /api/auth/logout` limpia cookie desde backend
- [x] `GET /api/auth/me` devuelve usuario desde DB o `401`
- [x] `JwtAuthGuard` aplicado explícitamente en controllers de negocio (sin `APP_GUARD` global)
- [x] Rutas públicas limitadas a health, login, logout y Swagger local
- [x] Pantalla `/login` funcional; frontend **sin** almacenamiento de JWT
- [x] `AuthProvider` valida sesión solo vía `GET /api/auth/me` (fuente de verdad backend)
- [x] `ProtectedRoute` no confía en memoria sin verificación `/me`
- [x] Logout en `AppNav` invoca `POST /api/auth/logout` y redirige a login
- [x] Clientes API usan `credentials: "include"`
- [x] Tests backend en verde (R1–R13)
- [x] `pnpm --filter api build` y `pnpm --filter api test` OK
- [x] `pnpm --filter web build` OK
- [x] Playwright smoke auth en verde (`e2e/auth-login.spec.ts`; suite total 9/9)
- [x] Entrada añadida en `prompts.md` (**P-024**)
- [ ] PR enlazada a issue **#8** (`Closes #8` o referencia explícita) — pendiente commit único y PR

---

## 13. Riesgos y decisiones MVP

| # | Decisión | Alternativa descartada | Motivo |
|---|----------|------------------------|--------|
| D1 | Cookie HttpOnly para JWT | `localStorage` / `sessionStorage` | Mitiga robo de token vía XSS; el frontend no accede al JWT |
| D2 | Sin refresh token | Refresh + rotación | Restricción explícita; re-login tras `JWT_EXPIRES_IN=30m` |
| D3 | `POST /api/auth/logout` limpia cookie | Solo logout cliente | El navegador deja de enviar la cookie; UX coherente |
| D4 | argon2 para passwords | bcrypt | Mejor resistencia GPU/ASIC; práctica recomendada actual |
| D5 | Passwords nunca en claro | Texto plano o reversible | Solo `passwordHash` argon2 en DB; verify con argon2 |
| D6 | `SameSite=Lax` sin CSRF token | CSRF token / double-submit | MVP local y same-site lax; hardening CSRF en iteración futura |
| D7 | Sin rate limiting en login | Throttle / lockout | Documentado como hardening futuro (GH-13 / deploy) |
| D8 | Guard explícito por controller | `APP_GUARD` global | Control granular en esta fase; menos magia implícita |
| D9 | Usuario demo vía `auth:create-demo-user` | Seed general Prisma / UI registro | Separa auth demo de datos de negocio; reduce acoplamiento |
| D10 | JWT payload solo `{ sub }` | Incluir `email` en token | Perfil siempre desde DB en `/me`; token mínimo |
| D11 | `/api/auth/me` como fuente de verdad FE | Estado en memoria sin revalidar | Backend decide sesión; FE no autoriza por memoria sola |
| D12 | `AUTH_COOKIE_SECURE=true` solo con HTTPS | Secure en HTTP local | Obligatorio HTTPS en producción |
| D13 | Sin roles / RBAC | Guards por rol | Restricción explícita; cualquier usuario autenticado accede a todo |
| D14 | Sin OAuth / SSO | Proveedores externos | Restricción explícita |
| D15 | Sin MFA | TOTP / WebAuthn | Fuera de alcance MVP |
| D16 | Sin password recovery | Email reset flow | Fuera de alcance MVP |
| D17 | `JWT_EXPIRES_IN=30m` | Sesión larga / sin expiración | Reduce ventana de exposición si cookie comprometida |
| D18 | CORS `credentials: true` | CORS sin credenciales | Requerido para cookies cross-origin en dev Vite ↔ API |
| D19 | No FK `userId` en recursos | Ownership por usuario | Auth es gate de acceso, no multi-usuario de datos |
| D20 | CI sin PostgreSQL hoy | Tests integración login en CI | Unitarios + mocks en CI; integración local / GH-13 futuro |

### Lo que **no** incluye esta iteración (resumen)

- `localStorage` para JWT
- Refresh token
- RBAC / roles
- OAuth / SSO
- MFA
- Password recovery
- CSRF avanzado (mitigación básica: `SameSite=Lax`)
- Rate limiting (hardening futuro)

### Impacto en slices existentes

Tras implementar US-001, **todos los flujos E2E manuales y Playwright existentes** deberán:

1. Realizar login (flujo real o mock con cookie) antes de navegar a rutas protegidas, **o**
2. Mockear respuestas API con coherencia de sesión por cookie.

Este impacto se documentará en el PR de implementación y en actualización de `DEMO.md`.

---

## 14. Trazabilidad

| Referencia | Relación |
|------------|----------|
| **GitHub issue #8** | Gate spec-first antes de implementación |
| **Backlog GH-06** | US-001 en `docs/09-github-backlog-bootstrap.md` |
| **US-001** | Historia de usuario origen (`docs/05-user-stories.md`) |
| **TB-008** | Schema y entidad User |
| **TB-009** | JWT authentication (login; demo user vía comando dedicado) |
| **TB-022** | Pantalla login (registro diferido) |
| `docs/03-technical-design.md` § 13 | Estrategia de autenticación objetivo |
| `docs/04-data-model.md` § 5.1 | Modelo User objetivo |
| `docs/adr/ADR-004-vertical-slice-first.md` | Vertical slice transversal E2E |
| Slices US-002–US-009 | Consumidores de la nueva capa de protección |

### Cadena de dependencias

```text
Foundation + US-002–US-009 ✅
        │
        ▼
US-001 (este spec) ✅ ──► Login JWT (cookie HttpOnly) + /me + /logout + API protegida
        │
        ├──► Habilita requisito "authenticated access" del MVP máster
        │
        └──► Prerequisito lógico para deploy público (GH-12)
```

---

## 15. Próximo paso recomendado

1. **Commit único** de US-001 y **PR** enlazada a issue **#8** (`Closes #8`).
2. **Iteración futura (fuera de US-001):** registro, refresh tokens, roles, CSRF tokens, rate limiting, ownership de recursos.

---

**Documento:** `docs/auth-mvp.md`  
**Última actualización:** 2026-06-25 (IMPLEMENTED — validación local jun 2026)
