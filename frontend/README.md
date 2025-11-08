# Smart Garbage Monitoring System - FrontendThis is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).



A beautiful, production-ready Next.js dashboard for municipal waste management.## Getting Started



![Next.js](https://img.shields.io/badge/Next.js-15+-black?style=flat-square&logo=next.js)First, run the development server:

![TypeScript](https://img.shields.io/badge/TypeScript-5+-blue?style=flat-square&logo=typescript)

![Tailwind CSS](https://img.shields.io/badge/Tailwind-4+-38B2AC?style=flat-square&logo=tailwind-css)```bash

npm run dev

## ✨ Features# or

yarn dev

- 🎨 **Beautiful UI** - Clean, modern design with light & dark modes# or

- 📊 **Real-time Data** - Live updates with React Query polling (30s intervals)pnpm dev

- 📈 **Interactive Charts** - Recharts visualizations with smooth animations# or

- 📱 **Fully Responsive** - Mobile-first design, works on all devicesbun dev

- ♿ **Accessible** - Built with Radix UI primitives```

- ⚡ **Fast** - Optimized with Next.js 15 and Turbopack

- 🎭 **Smooth Animations** - Framer Motion micro-interactionsOpen [http://localhost:3000](http://localhost:3000) with your browser to see the result.

- 🔐 **Type-Safe** - Full TypeScript coverage

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## 🚀 Quick Start

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

### Prerequisites

## Learn More

- Node.js 18+ or 20+

- pnpm (recommended) or npmTo learn more about Next.js, take a look at the following resources:

- Backend API running on `http://localhost:5000`

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.

### Installation- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.



```bashYou can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

# Navigate to frontend directory

cd frontend## Deploy on Vercel



# Install dependenciesThe easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

pnpm install

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# Start development server
pnpm dev
```

Visit **http://localhost:3000** 🎉

The frontend is preconfigured to connect to `http://localhost:5000`. To change the API URL, edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://your-backend-url:5000
```

## 📁 Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Home page
│   ├── dashboard/           # Dashboard page
│   ├── bins/                # Bins pages
│   └── admin/               # Admin pages
│
├── components/              # React components
│   ├── layout/             # Sidebar, Topbar, Providers
│   ├── dashboard/          # Dashboard components
│   ├── bins/               # Bin components
│   ├── admin/              # Admin components
│   └── ui/                 # shadcn/ui base components
│
├── lib/                     # Utilities
│   ├── api-client.ts       # ✅ API client (ready)
│   ├── hooks.ts            # ✅ React Query hooks (ready)
│   ├── store.ts            # ✅ Zustand store (ready)
│   ├── types.ts            # ✅ TypeScript types (ready)
│   └── utils.ts            # ✅ Helper functions (ready)
│
└── .env.local              # ✅ Environment config (ready)
```

## 🎯 Implementation Status

### ✅ Complete
- API client with all endpoints
- React Query hooks for data fetching
- Zustand store for UI state
- TypeScript types for API responses
- Utility functions
- Environment configuration
- Package.json with all dependencies

### 📝 To Implement
Follow the **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** for step-by-step instructions to build:

1. **Core Layout** - Sidebar, Topbar, Theme Provider
2. **Dashboard** - KPI cards, Bins grid, Alerts panel
3. **Bin Pages** - List view, Detail view with charts
4. **Admin Pages** - Create/Edit/Delete bin forms
5. **UI Components** - Button, Card, Dialog, Toast, etc.

Or use the **[AI_PROMPT.md](./AI_PROMPT.md)** to generate all components with AI!

## 📡 Backend API Integration

The frontend connects to these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/bins/status` | Get all bins |
| GET | `/api/bins/status/:binId` | Get specific bin |
| GET | `/api/bins/full` | Get full bins only |
| POST | `/api/bins` | Create new bin (admin) |
| POST | `/api/bins/update` | Update fill level |
| PUT | `/api/bins/:binId` | Update bin metadata |
| DELETE | `/api/bins/:binId` | Delete bin |
| GET | `/api/bins/:binId/history` | Get fill history |
| POST | `/api/bins/:binId/review` | Submit review |
| GET | `/api/bins/:binId/reviews` | Get reviews |
| GET | `/api/bins/:binId/collection` | Get collections |
| GET | `/api/analytics/summary` | Get KPIs |
| GET | `/api/analytics/collection-stats` | Get collection stats |

### Usage Example

```typescript
import { useBins } from '@/lib/hooks'

function BinsList() {
  const { data, isLoading } = useBins()
  
  if (isLoading) return <div>Loading...</div>
  
  return (
    <div>
      {data?.data.map(bin => (
        <div key={bin.binId}>{bin.location}: {bin.fillLevel}%</div>
      ))}
    </div>
  )
}
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - CTAs and links
- **Success**: Green (#10b981) - Empty bins (0-60%)
- **Warning**: Yellow (#f59e0b) - Filling bins (61-80%)
- **Danger**: Red (#ef4444) - Full bins (81-100%)

### Typography
- **Font**: Inter (Google Fonts)
- **Sizes**: Responsive scale (12px - 48px)

### Components
Based on [shadcn/ui](https://ui.shadcn.com/) pattern:
- Accessible (Radix UI)
- Customizable (Tailwind CSS)
- Type-safe (TypeScript)

## 📝 Available Scripts

```bash
# Development
pnpm dev              # Start dev server

# Production
pnpm build            # Build for production
pnpm start            # Start production server

# Quality
pnpm lint             # Run linter
```

## 🔧 Configuration

### Environment Variables

`.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

### Tailwind Configuration

Create `tailwind.config.ts` with design tokens (see IMPLEMENTATION_GUIDE.md)

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step component implementation
- **[AI_PROMPT.md](./AI_PROMPT.md)** - Complete AI prompt for code generation
- **[Backend API Docs](../backend/API_DOCUMENTATION.md)** - API reference

## 🚀 Next Steps

1. **Install dependencies**: `pnpm install`
2. **Start backend**: Ensure backend is running on port 5000
3. **Start frontend**: `pnpm dev`
4. **Implement components**: Follow IMPLEMENTATION_GUIDE.md
5. **Or use AI**: Copy AI_PROMPT.md into your AI assistant

## 🎯 Key Features to Implement

### Dashboard
- KPI strip (4 cards: Total bins, Full bins, Collections, Avg fill)
- Bins grid with animated gauges
- Alerts panel for full bins
- Real-time updates (30s polling)

### Bin Detail Page
- Large animated radial gauge
- Time-series history chart (Recharts)
- Reviews section with star ratings
- Collection schedule
- Admin actions (edit, delete)

### Admin Pages
- Create bin form (with validation)
- Edit bin form
- Delete confirmation dialog

## 🐛 Troubleshooting

**Cannot connect to backend:**
- Check `.env.local` has correct URL
- Verify backend is running
- Check browser console for CORS errors

**TypeScript errors:**
- Run `pnpm install` to install all dependencies
- The lib files are ready, but components need to be created

**Build errors:**
- Delete `.next` folder and rebuild
- Check all imports are correct

## 📄 License

ISC License

---

**Ready to build?** Start with the [Implementation Guide](./IMPLEMENTATION_GUIDE.md) or use the [AI Prompt](./AI_PROMPT.md) for rapid development!
