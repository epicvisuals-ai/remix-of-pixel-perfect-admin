# Pixel Perfect Admin - Database & API Documentation

This folder contains the database schema and API documentation for the Pixel Perfect Admin platform.

## Files

| File | Description |
|------|-------------|
| `Init DB.sql` | Original database schema with core tables |
| `extended_schema.sql` | Extended schema with all application tables |
| `api_documentation.md` | Comprehensive REST API documentation |

## Project Analysis Summary

### Application Overview
A Vite + React 18 SPA for managing creative content requests between brands and creators.

### User Roles
| Role | Description |
|------|-------------|
| `superadmin` | Full platform access |
| `admin` | Account-level administration |
| `brand` | Brand users creating requests |
| `creator` | Creators fulfilling requests |

### Pages & Features Analyzed

#### Authentication
- Magic link authentication
- Google OAuth
- Onboarding flow

#### Brand Features
- **Dashboard**: Role-aware overview with stats
- **My Requests**: Create, track, manage content requests
- **Projects**: Manage larger projects with deliverables
- **Creators**: Discover and browse creators
- **Messages**: Real-time messaging with creators

#### Creator Features
- **Dashboard**: Earnings, job stats
- **My Jobs**: View and manage assigned requests
- **Deliverables**: Upload and submit work
- **Portfolio**: Manage portfolio items
- **Quotes**: Send pricing quotes

#### Admin Features
- **Admin Requests**: View and assign all requests
- **Admin Creators**: Manage creator accounts
- **Admin Brands**: Manage brand accounts

#### Settings
- **Team**: Manage team members
- **Profile**: User settings, theme
- **Notifications**: Notification preferences
- **Billing**: Subscription and payments

## Database Schema Overview

### Core Tables (Original)
- `users` - User accounts
- `accounts` - Organization accounts
- `team_members` - Account membership
- `notifications` - User notifications
- `magic_tokens` - Auth tokens

### Extended Tables (New)

#### User Profiles
- `creator_profiles` - Creator-specific data
- `brand_profiles` - Brand-specific data
- `skills` - Skill definitions
- `creator_skills` - Creator-skill mapping

#### Content & Projects
- `requests` - Content requests
- `request_messages` - Request communication
- `projects` - Multi-deliverable projects
- `project_team_members` - Project team
- `deliverables` - Project/request deliverables
- `quotes` - Creator pricing quotes

#### Communication
- `conversations` - Chat conversations
- `conversation_participants` - Conversation members
- `messages` - Chat messages
- `files` - Uploaded files/attachments

#### Discovery & Engagement
- `favorites` - Saved creators
- `reviews` - Client reviews
- `portfolio_items` - Creator portfolio

#### Billing
- `payment_methods` - Stored payment info
- `billing_history` - Invoice history
- `creator_payouts` - Payout requests
- `creator_transactions` - Balance transactions

#### Settings
- `notification_preferences` - Notification settings
- `user_preferences` - User settings
- `activity_log` - Audit trail

## API Endpoints Summary

### Total Endpoints: 80+

| Category | Count | Description |
|----------|-------|-------------|
| Authentication | 5 | Auth flows |
| Users | 5 | User management |
| Accounts & Teams | 6 | Team management |
| Creator Profiles | 7 | Creator data |
| Brand Profiles | 2 | Brand data |
| Requests | 11 | Content requests |
| Projects | 9 | Project management |
| Deliverables | 7 | Deliverable handling |
| Quotes | 5 | Quote management |
| Messages | 6 | Messaging |
| Favorites | 3 | Saved creators |
| Reviews | 4 | Review system |
| Portfolio | 5 | Portfolio management |
| Files | 4 | File uploads |
| Notifications | 6 | Notification system |
| Billing | 8 | Payment & billing |
| Admin | 7 | Admin operations |

## CRUD Operations by Resource

| Resource | Create | Read | Update | Delete |
|----------|--------|------|--------|--------|
| Users | - | GET /users/me | PATCH /users/me | DELETE /users/me |
| Requests | POST /requests | GET /requests | PATCH /requests/:id | DELETE /requests/:id |
| Projects | POST /projects | GET /projects | PATCH /projects/:id | DELETE /projects/:id |
| Deliverables | POST .../deliverables | GET /deliverables/:id | PATCH /deliverables/:id | DELETE /deliverables/:id |
| Quotes | POST /quotes | GET /quotes | - | - |
| Messages | POST .../messages | GET .../messages | - | - |
| Favorites | POST /favorites | GET /favorites | - | DELETE /favorites/:id |
| Reviews | POST /reviews | GET .../reviews | PATCH /reviews/:id | DELETE /reviews/:id |
| Portfolio | POST .../portfolio | GET .../portfolio | PATCH .../portfolio/:id | DELETE .../portfolio/:id |

## Implementation Notes

### Soft Deletes
All major tables support soft deletes with `deleted_at` and `deleted_by` columns.

### Audit Trail
- `created_at`, `created_by` on create
- `updated_at`, `updated_by` on update
- `activity_log` for detailed tracking

### File Storage
Files use presigned URLs for direct upload to cloud storage (S3/GCS).

### Real-time Features
WebSocket support for:
- Messaging
- Typing indicators
- Notifications
- Status updates

### Authentication
- Magic link (passwordless)
- Google OAuth
- JWT tokens with refresh

## Next Steps

1. Set up PostgreSQL database
2. Run `Init DB.sql` first
3. Run `extended_schema.sql` second
4. Implement API backend (Node.js/Express recommended)
5. Connect React frontend to API
6. Set up file storage (AWS S3/Google Cloud Storage)
7. Configure Stripe for payments
8. Set up WebSocket server for real-time features
