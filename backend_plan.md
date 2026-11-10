# Naatukoottam – Backend Development Master Prompt

Act as a senior backend architect and NestJS developer. Build a complete, scalable, secure backend for **Naatukoottam (നാട്ടുകൂട്ടം)**, a Kerala-focused community social networking and infrastructure coordination platform.

Do not build a basic CRUD application. Build a properly structured backend that supports social networking, citizen issue reporting, AI-assisted analysis, public participation and government department coordination.

## 1. Project Overview

Naatukoottam is a social platform where ordinary people in Kerala can:

- Share local problems such as damaged roads, water shortages, electricity failures, waste management and drainage issues.
- Upload photos, videos and descriptions of problems.
- Like, comment, share and support other people's reports.
- Discover nearby community problems.
- Follow issues and receive updates.
- Track whether authorities have acknowledged or resolved reported problems.

The platform also helps authorities understand public needs, identify duplicate complaints, prioritize urgent issues and coordinate infrastructure projects.

A key problem we want to solve:

A Panchayat constructs a new road. Later, the Water Authority digs up that road to repair an underground pipeline. The road must be repaired again.

Naatukoottam should help prevent these repeated infrastructure damages through shared project records, location intelligence and interdepartmental coordination.

## 2. Technology Stack

Use the following technologies:

- Monorepo: Nx
- Backend: NestJS
- Language: TypeScript
- Database: PostgreSQL
- ORM: Prisma
- API: REST API
- Authentication: JWT access and refresh tokens
- Validation: class-validator and class-transformer
- API documentation: Swagger / OpenAPI
- File storage: Cloudinary-compatible storage abstraction
- Testing: Jest
- Password hashing: bcrypt or Argon2
- Geospatial support: PostgreSQL PostGIS where practical

The frontend will be developed separately using Next.js.

Vite may be used for compatible workspace tooling, but do not force it into Next.js or compromise NestJS compatibility.

## 3. Nx Monorepo Structure

Create the backend inside:

apps/api/

Organize reusable code inside:

libs/

Suggested architecture:

apps/
  api/
    src/
      main.ts
      app/
      modules/
      common/
      config/

libs/
  shared/
  database/
  validation/
  types/

Create independent NestJS modules for each business domain.

Keep the architecture modular, maintainable and easy for another developer to understand.

## 4. Authentication and User Management

Implement:

- User registration.
- Login and logout.
- Access token and refresh token.
- Password hashing.
- Password reset.
- User profile management.
- Profile image.
- Mobile number and email.
- Location and locality.
- Account status.
- User verification.

Support these roles:

1. CITIZEN
2. COMMUNITY_MODERATOR
3. DEPARTMENT_OFFICIAL
4. ADMIN

Implement role-based access control using NestJS guards and decorators.

Never allow users to assign themselves privileged roles.

## 5. Social Networking Module

Build a complete community social system.

Posts should support:

- Text content.
- Images.
- Videos.
- Multiple media attachments.
- Location.
- Post category.
- Language.
- Visibility.
- Hashtags.
- Created and updated timestamps.

Post categories:

- Road and transportation.
- Water supply.
- Electricity.
- Waste management.
- Drainage.
- Public safety.
- Health and sanitation.
- Other community issues.

Implement:

- Create post.
- Edit and delete own post.
- Get personalized feed.
- Get nearby posts.
- Get trending posts.
- Like and unlike.
- Comment and reply.
- Share posts.
- Bookmark posts.
- Report inappropriate content.
- Follow users.
- User profiles.
- Post pagination.

Most importantly, introduce a separate **Support / I Face This Too** feature.

A citizen should be able to support an existing infrastructure problem without creating another duplicate report.

Keep likes and issue-support counts separate.

## 6. Infrastructure Issue Management

This is one of the most important modules.

Every infrastructure issue should have:

- Unique ID.
- Title.
- Description.
- Category.
- Photos and videos.
- GPS coordinates.
- Address and locality.
- Reporter.
- Number of supporters.
- Number of affected residents, when verified.
- Urgency.
- Status.
- Assigned department.
- Assigned official.
- Created date.
- Last updated date.
- Resolution details.

Issue statuses:

- REPORTED
- UNDER_REVIEW
- VERIFIED
- ASSIGNED
- IN_PROGRESS
- WAITING_FOR_COORDINATION
- RESOLVED
- REOPENED
- REJECTED

