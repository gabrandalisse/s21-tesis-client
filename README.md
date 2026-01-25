# Pet Finder - Lost & Found Pet Reports

A Next.js application for reporting and finding lost pets, built with Zustand for state management.

## Features

- **Authentication**: Login and registration system
- **Pet Profiles**: Manage your pet information
- **Lost/Found Reports**: Create and browse pet reports
- **Real-time Chat**: Contact report owners directly
- **Responsive Design**: Works on desktop and mobile
- **Location Tracking**: Map integration for pet locations

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
├── components/          # Reusable React components
└── store/              # Zustand state management
```

## Pages

- `/login` - User authentication
- `/register` - User registration
- `/` - Home page with latest reports
- `/profile` - User profile management
- `/my-pets` - Pet profile management
- `/create-report` - Create lost/found reports
- `/report/[id]` - Report details with chat

## State Management

The app uses Zustand for state management with three main stores:

- `authStore` - User authentication and profile
- `petStore` - Pet profiles and reports
- `chatStore` - Real-time messaging

## Development

To start development:

```bash
npm run dev
```

To build for production:

```bash
npm run build
npm start
```