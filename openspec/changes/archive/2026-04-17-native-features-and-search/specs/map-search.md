## ADDED Requirements

### Requirement: Address Search Visibility
The search input must be toggleable to save screen space on the map.

#### Scenario: Toggling search bar
- **WHEN** the user clicks the Search icon.
- **THEN** a text input for address entry becomes visible.
- **AND** the focus is set to the input.

### Requirement: Address Geocoding
Entering an address should update the map view to that location.

#### Scenario: Searching for a valid address
- **WHEN** the user types "Avenida Paulista" and submits.
- **THEN** the application uses geocoding to find coordinates.
- **AND** the map animate towards those coordinates.