Allow citizens to:

- Report an issue.
- Support an existing issue.
- Follow an issue.
- Comment on an issue.
- Upload additional evidence.
- Reopen an issue with supporting evidence if the problem returns.

Create an issue history system that records every important status change.

## 7. AI Intelligence Module

Create a dedicated AI service with a provider-independent architecture.

Do not tightly couple the application to one AI provider.

Implement these capabilities:

### A. Automatic issue classification
Analyze text and descriptions to identify the correct issue category.

### B. Duplicate detection
Identify potentially duplicate issues based on:

- Location proximity.
- Text similarity.
- Category.
- Time.
- Uploaded descriptions.

When duplicates are detected, suggest merging them into one main issue while preserving individual reports and supporters.

Do not automatically merge unrelated issues.

### C. Priority analysis
Generate an AI-assisted priority score based on:

- Safety risk.
- Number of affected residents.
- Number of supporters.
- Duration of the problem.
- Infrastructure importance.
- Evidence and verification.

Use transparent, configurable rules alongside AI recommendations.

Do not use likes alone as an urgency indicator.

### D. Root cause correlation
Identify potentially connected reports.

Example:

- Water shortage in several nearby houses.
- Reduced water pressure.
- Reported pipeline leakage.
- Electricity failure at a pumping station.

The system should identify a possible connected incident and present the relationship for human verification.

### E. Department recommendations
Suggest which government department should handle an issue.

Important: AI recommendations must never be treated as confirmed facts without verification.

Implement an AI provider interface and a mock provider so the application works even without an API key.

## 8. Infrastructure Project Coordination

This is the main differentiating feature of Naatukoottam.

Build a shared infrastructure project registry.

Every project should include:

- Project name.
- Description.
- Department.
- Project type.
- Geographic location.
- Affected road or area.
- Planned start date.
- Expected completion date.
- Actual completion date.
- Project status.
- Work details.
- Supporting documents and photos.

Project categories:

- Road construction.
- Road resurfacing.
- Water pipeline installation.
- Water pipeline repair.
- Drainage construction.
- Electricity infrastructure.
- Other infrastructure projects.

Implement an overlap detection service.

Example:

A Panchayat plans to resurface a road.

The system checks whether a water pipeline installation or repair is already planned in the same area.

If a conflict is detected:

- Generate a conflict alert.
- Identify the related projects.
- Notify relevant departments.
- Recommend coordinating schedules.
- Allow officials to record a joint action plan.

Also maintain records of completed excavation and repair work to provide infrastructure history.

Do not assume every department has access to real-time government data. Design the system to work with manually entered and verified project records first.

## 9. Government and Department Management

Build department management functionality.

Departments should include:

- Panchayat / Local Self Government.
- Kerala Water Authority.
- Electricity Board (KSEB).
- Public Works Department.
- Waste Management.
- Other relevant departments.

Officials should be able to:

- View assigned issues.
- View nearby issues.
- Acknowledge complaints.
- Update progress.
- Assign issues to other authorized officials.
- Request interdepartmental coordination.
- Upload repair evidence.
- Mark issues resolved.
- Provide resolution explanations.

Create an official verification and department assignment workflow.

Only authorized officials should be able to change official resolution statuses.

## 10. Notifications

Implement a notification system for:

- New comments.
- New supporters.
- Issue status changes.
- Department acknowledgements.
- Nearby important issues.
- Project overlap warnings.
- Assignment notifications.
- Escalations.

Support in-app notifications first.

Design the notification service so email, push notifications and WhatsApp integrations can be added later.

## 11. English and Malayalam Support

Naatukoottam must support:

- English (en)
- Malayalam (ml)

Important requirements:

- Store Malayalam text using proper UTF-8 support.
- Preserve the original language of user-generated posts.
- Allow both English and Malayalam content.
- Support localized system messages and notifications.
- Keep API error responses compatible with frontend localization.
- Do not force machine translation on every user post.
- Allow optional AI translation in a future implementation.

The frontend will manage its own i18n interface. The backend must support bilingual content and locale preferences.

## 12. Database Design

Design a normalized Prisma schema covering:

