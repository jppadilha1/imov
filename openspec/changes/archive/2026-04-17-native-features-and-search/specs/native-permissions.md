## ADDED Requirements

### Requirement: Location Permission Request
The application must request user permission to access foreground location when the navigation button is pressed for the first time.

#### Scenario: User grants location permission
- **WHEN** the user clicks the Navigation button and permission hasn't been requested.
- **THEN** an Expo location permission dialog is shown.
- **AND** if granted, the map centers on the user's current coordinates.

### Requirement: Camera Permission Request
The application must request user permission to access the camera when a photo capture feature is initiated.

#### Scenario: Camera permission denied
- **WHEN** the user attempts to open the camera and denies permission.
- **THEN** the app displays a message or alert explaining why the permission is needed and does not open the camera.
