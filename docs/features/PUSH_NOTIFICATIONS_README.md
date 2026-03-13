# Push Notifications - Production Implementation

## Overview
Push notifications are implemented to notify users about:
1. New reports created within 5km of their location
2. Matches found for their lost pet reports

## Backend Components

### Notification Service
**Location**: `tesis-server/src/notification/services/notification.service.ts`

**Features**:
- Send notifications to individual users
- Send notifications to multiple users
- Send notifications to users within a radius (uses REPORT_MAX_DISTANCE_KM = 5km)
- Automatic cleanup of expired/invalid subscriptions
- Uses web-push library with VAPID authentication

### Report Service Integration
**Location**: `tesis-server/src/report/services/report.service.ts`

- Sends notifications when reports are created
- Notifies all users within 5km radius
- Excludes the report creator from notifications

### Report Processor Integration
**Location**: `tesis-server/src/report/queue/processors/report.processor.ts`

- Sends notifications when matches are found
- Notifies the owner of the lost pet report
- Includes match count and report details

### Database
Uses existing `UserDevice` model to store push subscriptions:
- `userId`: Foreign key to User
- `token`: Stores the push subscription JSON
- `platform`: Set to 'web' for PWA subscriptions

## Frontend Components

### PWA Utilities
**Location**: `pet-finder/src/utils/pwa.ts`

**Functions**:
- `subscribeToPushNotifications()`: Subscribe user to push notifications
- `unsubscribeFromPushNotifications()`: Unsubscribe from push notifications
- `checkPushSubscription()`: Check if user is subscribed

### API Client
**Location**: `pet-finder/src/services/api.ts`

**Methods**:
- `registerDevice()`: Register push subscription with backend
- `unregisterDevice()`: Remove device registration

### Auth Store
**Location**: `pet-finder/src/store/authStore.ts`

- Automatically registers for push notifications after login/register
- Includes `registerPushNotifications()` action

### Push Notification Prompt
**Location**: `pet-finder/src/components/PushNotificationPrompt.tsx`

- Shows prompt 3 seconds after login
- Only shows if permission is 'default' (not asked yet)
- Dismissible with session storage tracking

### Profile Page
**Location**: `pet-finder/src/app/profile/page.tsx`

- Toggle to enable/disable notifications
- Shows current notification status
- Allows users to manage notification preferences

### Service Worker
**Location**: `pet-finder/public/worker-development.js`

- Handles push events
- Displays notifications
- Handles notification clicks
- Manages notification actions

## Configuration

### Backend Environment Variables
**File**: `tesis-server/.env`

```env
VAPID_PUBLIC_KEY="your-public-key"
VAPID_PRIVATE_KEY="your-private-key"
VAPID_SUBJECT="mailto:admin@petly.com"
```

### Frontend Environment Variables
**File**: `pet-finder/.env.local`

```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="your-public-key"
```

**Note**: Use the same public key in both files.

## Generating VAPID Keys

Run the script to generate new VAPID keys:

```bash
cd tesis-server
node scripts/generate-vapid-keys.js
```

## How It Works

### 1. User Subscribes
1. User logs in
2. Notification prompt appears after 3 seconds
3. User clicks "Activar"
4. Browser requests permission
5. User grants permission
6. Frontend subscribes to push notifications
7. Subscription is sent to backend
8. Backend stores subscription in `UserDevice` table

### 2. Report Created
1. User creates a report
2. Backend saves report to database
3. Backend finds all users within 5km
4. Backend sends push notification to each user's devices
5. Service worker receives push event
6. Service worker displays notification

### 3. Match Found
1. Lost report is created
2. Background job finds matching found reports
3. If matches found, backend sends notification to report owner
4. Service worker displays notification with match details

## Notification Types

### Report Created Notification
- **Title**: "Nueva mascota [perdida/encontrada] cerca de ti"
- **Body**: "Se reportó un [tipo] [raza] [perdida/encontrada] en tu área"
- **Data**: reportId, type, url

### Match Found Notification
- **Title**: "¡Posibles coincidencias encontradas!"
- **Body**: "Encontramos [N] coincidencia(s) para tu [tipo] [raza] perdido"
- **Data**: reportId, matchCount, type, url
- **Requires Interaction**: true

## Browser Support

- ✅ Chrome/Edge (Desktop & Android)
- ✅ Firefox (Desktop & Android)
- ✅ Safari 16+ (Desktop & iOS 16.4+)*
- ✅ Opera (Desktop & Android)

*iOS Safari requires the app to be added to home screen

## Security

- VAPID keys provide authentication
- Subscriptions are tied to user accounts
- Only authenticated users can register devices
- Invalid/expired subscriptions are automatically removed
- No sensitive data in notification body

## Distance Calculation

Uses Haversine formula to calculate distances:
- Earth radius: 6371 km
- Maximum notification distance: 5 km (REPORT_MAX_DISTANCE_KM)

## Error Handling

- Invalid subscriptions (410/404) are automatically removed
- Failed notifications are logged but don't block the process
- All notification operations use Promise.allSettled for resilience
- User-friendly error messages in frontend
