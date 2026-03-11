# Domain — Errors

> Erros de domínio customizados. Sem dependência de frameworks — estendem `Error` nativo.

---

## Erros de Validação (Value Objects)

```typescript
class InvalidCoordinatesError extends Error {
  constructor(latitude?: number, longitude?: number) {
    super(`Coordenadas inválidas: lat=${latitude}, lng=${longitude}`);
    this.name = 'InvalidCoordinatesError';
  }
}

class InvalidAddressError extends Error {
  constructor() {
    super('Endereço não pode ser vazio');
    this.name = 'InvalidAddressError';
  }
}

class InvalidPhotoPathError extends Error {
  constructor() {
    super('Caminho da foto não pode ser vazio');
    this.name = 'InvalidPhotoPathError';
  }
}

class InvalidStatusTransitionError extends Error {
  constructor(from: string, to: string) {
    super(`Transição de status inválida: ${from} → ${to}`);
    this.name = 'InvalidStatusTransitionError';
  }
}
```

---

## Erros de Serviços (Gateways e Services)

```typescript
class AuthenticationError extends Error {
  constructor(message = 'Credenciais inválidas') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class RegistrationError extends Error {
  constructor(message = 'Erro ao registrar') {
    super(message);
    this.name = 'RegistrationError';
  }
}

class TokenExpiredError extends Error {
  constructor() {
    super('Token expirado — necessário login');
    this.name = 'TokenExpiredError';
  }
}

class NetworkError extends Error {
  constructor(message = 'Sem conexão com internet') {
    super(message);
    this.name = 'NetworkError';
  }
}

class LocationPermissionDeniedError extends Error {
  constructor() {
    super('Permissão de localização negada');
    this.name = 'LocationPermissionDeniedError';
  }
}

class LocationUnavailableError extends Error {
  constructor() {
    super('GPS indisponível');
    this.name = 'LocationUnavailableError';
  }
}

class PhotoCaptureCancelledError extends Error {
  constructor() {
    super('Captura de foto cancelada pelo usuário');
    this.name = 'PhotoCaptureCancelledError';
  }
}

class CameraPermissionDeniedError extends Error {
  constructor() {
    super('Permissão de câmera negada');
    this.name = 'CameraPermissionDeniedError';
  }
}
```

---

## Mapeamento: Quem lança cada erro

| Erro | Lançado por | Contexto |
|---|---|---|
| `InvalidCoordinatesError` | `Coordinates` (VO) | lat/lng fora do range |
| `InvalidAddressError` | `Address` (VO) | endereço vazio |
| `InvalidPhotoPathError` | `PhotoPath` (VO) | path vazio |
| `InvalidStatusTransitionError` | `ProspectoStatus` (VO) | transição não permitida |
| `AuthenticationError` | `IAuthGateway` impl | login com credenciais erradas |
| `RegistrationError` | `IAuthGateway` impl | email já cadastrado |
| `TokenExpiredError` | `IAuthGateway` impl | refresh token inválido |
| `NetworkError` | Gateways / Services | sem internet |
| `LocationPermissionDeniedError` | `ILocationService` impl | usuário negou GPS |
| `LocationUnavailableError` | `ILocationService` impl | GPS desativado |
| `PhotoCaptureCancelledError` | `IPhotoService` impl | usuário cancelou câmera |
| `CameraPermissionDeniedError` | `IPhotoService` impl | usuário negou câmera |
