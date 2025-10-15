# church_app Development Guidelines

Auto-generated from all feature plans. Last updated: 2025-10-15

## Active Technologies

- TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend) (001-full-stack-web)

## Project Structure

```
backend/
frontend/
tests/
```

## Commands

npm test; npm run lint

## Code Style

TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend): Follow standard conventions

## MCP Server Usage Guidelines

When implementing features, leverage available MCP servers for enhanced development:

### Context7 MCP Server (Library Documentation)

- **Use for**: Getting up-to-date, version-specific documentation and code examples from any library or framework
- **When to use**:
  - Learning new library APIs or patterns
  - Checking current best practices for dependencies (React, Prisma, Express, etc.)
  - Verifying correct usage of framework features
  - Finding code examples for specific use cases
- **Example use cases**:
  - "Get Prisma documentation for relation queries"
  - "Show React 18 hooks best practices"
  - "Find Express middleware examples for authentication"

### shadcn MCP Server (UI Components)

- **Use for**: UI component implementation with shadcn/ui library
- **When to use**:
  - Implementing new UI features or pages
  - Adding shadcn/ui components to the project
  - Finding component usage examples and patterns
  - Checking component API and customization options
- **Example use cases**:

  - "Add shadcn button component"
  - "Show shadcn form component examples"
  - "Get shadcn dialog implementation pattern"
  - "Find card component variants"

- **Reference shadcn-ui-guide.md** for detailed instructions on using shadcn components effectively.

**Best Practice**: Always consult MCP servers before implementing features to ensure you're using current best practices and correct API patterns.

## Recent Changes

- 001-full-stack-web: Added TypeScript 5.x (Node.js 20.x LTS for backend, React 18.x for frontend)

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
