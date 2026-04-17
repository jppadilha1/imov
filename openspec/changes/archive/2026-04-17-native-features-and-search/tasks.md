## 1. Infrastructure & Hooks

- [x] 1.1 Create `hooks/useLocation.ts` to manage location state and permissions.
- [x] 1.2 Implement `getCurrentPosition` and `searchByAddress` logic using `expo-location`.
- [x] 1.3 Create a central `usePermissions` hook or service to handle both Camera and Location request flows.

## 2. Map Screen UI Updates

- [x] 2.1 Add `isSearchVisible` state to `MapScreen` and toggle it via the Search icon.
- [x] 2.2 Implement a `SearchBar` overlay component that appears when `isSearchVisible` is true.
- [x] 2.3 Add a "Loading" state to the Map controls while fetching location or geocoding.

## 3. Functionality Integration

- [x] 3.1 Hook the Navigation button to center the map on the user's current location.
- [x] 3.2 Hook the SearchBar submit to geocode the address and animate the map to the result.
- [x] 3.3 Ensure the Camera permission flow is triggered when the user attempts any mocked photo capture (simulating the handshake).

## 4. Verification & Testing

- [x] 4.1 Update unit tests for `MapScreen` to cover search and navigation logic.
- [x] 4.2 Verify that permission denials are handled gracefully without crashing.
