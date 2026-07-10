# Public Deployment Spec (Issue #14)

Version: 1.0

Status: Draft — production configuration prepared in repository (VS-01); **public deployment executed and validated in July 2026**

Owner: DeliveryOps AI Team

---

## 1. Contexto

El proyecto DeliveryOps AI dispone de un MVP funcional en monorepo con:

- Frontend React + Vite (`apps/web`)
- Backend NestJS + Prisma (`apps/api`)
- Base de datos PostgreSQL
- Pipeline CI de build y test

El Issue #14 define la necesidad de publicar el MVP en entorno accesible por URL para demo y validación final, priorizando una estrategia de despliegue de bajo impacto sobre el estado actual del repositorio.

Esta especificación se limita al despliegue público del MVP existente.

---

## 2. Objetivo

Definir la especificación técnica de despliegue público para el MVP actual, incluyendo arquitectura de hosting, variables de entorno, riesgos, plan de implementación y criterios de cierre.

El objetivo es habilitar disponibilidad pública estable del sistema ya implementado, sin expandir funcionalidad de negocio.

---

## 3. Alcance

Incluido en esta spec:

- Despliegue del frontend en Vercel.
- Despliegue del backend en Railway.
- Provisionado de PostgreSQL gestionado en Railway.
- Configuración de variables de entorno de producción.
- Validación de conectividad end-to-end entre frontend, backend y base de datos.
- Validación funcional post-deploy del MVP existente.
- Definición de criterios de aceptación para cierre del Issue #14.

---

## 4. Fuera de alcance

No incluido en esta spec:

- Implementación de nuevas funcionalidades de producto.
- Rediseño de arquitectura de dominio.
- Refactor mayor de módulos existentes.
- Incorporación de nuevos proveedores de IA.
- Reescritura de tests o expansión de cobertura fuera de validaciones críticas de deploy.
- Cambios de UX no necesarios para compatibilidad de despliegue.

Queda explícito que **no se implementan nuevas funcionalidades**; únicamente se habilita despliegue público del MVP actual.

---

## 5. Arquitectura elegida

- **Frontend:** Vercel
- **Backend:** Railway
- **Database:** Railway PostgreSQL

Flujo lógico:

1. Usuario accede al frontend público (Vercel).
2. Frontend consume API pública del backend (Railway).
3. Backend ejecuta lógica de aplicación y persiste en PostgreSQL gestionado (Railway).
4. Autenticación y sesión se mantienen según la implementación actual de backend/frontend.

---

## 6. Justificación de la decisión

La estrategia Vercel + Railway + Railway PostgreSQL minimiza cambios porque:

- El frontend ya está preparado para build estático de producción.
- El backend ya compila y arranca en modo producción.
- Prisma ya opera con `DATABASE_URL` y migraciones versionadas.
- La separación frontend/backend coincide con la estructura actual del monorepo.
- Evita introducir en esta fase una contenedorización completa no existente como requisito previo.
- Reduce tiempo de puesta en producción para el objetivo del Issue #14.

Se prioriza una ruta de despliegue pragmática, coherente con el estado técnico actual y orientada a entrega demostrable.

---

## 7. Cambios esperados en el repositorio

Cambios documentales y de configuración de despliegue esperables para completar el Issue #14:

- Documentación de arquitectura de despliegue público final.
- Documentación de variables de entorno de producción por servicio.
- Ajustes de configuración necesarios para ejecución en dominios públicos.
- Evidencia de validación post-deploy en documentación de proyecto.

No se contemplan cambios funcionales de negocio ni ampliación de alcance del MVP.

### Estado actual (VS-01 — post-deploy, julio 2026)

Ya implementado en el repositorio:

- CORS configurable mediante `CORS_ORIGINS` (fallback local: puertos Vite `5173`–`5178`).
- Cookies HttpOnly configurables mediante `AUTH_COOKIE_SECURE` y `AUTH_COOKIE_SAME_SITE`.
- Variables documentadas en `apps/api/.env.example` y `apps/web/.env.example`.
- Frontend apunta al backend vía `VITE_API_URL` (build-time en Vercel).

### Ejecución completada / Evidence (Issue #14)

Realizado:

- Frontend Vercel
- Backend Railway
- PostgreSQL Railway
- Variables de entorno
- Migraciones
- Login
- Cookies HttpOnly
- Protected routes
- CSV import
- Capacity
- Absences
- Sprint analysis
- Excel export

Issue #14 se mantiene como trazabilidad; su cierre administrativo en GitHub se revisará aparte.

---

## 8. Variables de entorno necesarias

