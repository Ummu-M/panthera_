# Panthera2 — Claude Code Instructions

## 1. Project Overview

Panthera2 is a web application for the **Kenyatta University Rover Scout Crew**.

The application is intended to centralize crew management, member registration, scout badge/achievement tracking, treasury information, inventory, projects, and administrative oversight.

The project should be treated as a real production-oriented application, not a disposable prototype.

---

## 2. Core Development Principles

### Before changing anything

1. Inspect the existing project structure.
2. Understand how the relevant feature currently works.
3. Reuse existing components, utilities, database structures, and patterns where possible.
4. Do not rewrite working code unnecessarily.
5. Do not introduce a new library or architecture unless there is a clear reason.
6. Check related files before making changes that could affect other features.
7. For significant architectural changes, explain the proposed approach before implementing it.

### When making changes

* Make the smallest safe change that solves the problem.
* Keep changes focused on the requested task.
* Do not modify unrelated files.
* Preserve existing functionality.
* Follow the existing coding style and project conventions.
* Prefer maintainable, readable code over clever code.
* Do not create duplicate components or utilities when an existing one can be reused.
* Avoid hardcoded credentials, secrets, URLs, IDs, or sensitive configuration.
* Never expose `.env` values in source code, UI, logs, commits, or responses.

### After making changes

Always verify the change.

Depending on the task:

* Run the relevant development/build command.
* Run linting.
* Run tests if available.
* Check TypeScript errors if applicable.
* Check the browser/UI when the change affects the frontend.
* Check database queries and permissions when the change affects Supabase.
* Report what was changed and what was verified.

If verification cannot be performed, explicitly state why.

---

# 3. Technology Stack

Use the existing project stack rather than replacing it.

Expected technologies may include:

* Next.js
* React
* TypeScript/JavaScript
* Node.js
* Supabase
* PostgreSQL
* Git/GitHub
* Vercel for deployment

The project uses **Supabase** for backend services/database/authentication where already configured.

Do not replace Supabase with Firebase, MongoDB, Neon, or another backend unless explicitly instructed.

---

# 4. Application Architecture

Before changing architecture, inspect the current repository because the exact implementation may evolve.

Follow the project's existing separation between:

* UI/presentation
* Components
* Pages/routes
* Server-side logic
* Database access
* Authentication
* Utilities
* Types
* Configuration

Prefer server-side operations for sensitive database operations.

Do not expose privileged Supabase credentials to the browser.

---

# 5. Panthera Core Features

The application should support or be prepared to support the following major areas.

## Dashboard

The dashboard should provide useful crew-level information such as:

* Total scouts/members
* Treasury information
* Inventory information
* Active projects
* Badge/achievement progress
* Other relevant crew statistics

Dashboard numbers should come from real application data rather than hardcoded values.

---

# 6. Member Management

Members should be able to be registered and managed within the crew system.

Expected member information includes, where appropriate:

* Member name
* School/registration number
* Phone number
* Role
* Scout-related information
* Badge/achievement progress
* Other required profile information

The application previously used the school registration number and name for member registration.

A profile-related database field was changed from `school_id` to **phone number**. Inspect the current database schema before making assumptions about the exact field names.

Do not recreate or rename existing database fields without checking the current schema and dependencies.

---

# 7. Crew Roles and Permissions

The application has role-based access requirements.

There are specific authorized roles that can upload scout achievements.

The **Rover Scout Leader (RSL)** has administrative visibility and can monitor progress.

Important:

* Do not assume that every administrator can perform every action.
* Do not implement authorization only through frontend UI checks.
* Sensitive actions must also be protected server-side/database-side.
* Supabase Row Level Security (RLS) should be respected and strengthened where necessary.
* Never bypass RLS simply to make a feature work.

Before modifying permissions, inspect the current role model and Supabase policies.

---

# 8. Scout Badge and Achievement Tracking

The application includes scout badge tracking based on the **Jasiri Scout Handbook** / relevant Rover Scout badge structure.

Achievements should support:

* Recording completed achievements
* Associating achievements with members
* Tracking progress
* Uploading evidence where applicable
* Displaying badge/achievement status

Do not invent badge requirements if they are not present in the application data or provided by the user.

Badge approval workflows should not be invented.

The existing requirement is that the **RSL views progress but does not approve badges**, unless the project requirements are explicitly changed.

---

# 9. Treasury

The application includes crew treasury management.

The crew registration fee is **KSh 100**.

Treasury functionality may include:

* Income
* Expenses
* Balance
* Contributions
* Transaction history
* Financial summaries

The project has considered integration with **M-Pesa / Pochi la Biashara**.

Do not fake live M-Pesa transaction data.

If M-Pesa integration is implemented:

