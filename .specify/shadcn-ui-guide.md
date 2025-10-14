# shadcn/ui Implementation Guide

## Quick Reference for Church Management App

### Constitution Reference

- **Version**: 1.1.0
- **Section**: Architecture Standards > UI Development Standards
- **Authority**: This guide implements constitutional requirements for UI development

---

## Setup Instructions

### 1. Initialize shadcn/ui in Frontend

```bash
cd frontend
npx shadcn-ui@latest init
```

Configuration options:

- ✅ TypeScript: Yes
- ✅ Style: Default
- ✅ Base color: Slate (professional, church-appropriate)
- ✅ CSS variables: Yes (enables theming)
- ✅ React Server Components: No (using client-side React)
- ✅ Import alias: @/components

### 2. Install Tailwind CSS (if not already installed)

```bash
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 3. Configure Tailwind for Church Theme

Edit `tailwind.config.js`:

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Church-themed color palette
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // Additional custom colors for church context
        worship: {
          light: "#F3F4F6",
          DEFAULT: "#6B7280",
          dark: "#374151",
        },
        ministry: {
          light: "#DBEAFE",
          DEFAULT: "#3B82F6",
          dark: "#1E40AF",
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

---

## Component Usage Patterns

### Adding Components

Use shadcn MCP server or CLI to add components:

```bash
# Via CLI
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add table

# Via MCP Server (preferred during development)
# Ask: "Add shadcn button component"
# The MCP server will handle the component addition
```

### Component Organization

```
frontend/src/components/
├── ui/                    # shadcn/ui primitives (owned by project)
│   ├── button.tsx
│   ├── card.tsx
│   ├── form.tsx
│   ├── dialog.tsx
│   └── table.tsx
│
└── features/              # Composed feature components
    ├── member-card.tsx    # Uses ui/card, ui/button
    ├── donation-form.tsx  # Uses ui/form, ui/input
    └── event-dialog.tsx   # Uses ui/dialog, ui/calendar
```

### Example: Building a Member Card

```typescript
// src/components/features/member-card.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    email: string;
    role: string;
    avatarUrl?: string;
  };
  onEdit: (id: string) => void;
}