Referencia detallada: `apps/api/.env.example`, `apps/web/.env.example`.

### Frontend (Vercel)

| Variable | Uso | Local | Producción (recomendado) |
|----------|-----|-------|--------------------------|
| `VITE_API_URL` | URL base del API (build-time; requiere redeploy al cambiar) | `http://localhost:3000` | `https://<tu-api>.up.railway.app` |

### Backend (Railway)

| Variable | Uso | Local | Producción (recomendado) |
|----------|-----|-------|--------------------------|
| `PORT` | Puerto HTTP | opcional (`3000`) | inyectado por Railway |
| `DATABASE_URL` | PostgreSQL | Docker local `:5433` | cadena Railway PostgreSQL |
| `JWT_SECRET` | Firma JWT | valor de dev | secreto fuerte generado |
| `JWT_EXPIRES_IN` | TTL sesión | `30m` | `30m` (o según política) |
| `AUTH_COOKIE_NAME` | Nombre cookie | `deliveryops_access_token` | igual |
| `AUTH_COOKIE_SECURE` | Flag `Secure` | `false` | `true` |
| `AUTH_COOKIE_SAME_SITE` | Atributo `SameSite` | `lax` | `none` (`Secure=true` obligatorio) |
| `CORS_ORIGINS` | Orígenes CORS (`credentials: true`) | omitir → Vite `5173`–`5178` | `https://<tu-frontend>.vercel.app` |

### Base de datos (Railway PostgreSQL)

- Credenciales y URL de conexión gestionadas por Railway y referenciadas desde `DATABASE_URL`.

---

## 9. Riesgos

- **CORS y cookies cross-origin:** configuración incorrecta puede bloquear login/sesión en entorno público.
- **Desalineación de variables de entorno:** valores faltantes o inconsistentes pueden impedir arranque de servicios.
- **Migraciones de base de datos:** ejecución incompleta o en orden incorrecto puede degradar la disponibilidad del backend.
- **Dependencia entre servicios:** frontend puede quedar operativo pero sin backend funcional si la URL pública no está sincronizada.
- **Configuración de dominios:** errores de dominio/SSL pueden afectar acceso público y llamadas API.

---

## 10. Prerequisites

- GitHub repository up to date.
- CI pipeline passing.
- Production environment variables available.
- Railway and Vercel accounts configured.
- Access to the production PostgreSQL instance.

---

## 11. Plan de implementación

1. Confirmar arquitectura objetivo y responsables de cada servicio.
2. Provisionar servicio backend en Railway.
3. Provisionar PostgreSQL gestionado en Railway.
4. Configurar variables de entorno del backend y conexión a base de datos.
5. Ejecutar migraciones en entorno desplegado.
6. Publicar frontend en Vercel.
7. Configurar `VITE_API_URL` apuntando al backend público.
8. Verificar comunicación frontend-backend y persistencia en base de datos.
9. Ejecutar checklist de validación post-deploy.
10. Documentar resultados y cerrar Issue #14 al cumplir DoD.

---

## 12. Plan de validación post-deploy

Validaciones mínimas obligatorias:

- Frontend accesible por URL pública.
- Backend accesible por URL pública.
- Endpoint de salud operativo.
- Registro/login funcional según MVP actual.
- Rutas protegidas accesibles únicamente con sesión válida.
- Operaciones principales del MVP ejecutables sin errores críticos.
- Persistencia y lectura en PostgreSQL operativas.
- Build y CI en estado verde.

Validaciones de calidad:

- No regresión funcional sobre comportamiento existente del MVP.
- Trazabilidad de configuración usada en deploy documentada.

---

## 13. Rollback Plan

- Disable public deployment if required.
- Restore previous environment variables.
- Reconnect to the previous database if applicable.
- Re-run the last stable version.
- Document the incident before retrying.

---

## 14. Definition of Done

El Issue #14 se considera completado cuando:

- Existe frontend público operativo en Vercel.
- Existe backend público operativo en Railway.
- Existe base de datos PostgreSQL gestionada en Railway conectada al backend.
- Variables de entorno requeridas están definidas y verificadas en producción.
- Validación post-deploy está ejecutada y documentada.
- No se han introducido nuevas funcionalidades de producto.
- La entrega es demostrable de extremo a extremo mediante URLs públicas.

---

## 15. Related Artefacts

Issue:

- #14 Deploy MVP

Related specifications:

- `docs/final-delivery-mvp.md`

Related documentation:

- `README.md`
- `ARCHITECTURE.md`
- `PROJECT_CONTEXT.md`
- `docs/DEMO.md`
