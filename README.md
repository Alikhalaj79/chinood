# Paridis Gostar Chinood - Catalog Management System

A complete and modern catalog management system built with Next.js that enables catalog item management and display.

## 📋 Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Configuration](#configuration)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API](#api)
- [Security](#security)
- [Deployment](#deployment)

## ✨ Features

### Catalog Management

- ✅ Create, edit, and delete catalog items
- ✅ Image upload with support for JPEG, PNG, and WebP formats
- ✅ Three different display types for cards:
  - **Type 1**: Image on top, text below
  - **Type 2**: Text on left, image on right
  - **Type 3**: Image on left, text on right
- ✅ Search through catalog items
- ✅ Pagination with configurable items per page
- ✅ Configure card display direction (newest first or oldest first)

### Authentication & Security

- ✅ JWT-based authentication system
- ✅ Access Token with 15-minute expiration
- ✅ Refresh Token with 7-day expiration
- ✅ Automatic token refresh
- ✅ Protected admin routes
- ✅ Secure token storage in cookies

### User Interface

- ✅ Responsive design, mobile-friendly
- ✅ Full RTL (Right-to-Left) support for Persian language
- ✅ Vazirmatn font integration
- ✅ Smooth animations and fluid user experience
- ✅ Card preview before saving
- ✅ Toast notifications for operation feedback
- ✅ Skeleton loading for improved UX

### Settings

- ✅ Catalog display settings management
- ✅ Settings synchronization across browser tabs
- ✅ Settings stored in database

## 🛠 Technologies Used

### Frontend

- **Next.js 16.0.4** - React framework for building applications
- **React 19.2.0** - UI library
- **TypeScript 5** - Static typing
- **Tailwind CSS 4** - Styling
- **Vazirmatn Font** - Persian font

### Backend

- **Next.js API Routes** - Server-side APIs
- **MongoDB** - NoSQL database
- **Mongoose 9.0.0** - ODM for MongoDB
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing

### Development Tools

- **ESLint** - Code linter
- **PostCSS** - CSS processing

## 📦 Prerequisites

Before starting, make sure you have the following installed on your system:

- **Node.js** (version 18 or higher)
- **npm** or **yarn** or **pnpm**
- **MongoDB** (local or cloud like MongoDB Atlas)

## 🚀 Installation & Setup

### 1. Clone the Project

```bash
git clone <repository-url>
cd chinood
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# MongoDB connection
MONGODB_URI=mongodb://localhost:27017/chinood
# or for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chinood

# JWT keys (use for production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

# Admin credentials
ADMIN_USERNAME
ADMIN_PASSWORD

# Environment
NODE_ENV=development
```

**⚠️ Security Warning**: In production, make sure to change `JWT_SECRET` and `JWT_REFRESH_SECRET` to secure, random values.

### 4. Setup MongoDB

If using local MongoDB:

```bash
# On different operating systems
# Windows
mongod

# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

Or use MongoDB Atlas and place the connection URI in `.env.local`.

### 5. Check Database Connection

```bash
npm run check-db
```

### 6. Run the Project

```bash
# Development mode
npm run dev

# Build for production
npm run build

# Run production version
npm start
```

After running, the project will be available at `http://localhost:3000`.

## ⚙️ Configuration

### Database Settings

The project uses MongoDB. Main models:

- **CatalogItem**: Catalog items
- **User**: Users (currently not in use)
- **RefreshToken**: Refresh tokens
- **Settings**: Display settings

### Authentication Settings

- **Access Token**: Valid for 15 minutes
- **Refresh Token**: Valid for 7 days
- Tokens are stored in cookies (httpOnly for security)

### Image Upload Limitations

- Allowed formats: JPEG, JPG, PNG, WebP
- Maximum size: 5 megabytes
- Images are stored as Base64 in the database

## 📁 Project Structure

```
chinood/
├── app/                      # Next.js App Router
│   ├── admin/               # Admin panel
│   │   └── page.tsx
│   ├── api/                 # API Routes
│   │   ├── auth/           # Authentication
│   │   │   ├── login/
│   │   │   ├── logout/
│   │   │   ├── me/
│   │   │   └── refresh/
│   │   ├── catalog/        # Catalog management
│   │   ├── settings/       # Settings
│   │   ├── images/         # Images
│   │   └── db-status/      # Database status
│   ├── components/         # React components
│   │   ├── admin/         # Admin panel components
│   │   ├── CatalogCard.tsx
│   │   ├── CatalogGrid.tsx
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   ├── lib/               # Libraries and utilities
│   │   ├── models/       # Mongoose models
│   │   ├── hooks/        # React Hooks
│   │   ├── auth.ts       # Authentication functions
│   │   ├── catalog.ts    # Catalog functions
│   │   ├── db.ts         # Database connection
│   │   └── types.ts      # TypeScript types
│   ├── login/            # Login page
│   ├── page.tsx          # Home page (catalog display)
│   ├── layout.tsx         # Main layout
│   └── globals.css       # Global styles
├── api/                   # Helper scripts
│   └── data/
├── public/                # Static files
├── utils/                 # Helper functions
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 💻 Usage

### Home Page

The home page (`/`) displays the catalog publicly. Users can:

- View catalog items
- Navigate between pages
- Display settings (direction and item count) are applied from the admin panel

### Admin Panel

To access the admin panel:

1. Go to `/login`
2. Log in with admin credentials (default values in `.env.local`)
3. After successful login, you'll be redirected to `/admin`

In the admin panel, you can:

#### Create New Item

1. Fill out the form at the top of the page
2. Enter the title (required)
3. Enter the description (optional)
4. Upload an image (optional)
5. Select the display type
6. Click "Create Item"

#### Edit Item

1. Click the "Edit" button next to the desired item
2. Modify the information
3. You can change or remove the image
4. Click "Save Changes"

#### Delete Item

1. Click the "Delete" button next to the desired item
2. In the confirmation dialog, select "Delete"

#### Change Display Type

- You can change the display type of each item directly from the list
- Changes are applied immediately

#### Display Settings

- **Items per page**: Select from the dropdown (5, 7, 10, 15, 20)
- **Display direction**: Newest first or oldest first

## 🔌 API

### Authentication

#### `POST /api/auth/login`

User login

**Request:**

```json

```

**Response:**

```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "message": "Login successful"
}
```

#### `POST /api/auth/logout`

User logout

#### `GET /api/auth/me`

Current user information

#### `POST /api/auth/refresh`

Refresh tokens

### Catalog

#### `GET /api/catalog`

Get list of all catalog items (public)

**Response:**

```json
[
  {
    "id": "...",
    "title": "...",
    "description": "...",
    "image": "...",
    "imageMimeType": "image/jpeg",
    "itemViewType": "type1"
  }
]
```

#### `POST /api/catalog`

Create new item (requires authentication)

**Request:** FormData

- `title`: string (required)
- `description`: string (optional)
- `image`: File (optional)
- `itemViewType`: "type1" | "type2" | "type3"

#### `PUT /api/catalog/[id]`

Edit item (requires authentication)

**Request:** FormData

- `title`: string
- `description`: string
- `image`: File
- `removeImage`: "true" (to remove image)
- `itemViewType`: "type1" | "type2" | "type3"

#### `DELETE /api/catalog/[id]`

Delete item (requires authentication)

### Settings

#### `GET /api/settings`

Get settings (public)

**Response:**

```json
{
  "catalogViewType": "list",
  "cardDirection": "top-to-bottom",
  "itemsPerPage": 7
}
```

#### `PUT /api/settings`

Update settings (requires authentication)

**Request:**

```json
{
  "cardDirection": "bottom-to-top",
  "itemsPerPage": 10
}
```

### Images

#### `GET /api/images/[id]`

Get item image

### Database Status

#### `GET /api/db-status`

Check database connection status

## 🔒 Security

### Best Practices

1. **Environment Variables**: Never commit JWT keys and sensitive information in code
2. **HTTPS**: Always use HTTPS in production
3. **Cookie Security**: Cookies are configured with `httpOnly` and `secure` (in production)
4. **Token Expiry**: Access tokens have short validity periods (15 minutes)
5. **Refresh Token Rotation**: A new refresh token is generated on each refresh

### Changing Default Password

To change the admin password:

1. Change `ADMIN_USERNAME` and `ADMIN_PASSWORD` variables in `.env.local`
2. Restart the server

## 🚢 Deployment

### Vercel (Recommended)

1. Push the project to GitHub
2. Create a new project in [Vercel](https://vercel.com)
3. Add environment variables in Vercel settings
4. Use MongoDB Atlas for the database
5. Deploy

### Docker

You can add a Dockerfile and containerize the project.

### Other Platforms

The project is Next.js and can run on any platform that supports Node.js:

- Railway
- Render
- DigitalOcean App Platform
- AWS Amplify
- And more

## 📝 Available Scripts

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Run production version
npm start

# Run linter
npm run lint

# Check database connection
npm run check-db
```
