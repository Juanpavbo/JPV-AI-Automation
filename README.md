# JPV AI & Automation - Sitio Web con Booking, DB, Notificaciones y PWA

**Stack**: Astro 4 + Preact + Tailwind + Supabase + Vercel + Cloudflare
**Costo**: $0/mes (solo dominio ~$12/año opcional)

---

## 🏗️ Arquitectura Zero-Cost Governance

```
┌─────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                        │
│  Astro + Preact + PWA + Serverless Functions (100GB-hrs gratis) │
└──────────────────────────┬──────────────────────────────────────┘
                           │ HTTPS
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   SUPABASE   │   │  RESEND      │   │  CLOUDFLARE  │
│  (DB+Auth)   │   │  (Email)     │   │  (DNS+CDN)   │
│  500MB/2M    │   │  3k/mes      │   │  Unlimited   │
└──────────────┘   └──────────────┘   └──────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SELF-HOSTED (Oracle Cloud Free Tier)               │
│  2x AMD EPYC VMs + 200GB Storage GRATIS DE POR VIDA            │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ PostHog  │  │  Sentry  │  │UptimeKuma│  │  Postal  │       │
│  │Analytics │  │ Errors   │  │ Monitor  │  │  Email   │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Clona y configura

```bash
git clone https://github.com/Juanpavbo/JPV-AI-Automation.git
cd JPV-AI-Automation
cp .env.example .env
# Edita .env con tus credenciales
pnpm install
```

### 2. Supabase (gratis en cloud.supabase.com)

1. Crea proyecto → Settings → API → copia URL y anon key
2. SQL Editor → ejecuta `supabase/migrations/001_initial_schema.sql`
3. Authentication → Providers → Email → habilita "Confirm email"
4. Storage → crea bucket `avatars` (público)

### 3. Resend (gratis en resend.com)

1. Crea API key
2. Verifica dominio o usa `onboarding@resend.dev` para testing

### 4. Vercel (gratis en vercel.com)

```bash
vercel login
vercel link
vercel env add SUPABASE_URL
vercel env add SUPABASE_ANON_KEY
vercel env add RESEND_API_KEY
vercel --prod
```

### 5. Cloudflare (gratis en dash.cloudflare.com)

1. Añade dominio o usa subdominio `pages.dev`
2. DNS → CNAME `www` → `cname.vercel-dns.com`
3. SSL/TLS → Full (strict)
4. Workers → crea KV namespace para rate limiting si necesitas

---

## 📁 Estructura del Proyecto

```
JPV-AI-Automation/
├── src/
│   ├── components/          # Componentes Astro/Preact
│   │   ├── Hero.astro
│   │   ├── Why.astro
│   │   ├── Services.astro
│   │   ├── About.astro
│   │   ├── Stack.astro
│   │   ├── Booking.astro    # Integración Cal.com
│   │   ├── Contact.astro    # Formulario → Supabase + Email
│   │   └── PWARegistration.astro
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/
│   │   ├── supabase.ts      # Cliente + helpers
│   │   └── utils.ts
│   ├── pages/
│   │   ├── index.astro
│   │   └── api/
│   │       ├── contact.ts          # Endpoint formulario
│   │       └── cron/
│   │           ├── cleanup.ts      # Limpieza notificaciones leídas
│   │           └── reminders.ts    # Recordatorios de bookings
│   └── styles/
│       └── global.css
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docker/
│   └── docker-compose.yml   # Self-hosted: PostHog, Sentry, UptimeKuma, Postal
├── calcom/
│   └── .env.example         # Cal.com self-hosted config
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # CI/CD: lint, test, build, deploy
├── public/
│   ├── sw.js                # Service Worker (PWA)
│   ├── manifest.webmanifest
│   └── icons/               # Iconos PWA
├── vercel.json              # Config Vercel (headers, rewrites; crons corren en Supabase pg_cron)
├── eslint.config.js         # ESLint flat config
├── pnpm-workspace.yaml      # pnpm: onlyBuiltDependencies
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 🔧 Servicios Integrados

| Funcionalidad | Implementación | Gratis |
|--------------|----------------|--------|
| **Booking tipo Calendly** | Cal.com self-hosted en Vercel + Supabase | ✅ |
| **Base de datos** | Supabase (PostgreSQL + RLS) | ✅ 500MB |
| **Autenticación** | Supabase Auth (email, magic link, OAuth) | ✅ |
| **Email transaccional** | Resend (3k/mes) o Postal self-hosted | ✅ |
| **Analytics** | PostHog self-hosted (Oracle Cloud) | ✅ Ilimitado |
| **Error tracking** | Sentry self-hosted (Oracle Cloud) | ✅ Ilimitado |
| **Uptime monitoring** | Uptime Kuma self-hosted | ✅ Ilimitado |
| **PWA** | Service Worker + Web Manifest | ✅ Nativo |
| **CDN + DNS** | Cloudflare | ✅ Ilimitado |
| **Hosting + Edge** | Vercel | ✅ 100GB-hrs |
| **Dominio** | Namecheap (~$12/año) | ⚠️ Opcional |

