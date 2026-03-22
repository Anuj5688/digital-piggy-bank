## Packages
framer-motion | For smooth, playful animations fitting the piggybank theme
clsx | Utility for constructing className strings conditionally
tailwind-merge | Utility to merge tailwind classes
lucide-react | Beautiful icons

## Notes
- User authentication is handled via Replit Auth (`/api/login`, `/api/logout`).
- Money amounts are stored in cents. The frontend divides by 100 for display and multiplies by 100 before sending to the backend.
- The `useAuth` hook is already assumed to be present at `@/hooks/use-auth`.