* Keep credentials server-side.
* Validate callbacks/webhooks.
* Prevent duplicate transaction processing.
* Store appropriate transaction references.
* Do not expose secret API credentials.
* Clearly distinguish simulated/test transactions from real transactions.

---

# 10. Inventory

The dashboard includes inventory information.

Inventory functionality should be designed to support things such as:

* Item name
* Quantity
* Condition/status
* Assignment/location where appropriate
* Add/remove/update operations
* Inventory history where appropriate

Do not silently change inventory quantities without recording the appropriate operation when the application requires auditability.

---

# 11. Projects

Panthera should support crew projects and activities.

Project information may include:

* Project title
* Description
* Status
* Dates
* Participants
* Objectives
* Outcomes
* Related activities
* Evidence/media where appropriate

Use the existing database structure when available.

Do not create duplicate project systems if one already exists.

---

# 12. Authentication

Authentication must be handled securely.

The project has used/considered:

* Supabase authentication
* Google OAuth
* NextAuth/NextAuth-related configuration

Before changing authentication, inspect the current implementation and determine which authentication system is actually active.

Never:

* Hardcode OAuth secrets.
* Commit `.env` files.
* Print authentication tokens.
* Store passwords in plaintext.
* Disable authentication checks to make development easier.

For OAuth changes, verify:

* Redirect URLs
* Callback handling
* Session handling
* Environment variables
* Production vs development configuration

---

# 13. Supabase Rules

Supabase is a critical part of the project.

Before changing database-related functionality:

1. Inspect the existing tables.
2. Inspect relationships.
3. Inspect RLS policies.
4. Inspect existing queries.
5. Check whether the operation should happen client-side or server-side.

Prefer secure server-side operations for privileged actions.

Never use a service-role key in client-side code.

Never disable RLS globally just to solve an authorization problem.

If a query fails because of RLS, investigate and fix the policy appropriately rather than bypassing security.

---

# 14. Database Changes

When modifying the database:

* Prefer migrations when the project uses migrations.
* Preserve existing data.
* Avoid destructive changes unless explicitly requested.
* Check foreign keys and dependencies.
* Check existing queries before renaming columns.
* Update types/interfaces after schema changes.
* Update affected components and server logic.
* Verify the migration/change before considering the task complete.

Never drop production tables or delete user data without explicit confirmation.

---

# 15. File Uploads and Storage

If Supabase Storage is used:

* Inspect existing buckets before creating new ones.
* Reuse existing storage conventions.
* Validate uploaded files.
* Restrict access appropriately.
* Do not expose private files publicly without a valid reason.
* Use signed URLs where appropriate.
* Do not trust client-provided file metadata blindly.

---

# 16. UI/UX Guidelines

The application should feel like one coherent product.

Maintain:

* Consistent typography
* Consistent spacing
* Consistent buttons
* Consistent forms
* Consistent cards
* Consistent navigation
* Responsive layouts
* Accessible interactive elements
* Clear loading states
* Clear error states
* Clear success feedback

Do not introduce random colors, fonts, icons, or visual styles without considering the existing design system.

When modifying an existing page, preserve its established visual language.

Do not unnecessarily redesign the whole application when asked to fix one component.

---

# 17. Responsive Design

The application should work on:

* Desktop
* Laptop
* Tablet
* Mobile

Do not assume the user is always on a large screen.

Check:

* Navigation
* Tables
* Forms
* Cards
* Modals
* Dashboards
* Long text
* Buttons
* Touch targets

Avoid horizontal scrolling where it can reasonably be prevented.

---

# 18. Accessibility

Use semantic HTML where appropriate.

Important requirements:

* Buttons should be actual buttons.
* Links should be actual links.
* Form inputs should have labels.
* Images should have meaningful alt text where appropriate.
* Interactive elements should be keyboard accessible.
* Do not rely solely on color to communicate important information.
* Loading/error/success states should be understandable.

---

# 19. Error Handling

Do not hide errors.

Handle:

* Network errors
* Database errors
* Authentication errors
* Invalid form input
* Missing data
* Permission errors
* Failed uploads
* API failures

User-facing errors should be understandable.

Developer-facing logs should contain enough information to debug the problem without exposing secrets.

---

# 20. Security

Security is a priority.

Always consider:

* Authentication
* Authorization
* RLS
* Input validation
* XSS
* SQL injection
* CSRF where applicable
* Secure API design
* Secrets management
* File upload security
* Rate limiting where appropriate
* Dependency vulnerabilities
* Sensitive data exposure

Never trust client-side authorization.

Never assume that hiding a button makes an operation secure.

Validate permissions at the appropriate server/database layer.

---

# 21. Environment Variables

Use environment variables for:

* Supabase URLs
* Supabase keys
* OAuth credentials
* M-Pesa credentials
* API keys
* Authentication secrets
* Other private configuration

Never put secrets directly into source files.

Never commit:

```text
.env
.env.local
.env.production
```

