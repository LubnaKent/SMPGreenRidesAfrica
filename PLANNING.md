# SMP Green Rides Africa - Partner Dashboard

## Project Overview

A real-time Partner Dashboard for Sales Management Partners (SMP) to manage driver acquisition for Greenwheels - an electric bike (boda) leasing platform in Uganda. The dashboard provides complete transparency and control over the driver acquisition pipeline.

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | Next.js 14 (App Router) | Server components, API routes, Vercel-optimized |
| Language | TypeScript | Type safety, better DX |
| Styling | Tailwind CSS + shadcn/ui | Rapid development, consistent design |
| Database | Supabase (PostgreSQL) | Real-time subscriptions, built-in auth, file storage |
| Auth | Supabase Auth | Role-based access (SMP Admin, SMP Agent, Greenwheels Partner) |
| State | TanStack Query | Server state management, caching |
| Charts | Recharts | Analytics visualizations |
| Forms | React Hook Form + Zod | Form handling with validation |
| Hosting | Vercel | Seamless Next.js deployment |

---

## Core Features

### 1. Live Pipeline View
Track applicants through stages in real-time:
- **Sourced** - Initial lead captured
- **Screening** - Pre-qualification questionnaire
- **Qualified** - Passed all screening criteria
- **Onboarding** - Document verification & profile creation
- **Handed Over** - Ready for Greenwheels training

### 2. Driver Profiles
Complete digital profile for each driver:
- Personal information (name, phone, National ID)
- Documents (ID, Driving Permit, photos)
- Screening scores & results
- Source/referral information
- Status history & notes

### 3. Performance Analytics
Key metrics dashboard:
- Cost per acquisition (CPA)
- Time to qualify (avg days in pipeline)
- Source effectiveness (which channels perform best)
- Monthly/weekly acquisition targets vs actuals
- Conversion rates by stage

### 4. Communication Hub
- Internal notes on driver profiles
- Handover scheduling with Greenwheels
- Activity feed / notifications
- Batch handover management

---

## Database Schema (Initial)

```
users
├── id (uuid, PK)
├── email
├── role (enum: smp_admin, smp_agent, partner)
├── name
├── created_at

drivers
├── id (uuid, PK)
├── first_name
├── last_name
├── phone
├── national_id
├── driving_permit_number
├── location / zone
├── source_channel (enum: social_media, referral, roadshow, boda_stage, other)
├── referred_by (nullable, driver_id)
├── status (enum: sourced, screening, qualified, onboarding, handed_over, rejected)
├── screening_score (int)
├── assigned_agent_id (FK -> users)
├── created_at
├── updated_at

driver_documents
├── id (uuid, PK)
├── driver_id (FK)
├── document_type (enum: national_id, driving_permit, photo, other)
├── file_url
├── verified (boolean)
├── uploaded_at

screening_responses
├── id (uuid, PK)
├── driver_id (FK)
├── question_key
├── response
├── score_contribution
├── created_at

status_history
├── id (uuid, PK)
├── driver_id (FK)
├── from_status
├── to_status
├── changed_by (FK -> users)
├── notes
├── changed_at

handovers
├── id (uuid, PK)
├── scheduled_date
├── driver_ids (array)
├── status (enum: scheduled, completed, cancelled)
├── notes
├── created_by (FK -> users)
├── created_at
```

---

## User Roles & Permissions

| Feature | SMP Admin | SMP Agent | Greenwheels Partner |
|---------|-----------|-----------|---------------------|
| View all drivers | Yes | Own assigned | Yes (qualified+) |
| Add new drivers | Yes | Yes | No |
| Edit driver info | Yes | Own assigned | No |
| Change driver status | Yes | Yes | No |
| Upload documents | Yes | Yes | No |
| View analytics | Full | Limited | Partner view |
| Manage users | Yes | No | No |
| Schedule handovers | Yes | No | View only |

---

## Project Structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx (overview/analytics)
│   │   ├── pipeline/
│   │   ├── drivers/
│   │   │   ├── page.tsx (list)
│   │   │   ├── [id]/page.tsx (detail)
│   │   │   └── new/page.tsx
│   │   ├── handovers/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   ├── drivers/
│   │   ├── handovers/
│   │   └── analytics/
│   ├── layout.tsx
│   └── page.tsx (landing/redirect)
├── components/
│   ├── ui/ (shadcn components)
│   ├── pipeline/
│   ├── drivers/
│   ├── charts/
│   └── layout/
├── lib/
│   ├── supabase/
│   ├── utils.ts
│   └── validations/
├── hooks/
├── types/
└── constants/
```

---

## Suggestions & Recommendations

### 1. Real-time Updates
Use Supabase Realtime subscriptions so the pipeline view updates instantly when drivers move between stages - critical for the "live" feel mentioned in the proposal.

### 2. Mobile-First Design
Field agents will likely add drivers from their phones at boda stages. Ensure the "Add Driver" flow works well on mobile.

### 3. Offline Capability (Future)
Consider PWA features for areas with spotty connectivity - queue actions and sync when online.

### 4. WhatsApp Integration (Future)
Since WhatsApp is heavily used in Uganda, consider integrating WhatsApp Business API for:
- Automated status updates to drivers
- Document collection via WhatsApp

### 5. Export Functionality
Add CSV/Excel export for:
- Driver lists for handover
- Analytics reports for stakeholders

### 6. Audit Trail
The status_history table ensures full traceability - important for accountability in the CPA model.

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# App
NEXT_PUBLIC_APP_URL=
```

---

## Deployment

- **Platform**: Vercel
- **Database**: Supabase (hosted PostgreSQL)
- **File Storage**: Supabase Storage (for driver documents)
- **Domain**: Configure custom domain in Vercel

---

## Phase 1 MVP Scope

Focus on core functionality:
1. User authentication (SMP team only initially)
2. Add/edit drivers with basic info
3. Pipeline view with drag-and-drop status changes
4. Driver profile page with document uploads
5. Basic analytics (total drivers by status, monthly counts)

### Out of MVP Scope (Phase 2+)
- Greenwheels partner portal access
- Advanced analytics & reporting
- WhatsApp integration
- Referral program tracking
- Mobile app / PWA
