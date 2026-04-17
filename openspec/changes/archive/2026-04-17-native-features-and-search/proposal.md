## Why

The application currently uses static/mocked values for location and has placeholder buttons for search and navigation. To provide a production-ready experience, we need to integrate native Expo capabilities for geolocalization and camera access. Users expect to find their current position on the map and search for specific locations via address.

## What Changes

- **Native Permissions**: Integrate `expo-location` and `expo-camera` to request necessary permissions.
- **Map Navigation**: Implement "Go to my location" functionality using the existing Navigation button.
- **Address Search**: Implement functional search capability (address lookup) triggered by the Search button, allowing users to find specific property locations.
- **Camera Access**: Establish the foundation for camera usage (permission handling), maintaining the current mock visualization but ensuring the native plumbing is ready.

## Capabilities

### New Capabilities
- `native-permissions`: Centralized handling for Geolocation and Camera permission requests using Expo APIs.
- `location-services`: Ability to retrieve user current coordinates and track location for map centering.
- `address-geocoding`: Search for addresses and convert them to map coordinates (using `expo-location`'s geocoding).

### Modified Capabilities
- `prospect-map`: Enhance the existing map screen to support dynamic user location and interactive search.

## Impact

- **Dependencies**: Addition of `expo-location` and `expo-camera` to `package.json`.
- **UI Components**: Updates to `app/(tabs)/map.tsx` to include search input and state management for user location.
- **Permissions**: Configuration updates (e.g., `app.json`) to declare required permissions for iOS and Android.