or equivalent secret files.

If an environment variable is missing, explain which variable is required and where it should be configured without exposing its value.

---

# 22. Git Workflow

Before making a significant change, check:

```bash
git status
```

Prefer small, logical changes.

Do not:

* Delete unrelated work
* Reset the user's work without permission
* Force-push
* Rewrite Git history
* Remove files simply because they appear unused without investigating dependencies

Before major AI-assisted changes, a checkpoint commit is recommended.

Example:

```bash
git add .
git commit -m "Checkpoint before changes"
```

---

# 23. AI-Assisted Development Rules

Claude Code is being used as an engineering assistant.

Do not blindly generate large amounts of code.

For significant tasks:

1. Inspect.
2. Plan.
3. Explain the intended change briefly.
4. Implement.
5. Verify.
6. Summarize.

When the user says **"don't modify anything"**, only inspect/analyze.

When the user asks for a change, do not ask them to paste files that are already available in the repository. Inspect the repository yourself.

Do not claim to have tested something if you did not actually test it.

Do not claim that a feature is complete if there are known errors.

If a requested implementation conflicts with the current architecture, explain the conflict and propose the safest approach.

---

# 24. Dependencies

Before adding a dependency:

* Check whether the project already has a library that solves the problem.
* Prefer existing dependencies.
* Consider bundle size.
* Consider security.
* Consider maintenance.
* Avoid adding dependencies for trivial functionality.

Do not replace major dependencies without explicit approval.

---

# 25. Code Quality

Prefer:

* Clear names
* Small reusable functions
* Reusable components
* Strong typing where TypeScript is used
* Consistent error handling
* Simple control flow
* Minimal duplication
* Clear separation of responsibilities

Avoid:

* Giant components
* Giant functions
* Repeated database logic
* Hardcoded application data
* Dead code
* Unnecessary abstractions
* Magic numbers
* Temporary hacks left in production code

---

# 26. Performance

Avoid unnecessary:

* Database queries
* API calls
* React re-renders
* Large client-side bundles
* Repeated data fetching
* Image downloads
* Expensive computations

For database-heavy pages, consider appropriate:

* Indexes
* Pagination
* Filtering
* Server-side queries
* Caching where appropriate

Do not optimize prematurely. Measure or identify a real problem first.

---

# 27. Testing and Verification

After implementing a feature, verify the relevant behavior.

At minimum, check:

* Does the application build?
* Does the relevant page load?
* Does the main user flow work?
* Do authentication/authorization rules still work?
* Are database operations successful?
* Are errors handled?
* Does the UI remain responsive?

For bug fixes, reproduce the issue when possible before declaring it fixed.

---

# 28. Deployment

The application may be deployed using **Vercel**.

Before production deployment:

* Verify environment variables.
* Verify production Supabase configuration.
* Verify OAuth redirect URLs.
* Verify build output.
* Check for exposed secrets.
* Check authentication.
* Check database permissions/RLS.
* Check production-only configuration.

Do not assume that something working locally automatically works in production.

---

# 29. Development Commands

Before running commands, inspect `package.json` and use the project's actual scripts.

Common commands may include:

```bash
npm install
npm run dev
npm run build
npm run lint
```

Do not assume these commands exist. Check `package.json` first.

If the project uses another package manager, follow the existing lockfile/package-manager convention.

---

# 30. Panthera-Specific Priorities

When prioritizing work, generally use this order:

1. Security and authentication
2. Data integrity
3. Core functionality
4. Database correctness
5. Error handling
6. User experience
7. Performance
8. Visual polish
9. Optional enhancements

Do not sacrifice data security or correctness for visual improvements.

---

# 31. Important Project Context

Panthera is associated with the **Kenyatta University Rover Scout Crew**.

The application is intended to make crew operations more organized and reduce reliance on scattered/manual processes.

Important concepts include:

* Rover scouts
* Crew members
* RSL / Rover Scout Leader
* Scout achievements
* Badges
* Projects
* Treasury
* Inventory
* Crew activities
* Evidence/uploads
* Administrative oversight

Preserve these domain concepts when naming components, database structures, routes, and user-facing content.

---

# 32. When Requirements Are Ambiguous

Do not invent critical business rules.

If a requirement affects:

* Money
* Permissions
* Authentication
* Database structure
* Member records
* Badge approval
* M-Pesa transactions
* Deletion of data
* Production deployment

ask for clarification before making a potentially irreversible decision.

For low-risk UI or implementation details, use the existing project conventions and make a reasonable choice.

---

# 33. Final Rule

**Understand before changing.**

The repository is the source of truth for the current implementation.

Do not assume that old documentation, previous conversations, or this file perfectly describe the current codebase. When there is a conflict, inspect the actual code and database configuration first, then preserve the user's existing work unless explicitly instructed otherwise.
