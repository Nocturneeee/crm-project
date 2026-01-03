# AI Coding Guidelines for CRM Project

## Architecture Overview
This is a Node.js/Express REST API for a CRM system using Prisma ORM with MySQL. Key components:
- **Controllers** (`src/controllers/`): Handle business logic (auth, users, leads, analytics, roles)
- **Routes** (`src/routes/`): Define API endpoints under `/api/v1/`
- **Middlewares** (`src/middlewares/`): JWT authentication and role-based authorization
- **Models**: Prisma schema with User, Role, Lead entities and LeadStatus enum

## Authentication & Authorization
- Use JWT tokens with role information (ADMIN, SALES, LEAD)
- Extend Express Request with `AuthRequest` interface for user context
- Apply `authenticate` middleware for protected routes, `authorizeRole` for specific permissions
- Passwords hashed with bcrypt (10 rounds)

## Database Patterns
- Single PrismaClient instance in `src/utils/prisma.ts`
- Relations: User belongs to Role, Lead belongs to User (owner)
- Lead statuses: LEAD_IN, CONTACT_MADE, NEED_IDENTIFIED, PROPOSAL_MADE, WON, LOST, DELETE
- Use `include` in queries to fetch related data (e.g., `include: { role: true }`)

## Development Workflow
- **Start dev server**: `npm run dev` (nodemon auto-reload)
- **Seed database**: `npm run seed` (creates sample roles/users/leads)
- **Database migrations**: Run `npx prisma migrate dev` after schema changes
- **Generate client**: `npx prisma generate` (outputs to `src/generated/prisma/`)

## Code Conventions
- TypeScript with strict mode, CommonJS modules
- Indonesian comments in code (maintain consistency)
- Error responses in Indonesian for user-facing messages
- Controller functions use `console.time` for performance logging
- Debug middleware logs all requests in development

## Key Files
- `prisma/schema.prisma`: Database schema and relations
- `src/index.ts`: App setup and route mounting
- `src/middlewares/auth.ts`: Authentication logic
- `prisma/seed.ts`: Sample data creation

## Common Patterns
- Routes import controllers and export Router instances
- Controllers destructure `req.body` and validate required fields
- Use Prisma's `findUnique`, `create`, `update` with proper error handling
- JWT payload includes `userId`, `userEmail`, `role`