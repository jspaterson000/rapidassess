# RapidAssess - AI-Powered Insurance Assessment Platform

A comprehensive insurance assessment management system with AI-powered analysis, real-time collaboration, and mobile-first design.

## 🚀 Features

### Core Functionality
- **Job Management** - Create, assign, and track insurance assessment jobs
- **Assessment Workflow** - Step-by-step assessment process with quality controls
- **Team Management** - Drag-and-drop job assignment and workload balancing
- **Real-time Analytics** - Performance metrics and trend analysis
- **Customer Portal** - Self-service claim status tracking

### AI-Powered Features
- **Policy Analysis** - Automated claim review against PDS documents
- **Photo Analysis** - AI damage detection and cost estimation
- **Predictive Analytics** - Claim outcome prediction
- **Quality Scoring** - Automated assessment quality evaluation

### Mobile & Offline
- **Mobile-First Design** - Optimized for tablets and smartphones
- **Offline Capability** - Work without internet connection
- **Photo/Video Capture** - Built-in camera integration
- **Touch-Friendly Interface** - Optimized for field use

### Security & Compliance
- **Role-Based Access** - Granular permissions system
- **Data Encryption** - Sensitive data protection
- **Audit Trails** - Complete activity logging
- **GDPR Compliance** - Data protection and privacy controls

### Workflow Automation
- **Smart Assignment** - Location and workload-based job routing
- **Automated Notifications** - Email, SMS, and push notifications
- **Reminder Systems** - Overdue task alerts
- **Quality Controls** - Mandatory requirements and approvals

## 🛠 Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **UI Components**: Radix UI, Shadcn/ui
- **State Management**: React Hooks, Context API
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **File Storage**: Cloudinary / Supabase Storage
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Sonner

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (for production)

### Installation

1. **Clone and install dependencies**
```bash
git clone <repository-url>
cd rapidassess
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start development server**
```bash
npm run dev
```

### Demo Accounts

The application includes demo accounts for testing:

- **Platform Admin**: admin@rapidassess.com / admin123
- **Company Admin**: manager@rapidassess.com / manager123  
- **Assessor**: assessor@rapidassess.com / assessor123

## 📱 Mobile Usage

The application is optimized for mobile devices:

1. **Camera Integration** - Capture photos and videos directly
2. **Offline Mode** - Continue working without internet
3. **Touch Gestures** - Swipe, drag, and tap interactions
4. **Responsive Design** - Adapts to all screen sizes

## 🔧 Configuration

### Supabase Setup (Production)

1. Create a new Supabase project
2. Run the database migrations in `/supabase/migrations`
3. Configure Row Level Security policies
4. Update environment variables

### AI Integration

1. Set up OpenAI API key for enhanced analysis
2. Configure Cloudinary for optimized image processing
3. Enable real-time subscriptions for live updates

## 📊 Analytics & Reporting

The platform includes comprehensive analytics:

- **Performance Dashboards** - Real-time KPIs and metrics
- **Custom Reports** - Configurable report generation
- **Trend Analysis** - Historical data visualization
- **Export Capabilities** - CSV, JSON, PDF exports

## 🔐 Security Features

- **Encrypted Data Storage** - Sensitive information protection
- **Audit Logging** - Complete activity tracking
- **Session Management** - Secure authentication
- **Permission System** - Role-based access control

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Environment Variables

Required for production:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key
- `VITE_OPENAI_API_KEY` - OpenAI API key for AI features
- `VITE_CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name

## 📖 Documentation

### API Reference
- All API endpoints are documented in `/src/api/`
- Mock data examples in `/src/api/mockData.js`
- Integration examples in `/src/api/integrations.js`

### Component Library
- UI components in `/src/components/ui/`
- Business components in `/src/components/`
- Reusable utilities in `/src/lib/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Email: support@rapidassess.com
- Documentation: [docs.rapidassess.com](https://docs.rapidassess.com)
- Issues: GitHub Issues

---

Built with ❤️ for the insurance industry