export function MemberCard({ member, onEdit }: MemberCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar>
            <AvatarImage src={member.avatarUrl} alt={member.name} />
            <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{member.name}</CardTitle>
            <CardDescription>{member.role}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{member.email}</p>
      </CardContent>
      <CardFooter>
        <Button
          onClick={() => onEdit(member.id)}
          variant="outline"
          className="w-full"
        >
          Edit Member
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## MCP Server Integration

### Using shadcn MCP Server During Development

When implementing UI features, leverage the MCP server:

**Example Prompts:**

1. **Component Discovery:**

   - "What shadcn components should I use for a member directory?"
   - "Show me shadcn table component examples"

2. **Implementation Guidance:**

   - "Create a donation form using shadcn form components"
   - "Build a responsive navigation menu with shadcn"

3. **Accessibility Checks:**

   - "How do I ensure this component is WCAG 2.1 AA compliant?"
   - "Add keyboard navigation to this shadcn dialog"

4. **Theme Customization:**
   - "Customize shadcn button variants for church theme"
   - "Add dark mode support to this component"

**MCP Server Benefits:**

- ✅ Instant component examples with best practices
- ✅ Accessibility guidance built-in
- ✅ Theme customization suggestions
- ✅ Responsive design patterns
- ✅ Reduces context switching and documentation lookup

---

## Common Components for Church Management

### Recommended Components to Add First

```bash
# Core UI primitives
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add form
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add textarea

# Navigation
npx shadcn-ui@latest add navigation-menu
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add menubar

# Data Display
npx shadcn-ui@latest add table
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add calendar

# Feedback
npx shadcn-ui@latest add alert
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add alert-dialog

# Layout
npx shadcn-ui@latest add tabs
npx shadcn-ui@latest add accordion
npx shadcn-ui@latest add separator
```

### Church-Specific Component Examples

**1. Event Card**

```typescript
// Uses: Card, Badge, Button, Calendar
<Card>
  <CardHeader>
    <CardTitle>Sunday Worship Service</CardTitle>
    <Badge>Weekly</Badge>
  </CardHeader>
  <CardContent>
    <Calendar date={eventDate} />
    <p>Join us for worship and fellowship</p>
  </CardContent>
  <CardFooter>
    <Button>Register</Button>
  </CardFooter>
</Card>
```

**2. Donation Form**

```typescript
// Uses: Form, Input, Select, Button
<Form>
  <FormField name="amount">
    <FormLabel>Amount</FormLabel>
    <Input type="number" placeholder="$0.00" />
  </FormField>
  <FormField name="category">
    <FormLabel>Category</FormLabel>
    <Select>
      <SelectOption>Tithe</SelectOption>
      <SelectOption>Offering</SelectOption>
      <SelectOption>Building Fund</SelectOption>
    </Select>
  </FormField>
  <Button type="submit">Submit Donation</Button>
</Form>
```

**3. Member Directory Table**

```typescript
// Uses: Table, Avatar, Badge, DropdownMenu
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Member</TableHead>
      <TableHead>Role</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {members.map((member) => (
      <TableRow key={member.id}>
        <TableCell>
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={member.avatar} />
              <AvatarFallback>{member.initials}</AvatarFallback>
            </Avatar>
            {member.name}
          </div>
        </TableCell>
        <TableCell>{member.role}</TableCell>
        <TableCell>
          <Badge variant={member.active ? "success" : "secondary"}>
            {member.active ? "Active" : "Inactive"}
          </Badge>
        </TableCell>
        <TableCell>
          <DropdownMenu>{/* Actions */}</DropdownMenu>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Accessibility Checklist

All components MUST meet these accessibility standards:

- [ ] **Keyboard Navigation**: All interactive elements accessible via keyboard
- [ ] **Screen Reader Support**: Proper ARIA labels and roles
- [ ] **Focus Indicators**: Visible focus states on all interactive elements
- [ ] **Color Contrast**: WCAG AA compliant (4.5:1 for normal text, 3:1 for large text)
- [ ] **Responsive**: Works on mobile, tablet, and desktop
- [ ] **Dark Mode**: Proper contrast in both light and dark themes

**shadcn/ui provides these by default**, but always verify in context.

---

## Testing UI Components

### Unit Tests (Jest + React Testing Library)

```typescript
// src/components/features/__tests__/member-card.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { MemberCard } from "../member-card";

describe("MemberCard", () => {
  const mockMember = {
    id: "1",
    name: "John Doe",
    email: "john@church.org",
    role: "Elder",
  };

  it("renders member information", () => {
    render(<MemberCard member={mockMember} onEdit={jest.fn()} />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Elder")).toBeInTheDocument();
  });

  it("calls onEdit when edit button clicked", () => {
    const handleEdit = jest.fn();
    render(<MemberCard member={mockMember} onEdit={handleEdit} />);

    fireEvent.click(screen.getByText("Edit Member"));
    expect(handleEdit).toHaveBeenCalledWith("1");
  });
});
```

### Accessibility Tests

```typescript
import { axe, toHaveNoViolations } from "jest-axe";

expect.extend(toHaveNoViolations);

it("should not have accessibility violations", async () => {
  const { container } = render(
    <MemberCard member={mockMember} onEdit={jest.fn()} />
  );
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Dark Mode Implementation

### Enable Dark Mode Toggle

```typescript
// src/components/features/theme-toggle.tsx
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes"; // or your theme provider

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
```

---

## Performance Optimization

### Code Splitting Components

```typescript
// Lazy load heavy components
import { lazy, Suspense } from "react";

const HeavyDataTable = lazy(() => import("@/components/features/data-table"));

function MemberDirectory() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeavyDataTable />
    </Suspense>
  );
}
```

### Optimize Bundle Size

- ✅ Use tree-shaking (ESM imports)
- ✅ Lazy load large components
- ✅ Use `lucide-react` for icons (tree-shakeable)
- ✅ Keep Tailwind config minimal
- ✅ Monitor bundle size (`npm run build -- --analyze`)

---

## Resources

- **shadcn/ui Docs**: https://ui.shadcn.com
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **Radix UI Docs**: https://www.radix-ui.com/primitives
- **WCAG Guidelines**: https://www.w3.org/WAI/WCAG21/quickref/
- **Constitution**: `.specify/memory/constitution.md` (v1.1.0)

---

## Constitutional Compliance

This guide implements:

- ✅ Principle I: Clean Architecture (UI as presentation layer)
- ✅ Principle II: Test-Driven Development (test examples provided)
- ✅ Principle III: DRY (reusable components)
- ✅ Principle IV: KISS (simple, composable components)
- ✅ Principle VI: Separation of Concerns (UI separated from business logic)
- ✅ Architecture Standards: UI Development Standards section

**Last Updated**: 2025-10-14 (Constitution v1.1.0)
