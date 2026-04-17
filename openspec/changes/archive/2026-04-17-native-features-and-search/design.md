## Context

The ProspectHome application feature a map for viewing property prospects. Currently, the "Search" and "Navigation" (user location) buttons are non-functional. The app also plans to capture photos but hasn't fully integrated camera permission logic yet.

## Goals / Non-Goals

**Goals:**
- Implement reactive user location tracking on the map.
- Implement address search with auto-panning the map to the found location.
- Centralize permission handling for Location and Camera.
- Create a reusable SearchBar component or integrate search logic directly into the Map screen UI.

**Non-Goals:**
- Building a full navigation routing engine (turn-by-turn).
- Replacing the current camera mock UI; this change focuses on the *plumbing* and *permissions*.

## Decisions

- **Location Library**: Use `expo-location` for obtaining coordinates and geocoding addresses.
- **Permission Flow**:
  - Request `Foreground` location permissions when the user clicks the "Navigation" button for the first time.
  - Request `Camera` permissions when entering a photo capture flow (triggered from Prospect details or similar).
- **Search UI**:
  - Toggling the Search button will reveal an overlay `TextInput` above the map.
  - Use `reverseGeocodeAsync` or `geocodeAsync` from `expo-location` to handle address conversion.
- **State Management**:
  - Use local state in `MapScreen` for search input and user location status.
  - Refactor location logic into a custom hook `useLocation` for reusability.

## Risks / Trade-offs

- **API Limits**: Native geocoding (Expo Location) is usually rate-limited or depends on native providers (Google Play Services / Apple). For high-volume search, a third-party API like Google Maps Places would be better, but for MVP/Mock-first, `expo-location` is sufficient.
- **Permissions Complexity**: Android and iOS handle permissions differently; using Expo abstractions minimizes this risk.
