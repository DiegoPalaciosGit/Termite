# Termite — Pendientes (2026-07-13)

## Qué se hizo en esta sesión

| Qué | Estado |
|-----|--------|
| Migración 005 (RLS por rol) | ✅ Aplicada en Supabase |
| Diagnóstico bug invite | ✅ Tres causas encontradas (ver abajo) |
| SMTP propio con Resend | ✅ Configurado en Supabase Auth |
| Usuario zombie de Diego eliminado | ✅ SQL de limpieza corrido |
| Migración 006 (FK clients.user_id) | ⚠️ Escrita — **verificar si ya se corrió** |
| Migración 007 (folio por trigger) | ❌ Escrita — **falta correr en SQL editor** |
| Código: folio removido de actions | ✅ Editado — **falta commit + deploy** |

### El bug del invite era tres cosas encimadas

1. `profiles.role` tenía un CHECK que no incluía `'client'` → el upsert del invite tronaba (arreglado en 005).
2. `clients.user_id` referenciaba `auth.users` sin `ON DELETE` → borrar un usuario linkeado a un cliente fallaba a medias y dejaba usuarios zombie sin correo (arreglado en 006).
3. El SMTP built-in de Supabase solo manda ~2 correos/hora y solo a miembros del equipo del proyecto → 500 opaco (`AuthRetryableFetchError {}`) en cualquier invite real (arreglado con Resend, pero ver compras).

## Pasos inmediatos (en orden)

1. **Correr 006 y 007** en el SQL editor de Supabase (si 006 no se corrió ya).
2. **Commit + deploy** — migraciones 005/006/007 y los cambios en `web/src/app/(app)/hojas/actions.ts` y `web/src/app/(portal)/portal/actions.ts` (el folio ahora lo asigna el trigger; sin deploy, prod sigue calculando folio en código y puede chocar).
3. **Recrear cuenta admin de Diego**: login como Carlos → `/usuarios` → invitar `diegopalaciosgonzalez@gmail.com` con rol admin. Con sender `onboarding@resend.dev` el correo SÍ llega si esa dirección es la cuenta de Resend; si no llega, esperar al dominio verificado.
4. **Probar portal end-to-end**: tras verificar dominio, invitar alias `diegopalaciosgonzalez+cliente@gmail.com` desde la ficha del cliente "Diego" (reutilizarla, ya está desvinculada) → set-password → crear solicitud → aprobar como Carlos.
5. Decidir si la ficha de cliente "Diego Palacios González" se queda como cliente de prueba o se borra (no hay botón; sería por SQL).

## Compras necesarias

### Dominio propio — ÚNICA compra necesaria (~$250–500 MXN/año)

**Por qué es bloqueante:**
- **Resend no manda correos a destinatarios arbitrarios sin dominio verificado.** El sender de prueba `onboarding@resend.dev` solo entrega al correo de tu propia cuenta de Resend. Sin dominio: imposible invitar a Carlos, a su equipo o a clientes del portal. Todo el flujo de invites (usuarios y portal) está bloqueado por esto.
- **URL de producción con marca** — hoy es `mangle-termite.vercel.app`; un dominio propio (p. ej. `termite.mx` o `usatermite.com`) da confianza al piloto. Vercel hobby soporta dominio custom gratis.
- **Sender con marca** — los invites saldrían de algo como `hola@termite.mx` en vez de un remitente genérico.

Dónde: Cloudflare Registrar (precio de costo) o Namecheap. Verificación en Resend = agregar 3 registros DNS, 10 minutos.

### No hace falta comprar (por ahora)

- **Resend**: free tier = 3,000 correos/mes, 100/día. Sobra para el piloto.
- **Vercel**: hobby aguanta el piloto, incluye dominio custom y HTTPS.
- **Supabase**: free tier funciona, PERO pausa la DB tras ~1 semana sin actividad y no tiene backups automáticos. **Antes de que Carlos lo use a diario con datos reales, considerar Pro ($25 USD/mes)** — el riesgo es perder datos de producción sin backup. No urgente esta semana.

## Backlog previo (sin cambios)

- SAT Reader (diferido — necesita facturas XML reales de Carlos)
- Archivos untracked en raíz del repo: `.gitignore`, `MVP_PLAN.md`, `app/`, `specs/`, logos, `gemini-code-*.html` — decidir qué se commitea y qué se borra (`app/` en raíz parece accidental; el proyecto vive en `web/`)
- Server actions no revisan errores de insert/update (fallos silenciosos) — agregar manejo de error, aunque sea un redirect con `?error=`
