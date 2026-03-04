# Project Structure

The ALPHA Marketplace application is now organized into three separate applications, each with its own dedicated folder. This structure allows for better separation of concerns and makes it easier to maintain and scale each part of the platform independently.

## Directory Structure

```
src/
├── apps/
│   ├── ecommerce/          # Customer-facing e-commerce application
│   │   ├── components/     # Reusable UI components
│   │   │   ├── auth/       # Authentication components
│   │   │   ├── cart/       # Shopping cart components
│   │   │   ├── home/       # Homepage components
│   │   │   ├── layout/     # Layout components (Header, Footer)
│   │   │   ├── products/   # Product components
│   │   │   └── ui/         # Shared UI components
│   │   └── pages/          # Page components
│   │       ├── HomePage.tsx
│   │       ├── ProductsPage.tsx
│   │       ├── ProductDetailPage.tsx
│   │       ├── StoreDetailPage.tsx
│   │       ├── CampaignDetailPage.tsx
│   │       ├── SearchResultsPage.tsx
│   │       ├── CheckoutPage.tsx
│   │       ├── OrderSuccessPage.tsx
│   │       └── ProfilePage.tsx
│   │
│   ├── store/              # Store management portal
│   │   └── pages/
│   │       └── StorePortalPage.tsx
│   │
│   └── admin/              # Admin dashboard
│       └── pages/
│           └── AdminPage.tsx
│
├── context/                # Shared React contexts
│   ├── AppContext.tsx
│   ├── AuthContext.tsx
│   └── CartContext.tsx
│
├── lib/                    # Shared utilities and helpers
│   ├── mockData.ts
│   ├── roleUtils.ts
│   ├── supabase.ts
│   └── utils.ts
│
├── types/                  # TypeScript type definitions
│   └── index.ts
│
├── App.tsx                 # Main application wrapper
├── Router.tsx              # Application routing
└── main.tsx                # Application entry point
```

## Applications

### 1. E-Commerce Application (`/apps/ecommerce`)
The customer-facing marketplace where users can browse products, add items to cart, and make purchases.

**Access:** Available to all users (authenticated and guest)

**Key Features:**
- Product browsing and search
- Shopping cart
- Checkout process
- User profile and order history
- Store pages
- Campaign pages

### 2. Store Portal (`/apps/store`)
Management interface for store owners to manage their products, orders, and analytics.

**Access:** Available to authenticated users with roles:
- `store_manager` - Can access their assigned store
- `admin` - Can access all stores

**Key Features:**
- Product management
- Order processing
- Store analytics
- Inventory tracking

**Route:** `/store-portal`

### 3. Admin Dashboard (`/apps/admin`)
Central administration panel for platform management.

**Access:** Available to authenticated users with role:
- `admin` - Full administrative access

**Key Features:**
- User management
- Store management
- Product oversight
- Order management
- Campaign management
- Voucher management
- Platform analytics

**Route:** `/admin`

## User Roles

The application supports three user roles defined in the database:

1. **customer** (default)
   - Can browse and purchase products
   - Access to profile and order history

2. **store_manager**
   - All customer permissions
   - Access to Store Portal for their assigned store
   - Can manage products and orders for their store

3. **admin**
   - Full platform access
   - Access to Admin Dashboard
   - Access to Store Portal (all stores)
   - Can manage users, stores, products, campaigns, and system settings

## Authentication & Authorization

Authentication is handled through Supabase with Row Level Security (RLS) policies:

- **Profile Table:** Users can view and update their own profile. Admins can view all profiles.
- **Stores Table:** Public can view active stores. Store managers can view/update their store. Admins have full access.
- **Products Table:** Public can view active products. Store managers can manage their store's products. Admins have full access.
- **Orders Table:** Users can view their own orders. Store managers can view orders for their store. Admins can view all orders.

## Role-Based Navigation

The Header component automatically shows role-appropriate navigation:

- **All authenticated users:** Profile, Orders
- **Store managers:** Store Portal link
- **Admins:** Admin Dashboard link, Store Portal link

Access is enforced both in the UI and at the database level through RLS policies.

## Import Paths

When importing shared resources from within the apps:

**From page files** (`/apps/{app}/pages/`):
```typescript
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../context/AuthContext';
import { Product } from '../../../types';
```

**From component files** (`/apps/{app}/components/`):
```typescript
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../context/AuthContext';
import { Product } from '../../../../types';
```

## Development

All three applications share:
- Authentication context
- Database connection
- Routing configuration
- Build pipeline

This allows for code reuse while maintaining clear separation between different user-facing applications.

## Future Considerations

This structure is designed to support:
- Separate deployment of each application if needed
- Independent scaling of admin/store portals
- Easy addition of new user roles or application types
- Clear code ownership and maintenance responsibilities