- Users
- Roles and permissions
- User profiles
- Posts
- Post media
- Likes
- Comments
- Shares
- Bookmarks
- Hashtags
- Follows
- Infrastructure issues
- Issue supports
- Issue followers
- Issue history
- Issue evidence
- Departments
- Officials
- Issue assignments
- Infrastructure projects
- Project conflicts
- Coordination requests
- Notifications
- AI analysis records
- Audit logs

Use proper:

- Foreign keys.
- Unique constraints.
- Indexes.
- Relationships.
- Enums.
- Timestamps.
- Soft deletion where appropriate.

Prevent duplicate likes, supports and follows at the database level.

Use transactions for operations that affect multiple related records.

## 13. Security and Performance

Implement:

- DTO validation.
- Rate limiting.
- CORS configuration.
- Secure password storage.
- Authentication guards.
- Role-based authorization.
- File upload validation.
- File size limits.
- SQL injection protection through Prisma.
- Pagination for all large collections.
- Secure environment configuration.
- Audit logging for administrative actions.

Avoid exposing private user information through public API responses.

## 14. API Documentation

Enable Swagger documentation.

Organize endpoints by module.

Use consistent response structures and meaningful HTTP status codes.

Include pagination metadata.

Create API endpoints for:

- Authentication.
- Users.
- Posts.
- Feed.
- Comments.
- Likes.
- Supports.
- Issues.
- Maps and nearby issues.
- Departments.
- Officials.
- Infrastructure projects.
- Project conflicts.
- AI analysis.
- Notifications.
- Admin management.

Document request DTOs, response DTOs and authorization requirements.

## 15. Development and Seed Data

Create:

- Prisma migrations.
- Database seed script.
- Example citizen accounts.
- Example department officials.
- Example infrastructure issues.
- Example community posts.
- Example infrastructure projects.
- Example overlapping projects.

Include realistic Kerala-based demo scenarios.

For example:

A newly resurfaced road in a fictional Kerala locality has an upcoming water pipeline repair project. The system should detect the potential conflict.

Also create a demo scenario with multiple residents reporting water shortages and the AI identifying a possible common cause.

Clearly mark all sample records as demo data.

## 16. Development Rules

Follow these rules strictly:

1. First inspect the existing Nx workspace and repository.
2. Do not unnecessarily overwrite existing configurations.
3. Establish the database schema before implementing dependent modules.
4. Build features in logical stages.
5. Use clean, reusable TypeScript code.
6. Avoid huge service files and duplicated logic.
7. Separate controllers, services, DTOs, entities/models and infrastructure integrations.
8. Never hardcode API keys or secrets.
9. Use environment variables.
10. Do not create fake AI functionality that claims to perform real analysis. Use a clearly identified mock provider when necessary.
11. Make every implemented endpoint functional.
12. Add meaningful unit and integration tests.
13. Run Prisma migrations and verify database connectivity.
14. Test the complete authentication and issue-reporting workflow.
15. Ensure the application starts successfully.

## 17. Implementation Priority

Build in this order:

**Phase 1 – Foundation**
- Nx configuration.
- NestJS application.
- PostgreSQL connection.
- Prisma schema and migrations.
- Environment configuration.
- Swagger.

**Phase 2 – Core social platform**
- Authentication.
- User profiles.
- Posts.
- Media attachments.
- Feed.
- Likes.
- Comments.
- Issue support.

**Phase 3 – Infrastructure management**
- Issue reporting.
- Issue tracking.
- Location-based queries.
- Department management.
- Official assignment workflow.

**Phase 4 – Intelligence**
- Duplicate detection.
- AI categorization.
- Priority scoring.
- Related incident detection.
- Infrastructure project conflict detection.

**Phase 5 – Final integration**
- Notifications.
- Audit logs.
- Seed data.
- Tests.
- API documentation.
- Production-ready configuration.

## Final Objective

Deliver a working, well-structured NestJS backend that can power the complete Naatukoottam platform.

The backend must support a social networking experience for ordinary citizens while providing meaningful infrastructure intelligence and coordination capabilities for government departments.

Prioritize a working MVP over unnecessary complexity.

Before finishing, provide:

1. Complete backend architecture.
2. Database ER diagram.
3. List of implemented API endpoints.
4. Environment variable template.
5. Database setup and migration instructions.
6. Demo account credentials.
7. Test results.
8. Instructions for connecting the future Next.js frontend.

Start by inspecting the existing repository and proposing the implementation plan. Then proceed with development rather than stopping after writing a plan.