---

## 🛡️ Gobernanza y Sostenibilidad

### Infrastructure as Code (GitOps)
- **Terraform/OpenTofu** en `infra/` para Cloudflare, Vercel, Supabase
- **Docker Compose** en `docker/` para servicios self-hosted
- **GitHub Actions** para CI/CD automatizado

### Políticas de Datos (Data Governance)
```sql
-- RLS: Cada usuario ve solo sus datos
-- Retención automática via pg_cron:
--   - Notificaciones leídas > 30 días: DELETE
--   - Contactos sin actividad > 2 años: ANONIMIZAR
-- Backup: Supabase PITR (7 días) + export semanal a R2
```

### Seguridad
- **CSP + HSTS + Security Headers** via `vercel.json` + Cloudflare Workers
- **Turnstile (captcha invisible)** en formularios
- **Dependabot + CodeQL + Trivy** en CI
- **Secrets**: GitHub Environments + Vercel/Supabase/Cloudflare env vars

### Observabilidad
| Métrica | Herramienta | Alerta |
|---------|-------------|--------|
| Uptime | Uptime Kuma | Telegram/Email webhook |
| Errores | Sentry | Slack/Discord webhook |
| Analytics | PostHog | Dashboards internos |
| Performance | Vercel Analytics | Built-in |

### Documentación Viva
```
docs/
├── adr/                    # Architecture Decision Records
├── runbooks/               # Incident response (ej. "DB llena", "Email no sale")
├── onboarding/             # Cómo deploy, rotar secrets, escalar
└── governance/             # Retención, acceso, backup, disaster recovery
```

---

## 📦 Deploy Self-Hosted (Oracle Cloud Free Tier)

```bash
# 1. Crea 2 VMs AMD EPYC en Oracle Cloud (Always Free)
# 2. Instala Docker + Docker Compose
# 3. Clona repo y configura:
cp docker/.env.example docker/.env
# Edita docker/.env con passwords fuertes

# 4. Levanta servicios
cd docker
docker compose up -d

# 5. Configura PostHog (puerto 8000), Sentry (9000), Uptime Kuma (3001)
# 6. Apunta DNS: analytics.tu-dominio.com → IP VM1
#                sentry.tu-dominio.com → IP VM1
#                status.tu-dominio.com → IP VM2
```

---

## 🧪 Testing

```bash
pnpm test          # Unit tests (Vitest)
pnpm test:ui       # UI para tests
pnpm e2e           # E2E (Playwright)
pnpm e2e:ui        # UI Playwright
```

---

## 📋 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor desarrollo |
| `pnpm build` | Build producción |
| `pnpm preview` | Preview build local |
| `pnpm lint` | ESLint |
| `pnpm format` | Prettier |
| `pnpm check` | TypeScript + Astro check |
| `pnpm db:push` | Push migraciones a Supabase |
| `pnpm db:types` | Genera types TypeScript de DB |

---

## 🔐 Variables de Entorno Requeridas

Ver `.env.example` para lista completa. Mínimo para producción:

```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=...
RESEND_API_KEY=re_...
CONTACT_EMAIL=aiyautomation@zohomail.com
CRON_SECRET=...
PUBLIC_CALCOM_USERNAME=juan-pablo-valero-buitrago-y07qzi
PUBLIC_BOOKING_URL=https://cal.com/juan-pablo-valero-buitrago-y07qzi
VERCEL_TOKEN=...
VERCEL_ORG_ID=...
VERCEL_PROJECT_ID=...
```

---

## 📚 Referencias Open Source

- [opensourcealternative.to](https://opensourcealternative.to) - Alternativas usadas
- [Cal.com](https://cal.com/self-hosting) - Booking self-hosted
- [PostHog](https://posthog.com/docs/self-host) - Analytics self-hosted
- [Sentry](https://develop.sentry.dev/self-hosted/) - Error tracking self-hosted
- [Uptime Kuma](https://github.com/louislam/uptime-kuma) - Monitoring
- [Postal](https://postal.server/) - Email server self-hosted

---

## 🤝 Contribuir

1. Fork → feature branch → PR
2. `pnpm lint && pnpm check && pnpm test` pasa
3. Convencional commits: `feat:`, `fix:`, `docs:`, `chore:`

---

## 📄 Licencia

MIT - Libre para uso comercial, modificación y distribución.

---

**¿Preguntas?** [Agenda una llamada](https://cal.com/juan-pablo-valero-buitrago-y07qzi) o [escríbeme](mailto:aiyautomation@zohomail.com)