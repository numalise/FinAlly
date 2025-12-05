# Contributing to FinAlly

> **Guidelines for contributing to the FinAlly personal finance platform**

Thank you for considering contributing to FinAlly! This document provides guidelines and best practices for contributing code, documentation, and bug reports.

---

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Branching Strategy](#branching-strategy)
5. [Commit Message Format](#commit-message-format)
6. [Pull Request Process](#pull-request-process)
7. [Code Style Guidelines](#code-style-guidelines)
8. [Testing Requirements](#testing-requirements)
9. [Documentation Requirements](#documentation-requirements)
10. [Issue Reporting](#issue-reporting)

---

## Code of Conduct

### Our Standards

- **Be respectful:** Treat all contributors with respect and kindness
- **Be constructive:** Provide helpful feedback and suggestions
- **Be collaborative:** Work together to improve the project
- **Be inclusive:** Welcome contributors of all skill levels

### Unacceptable Behavior

- Harassment, discrimination, or personal attacks
- Trolling, inflammatory comments, or off-topic discussions
- Publishing others' private information without permission
- Any conduct that would be inappropriate in a professional setting

---

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 20.x installed
- AWS CLI configured with `finally_user` profile
- Terraform ≥ 1.5.0 installed
- PostgreSQL client (psql) for database access
- Docker for Lambda builds
- Git configured with your name and email

### Fork and Clone

```bash
# Fork the repository on GitHub
# Then clone your fork
git clone https://github.com/YOUR_USERNAME/FinAlly.git
cd FinAlly

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/FinAlly.git

# Verify remotes
git remote -v
```

### Setup Development Environment

Follow the complete setup guide in [SETUP.md](SETUP.md):

```bash
# Frontend setup
cd frontend
npm install
cp .env.example .env.local
# Edit .env.local with your Cognito credentials

# Lambda setup
cd ../lambda
npm install
npx prisma generate

# Verify setup
npm run build
```

---

## Development Workflow

### 1. Sync with Upstream

Before starting work, sync your fork with the upstream repository:

```bash
git checkout dev
git fetch upstream
git merge upstream/dev
git push origin dev
```

### 2. Create Feature Branch

```bash
# Create and switch to new branch
git checkout -b feature/your-feature-name

# Branch naming conventions:
# feature/add-investment-analytics    (new feature)
# fix/budget-calculation-bug          (bug fix)
# infra/add-vpc-endpoints             (infrastructure change)
# docs/update-api-reference           (documentation)
# refactor/simplify-asset-logic       (refactoring)
# test/add-unit-tests-for-allocation  (testing)
# style/update-chakra-theme           (styling)
```

### 3. Make Changes

- Write clear, self-documenting code
- Follow existing code style and patterns
- Add comments for complex logic only
- Update documentation if behavior changes
- Add tests for new functionality (Phase 6+)

### 4. Test Locally

**Frontend:**
```bash
cd frontend
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run build         # Production build
```

**Lambda:**
```bash
cd lambda
npm run lint          # ESLint
npm run type-check    # TypeScript
npm run build         # esbuild compilation
```

**Terraform:**
```bash
cd terraform/environments/dev
terraform fmt         # Format files
terraform validate    # Validate configuration
terraform plan        # Review changes
```

### 5. Commit Changes

Follow commit message guidelines (see below).

### 6. Push to Your Fork

```bash
git push origin feature/your-feature-name
```

### 7. Open Pull Request

Go to GitHub and create a pull request from your feature branch to `dev` branch.

---

## Branching Strategy

### Branch Hierarchy

```
main       ← Production-ready code (protected)
  │
staging    ← Pre-production validation (protected)
  │
dev        ← Active development (default branch)
  │
  ├─ feature/add-investment-analytics
  ├─ fix/budget-calculation-bug
  ├─ infra/add-vpc-endpoints
  └─ docs/update-api-reference
```

### Branch Protection

**`main` branch:**
- Requires pull request with 1 approval
- Requires passing CI checks (Phase 6+)
- No direct pushes
- Deployment to production

**`staging` branch:**
- Requires pull request
- Deployment to staging environment
- Testing ground before production

**`dev` branch:**
- Default branch for new PRs
- Requires pull request
- Deployment to dev environment

### Branch Lifecycle

1. Create feature branch from `dev`
2. Work on feature, commit regularly
3. Open PR to merge into `dev`
4. Code review and address feedback
5. Merge into `dev` (squash and merge)
6. Delete feature branch
7. When ready, merge `dev` → `staging` → `main`

---

## Commit Message Format

### Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: New feature
- `fix`: Bug fix
- `infra`: Infrastructure change
- `docs`: Documentation only
- `refactor`: Code refactoring (no behavior change)
- `test`: Adding or updating tests
- `style`: Code style changes (formatting, etc.)
- `perf`: Performance improvements
- `chore`: Build process or auxiliary tool changes

### Scope (optional)

- `frontend`: Frontend changes
- `lambda`: Backend API changes
- `terraform`: Infrastructure changes
- `database`: Database schema or migrations
- `scripts`: Utility scripts

### Subject

- Use imperative mood ("add" not "added" or "adds")
- Don't capitalize first letter
- No period at the end
- Keep under 72 characters

### Examples

**Good:**
```
feat(frontend): add investment analytics dashboard

Implemented new analytics page with:
- Net worth projection chart
- Spending trends analysis
- Category breakdown pie chart

Closes #45
```

```
fix(lambda): correct budget variance calculation

Budget variance was showing incorrect values when expenses
exceeded budget limit. Fixed calculation logic in budgets.ts.

Fixes #123
```

```
infra(terraform): add VPC endpoints for cost savings

Added VPC endpoints for:
- secretsmanager
- ecr.api
- ecr.dkr

Reduces NAT Gateway data transfer costs by ~€10/month.
```

**Bad:**
```
Update stuff
```

```
Fixed bug
```

```
Added new feature for analytics and also fixed some bugs in the budget calculation and updated documentation
```

### Footer

- `Closes #123` - Closes issue #123
- `Fixes #456` - Fixes bug #456
- `Refs #789` - References issue #789
- `Breaking Change: ...` - Describes breaking changes

---

## Pull Request Process

### PR Checklist

Before opening a PR, ensure:

- [ ] Code follows project style guidelines
- [ ] All tests pass (Phase 6+)
- [ ] TypeScript compiles without errors
- [ ] ESLint passes without errors
- [ ] Documentation updated (if behavior changes)
- [ ] Commit messages follow format
- [ ] Branch is up-to-date with `dev`
- [ ] Self-review completed

### PR Title

Follow commit message format:
```
feat(frontend): add investment analytics dashboard
fix(lambda): correct budget variance calculation
```

### PR Description Template

```markdown
## Summary
Brief description of changes.

## Type of Change
- [ ] New feature
- [ ] Bug fix
- [ ] Infrastructure change
- [ ] Documentation update
- [ ] Refactoring
- [ ] Performance improvement

## Changes Made
- Change 1
- Change 2
- Change 3

## Testing Done
- [ ] Manual testing completed
- [ ] Unit tests added (Phase 6+)
- [ ] Integration tests added (Phase 6+)

## Screenshots (if applicable)
Add screenshots for UI changes.

## Related Issues
Closes #123
Refs #456

## Deployment Notes
Any special deployment considerations (e.g., run migration first).
```

### Review Process

1. **PR opened** → Automated checks run (Phase 6+)
2. **Reviewer assigned** → Code review begins
3. **Feedback provided** → Author addresses comments
4. **Approval given** → Merge when ready
5. **Merged** → Feature branch deleted

### Code Review Guidelines

**As Author:**
- Respond to all comments (even if just "Done")
- Don't take feedback personally
- Ask for clarification if needed
- Mark resolved comments as resolved

**As Reviewer:**
- Be constructive and respectful
- Explain *why* changes are needed
- Suggest alternatives, don't just criticize
- Approve when satisfied (don't nitpick)

### Merge Strategy

**Squash and Merge:**
- Default for most PRs
- Creates single commit on `dev` branch
- Keeps history clean

**Merge Commit:**
- For large feature branches
- Preserves individual commits
- Use sparingly

**Rebase and Merge:**
- Not recommended (causes confusion)

---

## Code Style Guidelines

### TypeScript

**Use TypeScript features:**
```typescript
// Good: Explicit types
interface Asset {
  id: number;
  name: string;
  category_id: number;
}

function getAsset(id: number): Promise<Asset> {
  // ...
}

// Bad: Any types
function getAsset(id: any): any {
  // ...
}
```

**Avoid type assertions:**
```typescript
// Good: Type guard
if (typeof value === 'string') {
  // value is string here
}

// Bad: Type assertion
const str = value as string;
```

### Frontend (React)

**Component naming:**
```typescript
// Good: PascalCase for components
export function AssetCard() { ... }

// Bad: camelCase
export function assetCard() { ... }
```

**Hooks naming:**
```typescript
// Good: Use prefix "use"
function useAssets() { ... }

// Bad: No prefix
function getAssets() { ... }
```

**Conditional rendering:**
```typescript
// Good: Early return
if (isLoading) return <Spinner />;
if (error) return <ErrorMessage />;
return <AssetList assets={assets} />;

// Bad: Nested ternaries
return isLoading ? <Spinner /> : error ? <ErrorMessage /> : <AssetList />;
```

### Backend (Lambda)

**Function naming:**
```typescript
// Good: Verb-noun pattern
async function getAssets(userId: number) { ... }
async function createAsset(data: AssetData) { ... }

// Bad: Noun only
async function assets() { ... }
```

**Error handling:**
```typescript
// Good: Specific error responses
if (!asset) {
  return errorResponse(404, 'Asset not found', 'NOT_FOUND');
}

// Bad: Generic errors
if (!asset) {
  return errorResponse(500, 'Error', 'ERROR');
}
```

### Database (Prisma)

**Query patterns:**
```typescript
// Good: Use Prisma types
const assets: Asset[] = await prisma.assets.findMany({ ... });

// Bad: Any type
const assets: any = await prisma.assets.findMany({ ... });
```

**Transactions:**
```typescript
// Good: Use transactions for atomic operations
await prisma.$transaction(async (tx) => {
  await tx.expense_items.create({ ... });
  await tx.budgets.update({ ... });
});

// Bad: Separate queries (race condition)
await prisma.expense_items.create({ ... });
await prisma.budgets.update({ ... });
```

### Terraform

**Resource naming:**
```hcl
# Good: project-environment-resource
resource "aws_lambda_function" "finally_dev_api" {
  ...
}

# Bad: Unclear name
resource "aws_lambda_function" "api" {
  ...
}
```

**Use variables:**
```hcl
# Good: DRY with variables
resource "aws_db_instance" "main" {
  instance_class = var.db_instance_class
}

# Bad: Hard-coded values
resource "aws_db_instance" "main" {
  instance_class = "db.t3.micro"
}
```

---

## Testing Requirements

### Current Status (Phase 5)

Testing infrastructure is planned for Phase 6 (CI/CD Pipelines).

### Future Requirements (Phase 6+)

**Unit Tests:**
- Required for all new functions
- Aim for >80% code coverage
- Use Jest for TypeScript/Node.js

**Integration Tests:**
- Required for API endpoints
- Test database operations with test database
- Use Supertest for API testing

**E2E Tests:**
- Required for critical user flows
- Test authentication, asset creation, expense tracking
- Use Playwright or Cypress

**Example test structure:**
```
lambda/
├── src/
│   └── routes/
│       └── assets.ts
└── __tests__/
    └── routes/
        └── assets.test.ts
```

---

## Documentation Requirements

### When to Update Documentation

Update documentation when:
- Adding new API endpoints
- Changing API request/response format
- Adding new frontend components
- Modifying infrastructure
- Changing environment variables
- Adding new database tables/columns

### Which Files to Update

**API changes:**
- `docs/API.md` - API reference
- `lambda/src/routes/README.md` - Route handler docs

**Frontend changes:**
- `frontend/README.md` - Component architecture
- `frontend/DEVELOPMENT.md` - Development patterns

**Infrastructure changes:**
- `docs/ARCHITECTURE.md` - System architecture
- `terraform/README.md` - Infrastructure overview
- Specific module READMEs

**Database changes:**
- `database/README.md` - Schema documentation
- `database/MIGRATIONS.md` - Migration log

### Documentation Style

- Use clear, concise language
- Include code examples
- Use ASCII diagrams where helpful
- Keep line length <120 characters
- Use markdown formatting consistently

---

## Issue Reporting

### Before Reporting

1. Search existing issues to avoid duplicates
2. Try to reproduce the issue
3. Gather relevant information (logs, screenshots, etc.)

### Bug Report Template

```markdown
## Bug Description
Clear and concise description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- Browser: [e.g. Chrome 120]
- Device: [e.g. Desktop, iPhone 12]
- OS: [e.g. macOS 14.0]

## Additional Context
Any other context about the problem.

## Logs
```
Paste relevant logs here
```
```

### Feature Request Template

```markdown
## Feature Description
Clear and concise description of the feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What alternative solutions did you consider?

## Additional Context
Any other context or screenshots.
```

---

## Questions?

If you have questions about contributing:

1. Check existing documentation (README, SETUP, etc.)
2. Search closed issues and PRs
3. Open a discussion on GitHub
4. Ask in PR comments if related to specific code

---

## License

By contributing to FinAlly, you agree that your contributions will be licensed under the same license as the project.

---

**Thank you for contributing to FinAlly!**

We appreciate your time and effort in making this project better for everyone.

---

**Contributing Guide Version:** 1.0 (Phase 5)
**Last Updated:** December 2025
