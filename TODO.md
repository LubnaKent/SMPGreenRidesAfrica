# SMP Green Rides Africa - Project TODO

## Legend
- [ ] Not started
- [x] Completed
- [~] In progress

---

## Phase 1: Project Setup

- [x] Initialize Next.js 14 project with TypeScript
- [x] Configure Tailwind CSS
- [x] Install and configure shadcn/ui
- [x] Set up project folder structure
- [x] Configure ESLint and Prettier
- [x] Create environment variables template (.env.example)
- [x] Set up Supabase project
- [x] Configure Supabase client in Next.js

---

## Phase 2: Database & Authentication

- [x] Create database schema in Supabase
  - [x] users table
  - [x] drivers table
  - [x] driver_documents table
  - [x] screening_responses table
  - [x] status_history table
  - [x] handovers table
- [x] Set up Row Level Security (RLS) policies
- [x] Implement Supabase Auth
- [x] Create login page
- [x] Create registration page
- [x] Add role-based middleware/guards

---

## Phase 3: Core Layout & Navigation

- [x] Create dashboard layout with sidebar
- [x] Build responsive navigation component
- [x] Add user profile dropdown
- [x] Create breadcrumb component
- [x] Implement mobile hamburger menu

---

## Phase 4: Pipeline View (Main Feature)

- [x] Create pipeline board component (Kanban-style)
- [x] Implement drag-and-drop functionality
- [x] Add driver cards with key info preview
- [x] Connect to Supabase real-time for live updates
- [x] Add filtering (by agent, date range, source)
- [x] Add search functionality

---

## Phase 5: Driver Management

- [x] Create "Add Driver" form
  - [x] Personal info fields
  - [x] Source/channel selection
  - [x] Initial screening questions
- [x] Build driver list view with pagination
- [x] Create driver detail/profile page
  - [x] Info section (editable)
  - [x] Documents section with upload
  - [x] Status history timeline
  - [x] Notes/activity feed
- [x] Implement document upload to Supabase Storage
- [x] Add document verification toggle

---

## Phase 6: Analytics Dashboard

- [x] Create overview stats cards (total, by status, this month)
- [x] Build acquisition funnel chart (using Recharts)
- [x] Add source effectiveness chart
- [x] Create time-to-qualify metrics
- [x] Add monthly targets vs actuals chart
- [x] Implement date range filter

---

## Phase 7: Handover Management

- [x] Create handover scheduling form
- [x] Build handover list view
- [ ] Add batch driver selection for handover
- [x] Implement handover completion flow
- [x] Add handover history

---

## Phase 8: Polish & Testing

- [x] Add loading states and skeletons
- [x] Implement error boundaries
- [x] Add toast notifications
- [x] Test mobile responsiveness
- [x] Add empty states for lists
- [x] Performance optimization

---

## Phase 9: Deployment

- [x] Set up Vercel project
- [x] Configure environment variables in Vercel
- [ ] Set up Supabase production project
- [ ] Configure custom domain (if applicable)
- [x] Test production deployment (build passes)

---

## Recently Completed Features

- [x] Connect real data to driver detail page
- [x] Integrate charting library (Recharts) for analytics
- [x] Document upload/verification workflows
- [x] Screening questionnaire system with scoring
- [x] Role-based access control (smp_admin, smp_agent, partner)
- [x] Export/reporting features (CSV export for drivers and summary)
- [x] Edit driver modal with full form
- [x] Pipeline filtering (search, source channel)
- [x] Forgot password page with Supabase auth
- [x] Live dashboard stats connected to real data
- [x] Dashboard visual overhaul with gradients and animations
- [x] Empty state component with illustrations
- [x] Dark mode support throughout

---

## Future Enhancements (Post-MVP)

- [ ] Greenwheels partner portal access
- [x] Advanced reporting with CSV export
- [ ] PDF export for reports
- [ ] WhatsApp Business API integration
- [ ] Referral program tracking with unique codes
- [ ] Push notifications
- [ ] PWA for offline capability
- [x] Automated screening scoring system
- [ ] SMS notifications for drivers
- [ ] Integration with Greenwheels systems

---

## Bugs & Issues

_Track bugs here as they arise_

---

## Notes

- Target: 1,000 qualified drivers by end of July 2026
- Monthly targets: Feb-March: 40 each, April-July: 60 each
- CPA: 90,000 UGX per qualified driver
- Minimum driver requirements: 75 Uber trips/week OR 50 hours online, 12 trips/day
