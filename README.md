# Kclick - Multi-Vendor Marketplace Platform

A modern, full-featured e-commerce platform built with React, TypeScript, and Supabase. Kclick is a complete marketplace solution that enables customers to shop, merchants to sell, and administrators to manage the entire platform.

## Overview

Kclick is a production-ready marketplace platform with three distinct applications:

- **E-Commerce Application** - Customer-facing store for browsing and purchasing products
- **Store Portal** - Merchant dashboard for managing products, inventory, orders, and analytics
- **Admin Dashboard** - Central platform management and oversight

## Key Features

### Customer Experience
- Browse products across multiple categories and brands
- Advanced search and filtering capabilities
- Shopping cart with real-time updates
- Secure checkout with multiple payment methods (M-Pesa, Bank Card, Bank Transfer)
- User profiles and order history
- Wishlist and saved items
- Product reviews and ratings
- Promotional campaigns and flash sales

### Merchant Tools
- Product catalog management with variants and images
- Inventory tracking and stock management
- Order processing and fulfillment
- Sales analytics and performance metrics
- Promotional campaigns and vouchers
- Store customization (logo, cover images, policies)
- Payout tracking and financial reports

### Admin Capabilities
- Platform-wide user management
- Store approval and management
- Product and inventory oversight
- Order and payment monitoring
- Campaign and promotion management
- Voucher and discount administration
- System analytics and reporting

## Technology Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library

### Backend & Database
- **Supabase** - PostgreSQL database with authentication and real-time features
- **Row Level Security (RLS)** - Database-level access control
- **REST API** - Supabase auto-generated APIs

### Authentication
- **Supabase Auth** - Email/password authentication
- **JWT Tokens** - Secure session management

## Project Structure

```
src/
├── apps/
│   ├── ecommerce/          # Customer e-commerce app
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   └── services/       # API service layer
│   ├── store/              # Merchant portal
│   │   ├── components/     # Store-specific components
│   │   ├── pages/          # Store pages
│   │   └── services/       # Store service layer
│   └── admin/              # Admin dashboard
│       ├── components/     # Admin components
│       ├── pages/          # Admin pages
│       └── services/       # Admin service layer
├── context/                # React contexts (Auth, Cart, App)
├── lib/                    # Utilities and helpers
├── types/                  # TypeScript definitions
└── Router.tsx              # Central routing configuration
```

## User Roles & Permissions

### Customer
- Default role for all users
- Browse and purchase products
- Access personal profile and order history
- Save favorites and reviews

### Store Manager
- Inherits all customer permissions
- Manage assigned store
- Add and modify products
- Track inventory and sales
- Process orders
- View store analytics

### Admin
- Inherits all permissions
- Full platform access
- Manage users and stores
- Oversee all products and orders
- Configure campaigns and promotions
- System administration

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- Environment variables configured

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   # .env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. **Build for production**
   ```bash
   npm run build
   ```

## Core Database Tables

### Users & Profiles
- **auth.users** - Supabase authentication users
- **profiles** - Extended user information with roles and preferences

### Products & Inventory
- **products** - Product catalog with details, pricing, and metadata
- **categories** - Product categories with hierarchy
- **brands** - Brand information
- **product_images** - Product gallery images
- **product_variants** - Size, color, and other variants
- **store_products** - Store-specific product pricing and stock

### Orders & Payments
- **orders** - Customer orders with shipping and discount info
- **order_items** - Individual line items in orders
- **payments** - Payment transactions and status

### Store Management
- **stores** - Store information and configuration
- **stock_movements** - Inventory transaction history
- **store_payouts** - Merchant payment tracking

### Marketing
- **vouchers** - Discount codes and coupons
- **campaigns** - Promotional campaigns
- **store_promotions** - Store-specific promotions

## Security Features

### Database Security
- Row Level Security (RLS) policies on all sensitive tables
- User ownership verification on personal data
- Store membership verification for access control
- Admin-only access for sensitive operations

### Authentication
- Secure email/password authentication
- JWT-based session management
- Automatic session refresh

### Data Protection
- Encrypted sensitive information
- CORS protection on API endpoints
- Input validation and sanitization

## API Integration Points

### E-Commerce Services
- Product fetching and filtering
- Store information and details
- Cart operations (simulated client-side)
- Order creation and tracking
- User authentication and profile management

### Store Portal Services
- Inventory management
- Order processing
- Analytics data aggregation
- Payout calculations

### Admin Services
- User management
- Store approval workflow
- Product verification
- Campaign administration

## Development Guidelines

### File Organization
- Keep components focused and modular
- Separate business logic into service files
- Use TypeScript types for all data structures
- Follow naming conventions (PascalCase for components, camelCase for utilities)

### State Management
- Use React Context for global app state
- Local state for component-specific logic
- Service functions for API interactions

### Styling
- Tailwind CSS classes for all styling
- Use existing color and spacing tokens
- Responsive design with mobile-first approach

### Adding New Features
1. Create service functions for API calls
2. Build components using existing patterns
3. Add TypeScript types in `/src/types/`
4. Integrate into Router for new routes
5. Add RLS policies for new data access patterns

## Common Tasks

### Create a New Product
1. Use the Admin Dashboard or Store Portal
2. Fill in product details, images, and variants
3. Set pricing and inventory
4. Publish to make visible to customers

### Process an Order
1. View pending orders in Store Portal
2. Update order status through workflow
3. Add tracking information
4. Customer receives notifications

### Create a Promotion
1. Navigate to Campaigns in Admin Dashboard
2. Set discount percentage and duration
3. Select applicable products or stores
4. Activate to make live

### Manage User Roles
1. Access User Management in Admin Dashboard
2. Change user role (customer, store_manager, admin)
3. Assign store for store managers
4. Changes take effect immediately via RLS

## Troubleshooting

### Authentication Issues
- Clear browser cache and cookies
- Verify Supabase credentials in `.env`
- Check RLS policies for profile access

### Product Not Appearing
- Verify product `is_active` status
- Check `published_at` timestamp
- Confirm store has `is_active = true`
- Review RLS policies for product visibility

### Order Creation Failures
- Ensure user is authenticated
- Verify shipping information is complete
- Check inventory availability
- Validate cart items exist

### Permission Denied Errors
- Verify user role and assignment
- Check RLS policies in Supabase
- Confirm user ID matches data ownership
- Clear auth cache and re-login

## Performance Optimization

- Product images are optimized and cached
- Database queries use selective field selection
- Pagination on product listings
- Lazy loading for images and components
- Efficient RLS policies to minimize data transfer

## Deployment

### Building for Production
```bash
npm run build
```

### Environment Setup
- Set production Supabase URL and key
- Configure CORS in Supabase settings
- Enable appropriate RLS policies
- Set up database backups

### Monitoring
- Monitor database query performance
- Track failed authentication attempts
- Review order processing pipeline
- Monitor payment success rates

## Contributing

When making changes:
1. Follow existing code patterns and conventions
2. Add TypeScript types for new functions
3. Test database changes with RLS policies
4. Update relevant documentation
5. Run build to verify no errors

## Support & Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## License

Proprietary - All rights reserved
