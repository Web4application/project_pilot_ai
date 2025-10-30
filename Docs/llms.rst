# thirdweb API

- **OpenAPI Version:** `3.1.0`
- **API Version:** `1.15.1`

thirdweb API provides a unified interface for Web3 development. Build scalable blockchain applications with easy-to-use endpoints for wallet management, transaction processing, signatures, and smart contract interactions. Powered by thirdweb's infrastructure.

## Servers

- **URL:** `https://api.thirdweb.com`
  - **Description:** thirdweb API server

## Operations

### Initiate Auth

- **Method:** `POST`
- **Path:** `/v1/auth/initiate`
- **Tags:** Authentication

Start any authentication flow in one unified endpoint. This endpoint supports all authentication methods including SMS, email, OAuth, passkey, and SIWE (Sign-In with Ethereum).

**Supported Methods:**

- **SMS** - Send verification code to phone number
- **Email** - Send verification code to email address
- **Passkey** - Generate WebAuthn challenge for biometric authentication
- **SIWE** - Generate Sign-In with Ethereum payload

**Flow:**

1. Choose your authentication method
2. Provide method-specific parameters
3. Receive challenge data to complete authentication
4. Use the /complete endpoint to finish the process

**OAuth:**

The OAuth method uses a dedicated `/auth/social` endpoint instead of this one:

`GET /auth/social?provider=google&redirectUrl=...`

**Custom (JWT, auth-payload) and Guest:**

For custom authentication (JWT, auth-payload) and for guest authentication, you can skip this step and use the `/auth/complete` endpoint directly.

**Authentication:** Requires `x-client-id` header for frontend usage or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

**One of:**

- **`method` (required)**

  `string`, possible values: `"sms"` — Authentication method: SMS

- **`phone` (required)**

  `string` — Phone number in E.164 format (e.g., +1234567890)

* **`email` (required)**

  `string`, format: `email` — Email address for verification code

* **`method` (required)**

  `string`, possible values: `"email"` — Authentication method: Email

- **`method` (required)**

  `string`, possible values: `"oauth"` — Authentication method: OAuth

- **`provider` (required)**

  `string`, possible values: `"google", "apple", "facebook", "discord", "farcaster", "telegram", "line", "x", "coinbase", "github", "twitch", "steam", "tiktok"` — Social login provider

- **`redirectUrl`**

  `string`, format: `uri` — Custom redirect URL after OAuth completion

* **`method` (required)**

  `string`, possible values: `"passkey"` — Authentication method: Passkey

* **`type` (required)**

  `string`, possible values: `"sign-up", "sign-in"` — Whether to create a new passkey or use existing one

* **`username`**

  `string` — Username for passkey (optional, for identification)

- **`address` (required)**

  `string` — Ethereum wallet address for SIWE

- **`method` (required)**

  `string`, possible values: `"siwe"` — Authentication method: Sign-In with Ethereum

- **`chainId`**

  `integer` — Chain ID for SIWE (defaults to 1)

**Example:**

```
{
  "method": "sms",
  "phone": "+1234567890"
}
```

#### Responses

##### Status: 200 Authentication initiated successfully. Use the returned challenge data to complete authentication.

###### Content-Type: application/json

**One of:**

- **`method` (required)**

  `string`, possible values: `"sms"` — Authentication method: SMS

- **`success` (required)**

  `boolean` — Whether the SMS code was sent successfully

* **`method` (required)**

  `string`, possible values: `"email"` — Authentication method: Email

* **`success` (required)**

  `boolean` — Whether the email code was sent successfully

- **`method` (required)**

  `string`, possible values: `"oauth"` — Authentication method: OAuth

- **`redirectUrl` (required)**

  `string`, format: `uri` — URL to redirect user for OAuth authentication

* **`challenge` (required)**

  `string` — Base64-encoded WebAuthn challenge

* **`method` (required)**

  `string`, possible values: `"passkey"` — Authentication method: Passkey

* **`serverVerificationId` (required)**

  `string` — Server verification ID for passkey

* **`type` (required)**

  `string` — Challenge type (sign-up or sign-in)

- **`method` (required)**

  `string`, possible values: `"siwe"` — Authentication method: Sign-In with Ethereum

- **`payload` (required)**

  `string` — SIWE message string to be signed

**Example:**

```
{
  "method": "sms",
  "success": true
}
```

##### Status: 400 Invalid request - Check your method and parameters

##### Status: 429 Rate limit exceeded - Please wait before trying again

### Complete Auth

- **Method:** `POST`
- **Path:** `/v1/auth/complete`
- **Tags:** Authentication

Complete the authentication flow and receive your wallet credentials. After initiating authentication, use this endpoint to submit the required verification data.

**Completion Methods:**

- **SMS/Email** - Submit the verification code you received
- **Passkey** - Provide the WebAuthn signature response
- **SIWE** - Submit your signed Ethereum message
- **Guest** - Create an ephemeral guest wallet
- **Custom (JWT, auth-payload)** - Send your JWT token or custom payload

**Response:**

- `isNewUser` - Whether this is a new wallet creation
- `token` - JWT token for authenticated API requests
- `type` - The authentication method used
- `walletAddress` - Your new or existing wallet address

**Next step - Verify your token:**

```javascript
// Verify the token and get complete wallet details (server-side)
fetch('/v1/wallets/me', {
  headers: { 
    'Authorization': 'Bearer ' + token,
    'x-secret-key': 'your-secret-key'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Wallet verified:', data.result.address);
  console.log('Auth profiles:', data.result.profiles);
});
```

**Authentication:** Requires `x-client-id` header for frontend usage or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

**One of:**

- **`code` (required)**

  `string` — Verification code received via SMS

- **`method` (required)**

  `string`, possible values: `"sms"` — Authentication method: SMS

- **`phone` (required)**

  `string` — Phone number that received the code

* **`code` (required)**

  `string` — Verification code received via email

* **`email` (required)**

  `string` — Email address that received the code

* **`method` (required)**

  `string`, possible values: `"email"` — Authentication method: Email

- **`authenticatorData` (required)**

  `string` — Base64-encoded authenticator data

- **`clientData` (required)**

  `string` — Base64-encoded client data JSON

- **`credentialId` (required)**

  `string` — Base64-encoded credential ID

- **`method` (required)**

  `string`, possible values: `"passkey"` — Authentication method: Passkey

- **`serverVerificationId` (required)**

  `string` — Server verification ID from initiate response

- **`type` (required)**

  `string`, possible values: `"sign-up", "sign-in"` — Passkey operation type

- **`credential`**

  `object` — Credential data for passkey registration

  - **`algorithm` (required)**

    `object` — Algorithm used for the credential

  - **`publicKey` (required)**

    `string` — Public key for the credential

- **`origin`**

  `string` — Origin of the request

- **`rpId`**

  `string` — Relying party identifier

- **`signature`**

  `string` — Base64-encoded signature (for sign-in)

- **`username`**

  `string` — Username for the passkey

* **`method` (required)**

  `string`, possible values: `"siwe"` — Authentication method: Sign-In with Ethereum

* **`payload` (required)**

  `string` — The original SIWE payload that was signed

* **`signature` (required)**

  `string` — Hex-encoded signed SIWE message

- **`method` (required)**

  `string`, possible values: `"custom"` — Authentication method: Custom

- **`type` (required)**

  `string`, possible values: `"jwt", "auth-payload"` — Custom authentication type

- **`jwt`**

  `object` — JWT token for OIDC authentication

- **`payload`**

  `object` — Custom authentication payload

* **`method` (required)**

  `string`, possible values: `"guest"` — Authentication method: Guest

* **`sessionId`**

  `string` — Optional guest session ID - if not provided, a random one will be generated with no persistence guarantees.

**Example:**

```
{
  "method": "sms",
  "phone": "+1234567890",
  "code": "123456"
}
```

#### Responses

##### Status: 200 Authentication completed successfully. You now have wallet access.

###### Content-Type: application/json

- **`isNewUser` (required)**

  `boolean` — Whether this is a newly created user/wallet

- **`token` (required)**

  `string` — JWT authentication token for API access

- **`type` (required)**

  `string` — Type of authentication completed

- **`walletAddress` (required)**

  `string` — The wallet address

**Example:**

```
{
  "isNewUser": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "type": "email",
  "walletAddress": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
}
```

##### Status: 400 Invalid credentials or request - Check your challenge ID and verification data

##### Status: 429 Rate limit exceeded - Please wait before trying again

### Link Auth

- **Method:** `POST`
- **Path:** `/v1/auth/link`
- **Tags:** Authentication

Link an additional authentication method or external wallet to the currently authenticated user. Provide the authentication token from another completed login (for example, a SIWE wallet or OAuth account) and this endpoint will associate it with the user's existing wallet.

**Usage:**

1. Complete an authentication flow using `/auth/complete` to obtain the new authentication token
2. Call this endpoint with the token you want to link
3. Receive the full list of linked authentication profiles for the wallet

**Authentication:** Requires both client authentication (`x-client-id` or `x-secret-key`) and a wallet access token via `Authorization: Bearer <jwt>`.

#### Request Body

##### Content-Type: application/json

- **`accountAuthTokenToConnect` (required)**

  `string` — Authentication token for the account that should be linked to the currently authenticated wallet.

**Example:**

```
{
  "accountAuthTokenToConnect": "tw_acc_auth_token_123"
}
```

#### Responses

##### Status: 200 Authentication method linked successfully. The response contains the updated list of linked authentication profiles.

###### Content-Type: application/json

- **`linkedAccounts` (required)**

  `array` — Updated list of authentication profiles linked to the wallet after the new account has been connected.

  **Items:**

  **Any of:**

  - **`email` (required)**

    `string`

  - **`emailVerified` (required)**

    `boolean`

  - **`hd` (required)**

    `string`

  - **`id` (required)**

    `string`

  - **`locale` (required)**

    `string`

  - **`picture` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"google"`

  - **`familyName`**

    `string`

  - **`givenName`**

    `string`

  - **`name`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"facebook"`

  * **`email`**

    `string`

  * **`firstName`**

    `string`

  * **`lastName`**

    `string`

  * **`name`**

    `string`

  * **`picture`**

    `string`

  - **`emailVerified` (required)**

    `boolean`

  - **`id` (required)**

    `string`

  - **`isPrivateEmail` (required)**

    `boolean`

  - **`type` (required)**

    `string`, possible values: `"apple"`

  - **`email`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"github"`

  * **`username` (required)**

    `string`

  * **`avatar`**

    `string | null`

  * **`name`**

    `string | null`

  - **`avatar` (required)**

    `string`

  - **`emailVerified` (required)**

    `boolean`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"discord"`

  - **`username` (required)**

    `string`

  - **`email`**

    `string`, format: `email`

  * **`id` (required)**

    `string`

  * **`name` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"coinbase"`

  * **`avatar`**

    `string`

  - **`id` (required)**

    `string`

  - **`name` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"x"`

  - **`username` (required)**

    `string`

  - **`profileImageUrl`**

    `string`

  * **`avatarUrl` (required)**

    `string`

  * **`displayName` (required)**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"tiktok"`

  * **`unionId`**

    `string`

  - **`id` (required)**

    `string`

  - **`metadata` (required)**

    `object`

    - **`avatar` (required)**

      `object`

      - **`large`**

        `string`

      - **`medium`**

        `string`

      - **`small`**

        `string`

    - **`personaname`**

      `string`

    - **`profileurl`**

      `string`

    - **`realname`**

      `string`

  - **`type` (required)**

    `string`, possible values: `"steam"`

  - **`avatar`**

    `string`

  - **`username`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"telegram"`

  * **`firstName`**

    `string`

  * **`lastName`**

    `string`

  * **`picture`**

    `string`

  * **`username`**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"twitch"`

  - **`username` (required)**

    `string`

  - **`avatar`**

    `string`

  - **`description`**

    `string`

  - **`email`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"line"`

  * **`avatar`**

    `string`

  * **`username`**

    `string`

  - **`fid` (required)**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"farcaster"`

  - **`walletAddress`**

    `string`

  * **`algorithm` (required)**

    `string`

  * **`credentialId` (required)**

    `string`

  * **`publicKey` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"passkey"`

  - **`email` (required)**

    `string`, format: `email`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"email"`

  * **`id` (required)**

    `string`

  * **`pregeneratedIdentifier` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"pre_generation"`

  - **`id` (required)**

    `string`

  - **`phone` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"phone"`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"siwe"`

  * **`walletAddress` (required)**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"guest"`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"backend"`

  - **`identifier` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"server"`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"custom_jwt"`

  * **`authProviderId`**

    `string`

  * **`email`**

    `string`

  * **`phone`**

    `string`

  * **`walletAddress`**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"custom_auth_endpoint"`

  - **`authProviderId`**

    `string`

  - **`email`**

    `string`

  - **`phone`**

    `string`

  - **`walletAddress`**

    `string`

**Example:**

```
{
  "linkedAccounts": [
    {
      "id": "auth_siwe_123",
      "type": "siwe",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
    }
  ]
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Wallet authentication required. Include Authorization: Bearer \<jwt> header.

##### Status: 429 Rate limit exceeded - Please wait before trying again

##### Status: 502 Third-party provider did not return any linked accounts after processing the request.

### Unlink Auth

- **Method:** `POST`
- **Path:** `/v1/auth/unlink`
- **Tags:** Authentication

Disconnect an authentication method or external wallet from the currently authenticated user. Provide the identifiers for the provider you want to remove (for example, an email address or wallet address) and this endpoint will detach it from the user's account.

**Usage:**

1. Choose the provider type you want to disconnect (email, phone, siwe, oauth, etc.)
2. Supply the provider-specific identifiers in the request body
3. Receive the updated list of linked authentication profiles

**Authentication:** Requires both client authentication (`x-client-id` or `x-secret-key`) and a wallet access token via `Authorization: Bearer <jwt>`.

#### Request Body

##### Content-Type: application/json

- **`details` (required)**

  `object` — Identifiers for the provider profile that should be disconnected

  - **`address`**

    `string`

  - **`email`**

    `string`, format: `email`

  - **`id`**

    `string`

  - **`phone`**

    `string`

  - **`walletAddress`**

    `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

- **`type` (required)**

  `string`, possible values: `"apple", "coinbase", "discord", "email", "facebook", "farcaster", "github", "google", "guest", "line", "passkey", "phone", "siwe", "steam", "telegram", "twitch", "x", "tiktok", "backend", "wallet", "custom_auth_endpoint", "custom_jwt"` — Authentication provider type to disconnect

- **`allowAccountDeletion`**

  `boolean`, default: `false` — If true, allows the account to be deleted when unlinking removes the last authentication method. Defaults to false when omitted.

**Example:**

```
{
  "type": "siwe",
  "details": {
    "address": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
  }
}
```

#### Responses

##### Status: 200 Authentication method unlinked successfully. The response contains the updated list of linked authentication profiles.

###### Content-Type: application/json

- **`linkedAccounts` (required)**

  `array` — Updated list of authentication profiles linked to the wallet after the new account has been connected.

  **Items:**

  **Any of:**

  - **`email` (required)**

    `string`

  - **`emailVerified` (required)**

    `boolean`

  - **`hd` (required)**

    `string`

  - **`id` (required)**

    `string`

  - **`locale` (required)**

    `string`

  - **`picture` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"google"`

  - **`familyName`**

    `string`

  - **`givenName`**

    `string`

  - **`name`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"facebook"`

  * **`email`**

    `string`

  * **`firstName`**

    `string`

  * **`lastName`**

    `string`

  * **`name`**

    `string`

  * **`picture`**

    `string`

  - **`emailVerified` (required)**

    `boolean`

  - **`id` (required)**

    `string`

  - **`isPrivateEmail` (required)**

    `boolean`

  - **`type` (required)**

    `string`, possible values: `"apple"`

  - **`email`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"github"`

  * **`username` (required)**

    `string`

  * **`avatar`**

    `string | null`

  * **`name`**

    `string | null`

  - **`avatar` (required)**

    `string`

  - **`emailVerified` (required)**

    `boolean`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"discord"`

  - **`username` (required)**

    `string`

  - **`email`**

    `string`, format: `email`

  * **`id` (required)**

    `string`

  * **`name` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"coinbase"`

  * **`avatar`**

    `string`

  - **`id` (required)**

    `string`

  - **`name` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"x"`

  - **`username` (required)**

    `string`

  - **`profileImageUrl`**

    `string`

  * **`avatarUrl` (required)**

    `string`

  * **`displayName` (required)**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"tiktok"`

  * **`unionId`**

    `string`

  - **`id` (required)**

    `string`

  - **`metadata` (required)**

    `object`

    - **`avatar` (required)**

      `object`

      - **`large`**

        `string`

      - **`medium`**

        `string`

      - **`small`**

        `string`

    - **`personaname`**

      `string`

    - **`profileurl`**

      `string`

    - **`realname`**

      `string`

  - **`type` (required)**

    `string`, possible values: `"steam"`

  - **`avatar`**

    `string`

  - **`username`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"telegram"`

  * **`firstName`**

    `string`

  * **`lastName`**

    `string`

  * **`picture`**

    `string`

  * **`username`**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"twitch"`

  - **`username` (required)**

    `string`

  - **`avatar`**

    `string`

  - **`description`**

    `string`

  - **`email`**

    `string`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"line"`

  * **`avatar`**

    `string`

  * **`username`**

    `string`

  - **`fid` (required)**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"farcaster"`

  - **`walletAddress`**

    `string`

  * **`algorithm` (required)**

    `string`

  * **`credentialId` (required)**

    `string`

  * **`publicKey` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"passkey"`

  - **`email` (required)**

    `string`, format: `email`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"email"`

  * **`id` (required)**

    `string`

  * **`pregeneratedIdentifier` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"pre_generation"`

  - **`id` (required)**

    `string`

  - **`phone` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"phone"`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"siwe"`

  * **`walletAddress` (required)**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"guest"`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"backend"`

  - **`identifier` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"server"`

  * **`id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"custom_jwt"`

  * **`authProviderId`**

    `string`

  * **`email`**

    `string`

  * **`phone`**

    `string`

  * **`walletAddress`**

    `string`

  - **`id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"custom_auth_endpoint"`

  - **`authProviderId`**

    `string`

  - **`email`**

    `string`

  - **`phone`**

    `string`

  - **`walletAddress`**

    `string`

**Example:**

```
{
  "linkedAccounts": [
    {
      "id": "auth_siwe_123",
      "type": "siwe",
      "walletAddress": "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
    }
  ]
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Wallet authentication required. Include Authorization: Bearer \<jwt> header.

##### Status: 429 Rate limit exceeded - Please wait before trying again

##### Status: 502 Third-party provider did not return any linked accounts after processing the request.

### Social Auth

- **Method:** `GET`
- **Path:** `/v1/auth/social`
- **Tags:** Authentication

Complete OAuth authentication with social providers in a single step. Unlike other auth methods that require separate initiate/complete calls, OAuth is handled entirely through redirects.

**OAuth Flow (Self-Contained):**

1. Redirect your user to this endpoint with provider and redirectUrl
2. User completes OAuth flow with the provider
3. User is redirected back to your redirectUrl with wallet credentials

**Why OAuth is different:** OAuth providers handle the challenge/response flow externally, so no separate `/complete` step is needed.

**Example:** Redirect user to: `GET /v1/auth/social?provider=google&redirectUrl=https://myapp.com/auth/callback`

**Callback Handling:** After OAuth completion, user arrives at your redirectUrl with an `authResult` query parameter:

```bash
https://myapp.com/auth/callback?authResult=%7B%22storedToken%22%3A%7B%22authDetails%22%3A%7B...%7D%2C%22cookieString%22%3A%22eyJ...%22%7D%7D
```

**Extract JWT token in your callback:**

```javascript
// Parse the authResult from URL
const urlParams = new URLSearchParams(window.location.search);
const authResultString = urlParams.get('authResult');
const authResult = JSON.parse(authResultString!);

// Extract the JWT token
const token = authResult.storedToken.cookieString;
```

**Verify and use the JWT token:**

```javascript
// Use the JWT token for authenticated requests
fetch('/v1/wallets/me', {
  headers: { 
    'Authorization': 'Bearer ' + token,
    'x-secret-key': 'your-secret-key'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Wallet verified:', data.result.address);
  console.log('Auth profiles:', data.result.profiles);
});
```

**Authentication Options:** Choose one of two ways to provide your client credentials:

**Option 1: Query Parameter (Recommended for OAuth flows)**

```bash
GET /v1/auth/social?provider=google&redirectUrl=https://myapp.com/callback&clientId=your_client_id
```

**Option 2: Header (Alternative)**

```bash
GET /v1/auth/social?provider=google&redirectUrl=https://myapp.com/callback
Headers: x-client-id: your_client_id
```

#### Responses

##### Status: 302 Redirects to OAuth provider for authentication

##### Status: 400 Invalid request parameters

### Get My Wallet

- **Method:** `GET`
- **Path:** `/v1/wallets/me`
- **Tags:** Wallets

Retrieve the authenticated user's wallet information including wallet addresses and linked authentication wallets. This endpoint provides comprehensive user data for the currently authenticated session.

**Returns:**

- Primary wallet address
- Smart wallet address (if available)
- Wallet creation timestamp
- Public key in hexadecimal format (if available)
- All linked authentication profiles (email, phone, OAuth providers)

**Authentication:** Requires `Authorization: Bearer <jwt>` header with a valid user authentication token.

#### Responses

##### Status: 200 Wallet retrieved successfully. Returns comprehensive user information including wallet addresses, public key, and linked wallets.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`profiles` (required)**

    `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

    **Items:**

    **Any of:**

    - **`email` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`hd` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`locale` (required)**

      `string`

    - **`picture` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"google"`

    - **`familyName`**

      `string`

    - **`givenName`**

      `string`

    - **`name`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"facebook"`

    * **`email`**

      `string`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`name`**

      `string`

    * **`picture`**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`isPrivateEmail` (required)**

      `boolean`

    - **`type` (required)**

      `string`, possible values: `"apple"`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"github"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string | null`

    * **`name`**

      `string | null`

    - **`avatar` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"discord"`

    - **`username` (required)**

      `string`

    - **`email`**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`name` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"coinbase"`

    * **`avatar`**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"x"`

    - **`username` (required)**

      `string`

    - **`profileImageUrl`**

      `string`

    * **`avatarUrl` (required)**

      `string`

    * **`displayName` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"tiktok"`

    * **`unionId`**

      `string`

    - **`id` (required)**

      `string`

    - **`metadata` (required)**

      `object`

      - **`avatar` (required)**

        `object`

        - **`large`**

          `string`

        - **`medium`**

          `string`

        - **`small`**

          `string`

      - **`personaname`**

        `string`

      - **`profileurl`**

        `string`

      - **`realname`**

        `string`

    - **`type` (required)**

      `string`, possible values: `"steam"`

    - **`avatar`**

      `string`

    - **`username`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"telegram"`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`picture`**

      `string`

    * **`username`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"twitch"`

    - **`username` (required)**

      `string`

    - **`avatar`**

      `string`

    - **`description`**

      `string`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"line"`

    * **`avatar`**

      `string`

    * **`username`**

      `string`

    - **`fid` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"farcaster"`

    - **`walletAddress`**

      `string`

    * **`algorithm` (required)**

      `string`

    * **`credentialId` (required)**

      `string`

    * **`publicKey` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"passkey"`

    - **`email` (required)**

      `string`, format: `email`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"email"`

    * **`id` (required)**

      `string`

    * **`pregeneratedIdentifier` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"pre_generation"`

    - **`id` (required)**

      `string`

    - **`phone` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"phone"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"siwe"`

    * **`walletAddress` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"guest"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"backend"`

    - **`identifier` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"server"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"custom_jwt"`

    * **`authProviderId`**

      `string`

    * **`email`**

      `string`

    * **`phone`**

      `string`

    * **`walletAddress`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"custom_auth_endpoint"`

    - **`authProviderId`**

      `string`

    - **`email`**

      `string`

    - **`phone`**

      `string`

    - **`walletAddress`**

      `string`

  - **`address`**

    `string` — The EOA (Externally Owned Wallet) address of the wallet. This is the traditional wallet address.

  - **`createdAt`**

    `string` — The date and time the wallet was created

  - **`publicKey`**

    `string` — The wallet's public key in hexadecimal format. Useful for peer-to-peer encryption and cryptographic operations.

  - **`smartWalletAddress`**

    `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced wallet features.

**Example:**

```
{
  "result": {
    "address": "",
    "createdAt": "",
    "profiles": [
      {
        "email": "",
        "emailVerified": true,
        "familyName": "",
        "givenName": "",
        "hd": "",
        "id": "",
        "locale": "",
        "name": "",
        "picture": "",
        "type": "google"
      }
    ],
    "smartWalletAddress": "",
    "publicKey": ""
  }
}
```

##### Status: 401 Authentication required. The request must include a valid \`Authorization: Bearer \<jwt>\` header.

##### Status: 404 Wallet not found. The authenticated user does not exist in the system.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### List User Wallets

- **Method:** `GET`
- **Path:** `/v1/wallets/user`
- **Tags:** Wallets

Get all user wallet details with filtering and pagination for your project.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Responses

##### Status: 200 Returns a list of user wallet addresses, smart wallet addresses, and auth details.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object` — Pagination information

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

  - **`wallets` (required)**

    `array` — Array of user wallets

    **Items:**

    - **`profiles` (required)**

      `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

      **Items:**

      **Any of:**

      - **`email` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`hd` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`locale` (required)**

        `string`

      - **`picture` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"google"`

      - **`familyName`**

        `string`

      - **`givenName`**

        `string`

      - **`name`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"facebook"`

      * **`email`**

        `string`

      * **`firstName`**

        `string`

      * **`lastName`**

        `string`

      * **`name`**

        `string`

      * **`picture`**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`isPrivateEmail` (required)**

        `boolean`

      - **`type` (required)**

        `string`, possible values: `"apple"`

      - **`email`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"github"`

      * **`username` (required)**

        `string`

      * **`avatar`**

        `string | null`

      * **`name`**

        `string | null`

      - **`avatar` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"discord"`

      - **`username` (required)**

        `string`

      - **`email`**

        `string`, format: `email`

      * **`id` (required)**

        `string`

      * **`name` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"coinbase"`

      * **`avatar`**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"x"`

      - **`username` (required)**

        `string`

      - **`profileImageUrl`**

        `string`

      * **`avatarUrl` (required)**

        `string`

      * **`displayName` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"tiktok"`

      * **`unionId`**

        `string`

      - **`id` (required)**

        `string`

      - **`metadata` (required)**

        `object`

        - **`avatar` (required)**

          `object`

          - **`large`**

            `string`

          - **`medium`**

            `string`

          - **`small`**

            `string`

        - **`personaname`**

          `string`

        - **`profileurl`**

          `string`

        - **`realname`**

          `string`

      - **`type` (required)**

        `string`, possible values: `"steam"`

      - **`avatar`**

        `string`

      - **`username`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"telegram"`

      * **`firstName`**

        `string`

      * **`lastName`**

        `string`

      * **`picture`**

        `string`

      * **`username`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"twitch"`

      - **`username` (required)**

        `string`

      - **`avatar`**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"line"`

      * **`avatar`**

        `string`

      * **`username`**

        `string`

      - **`fid` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"farcaster"`

      - **`walletAddress`**

        `string`

      * **`algorithm` (required)**

        `string`

      * **`credentialId` (required)**

        `string`

      * **`publicKey` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"passkey"`

      - **`email` (required)**

        `string`, format: `email`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"email"`

      * **`id` (required)**

        `string`

      * **`pregeneratedIdentifier` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"pre_generation"`

      - **`id` (required)**

        `string`

      - **`phone` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"phone"`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"siwe"`

      * **`walletAddress` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"guest"`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"backend"`

      - **`identifier` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"server"`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"custom_jwt"`

      * **`authProviderId`**

        `string`

      * **`email`**

        `string`

      * **`phone`**

        `string`

      * **`walletAddress`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"custom_auth_endpoint"`

      - **`authProviderId`**

        `string`

      - **`email`**

        `string`

      - **`phone`**

        `string`

      - **`walletAddress`**

        `string`

    - **`address`**

      `string` — The EOA (Externally Owned Wallet) address of the wallet. This is the traditional wallet address.

    - **`createdAt`**

      `string` — The date and time the wallet was created

    - **`publicKey`**

      `string` — The wallet's public key in hexadecimal format. Useful for peer-to-peer encryption and cryptographic operations.

    - **`smartWalletAddress`**

      `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced wallet features.

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    },
    "wallets": [
      {
        "address": "",
        "createdAt": "",
        "profiles": [
          {
            "email": "",
            "emailVerified": true,
            "familyName": "",
            "givenName": "",
            "hd": "",
            "id": "",
            "locale": "",
            "name": "",
            "picture": "",
            "type": "google"
          }
        ],
        "smartWalletAddress": "",
        "publicKey": ""
      }
    ]
  }
}
```

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### Create User Wallet

- **Method:** `POST`
- **Path:** `/v1/wallets/user`
- **Tags:** Wallets

Create a user wallet with a wallet based on their authentication strategy. This endpoint creates a wallet in advance that can be claimed later when the user authenticates.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`type` (required)**

  `string`, possible values: `"google", "apple", "facebook", "discord", "email", "phone", "custom_auth_endpoint", "custom_jwt", "siwe"`

- **`email`**

  `string`

- **`phone`**

  `string`

- **`userId`**

  `string`

- **`walletAddress`**

  `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

**Example:**

```
{
  "type": "email",
  "email": "test@test.com"
}
```

#### Responses

##### Status: 200 Successfully created a user wallet with wallet.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`profiles` (required)**

    `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

    **Items:**

    **Any of:**

    - **`email` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`hd` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`locale` (required)**

      `string`

    - **`picture` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"google"`

    - **`familyName`**

      `string`

    - **`givenName`**

      `string`

    - **`name`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"facebook"`

    * **`email`**

      `string`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`name`**

      `string`

    * **`picture`**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`isPrivateEmail` (required)**

      `boolean`

    - **`type` (required)**

      `string`, possible values: `"apple"`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"github"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string | null`

    * **`name`**

      `string | null`

    - **`avatar` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"discord"`

    - **`username` (required)**

      `string`

    - **`email`**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`name` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"coinbase"`

    * **`avatar`**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"x"`

    - **`username` (required)**

      `string`

    - **`profileImageUrl`**

      `string`

    * **`avatarUrl` (required)**

      `string`

    * **`displayName` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"tiktok"`

    * **`unionId`**

      `string`

    - **`id` (required)**

      `string`

    - **`metadata` (required)**

      `object`

      - **`avatar` (required)**

        `object`

        - **`large`**

          `string`

        - **`medium`**

          `string`

        - **`small`**

          `string`

      - **`personaname`**

        `string`

      - **`profileurl`**

        `string`

      - **`realname`**

        `string`

    - **`type` (required)**

      `string`, possible values: `"steam"`

    - **`avatar`**

      `string`

    - **`username`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"telegram"`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`picture`**

      `string`

    * **`username`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"twitch"`

    - **`username` (required)**

      `string`

    - **`avatar`**

      `string`

    - **`description`**

      `string`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"line"`

    * **`avatar`**

      `string`

    * **`username`**

      `string`

    - **`fid` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"farcaster"`

    - **`walletAddress`**

      `string`

    * **`algorithm` (required)**

      `string`

    * **`credentialId` (required)**

      `string`

    * **`publicKey` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"passkey"`

    - **`email` (required)**

      `string`, format: `email`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"email"`

    * **`id` (required)**

      `string`

    * **`pregeneratedIdentifier` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"pre_generation"`

    - **`id` (required)**

      `string`

    - **`phone` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"phone"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"siwe"`

    * **`walletAddress` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"guest"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"backend"`

    - **`identifier` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"server"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"custom_jwt"`

    * **`authProviderId`**

      `string`

    * **`email`**

      `string`

    * **`phone`**

      `string`

    * **`walletAddress`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"custom_auth_endpoint"`

    - **`authProviderId`**

      `string`

    - **`email`**

      `string`

    - **`phone`**

      `string`

    - **`walletAddress`**

      `string`

  - **`address`**

    `string` — The EOA (Externally Owned Wallet) address of the wallet. This is the traditional wallet address.

  - **`createdAt`**

    `string` — The date and time the wallet was created

  - **`publicKey`**

    `string` — The wallet's public key in hexadecimal format. Useful for peer-to-peer encryption and cryptographic operations.

  - **`smartWalletAddress`**

    `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced wallet features.

**Example:**

```
{
  "result": {
    "address": "",
    "createdAt": "",
    "profiles": [
      {
        "email": "",
        "emailVerified": true,
        "familyName": "",
        "givenName": "",
        "hd": "",
        "id": "",
        "locale": "",
        "name": "",
        "picture": "",
        "type": "google"
      }
    ],
    "smartWalletAddress": "",
    "publicKey": ""
  }
}
```

##### Status: 400 Invalid request. This may occur due to missing required fields based on the authentication strategy, invalid strategy, or malformed request data.

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### List Server Wallets

- **Method:** `GET`
- **Path:** `/v1/wallets/server`
- **Tags:** Wallets

Get all server wallet details with pagination for your project.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Responses

##### Status: 200 Returns a list of server wallet addresses, smart wallet addresses, and auth details.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object` — Pagination information

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

  - **`wallets` (required)**

    `array` — Array of server wallets

    **Items:**

    - **`profiles` (required)**

      `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

      **Items:**

      **Any of:**

      - **`email` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`hd` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`locale` (required)**

        `string`

      - **`picture` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"google"`

      - **`familyName`**

        `string`

      - **`givenName`**

        `string`

      - **`name`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"facebook"`

      * **`email`**

        `string`

      * **`firstName`**

        `string`

      * **`lastName`**

        `string`

      * **`name`**

        `string`

      * **`picture`**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`isPrivateEmail` (required)**

        `boolean`

      - **`type` (required)**

        `string`, possible values: `"apple"`

      - **`email`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"github"`

      * **`username` (required)**

        `string`

      * **`avatar`**

        `string | null`

      * **`name`**

        `string | null`

      - **`avatar` (required)**

        `string`

      - **`emailVerified` (required)**

        `boolean`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"discord"`

      - **`username` (required)**

        `string`

      - **`email`**

        `string`, format: `email`

      * **`id` (required)**

        `string`

      * **`name` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"coinbase"`

      * **`avatar`**

        `string`

      - **`id` (required)**

        `string`

      - **`name` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"x"`

      - **`username` (required)**

        `string`

      - **`profileImageUrl`**

        `string`

      * **`avatarUrl` (required)**

        `string`

      * **`displayName` (required)**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"tiktok"`

      * **`unionId`**

        `string`

      - **`id` (required)**

        `string`

      - **`metadata` (required)**

        `object`

        - **`avatar` (required)**

          `object`

          - **`large`**

            `string`

          - **`medium`**

            `string`

          - **`small`**

            `string`

        - **`personaname`**

          `string`

        - **`profileurl`**

          `string`

        - **`realname`**

          `string`

      - **`type` (required)**

        `string`, possible values: `"steam"`

      - **`avatar`**

        `string`

      - **`username`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"telegram"`

      * **`firstName`**

        `string`

      * **`lastName`**

        `string`

      * **`picture`**

        `string`

      * **`username`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"twitch"`

      - **`username` (required)**

        `string`

      - **`avatar`**

        `string`

      - **`description`**

        `string`

      - **`email`**

        `string`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"line"`

      * **`avatar`**

        `string`

      * **`username`**

        `string`

      - **`fid` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"farcaster"`

      - **`walletAddress`**

        `string`

      * **`algorithm` (required)**

        `string`

      * **`credentialId` (required)**

        `string`

      * **`publicKey` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"passkey"`

      - **`email` (required)**

        `string`, format: `email`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"email"`

      * **`id` (required)**

        `string`

      * **`pregeneratedIdentifier` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"pre_generation"`

      - **`id` (required)**

        `string`

      - **`phone` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"phone"`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"siwe"`

      * **`walletAddress` (required)**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"guest"`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"backend"`

      - **`identifier` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"server"`

      * **`id` (required)**

        `string`

      * **`type` (required)**

        `string`, possible values: `"custom_jwt"`

      * **`authProviderId`**

        `string`

      * **`email`**

        `string`

      * **`phone`**

        `string`

      * **`walletAddress`**

        `string`

      - **`id` (required)**

        `string`

      - **`type` (required)**

        `string`, possible values: `"custom_auth_endpoint"`

      - **`authProviderId`**

        `string`

      - **`email`**

        `string`

      - **`phone`**

        `string`

      - **`walletAddress`**

        `string`

    - **`address`**

      `string` — The EOA (Externally Owned Wallet) address of the wallet. This is the traditional wallet address.

    - **`createdAt`**

      `string` — The date and time the wallet was created

    - **`publicKey`**

      `string` — The wallet's public key in hexadecimal format. Useful for peer-to-peer encryption and cryptographic operations.

    - **`smartWalletAddress`**

      `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced wallet features.

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    },
    "wallets": [
      {
        "address": "",
        "createdAt": "",
        "profiles": [
          {
            "email": "",
            "emailVerified": true,
            "familyName": "",
            "givenName": "",
            "hd": "",
            "id": "",
            "locale": "",
            "name": "",
            "picture": "",
            "type": "google"
          }
        ],
        "smartWalletAddress": "",
        "publicKey": ""
      }
    ]
  }
}
```

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 500 Internal server error. This may occur due to service unavailability or unexpected server errors.

### Create Server Wallet

- **Method:** `POST`
- **Path:** `/v1/wallets/server`
- **Tags:** Wallets

Creates a server wallet from a unique identifier. If the wallet already exists, it will return the existing wallet.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`identifier` (required)**

  `string` — Unique identifier for wallet creation or retrieval. Can be user ID, email, or any unique string. The same identifier will always return the same wallet.

**Example:**

```
{
  "identifier": "treasury-wallet-123"
}
```

#### Responses

##### Status: 200 Server wallet created or connected successfully. Returns wallet addresses for subsequent operations.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`profiles` (required)**

    `array` — The profiles linked to the wallet, can be email, phone, google etc, or backend for developer created wallets

    **Items:**

    **Any of:**

    - **`email` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`hd` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`locale` (required)**

      `string`

    - **`picture` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"google"`

    - **`familyName`**

      `string`

    - **`givenName`**

      `string`

    - **`name`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"facebook"`

    * **`email`**

      `string`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`name`**

      `string`

    * **`picture`**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`isPrivateEmail` (required)**

      `boolean`

    - **`type` (required)**

      `string`, possible values: `"apple"`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"github"`

    * **`username` (required)**

      `string`

    * **`avatar`**

      `string | null`

    * **`name`**

      `string | null`

    - **`avatar` (required)**

      `string`

    - **`emailVerified` (required)**

      `boolean`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"discord"`

    - **`username` (required)**

      `string`

    - **`email`**

      `string`, format: `email`

    * **`id` (required)**

      `string`

    * **`name` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"coinbase"`

    * **`avatar`**

      `string`

    - **`id` (required)**

      `string`

    - **`name` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"x"`

    - **`username` (required)**

      `string`

    - **`profileImageUrl`**

      `string`

    * **`avatarUrl` (required)**

      `string`

    * **`displayName` (required)**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"tiktok"`

    * **`unionId`**

      `string`

    - **`id` (required)**

      `string`

    - **`metadata` (required)**

      `object`

      - **`avatar` (required)**

        `object`

        - **`large`**

          `string`

        - **`medium`**

          `string`

        - **`small`**

          `string`

      - **`personaname`**

        `string`

      - **`profileurl`**

        `string`

      - **`realname`**

        `string`

    - **`type` (required)**

      `string`, possible values: `"steam"`

    - **`avatar`**

      `string`

    - **`username`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"telegram"`

    * **`firstName`**

      `string`

    * **`lastName`**

      `string`

    * **`picture`**

      `string`

    * **`username`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"twitch"`

    - **`username` (required)**

      `string`

    - **`avatar`**

      `string`

    - **`description`**

      `string`

    - **`email`**

      `string`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"line"`

    * **`avatar`**

      `string`

    * **`username`**

      `string`

    - **`fid` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"farcaster"`

    - **`walletAddress`**

      `string`

    * **`algorithm` (required)**

      `string`

    * **`credentialId` (required)**

      `string`

    * **`publicKey` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"passkey"`

    - **`email` (required)**

      `string`, format: `email`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"email"`

    * **`id` (required)**

      `string`

    * **`pregeneratedIdentifier` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"pre_generation"`

    - **`id` (required)**

      `string`

    - **`phone` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"phone"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"siwe"`

    * **`walletAddress` (required)**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"guest"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"backend"`

    - **`identifier` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"server"`

    * **`id` (required)**

      `string`

    * **`type` (required)**

      `string`, possible values: `"custom_jwt"`

    * **`authProviderId`**

      `string`

    * **`email`**

      `string`

    * **`phone`**

      `string`

    * **`walletAddress`**

      `string`

    - **`id` (required)**

      `string`

    - **`type` (required)**

      `string`, possible values: `"custom_auth_endpoint"`

    - **`authProviderId`**

      `string`

    - **`email`**

      `string`

    - **`phone`**

      `string`

    - **`walletAddress`**

      `string`

  - **`address`**

    `string` — The EOA (Externally Owned Wallet) address of the wallet. This is the traditional wallet address.

  - **`createdAt`**

    `string` — The date and time the wallet was created

  - **`publicKey`**

    `string` — The wallet's public key in hexadecimal format. Useful for peer-to-peer encryption and cryptographic operations.

  - **`smartWalletAddress`**

    `string` — The smart wallet address with EIP-4337 support. This address enables gasless transactions and advanced wallet features.

**Example:**

```
{
  "result": {
    "address": "",
    "createdAt": "",
    "profiles": [
      {
        "email": "",
        "emailVerified": true,
        "familyName": "",
        "givenName": "",
        "hd": "",
        "id": "",
        "locale": "",
        "name": "",
        "picture": "",
        "type": "google"
      }
    ],
    "smartWalletAddress": "",
    "publicKey": ""
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the identifier format is invalid or required parameters are missing.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header.

##### Status: 500 Internal server error. This may occur due to wallet service unavailability, smart wallet deployment issues, or unexpected server errors.

### Get Balance

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/balance`
- **Tags:** Wallets

Get native or ERC20 token balance for a wallet address. Can retrieve live balances for any ERC20 token on a signle chain, or native token balances across multiple chains.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet native balances retrieved successfully. Returns detailed native token balance information for each chain including token metadata and formatted values.

###### Content-Type: application/json

- **`result` (required)**

  `array`

  **Items:**

  - **`chainId` (required)**

    `number` — The blockchain network ID

  - **`decimals` (required)**

    `number` — Number of decimal places for the token

  - **`displayValue` (required)**

    `string` — Human-readable balance formatted with appropriate decimal places

  - **`name` (required)**

    `string` — The token name (e.g., 'Ether', 'USD Coin')

  - **`symbol` (required)**

    `string` — The token symbol (e.g., 'ETH', 'USDC')

  - **`tokenAddress` (required)**

    `string` — The token contract address. Returns zero address (0x0...0) for native tokens.

  - **`value` (required)**

    `string` — Raw balance value as string in smallest unit (wei for ETH, etc.)

**Example:**

```
{
  "result": [
    {
      "chainId": 1,
      "decimals": 1,
      "displayValue": "",
      "name": "",
      "symbol": "",
      "tokenAddress": "",
      "value": ""
    }
  ]
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or chain IDs are invalid.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, RPC service unavailability, or unexpected server errors.

### Get Transactions

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/transactions`
- **Tags:** Wallets

Retrieves transactions for a specific wallet address across one or more blockchain networks. This endpoint provides comprehensive transaction data including both incoming and outgoing transactions, with block information, gas details, transaction status, and function calls. Results can be filtered, paginated, and sorted to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet transactions retrieved successfully. Returns transaction data with metadata including pagination information and chain details. Includes decoded function calls when ABI is available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

  - **`transactions` (required)**

    `array` — Array of wallet transactions.

    **Items:**

    - **`blockHash` (required)**

      `string` — The hash of the block containing this transaction.

    - **`blockNumber` (required)**

      `number` — The block number containing this transaction.

    - **`blockTimestamp` (required)**

      `number` — The timestamp of the block (Unix timestamp).

    - **`chainId` (required)**

      `string` — The chain ID where the transaction occurred.

    - **`data` (required)**

      `string` — The transaction input data.

    - **`fromAddress` (required)**

      `string` — The address that initiated the transaction.

    - **`functionSelector` (required)**

      `string` — The function selector (first 4 bytes of the transaction data).

    - **`gas` (required)**

      `number` — The gas limit for the transaction.

    - **`gasPrice` (required)**

      `string` — The gas price used for the transaction (in wei as string).

    - **`hash` (required)**

      `string` — The transaction hash.

    - **`nonce` (required)**

      `number` — The transaction nonce.

    - **`status` (required)**

      `number` — The transaction status (1 for success, 0 for failure).

    - **`toAddress` (required)**

      `string` — The address that received the transaction.

    - **`transactionIndex` (required)**

      `number` — The index of the transaction within the block.

    - **`value` (required)**

      `string` — The value transferred in the transaction (in wei as string).

    - **`contractAddress`**

      `string` — Contract address created if this was a contract creation transaction.

    - **`cumulativeGasUsed`**

      `number` — Total gas used by all transactions in this block up to and including this one.

    - **`decoded`**

      `object` — Decoded transaction data (included when ABI is available).

      - **`inputs` (required)**

        `object` — Object containing decoded function parameters.

      - **`name` (required)**

        `string` — The function name.

      - **`signature` (required)**

        `string` — The function signature.

    - **`effectiveGasPrice`**

      `string` — The effective gas price paid (in wei as string).

    - **`gasUsed`**

      `number` — The amount of gas used by the transaction.

    - **`maxFeePerGas`**

      `string` — Maximum fee per gas (EIP-1559).

    - **`maxPriorityFeePerGas`**

      `string` — Maximum priority fee per gas (EIP-1559).

    - **`transactionType`**

      `number` — The transaction type (0=legacy, 1=EIP-2930, 2=EIP-1559).

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    },
    "transactions": [
      {
        "blockHash": "",
        "blockNumber": 1,
        "blockTimestamp": 1,
        "chainId": "",
        "contractAddress": "",
        "cumulativeGasUsed": 1,
        "data": "",
        "decoded": {
          "inputs": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "name": "",
          "signature": ""
        },
        "effectiveGasPrice": "",
        "fromAddress": "",
        "functionSelector": "",
        "gas": 1,
        "gasPrice": "",
        "gasUsed": 1,
        "hash": "",
        "maxFeePerGas": "",
        "maxPriorityFeePerGas": "",
        "nonce": 1,
        "status": 1,
        "toAddress": "",
        "transactionIndex": 1,
        "transactionType": 1,
        "value": ""
      }
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Wallet not found or no transactions available for the specified wallet address on the given blockchain networks.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get Tokens

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/tokens`
- **Tags:** Wallets

Retrieves token balances for a specific wallet address across one or more blockchain networks. This endpoint provides comprehensive token data including ERC-20 tokens with their balances, metadata, and price information. Results can be filtered by chain, sorted by balance or USD value, and customized to include/exclude spam tokens, native tokens, and tokens without price data. Supports pagination and metadata resolution options.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet tokens retrieved successfully. Returns token data with metadata including pagination information and chain details. Includes token balances, metadata, and price information when available. Results are sorted by the specified criteria (default: USD value descending) and filtered according to the provided parameters.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

  - **`tokens` (required)**

    `array` — Array of wallet tokens.

    **Items:**

    - **`balance` (required)**

      `string` — The token balance as a string

    - **`chain_id` (required)**

      `number` — The chain ID of the token

    - **`token_address` (required)**

      `string` — The contract address of the token

    - **`decimals`**

      `number` — The number of decimal places

    - **`icon_uri`**

      `string` — The token icon URI

    - **`name`**

      `string` — The token name

    - **`price_data`**

      `object` — Price data for the token

      - **`circulating_supply`**

        `number` — The circulating supply of the token

      - **`market_cap_usd`**

        `number` — The market cap of the token in USD

      - **`percent_change_24h`**

        `number` — The percentage change of the token in the last 24 hours

      - **`price_timestamp`**

        `string` — The timestamp of the latest price update

      - **`price_usd`**

        `number` — The price of the token in USD

      - **`total_supply`**

        `number` — The total supply of the token

      - **`usd_value`**

        `number` — The value of the token balance in USD

      - **`volume_24h_usd`**

        `number` — The volume of the token in USD

    - **`prices`**

      `object` — Price data

    - **`symbol`**

      `string` — The token symbol

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    },
    "tokens": [
      {
        "balance": "",
        "chain_id": 1,
        "decimals": 1,
        "name": "",
        "icon_uri": "",
        "prices": {
          "ANY_ADDITIONAL_PROPERTY": 1
        },
        "price_data": {
          "circulating_supply": 1,
          "market_cap_usd": 1,
          "percent_change_24h": 1,
          "price_timestamp": "",
          "price_usd": 1,
          "total_supply": 1,
          "usd_value": 1,
          "volume_24h_usd": 1
        },
        "symbol": "",
        "token_address": ""
      }
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Wallet not found or no tokens available for the specified wallet address on the given blockchain networks.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get NFTs

- **Method:** `GET`
- **Path:** `/v1/wallets/{address}/nfts`
- **Tags:** Wallets

Retrieves NFTs for a specific wallet address across one or more blockchain networks. This endpoint provides comprehensive NFT data including metadata, attributes, and collection information. Results can be filtered by chain and paginated to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Wallet NFTs retrieved successfully. Returns NFT data with metadata including pagination information and chain details. Includes NFT metadata, attributes, and collection information when available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`nfts` (required)**

    `array` — Array of wallet NFTs.

    **Items:**

    - **`chain_id` (required)**

      `number` — The chain ID of the NFT

    - **`token_address` (required)**

      `string` — The contract address of the NFT collection

    - **`token_id` (required)**

      `string` — The token ID of the NFT

    - **`animation_url`**

      `string` — The animation URL of the NFT

    - **`attributes`**

      `array` — The attributes/traits of the NFT

      **Items:**

      - **`display_type`**

        `string` — The display type

      - **`trait_type`**

        `string` — The trait type

      - **`value`**

        `object` — The trait value

    - **`collection`**

      `object` — Collection information

      - **`description`**

        `string` — The collection description

      - **`external_url`**

        `string` — The collection external URL

      - **`image`**

        `string` — The collection image URL

      - **`name`**

        `string` — The collection name

    - **`description`**

      `string` — The description of the NFT

    - **`external_url`**

      `string` — The external URL of the NFT

    - **`image_url`**

      `string` — The image URL of the NFT

    - **`metadata`**

      `object` — Additional metadata for the NFT

    - **`name`**

      `string` — The name of the NFT

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

**Example:**

```
{
  "result": {
    "nfts": [
      {
        "animation_url": "",
        "attributes": [
          {
            "display_type": "",
            "trait_type": "",
            "value": ""
          }
        ],
        "chain_id": 1,
        "collection": {
          "description": "",
          "external_url": "",
          "image": "",
          "name": ""
        },
        "description": "",
        "external_url": "",
        "image_url": "",
        "metadata": {
          "ANY_ADDITIONAL_PROPERTY": "anything"
        },
        "name": "",
        "token_address": "",
        "token_id": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    }
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId array is empty or exceeds the maximum limit of 50, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Wallet not found or no NFTs available for the specified wallet address on the given blockchain networks.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Sign Message

- **Method:** `POST`
- **Path:** `/v1/wallets/sign-message`
- **Tags:** Wallets

Signs an arbitrary message using the specified wallet. This endpoint supports both text and hexadecimal message formats. The signing is performed using thirdweb Engine with smart wallet support for gasless transactions.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier where the signing will occur. Common values include: 1 (Ethereum), 137 (Polygon), 56 (BSC).

- **`from` (required)**

  `string` — The wallet address or ENS name that will sign the message.

- **`message` (required)**

  `string` — The message to be signed. Can be plain text or hexadecimal format (starting with 0x). The format is automatically detected.

**Example:**

```
{
  "from": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "message": "Hello, world!"
}
```

#### Responses

##### Status: 200 Message signed successfully. Returns the cryptographic signature that can be used for verification.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`signature` (required)**

    `string` — The cryptographic signature in hexadecimal format. This can be used for verification and authentication purposes.

**Example:**

```
{
  "result": {
    "signature": ""
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the wallet address format is invalid, chainId is not supported, or the message format is incorrect.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to wallet connectivity issues, signing service unavailability, or unexpected server errors.

### Sign Typed Data

- **Method:** `POST`
- **Path:** `/v1/wallets/sign-typed-data`
- **Tags:** Wallets

Signs structured data according to the EIP-712 standard using the specified wallet. This is commonly used for secure message signing in DeFi protocols, NFT marketplaces, and other dApps that require structured data verification. The typed data includes domain separation and type definitions for enhanced security.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier for EIP-712 domain separation.

- **`domain` (required)**

  `object` — EIP-712 domain separator containing contract and chain information for signature verification.

  - **`chainId`**

    `string` — Chain ID as string for domain separation

  - **`name`**

    `string` — The domain name (e.g., token name)

  - **`salt`**

    `string` — Optional salt for additional entropy

  - **`verifyingContract`**

    `string` — The contract address that will verify this signature

  - **`version`**

    `string` — Domain version for signature compatibility

- **`from` (required)**

  `string` — The wallet address or ENS name that will sign the typed data.

- **`message` (required)**

  `object` — The structured data to be signed, matching the defined types schema.

- **`primaryType` (required)**

  `string` — The primary type name from the types object that defines the main structure being signed.

- **`types` (required)**

  `object` — Type definitions for the structured data, following EIP-712 specifications.

**Example:**

```
{
  "from": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "domain": {
    "name": "MyDomain",
    "version": "1",
    "chainId": "1",
    "verifyingContract": "0x1234567890123456789012345678901234567890"
  },
  "message": {
    "name": "foo"
  },
  "primaryType": "MyType",
  "types": {
    "MyType": [
      {
        "name": "name",
        "type": "string"
      }
    ]
  }
}
```

#### Responses

##### Status: 200 Typed data signed successfully. Returns the EIP-712 compliant signature that can be used for on-chain verification.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`signature` (required)**

    `string` — The cryptographic signature in hexadecimal format. This can be used for verification and authentication purposes.

**Example:**

```
{
  "result": {
    "signature": ""
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the typed data structure is malformed, domain parameters are incorrect, or wallet address format is invalid.

##### Status: 401 Authentication required. The request must include valid \`x-wallet-access-token\` headers for accessing the wallet, as well as a x-client-id (frontend) or x-secret-key (backend) for project authentication.

##### Status: 500 Internal server error. This may occur due to wallet connectivity issues, signing service unavailability, or unexpected server errors.

### Send Tokens

- **Method:** `POST`
- **Path:** `/v1/wallets/send`
- **Tags:** Wallets

Send tokens to multiple recipients in a single transaction batch. Supports native tokens (ETH, MATIC, etc.), ERC20 tokens, ERC721 NFTs, and ERC1155 tokens. The token type is automatically determined based on the provided parameters and ERC165 interface detection:

- **Native Token**: No `tokenAddress` provided

- **ERC20**: `tokenAddress` provided, no `tokenId`

- **ERC721/ERC1155**: `tokenAddress` and `tokenId` provided. Auto detects contract type:

  - ERC721: quantity must be '1'
  - ERC1155: any quantity allowed (including '1')

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier where the transfer will be executed.

- **`recipients` (required)**

  `array` — Array of recipients and quantities. Maximum 100 recipients per request.

  **Items:**

  - **`address` (required)**

    `string` — The recipient wallet address or ENS name

  - **`quantity` (required)**

    `string` — The amount to send. For native tokens and ERC20: amount in wei/smallest unit. For ERC721: should be '1'. For ERC1155: the number of tokens to transfer.

- **`from`**

  `string` — The wallet address or ENS name that will send the tokens. If omitted, the project wallet will be used if available.

- **`tokenAddress`**

  `string` — The token contract address. Omit for native token (ETH, MATIC, etc.) transfers.

- **`tokenId`**

  `string` — The token ID for NFT transfers (ERC721/ERC1155). Required for NFT transfers.

**Example:**

```
{
  "from": "0x1234567890123456789012345678901234567890",
  "chainId": 1,
  "recipients": [
    {
      "address": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      "quantity": "1000000000000000000"
    },
    {
      "address": "0x1111111111111111111111111111111111111111",
      "quantity": "500000000000000000"
    }
  ]
}
```

#### Responses

##### Status: 200 Tokens sent successfully. Returns transaction IDs for tracking and monitoring.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Array of transaction IDs for the submitted transfers. One ID per recipient.

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when token parameters are malformed, insufficient balance, invalid contract data, or unsupported token type.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, gas estimation failures, contract execution errors, or unexpected server errors.

### List Contracts

- **Method:** `GET`
- **Path:** `/v1/contracts`
- **Tags:** Contracts

Retrieves a list of all smart contracts imported by the authenticated client on the thirdweb dashboard. This endpoint provides access to contracts that have been added to your dashboard for management and interaction. Results include contract metadata, deployment information, and import timestamps.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

**Note**: For detailed contract metadata including compilation information, ABI, and source code, use the dedicated metadata endpoint: `GET /v1/contracts/{chainId}/{address}/metadata`.

#### Responses

##### Status: 200 Successfully retrieved list of contracts

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`contracts` (required)**

    `array` — Array of contracts imported by the client.

    **Items:**

    - **`address` (required)**

      `string` — The contract address.

    - **`chainId` (required)**

      `string` — The chain ID where the contract is deployed.

    - **`importedAt` (required)**

      `string` — The date when the contract was imported to the dashboard.

    - **`deployedAt`**

      `string` — The date when the contract was deployed.

    - **`id`**

      `string` — The contract ID.

    - **`name`**

      `string` — The contract name, if available.

    - **`symbol`**

      `string` — The contract symbol, if available.

    - **`type`**

      `string` — The contract type (e.g., ERC20, ERC721, etc.).

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

**Example:**

```
{
  "result": {
    "contracts": [
      {
        "address": "",
        "chainId": "",
        "deployedAt": "",
        "id": "",
        "importedAt": "",
        "name": "",
        "symbol": "",
        "type": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    }
  }
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Deploy Contract

- **Method:** `POST`
- **Path:** `/v1/contracts`
- **Tags:** Contracts

Deploy a new smart contract to a blockchain network using raw bytecode. This endpoint allows you to deploy contracts by providing the contract bytecode, ABI, constructor parameters, and optional salt for deterministic deployment.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`abi` (required)**

  `array` — The contract ABI array.

  **Items:**

- **`bytecode` (required)**

  `string` — The contract bytecode as a hex string.

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

- **`constructorParams`**

  `object` — Object containing constructor parameters for the contract deployment (e.g., { param1: 'value1', param2: 123 }).

- **`from`**

  `string` — The wallet address or ENS name that will deploy the contract. If omitted, the project wallet will be used if available.

- **`salt`**

  `string` — Optional salt value for deterministic contract deployment.

**Example:**

```
{
  "chainId": 1,
  "from": "0x1234567890123456789012345678901234567890",
  "bytecode": "0x608060405234801561001057600080fd5b50...",
  "abi": [
    {
      "type": "constructor",
      "inputs": [
        {
          "name": "defaultAdmin",
          "type": "address"
        }
      ]
    },
    {
      "type": "function",
      "name": "name",
      "inputs": [],
      "outputs": [
        {
          "type": "string"
        }
      ],
      "stateMutability": "view"
    }
  ],
  "constructorParams": {
    "defaultAdmin": "0x1234567890123456789012345678901234567890"
  }
}
```

#### Responses

##### Status: 200 Contract deployed successfully

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`address` (required)**

    `string` — The deployed contract address.

  - **`chainId` (required)**

    `number` — The chain ID where the contract was deployed.

  - **`transactionId`**

    `string` — The unique identifier for the transaction that deployed the contract. Will not be returned if the contract was already deployed at the predicted address.

**Example:**

```
{
  "result": {
    "address": "",
    "chainId": 1,
    "transactionId": ""
  }
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Read Contract

- **Method:** `POST`
- **Path:** `/v1/contracts/read`
- **Tags:** Contracts

Executes multiple read-only contract method calls in a single batch request. This endpoint allows efficient batch reading from multiple contracts on the same chain, significantly reducing the number of HTTP requests needed. Each call specifies the contract address, method signature, and optional parameters. Results are returned in the same order as the input calls, with individual success/failure status for each operation.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

- **`calls` (required)**

  `array` — Array of contract method calls to execute. Each call specifies a contract address, method signature, and optional parameters.

  **Items:**

  - **`contractAddress` (required)**

    `string` — The smart contract address or ENS name.

  - **`method` (required)**

    `string` — The contract function signature to call (e.g., 'function approve(address spender, uint256 amount)' or \`function balanceOf(address)\`). Must start with 'function' followed by the function name and parameters as defined in the contract ABI.

  - **`params`**

    `array` — Array of parameters to pass to the contract method, in the correct order and format.

    **Items:**

  - **`value`**

    `string` — Amount of native token to send with the transaction in wei. Required for payable methods.

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

**Example:**

```
{
  "calls": [
    {
      "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "method": "function name() view returns (string)"
    },
    {
      "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "method": "function totalSupply() returns (uint256)"
    },
    {
      "contractAddress": "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
      "method": "function balanceOf(address) returns (uint256)",
      "params": [
        "0x742d35Cc6634C0532925a3b8D43C67B8c8B3E9C6"
      ]
    }
  ],
  "chainId": 8453
}
```

#### Responses

##### Status: 200 Contract read operations completed successfully. Returns an array of results corresponding to each input call, including both successful and failed operations.

###### Content-Type: application/json

- **`result` (required)**

  `array` — Array of results corresponding to each contract read call. Results are returned in the same order as the input calls.

  **Items:**

  - **`success` (required)**

    `boolean` — Indicates whether the contract read operation was successful.

  - **`data`**

    `object` — The result of the contract read operation. The type and format depend on the method's return value as defined in the contract ABI.

  - **`error`**

    `string` — Error message if the contract read operation failed.

**Example:**

```
{
  "result": [
    {
      "data": null,
      "error": "",
      "success": true
    }
  ]
}
```

##### Status: 400 Invalid request parameters. This occurs when the chainId is not supported, contract addresses are invalid, function signatures are malformed, or the calls array is empty.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 500 Internal server error. This may occur due to engine connectivity issues, RPC node unavailability, or unexpected server errors.

### Write Contract

- **Method:** `POST`
- **Path:** `/v1/contracts/write`
- **Tags:** Contracts

Executes write operations (transactions) on smart contracts. This is a convenience endpoint that simplifies contract interaction by accepting method signatures and parameters directly, without requiring manual transaction encoding. All calls are executed against the same contract address and chain, making it ideal for batch operations.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`calls` (required)**

  `array` — Array of contract method calls to execute. Each call specifies a contract address, method signature, and optional parameters.

  **Items:**

  - **`contractAddress` (required)**

    `string` — The smart contract address or ENS name.

  - **`method` (required)**

    `string` — The contract function signature to call (e.g., 'function approve(address spender, uint256 amount)' or \`function balanceOf(address)\`). Must start with 'function' followed by the function name and parameters as defined in the contract ABI.

  - **`params`**

    `array` — Array of parameters to pass to the contract method, in the correct order and format.

    **Items:**

  - **`value`**

    `string` — Amount of native token to send with the transaction in wei. Required for payable methods.

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

- **`from`**

  `string` — The wallet address or ENS name that will send the transaction. If omitted, the project wallet will be used if available.

**Example:**

```
{
  "calls": [
    {
      "contractAddress": "0xe352Cf5f74e3ACfd2d59EcCee6373d2Aa996086e",
      "method": "function approve(address spender, uint256 amount)",
      "params": [
        "0x4fA9230f4E8978462cE7Bf8e6b5a2588da5F4264",
        1000000000
      ]
    }
  ],
  "chainId": 84532,
  "from": "0x1234567890123456789012345678901234567890"
}
```

#### Responses

##### Status: 200 Contract write operations submitted successfully. Returns transaction IDs for tracking and monitoring.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Array of unique identifiers for the submitted transactions. Use these to track transaction status.

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when contract parameters are malformed, method signatures are invalid, insufficient balance, or unsupported contract methods.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`id` (required)**

    `string` — Payment ID

  - **`link` (required)**

    `string` — Link to purchase the product

  - **`message` (required)**

    `string` — Message to display to the user

  - **`quote` (required)**

    `object` — Bridge quote for completing the payment

    - **`destinationAmount` (required)**

      `string` — Destination amount in wei

    - **`intent` (required)**

      `object` — Quote intent details

      - **`amount` (required)**

        `string` — The amount in wei

      - **`destinationChainId` (required)**

        `integer` — Destination chain ID

      - **`destinationTokenAddress` (required)**

        `string` — Destination token address

      - **`originChainId` (required)**

        `integer` — Origin chain ID

      - **`originTokenAddress` (required)**

        `string` — Origin token address

      - **`receiver` (required)**

        `string` — Receiver address

      - **`sender` (required)**

        `string` — Sender address

    - **`originAmount` (required)**

      `string` — Origin amount in wei

    - **`steps` (required)**

      `array` — Array of steps to complete the bridge operation

      **Items:**

      - **`destinationAmount` (required)**

        `string` — Destination amount in wei

      - **`destinationToken` (required)**

        `object` — Destination token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`originAmount` (required)**

        `string` — Origin amount in wei

      - **`originToken` (required)**

        `object` — Origin token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`transactions` (required)**

        `array` — Array of transactions for this step

        **Items:**

        - **`action` (required)**

          `string`, possible values: `"approval", "transfer", "buy", "sell", "fee"` — Type of action this transaction performs

        - **`chainId` (required)**

          `integer` — Blockchain network identifier

        - **`data` (required)**

          `string` — Transaction data payload

        - **`to` (required)**

          `string` — Transaction recipient address

        - **`from`**

          `string` — Transaction sender address

        - **`spender`**

          `string` — Spender address for approval transactions

        - **`value`**

          `string` — Transaction value in wei

      - **`estimatedExecutionTimeMs`**

        `number` — Estimated execution time in milliseconds

    - **`timestamp` (required)**

      `number` — Quote timestamp

    - **`blockNumber`**

      `string` — Block number when quote was generated

    - **`estimatedExecutionTimeMs`**

      `number` — Estimated execution time in milliseconds

**Example:**

```
{
  "result": {
    "message": "",
    "link": "",
    "id": "",
    "quote": {
      "blockNumber": "",
      "destinationAmount": "",
      "estimatedExecutionTimeMs": 1,
      "intent": {
        "amount": "",
        "destinationChainId": 1,
        "destinationTokenAddress": "",
        "originChainId": 1,
        "originTokenAddress": "",
        "receiver": "",
        "sender": ""
      },
      "originAmount": "",
      "steps": [
        {
          "originToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "destinationToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "transactions": [
            {
              "chainId": 1,
              "to": "",
              "data": "",
              "action": "approval",
              "from": "",
              "spender": "",
              "value": ""
            }
          ],
          "originAmount": "",
          "destinationAmount": "",
          "estimatedExecutionTimeMs": 1
        }
      ],
      "timestamp": 1
    }
  }
}
```

##### Status: 404 Contract not found. The specified contract address does not exist on the given blockchain network or is not accessible.

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, gas estimation failures, contract execution errors, or unexpected server errors.

### Get Transactions

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/transactions`
- **Tags:** Contracts

Retrieves transactions for a specific smart contract address on a specific blockchain network. This endpoint provides comprehensive transaction data including block information, gas details, transaction status, and function calls. Results can be filtered, paginated, and sorted to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Contract transactions retrieved successfully. Returns transaction data with metadata including pagination information. Includes decoded function calls when ABI is available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`data` (required)**

    `array` — Array of contract transactions.

    **Items:**

    - **`blockHash` (required)**

      `string` — The hash of the block containing this transaction.

    - **`blockNumber` (required)**

      `number` — The block number containing this transaction.

    - **`blockTimestamp` (required)**

      `number` — The timestamp of the block (Unix timestamp).

    - **`chainId` (required)**

      `string` — The chain ID where the transaction occurred.

    - **`data` (required)**

      `string` — The transaction input data.

    - **`fromAddress` (required)**

      `string` — The address that initiated the transaction.

    - **`functionSelector` (required)**

      `string` — The function selector (first 4 bytes of the transaction data).

    - **`gas` (required)**

      `number` — The gas limit for the transaction.

    - **`gasPrice` (required)**

      `string` — The gas price used for the transaction (in wei as string).

    - **`hash` (required)**

      `string` — The transaction hash.

    - **`nonce` (required)**

      `number` — The transaction nonce.

    - **`status` (required)**

      `number` — The transaction status (1 for success, 0 for failure).

    - **`toAddress` (required)**

      `string` — The address that received the transaction.

    - **`transactionIndex` (required)**

      `number` — The index of the transaction within the block.

    - **`value` (required)**

      `string` — The value transferred in the transaction (in wei as string).

    - **`contractAddress`**

      `string` — Contract address created if this was a contract creation transaction.

    - **`cumulativeGasUsed`**

      `number` — Total gas used by all transactions in this block up to and including this one.

    - **`decoded`**

      `object` — Decoded transaction data (included when ABI is available).

      - **`inputs` (required)**

        `object` — Object containing decoded function parameters.

      - **`name` (required)**

        `string` — The function name.

      - **`signature` (required)**

        `string` — The function signature.

    - **`effectiveGasPrice`**

      `string` — The effective gas price paid (in wei as string).

    - **`gasUsed`**

      `number` — The amount of gas used by the transaction.

    - **`maxFeePerGas`**

      `string` — Maximum fee per gas (EIP-1559).

    - **`maxPriorityFeePerGas`**

      `string` — Maximum priority fee per gas (EIP-1559).

    - **`transactionType`**

      `number` — The transaction type (0=legacy, 1=EIP-2930, 2=EIP-1559).

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

**Example:**

```
{
  "result": {
    "data": [
      {
        "blockHash": "",
        "blockNumber": 1,
        "blockTimestamp": 1,
        "chainId": "",
        "contractAddress": "",
        "cumulativeGasUsed": 1,
        "data": "",
        "decoded": {
          "inputs": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "name": "",
          "signature": ""
        },
        "effectiveGasPrice": "",
        "fromAddress": "",
        "functionSelector": "",
        "gas": 1,
        "gasPrice": "",
        "gasUsed": 1,
        "hash": "",
        "maxFeePerGas": "",
        "maxPriorityFeePerGas": "",
        "nonce": 1,
        "status": 1,
        "toAddress": "",
        "transactionIndex": 1,
        "transactionType": 1,
        "value": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    }
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the contract address or chainId format is invalid, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Contract not found or no transactions available for the specified contract address on the given blockchain network.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get Events

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/events`
- **Tags:** Contracts

Retrieves events emitted by a specific smart contract address on a specific blockchain network. This endpoint provides comprehensive event data including block information, transaction details, event topics, and optional ABI decoding. Results can be filtered, paginated, and sorted to meet specific requirements.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Contract events retrieved successfully. Returns event data with metadata including pagination information. Includes decoded event parameters when ABI is available.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`events` (required)**

    `array` — Array of contract events.

    **Items:**

    - **`address` (required)**

      `string` — The contract address that emitted the event.

    - **`blockHash` (required)**

      `string` — The hash of the block containing this event.

    - **`blockNumber` (required)**

      `number` — The block number where the event was emitted.

    - **`blockTimestamp` (required)**

      `number` — The timestamp of the block (Unix timestamp).

    - **`chainId` (required)**

      `string` — The chain ID where the event occurred.

    - **`data` (required)**

      `string` — The non-indexed event data as a hex string.

    - **`logIndex` (required)**

      `number` — The index of the log within the transaction.

    - **`topics` (required)**

      `array` — Array of indexed event topics (including event signature).

      **Items:**

      `string`

    - **`transactionHash` (required)**

      `string` — The hash of the transaction containing this event.

    - **`transactionIndex` (required)**

      `number` — The index of the transaction within the block.

    - **`decoded`**

      `object` — Decoded event data (included when ABI is available).

      - **`name` (required)**

        `string` — The event name.

      - **`params` (required)**

        `object` — Object containing decoded parameters.

      - **`signature` (required)**

        `string` — The event signature.

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

**Example:**

```
{
  "result": {
    "events": [
      {
        "address": "",
        "blockHash": "",
        "blockNumber": 1,
        "blockTimestamp": 1,
        "chainId": "",
        "data": "",
        "decoded": {
          "name": "",
          "params": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "signature": ""
        },
        "logIndex": 1,
        "topics": [
          ""
        ],
        "transactionHash": "",
        "transactionIndex": 1
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    }
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the contract address or chainId format is invalid, or pagination parameters are out of range.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Contract not found or no events available for the specified contract address on the given blockchain network.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, external service unavailability, or unexpected server errors.

### Get Metadata

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/metadata`
- **Tags:** Contracts

Retrieves detailed metadata for a specific smart contract from the thirdweb contract metadata service. This includes compilation information, ABI, documentation, and other contract-related metadata. Note: Source code is excluded from the response to keep it lightweight and suitable for programmatic access.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

**Metadata Source**: The metadata is fetched from the thirdweb contract metadata service and includes detailed Solidity compilation information, contract ABI, and developer documentation.

#### Responses

##### Status: 200 Successfully retrieved contract metadata

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`compiler`**

    `object` — Compiler information including version.

    - **`version` (required)**

      `string` — Solidity compiler version used to compile the contract.

  - **`language`**

    `string` — Programming language of the contract (e.g., 'Solidity').

  - **`output`**

    `object` — Compilation output including ABI and documentation.

    - **`abi`**

      `array` — Contract ABI (Application Binary Interface) as an array of function/event/error definitions.

      **Items:**

    - **`devdoc`**

      `object` — Developer documentation extracted from contract comments.

    - **`userdoc`**

      `object` — User documentation extracted from contract comments.

  - **`settings`**

    `object` — Compilation settings including optimization and target configuration.

    - **`compilationTarget`**

      `object` — Compilation target mapping source file names to contract names.

    - **`evmVersion`**

      `string` — EVM version target for compilation.

    - **`libraries`**

      `object` — Library addresses for linking.

    - **`metadata`**

      `object` — Metadata settings for compilation.

      - **`bytecodeHash`**

        `string` — Hash method used for bytecode metadata.

    - **`optimizer`**

      `object` — Optimizer settings used during compilation.

      - **`enabled`**

        `boolean` — Whether optimizer is enabled.

      - **`runs`**

        `number` — Number of optimizer runs.

    - **`remappings`**

      `array` — Import remappings used during compilation.

      **Items:**

      `string`

  - **`version`**

    `number` — Metadata format version.

**Example:**

```
{
  "result": {
    "compiler": {
      "version": ""
    },
    "language": "",
    "output": {
      "abi": [],
      "devdoc": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      },
      "userdoc": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      }
    },
    "settings": {
      "compilationTarget": {
        "ANY_ADDITIONAL_PROPERTY": ""
      },
      "evmVersion": "",
      "libraries": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      },
      "metadata": {
        "bytecodeHash": ""
      },
      "optimizer": {
        "enabled": true,
        "runs": 1
      },
      "remappings": [
        ""
      ]
    },
    "version": 1
  }
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 404 Contract metadata not found

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Get Signatures

- **Method:** `GET`
- **Path:** `/v1/contracts/{chainId}/{address}/signatures`
- **Tags:** Contracts

Retrieves human-readable ABI signatures for a specific smart contract. This endpoint fetches the contract metadata from the thirdweb service, extracts the ABI, and converts it into an array of human-readable function and event signatures that can be used directly with contract interaction methods.

**Authentication**: This endpoint requires backend authentication using the `x-secret-key` header. The secret key should never be exposed publicly.

**Usage**: The returned signatures can be used directly in contract read/write operations or event filtering. Each signature follows the standard Solidity format and includes function parameters, return types, state mutability, and event indexing information.

#### Responses

##### Status: 200 Successfully retrieved contract signatures

###### Content-Type: application/json

- **`result` (required)**

  `array` — Array of human-readable ABI signatures including functions and events. Each signature is formatted as a string that can be used directly in contract read/write operations or event filtering.

  **Items:**

  `string`

**Example:**

```
{
  "result": [
    ""
  ]
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. The request must include a valid \`x-secret-key\` header for backend authentication.

##### Status: 404 Contract metadata not found or ABI is not available

##### Status: 429 Rate limit exceeded

##### Status: 500 Internal server error

### Get Transaction

- **Method:** `GET`
- **Path:** `/v1/transactions/{transactionId}`
- **Tags:** Transactions

Retrieves detailed information about a specific transaction using its unique identifier. Returns comprehensive transaction data including execution status, blockchain details, and any associated metadata.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Transaction details retrieved successfully. Returns comprehensive transaction information including status, blockchain details, and execution metadata.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`batchIndex` (required)**

    `integer` — Index within transaction batch

  - **`cancelledAt` (required)**

    `string | null` — ISO timestamp when transaction was cancelled, if applicable

  - **`chainId` (required)**

    `string` — Blockchain network identifier as string

  - **`clientId` (required)**

    `string` — Client identifier that initiated the transaction

  - **`confirmedAt` (required)**

    `string | null` — ISO timestamp when transaction was confirmed on-chain

  - **`confirmedAtBlockNumber` (required)**

    `string | null` — Block number where transaction was confirmed

  - **`createdAt` (required)**

    `string` — ISO timestamp when transaction was created

  - **`errorMessage` (required)**

    `string | null` — Error message if transaction failed

  - **`from` (required)**

    `string | null` — Sender wallet address

  - **`id` (required)**

    `string` — Unique transaction identifier

  - **`status` (required)**

    `string | null`, possible values: `"QUEUED", "SUBMITTED", "CONFIRMED", "FAILED"` — Transaction status

  - **`transactionHash` (required)**

    `string | null` — On-chain transaction hash once confirmed

  - **`enrichedData`**

    `object` — Additional metadata and enriched transaction information

  - **`executionParams`**

    `object` — Parameters used for transaction execution

  - **`executionResult`**

    `object` — Result data from transaction execution

  - **`transactionParams`**

    `object` — Original transaction parameters and data

**Example:**

```
{
  "result": {
    "batchIndex": 1,
    "cancelledAt": null,
    "chainId": "",
    "clientId": "",
    "confirmedAt": null,
    "confirmedAtBlockNumber": null,
    "createdAt": "",
    "enrichedData": null,
    "errorMessage": null,
    "executionParams": null,
    "executionResult": null,
    "from": null,
    "id": "",
    "transactionHash": null,
    "transactionParams": null,
    "status": "QUEUED"
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when the transaction ID format is invalid or malformed.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Transaction not found. The specified transaction ID does not exist or is not associated with the authenticated client.

##### Status: 500 Internal server error. This may occur due to engine connectivity issues, database unavailability, or unexpected server errors.

### List Transactions

- **Method:** `GET`
- **Path:** `/v1/transactions`
- **Tags:** Transactions

Retrieves a paginated list of transactions associated with the authenticated client. Results are sorted by creation date in descending order (most recent first). Supports filtering by wallet address and pagination controls.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Transactions retrieved successfully. Returns a paginated list of transactions with metadata including creation and confirmation timestamps.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

  - **`transactions` (required)**

    `array`

    **Items:**

    - **`batchIndex` (required)**

      `integer` — Index within transaction batch

    - **`cancelledAt` (required)**

      `string | null` — ISO timestamp when transaction was cancelled, if applicable

    - **`chainId` (required)**

      `string` — Blockchain network identifier as string

    - **`clientId` (required)**

      `string` — Client identifier that initiated the transaction

    - **`confirmedAt` (required)**

      `string | null` — ISO timestamp when transaction was confirmed on-chain

    - **`confirmedAtBlockNumber` (required)**

      `string | null` — Block number where transaction was confirmed

    - **`createdAt` (required)**

      `string` — ISO timestamp when transaction was created

    - **`errorMessage` (required)**

      `string | null` — Error message if transaction failed

    - **`from` (required)**

      `string | null` — Sender wallet address

    - **`id` (required)**

      `string` — Unique transaction identifier

    - **`status` (required)**

      `string | null`, possible values: `"QUEUED", "SUBMITTED", "CONFIRMED", "FAILED"` — Transaction status

    - **`transactionHash` (required)**

      `string | null` — On-chain transaction hash once confirmed

    - **`enrichedData`**

      `object` — Additional metadata and enriched transaction information

    - **`executionParams`**

      `object` — Parameters used for transaction execution

    - **`executionResult`**

      `object` — Result data from transaction execution

    - **`transactionParams`**

      `object` — Original transaction parameters and data

**Example:**

```
{
  "result": {
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    },
    "transactions": [
      {
        "batchIndex": 1,
        "cancelledAt": null,
        "chainId": "",
        "clientId": "",
        "confirmedAt": null,
        "confirmedAtBlockNumber": null,
        "createdAt": "",
        "enrichedData": null,
        "errorMessage": null,
        "executionParams": null,
        "executionResult": null,
        "from": null,
        "id": "",
        "transactionHash": null,
        "transactionParams": null,
        "status": "QUEUED"
      }
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when pagination parameters are out of range or wallet address format is invalid.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 500 Internal server error. This may occur due to engine connectivity issues, database unavailability, or unexpected server errors.

### Send Transactions

- **Method:** `POST`
- **Path:** `/v1/transactions`
- **Tags:** Transactions

Submits pre-encoded blockchain transactions with custom data payloads. This endpoint is for low-level transaction submission where you have already encoded the transaction data. For smart contract method calls, use /v1/contracts/write. For native token transfers, use /v1/wallets/send.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier where all transactions will be executed.

- **`transactions` (required)**

  `array` — Array of encoded blockchain transactions to execute. All transactions will use the same from address and chainId.

  **Items:**

  - **`data` (required)**

    `string` — Transaction data in hexadecimal format for contract interactions or custom payloads.

  - **`to` (required)**

    `string` — The target address or ENS name for the transaction.

  - **`value`**

    `string` — Amount of native token to send in wei (smallest unit). Use '0' or omit for non-value transactions.

- **`from`**

  `string` — The wallet address or ENS name that will send the transaction. If omitted, the project wallet will be used if available.

**Example:**

```
{
  "chainId": 137,
  "from": "0x1234567890123456789012345678901234567890",
  "transactions": [
    {
      "data": "0xa9059cbb000000000000000000000000742d35cc6634c0532925a3b8d43c67b8c8b3e9c6000000000000000000000000000000000000000000000000016345785d8a0000",
      "to": "0xA0b86a33E6411E3036C1C4c7E815D0a82e3F5fD6",
      "value": "0"
    }
  ]
}
```

#### Responses

##### Status: 200 Encoded transactions submitted successfully. Returns the transaction IDs for tracking and monitoring.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionIds` (required)**

    `array` — Array of unique identifiers for the submitted transactions. Use these to track transaction status.

    **Items:**

    `string`

**Example:**

```
{
  "result": {
    "transactionIds": [
      ""
    ]
  }
}
```

##### Status: 400 Invalid request parameters. This occurs when transaction data is malformed, insufficient balance, or invalid encoded data.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`id` (required)**

    `string` — Payment ID

  - **`link` (required)**

    `string` — Link to purchase the product

  - **`message` (required)**

    `string` — Message to display to the user

  - **`quote` (required)**

    `object` — Bridge quote for completing the payment

    - **`destinationAmount` (required)**

      `string` — Destination amount in wei

    - **`intent` (required)**

      `object` — Quote intent details

      - **`amount` (required)**

        `string` — The amount in wei

      - **`destinationChainId` (required)**

        `integer` — Destination chain ID

      - **`destinationTokenAddress` (required)**

        `string` — Destination token address

      - **`originChainId` (required)**

        `integer` — Origin chain ID

      - **`originTokenAddress` (required)**

        `string` — Origin token address

      - **`receiver` (required)**

        `string` — Receiver address

      - **`sender` (required)**

        `string` — Sender address

    - **`originAmount` (required)**

      `string` — Origin amount in wei

    - **`steps` (required)**

      `array` — Array of steps to complete the bridge operation

      **Items:**

      - **`destinationAmount` (required)**

        `string` — Destination amount in wei

      - **`destinationToken` (required)**

        `object` — Destination token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`originAmount` (required)**

        `string` — Origin amount in wei

      - **`originToken` (required)**

        `object` — Origin token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`transactions` (required)**

        `array` — Array of transactions for this step

        **Items:**

        - **`action` (required)**

          `string`, possible values: `"approval", "transfer", "buy", "sell", "fee"` — Type of action this transaction performs

        - **`chainId` (required)**

          `integer` — Blockchain network identifier

        - **`data` (required)**

          `string` — Transaction data payload

        - **`to` (required)**

          `string` — Transaction recipient address

        - **`from`**

          `string` — Transaction sender address

        - **`spender`**

          `string` — Spender address for approval transactions

        - **`value`**

          `string` — Transaction value in wei

      - **`estimatedExecutionTimeMs`**

        `number` — Estimated execution time in milliseconds

    - **`timestamp` (required)**

      `number` — Quote timestamp

    - **`blockNumber`**

      `string` — Block number when quote was generated

    - **`estimatedExecutionTimeMs`**

      `number` — Estimated execution time in milliseconds

**Example:**

```
{
  "result": {
    "message": "",
    "link": "",
    "id": "",
    "quote": {
      "blockNumber": "",
      "destinationAmount": "",
      "estimatedExecutionTimeMs": 1,
      "intent": {
        "amount": "",
        "destinationChainId": 1,
        "destinationTokenAddress": "",
        "originChainId": 1,
        "originTokenAddress": "",
        "receiver": "",
        "sender": ""
      },
      "originAmount": "",
      "steps": [
        {
          "originToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "destinationToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "transactions": [
            {
              "chainId": 1,
              "to": "",
              "data": "",
              "action": "approval",
              "from": "",
              "spender": "",
              "value": ""
            }
          ],
          "originAmount": "",
          "destinationAmount": "",
          "estimatedExecutionTimeMs": 1
        }
      ],
      "timestamp": 1
    }
  }
}
```

##### Status: 500 Internal server error. This may occur due to blockchain connectivity issues, gas estimation failures, or unexpected server errors.

### Create Payment

- **Method:** `POST`
- **Path:** `/v1/payments`
- **Tags:** Payments

Create a payment to be executed. Users can complete the payment via hosted UI (link is returned), a transaction execution referencing the product ID, or embedded widgets with the product ID.

**Authentication**: This endpoint requires project authentication.

#### Request Body

##### Content-Type: application/json

- **`description` (required)**

  `string` — The description of the product

- **`name` (required)**

  `string` — The name of the product

- **`recipient` (required)**

  `string` — The wallet address or ENS name that will receive the payment for the product

- **`token` (required)**

  `object` — The token to purchase

  - **`address` (required)**

    `string` — The token address to purchase (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token)

  - **`amount` (required)**

    `string` — The amount of the token to purchase in wei.

  - **`chainId` (required)**

    `integer` — The blockchain network where the token is located

- **`imageUrl`**

  `string` — The URL of the product image

- **`purchaseData`**

  `object` — App specific purchase data for this payment

**Example:**

```
{
  "name": "Course",
  "description": "The complete javascript course",
  "imageUrl": "https://example.com/course.png",
  "token": {
    "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "chainId": 42161,
    "amount": "100"
  },
  "recipient": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9"
}
```

#### Responses

##### Status: 200 Payment created successfully. Returns the ID and link to complete the payment.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`id` (required)**

    `string` — The payment ID

  - **`link` (required)**

    `string` — The link to purchase the product

**Example:**

```
{
  "result": {
    "id": "",
    "link": ""
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### Complete Payment

- **Method:** `POST`
- **Path:** `/v1/payments/{id}`
- **Tags:** Payments

Completes a payment using its default token and amount. If the user does not have sufficient funds in the product's default payment token a 402 status will be returned containing a link and raw quote for purchase fulfillment.

**Authentication**: This endpoint requires project authentication.

#### Request Body

##### Content-Type: application/json

- **`from`**

  `string` — The wallet address or ENS name that will purchase the product. If omitted, the project wallet will be used if available.

**Example:**

```
{
  "from": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9"
}
```

#### Responses

##### Status: 200 Product purchased successfully. Returns the transaction used for the purchase.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Transaction ID that was executed for your product purchase

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`id` (required)**

    `string` — Payment ID

  - **`link` (required)**

    `string` — Link to purchase the product

  - **`message` (required)**

    `string` — Message to display to the user

  - **`quote` (required)**

    `object` — Bridge quote for completing the payment

    - **`destinationAmount` (required)**

      `string` — Destination amount in wei

    - **`intent` (required)**

      `object` — Quote intent details

      - **`amount` (required)**

        `string` — The amount in wei

      - **`destinationChainId` (required)**

        `integer` — Destination chain ID

      - **`destinationTokenAddress` (required)**

        `string` — Destination token address

      - **`originChainId` (required)**

        `integer` — Origin chain ID

      - **`originTokenAddress` (required)**

        `string` — Origin token address

      - **`receiver` (required)**

        `string` — Receiver address

      - **`sender` (required)**

        `string` — Sender address

    - **`originAmount` (required)**

      `string` — Origin amount in wei

    - **`steps` (required)**

      `array` — Array of steps to complete the bridge operation

      **Items:**

      - **`destinationAmount` (required)**

        `string` — Destination amount in wei

      - **`destinationToken` (required)**

        `object` — Destination token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`originAmount` (required)**

        `string` — Origin amount in wei

      - **`originToken` (required)**

        `object` — Origin token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`transactions` (required)**

        `array` — Array of transactions for this step

        **Items:**

        - **`action` (required)**

          `string`, possible values: `"approval", "transfer", "buy", "sell", "fee"` — Type of action this transaction performs

        - **`chainId` (required)**

          `integer` — Blockchain network identifier

        - **`data` (required)**

          `string` — Transaction data payload

        - **`to` (required)**

          `string` — Transaction recipient address

        - **`from`**

          `string` — Transaction sender address

        - **`spender`**

          `string` — Spender address for approval transactions

        - **`value`**

          `string` — Transaction value in wei

      - **`estimatedExecutionTimeMs`**

        `number` — Estimated execution time in milliseconds

    - **`timestamp` (required)**

      `number` — Quote timestamp

    - **`blockNumber`**

      `string` — Block number when quote was generated

    - **`estimatedExecutionTimeMs`**

      `number` — Estimated execution time in milliseconds

**Example:**

```
{
  "result": {
    "message": "",
    "link": "",
    "id": "",
    "quote": {
      "blockNumber": "",
      "destinationAmount": "",
      "estimatedExecutionTimeMs": 1,
      "intent": {
        "amount": "",
        "destinationChainId": 1,
        "destinationTokenAddress": "",
        "originChainId": 1,
        "originTokenAddress": "",
        "receiver": "",
        "sender": ""
      },
      "originAmount": "",
      "steps": [
        {
          "originToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "destinationToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "transactions": [
            {
              "chainId": 1,
              "to": "",
              "data": "",
              "action": "approval",
              "from": "",
              "spender": "",
              "value": ""
            }
          ],
          "originAmount": "",
          "destinationAmount": "",
          "estimatedExecutionTimeMs": 1
        }
      ],
      "timestamp": 1
    }
  }
}
```

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### Get Payment History

- **Method:** `GET`
- **Path:** `/v1/payments/{id}`
- **Tags:** Payments

Get payment history for a specific payment link

#### Responses

##### Status: 200 Payment history retrieved successfully

###### Content-Type: application/json

- **`data` (required)**

  `array` — List of payments for the client

  **Items:**

  - **`clientId` (required)**

    `string`

  - **`createdAt` (required)**

    `string`

  - **`destinationAmount` (required)**

    `string`

  - **`destinationToken` (required)**

    `object`

    - **`address` (required)**

      `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

    - **`chainId` (required)**

      `integer`

    - **`decimals` (required)**

      `integer`

    - **`name` (required)**

      `string`

    - **`symbol` (required)**

      `string`

    - **`iconUri`**

      `string`

  - **`id` (required)**

    `string`

  - **`receiver` (required)**

    `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

  - **`status` (required)**

    `string`, possible values: `"PENDING", "COMPLETED", "FAILED", "NOT_FOUND"`

  - **`transactions` (required)**

    `array`

    **Items:**

    - **`chainId` (required)**

      `integer`

    - **`transactionHash` (required)**

      `string`

  - **`type` (required)**

    `string`, possible values: `"buy", "sell", "transfer", "onramp"`

  - **`blockNumber`**

    `string`

  - **`developerFeeBps`**

    `number`

  - **`developerFeeRecipient`**

    `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

  - **`onrampId`**

    `string`

  - **`originAmount`**

    `string`

  - **`originToken`**

    `object`

    - **`address` (required)**

      `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

    - **`chainId` (required)**

      `integer`

    - **`decimals` (required)**

      `integer`

    - **`name` (required)**

      `string`

    - **`symbol` (required)**

      `string`

    - **`iconUri`**

      `string`

  - **`paymentLinkId`**

    `string`

  - **`purchaseData`**

    `object`

  - **`sender`**

    `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

  - **`transactionId`**

    `string`

- **`meta` (required)**

  `object`

  - **`totalCount` (required)**

    `number` — Total number of payments

**Example:**

```
{
  "data": [
    {
      "id": "",
      "blockNumber": "",
      "transactionId": "",
      "onrampId": "",
      "clientId": "",
      "sender": "",
      "receiver": "",
      "developerFeeRecipient": "",
      "developerFeeBps": 1,
      "transactions": [
        {
          "chainId": 1,
          "transactionHash": ""
        }
      ],
      "status": "PENDING",
      "type": "buy",
      "originAmount": "",
      "destinationAmount": "",
      "paymentLinkId": "",
      "purchaseData": null,
      "originToken": {
        "chainId": 1,
        "address": "",
        "symbol": "",
        "name": "",
        "decimals": 1,
        "iconUri": ""
      },
      "destinationToken": {
        "chainId": 1,
        "address": "",
        "symbol": "",
        "name": "",
        "decimals": 1,
        "iconUri": ""
      },
      "createdAt": ""
    }
  ],
  "meta": {
    "totalCount": 1
  }
}
```

##### Status: 400 Bad request

###### Content-Type: application/json

- **`error` (required)**

  `string`

**Example:**

```
{
  "error": ""
}
```

##### Status: 404 Payment link not found

###### Content-Type: application/json

- **`error` (required)**

  `string`

**Example:**

```
{
  "error": ""
}
```

### x402 - Verify payment

- **Method:** `POST`
- **Path:** `/v1/payments/x402/verify`
- **Tags:** Payments

Verify an x402 payment payload against the provided payment requirements. Compatible with any standard x402 middleware.

#### Request Body

##### Content-Type: application/json

- **`paymentPayload` (required)**

  `object`

  - **`network` (required)**

    `object`

  - **`payload` (required)**

    `object`

  - **`scheme` (required)**

    `string`, possible values: `"exact"`

  - **`x402Version` (required)**

    `number`

- **`paymentRequirements` (required)**

  `object`

  - **`asset` (required)**

    `object`

  - **`description` (required)**

    `string`

  - **`maxAmountRequired` (required)**

    `string`

  - **`maxTimeoutSeconds` (required)**

    `integer`

  - **`mimeType` (required)**

    `string`

  - **`network` (required)**

    `object`

  - **`payTo` (required)**

    `object`

  - **`resource` (required)**

    `string`, format: `uri`

  - **`scheme` (required)**

    `string`, possible values: `"exact"`

  - **`extra`**

    `object`

  - **`outputSchema`**

    `object`

**Example:**

```
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base-sepolia",
    "payload": {
      "signature": "",
      "authorization": {
        "from": "",
        "to": "",
        "value": "",
        "validAfter": "",
        "validBefore": "",
        "nonce": ""
      }
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "",
    "resource": "",
    "description": "",
    "mimeType": "",
    "outputSchema": {
      "ANY_ADDITIONAL_PROPERTY": "anything"
    },
    "payTo": "",
    "maxTimeoutSeconds": 1,
    "asset": "",
    "extra": {
      "ANY_ADDITIONAL_PROPERTY": "anything"
    }
  }
}
```

#### Responses

##### Status: 200 Verification successful

###### Content-Type: application/json

- **`isValid` (required)**

  `boolean`

- **`errorMessage`**

  `string`

- **`invalidReason`**

  `string`, possible values: `"insufficient_funds", "invalid_exact_evm_payload_authorization_valid_after", "invalid_exact_evm_payload_authorization_valid_before", "invalid_exact_evm_payload_authorization_value", "invalid_exact_evm_payload_signature", "invalid_exact_evm_payload_recipient_mismatch", "invalid_exact_svm_payload_transaction", "invalid_exact_svm_payload_transaction_amount_mismatch", "invalid_exact_svm_payload_transaction_create_ata_instruction", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset", "invalid_exact_svm_payload_transaction_instructions", "invalid_exact_svm_payload_transaction_instructions_length", "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high", "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked", "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked", "invalid_exact_svm_payload_transaction_not_a_transfer_instruction", "invalid_exact_svm_payload_transaction_cannot_derive_receiver_ata", "invalid_exact_svm_payload_transaction_receiver_ata_not_found", "invalid_exact_svm_payload_transaction_sender_ata_not_found", "invalid_exact_svm_payload_transaction_simulation_failed", "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata", "invalid_network", "invalid_payload", "invalid_payment_requirements", "invalid_scheme", "invalid_payment", "payment_expired", "unsupported_scheme", "invalid_x402_version", "invalid_transaction_state", "invalid_x402_version", "settle_exact_svm_block_height_exceeded", "settle_exact_svm_transaction_confirmation_timed_out", "unsupported_scheme", "unexpected_settle_error", "unexpected_verify_error"`

- **`payer`**

  `object`

**Example:**

```
{
  "isValid": true,
  "invalidReason": "insufficient_funds",
  "payer": "",
  "errorMessage": ""
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header.

##### Status: 500 Internal server error

### x402 - Settle payment

- **Method:** `POST`
- **Path:** `/v1/payments/x402/settle`
- **Tags:** Payments

Settle an x402 payment. Compatible with any standard x402 middleware.

#### Request Body

##### Content-Type: application/json

- **`paymentPayload` (required)**

  `object`

  - **`network` (required)**

    `object`

  - **`payload` (required)**

    `object`

  - **`scheme` (required)**

    `string`, possible values: `"exact"`

  - **`x402Version` (required)**

    `number`

- **`paymentRequirements` (required)**

  `object`

  - **`asset` (required)**

    `object`

  - **`description` (required)**

    `string`

  - **`maxAmountRequired` (required)**

    `string`

  - **`maxTimeoutSeconds` (required)**

    `integer`

  - **`mimeType` (required)**

    `string`

  - **`network` (required)**

    `object`

  - **`payTo` (required)**

    `object`

  - **`resource` (required)**

    `string`, format: `uri`

  - **`scheme` (required)**

    `string`, possible values: `"exact"`

  - **`extra`**

    `object`

  - **`outputSchema`**

    `object`

- **`waitUntil`**

  `string`, possible values: `"simulated", "submitted", "confirmed"`, default: `"confirmed"` — The event to wait for to determina a transaction confirmation. 'simulated' will only simulate the transaction (fastest), 'submitted' will wait till the transaction is submitted, and 'confirmed' will wait for the transaction to be fully confirmed on chain (slowest). Defaults to 'confirmed'.

**Example:**

```
{
  "paymentPayload": {
    "x402Version": 1,
    "scheme": "exact",
    "network": "base-sepolia",
    "payload": {
      "signature": "",
      "authorization": {
        "from": "",
        "to": "",
        "value": "",
        "validAfter": "",
        "validBefore": "",
        "nonce": ""
      }
    }
  },
  "paymentRequirements": {
    "scheme": "exact",
    "network": "base-sepolia",
    "maxAmountRequired": "",
    "resource": "",
    "description": "",
    "mimeType": "",
    "outputSchema": {
      "ANY_ADDITIONAL_PROPERTY": "anything"
    },
    "payTo": "",
    "maxTimeoutSeconds": 1,
    "asset": "",
    "extra": {
      "ANY_ADDITIONAL_PROPERTY": "anything"
    }
  },
  "waitUntil": "confirmed"
}
```

#### Responses

##### Status: 200 Settlement successful

###### Content-Type: application/json

- **`network` (required)**

  `string`, possible values: `"base-sepolia", "base", "avalanche-fuji", "avalanche", "iotex", "solana-devnet", "solana", "sei", "sei-testnet"`

- **`success` (required)**

  `boolean`

- **`transaction` (required)**

  `string`

- **`errorMessage`**

  `string`

- **`errorReason`**

  `string`, possible values: `"insufficient_funds", "invalid_exact_evm_payload_authorization_valid_after", "invalid_exact_evm_payload_authorization_valid_before", "invalid_exact_evm_payload_authorization_value", "invalid_exact_evm_payload_signature", "invalid_exact_evm_payload_recipient_mismatch", "invalid_exact_svm_payload_transaction", "invalid_exact_svm_payload_transaction_amount_mismatch", "invalid_exact_svm_payload_transaction_create_ata_instruction", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_payee", "invalid_exact_svm_payload_transaction_create_ata_instruction_incorrect_asset", "invalid_exact_svm_payload_transaction_instructions", "invalid_exact_svm_payload_transaction_instructions_length", "invalid_exact_svm_payload_transaction_instructions_compute_limit_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction", "invalid_exact_svm_payload_transaction_instructions_compute_price_instruction_too_high", "invalid_exact_svm_payload_transaction_instruction_not_spl_token_transfer_checked", "invalid_exact_svm_payload_transaction_instruction_not_token_2022_transfer_checked", "invalid_exact_svm_payload_transaction_not_a_transfer_instruction", "invalid_exact_svm_payload_transaction_cannot_derive_receiver_ata", "invalid_exact_svm_payload_transaction_receiver_ata_not_found", "invalid_exact_svm_payload_transaction_sender_ata_not_found", "invalid_exact_svm_payload_transaction_simulation_failed", "invalid_exact_svm_payload_transaction_transfer_to_incorrect_ata", "invalid_network", "invalid_payload", "invalid_payment_requirements", "invalid_scheme", "invalid_payment", "payment_expired", "unsupported_scheme", "invalid_x402_version", "invalid_transaction_state", "invalid_x402_version", "settle_exact_svm_block_height_exceeded", "settle_exact_svm_transaction_confirmation_timed_out", "unsupported_scheme", "unexpected_settle_error", "unexpected_verify_error"`

- **`payer`**

  `object`

**Example:**

```
{
  "success": true,
  "errorReason": "insufficient_funds",
  "payer": "",
  "transaction": "",
  "network": "base-sepolia",
  "errorMessage": ""
}
```

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header.

##### Status: 500 Internal server error

### x402 - Supported payment methods

- **Method:** `GET`
- **Path:** `/v1/payments/x402/supported`
- **Tags:** Payments

List supported x402 payment methods, optionally filtered by token address and chainId. Compatible with any standard x402 middleware.

#### Responses

##### Status: 200 Supported payment kinds

###### Content-Type: application/json

- **`kinds` (required)**

  `array`

  **Items:**

  - **`network` (required)**

    `object`

  - **`scheme` (required)**

    `string`, possible values: `"exact"`

  - **`x402Version` (required)**

    `number`, possible values: `1`

  - **`extra`**

    `object`

    - **`defaultAsset`**

      `object`

      - **`address` (required)**

        `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

      - **`decimals` (required)**

        `number`

      - **`eip712` (required)**

        `object`

        - **`name` (required)**

          `string`

        - **`primaryType` (required)**

          `string`, possible values: `"TransferWithAuthorization", "Permit"`

        - **`version` (required)**

          `string`

    - **`supportedAssets`**

      `array`

      **Items:**

      - **`address` (required)**

        `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

      - **`decimals` (required)**

        `number`

      - **`eip712` (required)**

        `object`

        - **`name` (required)**

          `string`

        - **`primaryType` (required)**

          `string`, possible values: `"TransferWithAuthorization", "Permit"`

        - **`version` (required)**

          `string`

**Example:**

```
{
  "kinds": [
    {
      "x402Version": 1,
      "scheme": "exact",
      "network": "base-sepolia",
      "extra": {
        "defaultAsset": {
          "address": "",
          "decimals": 1,
          "eip712": {
            "name": "",
            "version": "",
            "primaryType": "TransferWithAuthorization"
          }
        },
        "supportedAssets": [
          {
            "address": "",
            "decimals": 1,
            "eip712": {
              "name": "",
              "version": "",
              "primaryType": "TransferWithAuthorization"
            }
          }
        ]
      }
    }
  ]
}
```

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header.

##### Status: 500 Internal server error

### x402 - Fetch with payment

- **Method:** `POST`
- **Path:** `/v1/payments/x402/fetch`
- **Tags:** Payments

Fetch any given url. If the url returns HTTP 402 payment required, this endpoint handles payment with the authenticated wallet.

Optionally pass a 'from' query parameter with the authenticated wallet address (server or user wallet) to complete the payment.

If no 'from' parameter is passed, the default project wallet address will be used.

- Works with any x402 compatible endpoint.
- Automatically selects a compatible payment method.
- Signs the appropriate payment payload.
- Sends the payment to the url.
- Returns the final result from the url called.

Request body and headers are always passed through to the url called.

**Authentication**: This endpoint requires wallet authentication for the payment. For frontend usage, include `x-client-id` and `Authorization: Bearer <jwt>` headers. For backend usage, include `x-secret-key` header.

#### Request Body

##### Content-Type: \*/\*

**Example:**

```
{
  "key": "value"
}
```

#### Responses

##### Status: 200 Returns the final result from the API call

##### Status: 400 Invalid request parameters

##### Status: 401 Authentication required. For frontend usage, include \`x-client-id\` and \`Authorization: Bearer \<jwt>\` headers. For backend usage, include \`x-secret-key\` header.

##### Status: 402 Payment required. The user does not have enough funds to cover the payment requirements. Returns a payment link to fund the wallet and complete the payment.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`id` (required)**

    `string` — Payment ID

  - **`link` (required)**

    `string` — Link to purchase the product

  - **`message` (required)**

    `string` — Message to display to the user

  - **`quote` (required)**

    `object` — Bridge quote for completing the payment

    - **`destinationAmount` (required)**

      `string` — Destination amount in wei

    - **`intent` (required)**

      `object` — Quote intent details

      - **`amount` (required)**

        `string` — The amount in wei

      - **`destinationChainId` (required)**

        `integer` — Destination chain ID

      - **`destinationTokenAddress` (required)**

        `string` — Destination token address

      - **`originChainId` (required)**

        `integer` — Origin chain ID

      - **`originTokenAddress` (required)**

        `string` — Origin token address

      - **`receiver` (required)**

        `string` — Receiver address

      - **`sender` (required)**

        `string` — Sender address

    - **`originAmount` (required)**

      `string` — Origin amount in wei

    - **`steps` (required)**

      `array` — Array of steps to complete the bridge operation

      **Items:**

      - **`destinationAmount` (required)**

        `string` — Destination amount in wei

      - **`destinationToken` (required)**

        `object` — Destination token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`originAmount` (required)**

        `string` — Origin amount in wei

      - **`originToken` (required)**

        `object` — Origin token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`transactions` (required)**

        `array` — Array of transactions for this step

        **Items:**

        - **`action` (required)**

          `string`, possible values: `"approval", "transfer", "buy", "sell", "fee"` — Type of action this transaction performs

        - **`chainId` (required)**

          `integer` — Blockchain network identifier

        - **`data` (required)**

          `string` — Transaction data payload

        - **`to` (required)**

          `string` — Transaction recipient address

        - **`from`**

          `string` — Transaction sender address

        - **`spender`**

          `string` — Spender address for approval transactions

        - **`value`**

          `string` — Transaction value in wei

      - **`estimatedExecutionTimeMs`**

        `number` — Estimated execution time in milliseconds

    - **`timestamp` (required)**

      `number` — Quote timestamp

    - **`blockNumber`**

      `string` — Block number when quote was generated

    - **`estimatedExecutionTimeMs`**

      `number` — Estimated execution time in milliseconds

**Example:**

```
{
  "result": {
    "message": "",
    "link": "",
    "id": "",
    "quote": {
      "blockNumber": "",
      "destinationAmount": "",
      "estimatedExecutionTimeMs": 1,
      "intent": {
        "amount": "",
        "destinationChainId": 1,
        "destinationTokenAddress": "",
        "originChainId": 1,
        "originTokenAddress": "",
        "receiver": "",
        "sender": ""
      },
      "originAmount": "",
      "steps": [
        {
          "originToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "destinationToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "transactions": [
            {
              "chainId": 1,
              "to": "",
              "data": "",
              "action": "approval",
              "from": "",
              "spender": "",
              "value": ""
            }
          ],
          "originAmount": "",
          "destinationAmount": "",
          "estimatedExecutionTimeMs": 1
        }
      ],
      "timestamp": 1
    }
  }
}
```

##### Status: 500 Internal server error

### x402 - Discover resources

- **Method:** `GET`
- **Path:** `/v1/payments/x402/discover/resources`
- **Tags:** Payments

Discover payable x402 compatible services and HTTP endpoints that can be paid for using the fetchWithPayment tool. Use this tool to browse services, APIs and endpoints to find what you need for your tasks. Each item has a resource url that you can call with the fetchWithPayment tool.Price is in the base units of the asset. For example, if the price is 1000000 and the asset is USDC (which is the default and has 6 decimals), the price is 1 USDC.Examples: if network is eip155:8453, asset is 0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913, max amount required is 10000, resource is <https://api.example.com/paid-api>, then you should interpret that as "the api.example.com/paid-api service costs 0.01 USDC per call".

#### Responses

##### Status: 200 List of discovered x402 resources

###### Content-Type: application/json

- **`items` (required)**

  `array`

  **Items:**

  - **`accepts` (required)**

    `array`

    **Items:**

    - **`asset` (required)**

      `object`

    - **`description` (required)**

      `string`

    - **`maxAmountRequired` (required)**

      `string`

    - **`maxTimeoutSeconds` (required)**

      `integer`

    - **`mimeType` (required)**

      `string`

    - **`network` (required)**

      `object`

    - **`payTo` (required)**

      `object`

    - **`resource` (required)**

      `string`, format: `uri`

    - **`scheme` (required)**

      `string`, possible values: `"exact"`

    - **`extra`**

      `object`

    - **`outputSchema`**

      `object`

  - **`lastUpdated` (required)**

    `string`

  - **`resource` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"http"`

  - **`x402Version` (required)**

    `number`

  - **`metadata`**

    `object`

- **`pagination` (required)**

  `object`

  - **`limit` (required)**

    `number`

  - **`offset` (required)**

    `number`

  - **`total` (required)**

    `number`

- **`x402Version` (required)**

  `number`

**Example:**

```
{
  "x402Version": 1,
  "items": [
    {
      "resource": "",
      "type": "http",
      "x402Version": 1,
      "accepts": [
        {
          "scheme": "exact",
          "network": "base-sepolia",
          "maxAmountRequired": "",
          "resource": "",
          "description": "",
          "mimeType": "",
          "outputSchema": {
            "ANY_ADDITIONAL_PROPERTY": "anything"
          },
          "payTo": "",
          "maxTimeoutSeconds": 1,
          "asset": "",
          "...": "[Additional Properties Truncated]"
        }
      ],
      "lastUpdated": "",
      "metadata": {
        "ANY_ADDITIONAL_PROPERTY": "anything"
      }
    }
  ],
  "pagination": {
    "limit": 1,
    "offset": 1,
    "total": 1
  }
}
```

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header.

##### Status: 500 Internal server error

### Create Token

- **Method:** `POST`
- **Path:** `/v1/tokens`
- **Tags:** Tokens

Create a new ERC20 token with the provided metadata and starting price. The token is immediately available for purchase using thirdweb Payments.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

- **`description` (required)**

  `string` — Token description

- **`imageUrl` (required)**

  `string`, format: `uri` — Token image URL

- **`name` (required)**

  `string` — Token name

- **`symbol` (required)**

  `string` — Token symbol

- **`from`**

  `string` — Wallet address or ENS that will deploy the token. If omitted, the project wallet will be used if available.

- **`maxSupply`**

  `number`, default: `1000000000` — The maximum token supply.

- **`owner`**

  `string` — The token owner address, if different from \`from\`.

- **`sale`**

  `object` — Setup this token for a sale.

  - **`amount` (required)**

    `number` — The number of tokens to allocate to the sale.

  - **`startingPrice` (required)**

    `string` — The initial token price in wei. This price is in the currency specified by \`currency\` (or the native token if not specified).

  - **`currency`**

    `string` — The currency to price this token sale in. Defaults to the native token.

  - **`developerFeeBps`**

    `number` — The bps fee on the token pool.

  - **`developerFeeRecipient`**

    `string` — The address to send the developer fee to. Defaults to the token owner.

  - **`type`**

    `string`, possible values: `"pool"`, default: `"pool"`

- **`salt`**

  `string` — A salt to deterministically generate the token address.

**Example:**

```
{
  "chainId": 42161,
  "name": "MyToken",
  "symbol": "MT",
  "description": "My very own token",
  "imageUrl": "https://picsum.photos/200",
  "from": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9",
  "maxSupply": 1000000000,
  "sale": {
    "type": "pool",
    "startingPrice": "100000",
    "amount": 1000000,
    "developerFeeBps": 10,
    "currency": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831"
  }
}
```

#### Responses

##### Status: 202 The token is being deployed. Returns the predicted token address.

###### Content-Type: application/json

- **`address` (required)**

  `string` — The address the token was deployed at

- **`transactionId` (required)**

  `string` — The in-progress deployment transaction ID.

**Example:**

```
{
  "transactionId": "",
  "address": ""
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to deploy the contract.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### List Tokens

- **Method:** `GET`
- **Path:** `/v1/tokens`
- **Tags:** Tokens

Lists or search existing tokens based on the provided filters. Supports querying by chain ID, token address, symbol, and/or name.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Tokens returned successfully.

###### Content-Type: application/json

- **`pagination` (required)**

  `object`

  - **`hasMore`**

    `boolean` — Whether there are more items available

  - **`limit`**

    `number | null`, default: `20` — Number of items per page

  - **`page`**

    `number | null`, default: `1` — Current page number

  - **`totalCount`**

    `number | null` — Total number of items available

- **`tokens` (required)**

  `array`

  **Items:**

  - **`address` (required)**

    `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

  - **`chainId` (required)**

    `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

  - **`decimals` (required)**

    `number`

  - **`prices` (required)**

    `object` — Token price in different FIAT currencies.

  - **`symbol` (required)**

    `string`

  - **`iconUri`**

    `string`

**Example:**

```
{
  "pagination": {
    "hasMore": true,
    "limit": 20,
    "page": 1,
    "totalCount": null
  },
  "tokens": [
    {
      "chainId": 1,
      "address": "",
      "decimals": 1,
      "symbol": "",
      "iconUri": "",
      "prices": {
        "USD": 1,
        "EUR": 0.84
      }
    }
  ]
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### Get Owners

- **Method:** `GET`
- **Path:** `/v1/tokens/{chainId}/{address}/owners`
- **Tags:** Tokens

Retrieves a paginated list of owners for a given token contract on a specific chain. Supports ERC-20 tokens, ERC-721 NFTs, and ERC-1155 tokens:

- **ERC-20**: No `tokenId` provided - returns token holders with balances
- **NFT Collection**: No `tokenId` provided - returns all owners of any token in the collection
- **Specific NFT**: `tokenId` provided - returns owner(s) of that specific token ID

The token standard is automatically detected using ERC165 interface detection when needed.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Token owners retrieved successfully. Returns owners with pagination information. For ERC-20 tokens, \`amount\` represents token balance. For NFTs, \`amount\` represents quantity owned (usually '1' for ERC-721, can be >1 for ERC-1155).

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`owners` (required)**

    `array` — Array of token owners with amounts.

    **Items:**

    - **`address` (required)**

      `string` — Owner wallet address

    - **`amount` (required)**

      `string` — Token amount owned as a string

    - **`tokenId`**

      `string` — Token ID for NFTs

  - **`pagination` (required)**

    `object`

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

**Example:**

```
{
  "result": {
    "owners": [
      {
        "address": "",
        "amount": "",
        "tokenId": ""
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    }
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. The request must include a valid \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Token not found or no owners available.

##### Status: 500 Internal server error.

### List Supported Chains

- **Method:** `GET`
- **Path:** `/v1/bridge/chains`
- **Tags:** Bridge

List all blockchain networks available for cross-chain bridging. Each chain includes metadata and native currency details.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Successfully retrieved supported bridge chains.

###### Content-Type: application/json

- **`result` (required)**

  `array` — Blockchain networks that support cross-chain bridging

  **Items:**

  - **`chainId` (required)**

    `number` — The chain ID of the chain

  - **`icon` (required)**

    `string` — The URL of the chain's icon

  - **`name` (required)**

    `string` — The name of the chain

  - **`nativeCurrency` (required)**

    `object` — Information about the native currency of the chain

    - **`decimals` (required)**

      `number` — The number of decimals used by the native currency

    - **`name` (required)**

      `string` — The name of the native currency

    - **`symbol` (required)**

      `string` — The symbol of the native currency

**Example:**

```
{
  "result": [
    {
      "chainId": 1,
      "name": "Ethereum Mainnet",
      "icon": "ipfs://QmcxZHpyJa8T4i63xqjPYrZ6tKrt55tZJpbXcjSDKuKaf9/ethereum/512.png",
      "nativeCurrency": {
        "name": "Ether",
        "symbol": "ETH",
        "decimals": 18
      }
    },
    {
      "chainId": 43114,
      "name": "Avalanche C-Chain",
      "icon": "ipfs://QmcxZHpyJa8T4i63xqjPYrZ6tKrt55tZJpbXcjSDKuKaf9/avalanche/512.png",
      "nativeCurrency": {
        "name": "Avalanche",
        "symbol": "AVAX",
        "decimals": 18
      }
    },
    {
      "chainId": 137,
      "name": "Polygon Mainnet",
      "icon": "ipfs://Qmd58rKLnBfteouAcmdjQ1HzDvRLSLjMbHjuXRytsKwAkD",
      "nativeCurrency": {
        "name": "POL",
        "symbol": "POL",
        "decimals": 18
      }
    }
  ]
}
```

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` header.

##### Status: 500 Internal server error occurred while fetching bridge chains.

### List Supported Routes

- **Method:** `GET`
- **Path:** `/v1/bridge/routes`
- **Tags:** Bridge

List supported bridge routes with simple pagination and optional chain or token filters.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Successfully retrieved supported bridge routes.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object` — Pagination details for the returned routes.

    - **`hasMore`**

      `boolean` — Whether there are more items available

    - **`limit`**

      `number | null`, default: `20` — Number of items per page

    - **`page`**

      `number | null`, default: `1` — Current page number

    - **`totalCount`**

      `number | null` — Total number of items available

  - **`routes` (required)**

    `array` — Supported bridge routes that match the provided filters.

    **Items:**

    - **`destinationToken` (required)**

      `object`

      - **`address` (required)**

        `string` — Token contract address

      - **`chainId` (required)**

        `integer` — Chain identifier for the token

      - **`decimals` (required)**

        `integer` — Number of decimals the token uses

      - **`name` (required)**

        `string` — Token name

      - **`symbol` (required)**

        `string` — Token symbol

      - **`iconUri`**

        `string`, format: `uri` — Optional icon URL for the token

      - **`marketCapUsd`**

        `number` — 24h market capitalization in USD when available

      - **`prices`**

        `object` — Token price quotes keyed by fiat currency code

      - **`volume24hUsd`**

        `number` — 24h trading volume in USD when available

    - **`originToken` (required)**

      `object`

      - **`address` (required)**

        `string` — Token contract address

      - **`chainId` (required)**

        `integer` — Chain identifier for the token

      - **`decimals` (required)**

        `integer` — Number of decimals the token uses

      - **`name` (required)**

        `string` — Token name

      - **`symbol` (required)**

        `string` — Token symbol

      - **`iconUri`**

        `string`, format: `uri` — Optional icon URL for the token

      - **`marketCapUsd`**

        `number` — 24h market capitalization in USD when available

      - **`prices`**

        `object` — Token price quotes keyed by fiat currency code

      - **`volume24hUsd`**

        `number` — 24h trading volume in USD when available

**Example:**

```
{
  "result": {
    "routes": [
      {
        "originToken": {
          "chainId": 1,
          "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          "symbol": "ETH",
          "name": "Ether",
          "decimals": 18,
          "iconUri": "https://assets.relay.link/icons/1/light.png",
          "prices": {
            "USD": 3200.5,
            "EUR": 2950.75
          }
        },
        "destinationToken": {
          "chainId": 1,
          "address": "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
          "symbol": "ETH",
          "name": "Ether",
          "decimals": 18,
          "iconUri": "https://assets.relay.link/icons/1/light.png",
          "prices": {
            "USD": 3200.5,
            "EUR": 2950.75
          }
        }
      }
    ],
    "pagination": {
      "hasMore": true,
      "limit": 20,
      "page": 1,
      "totalCount": null
    }
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` header.

##### Status: 500 Internal server error occurred while fetching bridge routes.

### Convert Fiat to Crypto

- **Method:** `GET`
- **Path:** `/v1/bridge/convert`
- **Tags:** Bridge

Convert fiat currency amount to cryptocurrency token amount. Supports multiple fiat currencies based on available price data for the specific token. Returns the equivalent amount of crypto tokens for the specified fiat amount based on current market prices. If price data is not available for the requested currency, the API will return a 404 error.

**Native Tokens**: To get the price of native tokens (like ETH on Ethereum), use the address `0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`. For example, to get the price of ETH on Ethereum Mainnet (chainId: 1), pass `to=0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE`.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Responses

##### Status: 200 Conversion completed successfully. Returns the amount of crypto tokens equivalent to the specified fiat amount.

###### Content-Type: application/json

- **`result` (required)**

  `number` — The conversion result - amount of crypto tokens for the fiat amount

**Example:**

```
{
  "result": 0.000025
}
```

##### Status: 400 Bad request. Invalid parameters such as invalid amounts, malformed token address, or invalid currency code.

##### Status: 401 Authentication required. Include \`x-client-id\` header for frontend usage or \`x-secret-key\` for backend usage.

##### Status: 404 Token not found, price data unavailable for the specified token on the given chain, or price data not available for the requested currency.

##### Status: 429 Too many requests. Rate limit exceeded.

##### Status: 500 Internal server error. This may occur due to network connectivity issues or external service failures.

### Swap or Bridge Tokens

- **Method:** `POST`
- **Path:** `/v1/bridge/swap`
- **Tags:** Bridge

Swap one token for another using the optimal route available. You can specify a tokenIn amount (if exact='input') or tokenOut amount (if exact='output'), but not both. The corresponding output or input amount will be returned as the quote.

**Authentication**: This endpoint requires project authentication and wallet authentication. For backend usage, use `x-secret-key` header. For frontend usage, use `x-client-id` + `Authorization: Bearer <jwt>` headers.

#### Request Body

##### Content-Type: application/json

- **`tokenIn` (required)**

  `object`

  - **`address` (required)**

    `string` — The input token address to swap (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token)

  - **`chainId` (required)**

    `integer` — The blockchain network where the token is located

  - **`amount`**

    `string` — The amount of the input token to swap in wei.

  - **`maxAmount`**

    `string` — The maximum amount of the input token to swap in wei.

- **`tokenOut` (required)**

  `object`

  - **`address` (required)**

    `string` — The output token address to swap (use 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE for native token)

  - **`chainId` (required)**

    `integer` — The blockchain network where the token is located

  - **`amount`**

    `string` — The amount of the output token to receive in wei.

  - **`minAmount`**

    `string` — The minimum amount of the output token to receive in wei.

- **`exact`**

  `string`, possible values: `"input", "output"`, default: `"input"` — Whether to swap the exact input or output amount

- **`from`**

  `string` — The wallet address or ENS name that will execute the swap. If omitted, the project wallet will be used if available.

- **`slippageToleranceBps`**

  `number | null` — The slippage tolerance in basis points. Will be automatically calculated by default.

**Example:**

```
{
  "exact": "input",
  "tokenIn": {
    "address": "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
    "chainId": 42161,
    "amount": "100"
  },
  "tokenOut": {
    "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
    "chainId": 42161,
    "minAmount": "80"
  },
  "from": "0xEfc38EF8C09535b25e364b6d1a7C406D3972f2A9"
}
```

#### Responses

##### Status: 200 Swap completed successfully. Returns the transaction used for the swap.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Payment transaction ID that was executed

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 400 Invalid request parameters.

##### Status: 401 Authentication required. For backend usage, include \`x-secret-key\` header. For frontend usage, include \`x-client-id\` + \`Authorization: Bearer \<jwt>\` headers.

##### Status: 402 Payment required. Insufficient wallet balance to complete the purchase.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`id` (required)**

    `string` — Payment ID

  - **`link` (required)**

    `string` — Link to purchase the product

  - **`message` (required)**

    `string` — Message to display to the user

  - **`quote` (required)**

    `object` — Bridge quote for completing the payment

    - **`destinationAmount` (required)**

      `string` — Destination amount in wei

    - **`intent` (required)**

      `object` — Quote intent details

      - **`amount` (required)**

        `string` — The amount in wei

      - **`destinationChainId` (required)**

        `integer` — Destination chain ID

      - **`destinationTokenAddress` (required)**

        `string` — Destination token address

      - **`originChainId` (required)**

        `integer` — Origin chain ID

      - **`originTokenAddress` (required)**

        `string` — Origin token address

      - **`receiver` (required)**

        `string` — Receiver address

      - **`sender` (required)**

        `string` — Sender address

    - **`originAmount` (required)**

      `string` — Origin amount in wei

    - **`steps` (required)**

      `array` — Array of steps to complete the bridge operation

      **Items:**

      - **`destinationAmount` (required)**

        `string` — Destination amount in wei

      - **`destinationToken` (required)**

        `object` — Destination token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`originAmount` (required)**

        `string` — Origin amount in wei

      - **`originToken` (required)**

        `object` — Origin token information

        - **`address` (required)**

          `string` — A valid Ethereum address (0x-prefixed hex string) or ENS name (e.g., vitalik.eth).

        - **`chainId` (required)**

          `integer` — The blockchain network identifier. Common values include: 1 (Ethereum), 8453 (Base), 137 (Polygon), 56 (BSC), 43114 (Avalanche), 42161 (Arbitrum), 10 (Optimism).

        - **`decimals` (required)**

          `number`

        - **`prices` (required)**

          `object` — Token price in different FIAT currencies.

        - **`symbol` (required)**

          `string`

        - **`iconUri`**

          `string`

      - **`transactions` (required)**

        `array` — Array of transactions for this step

        **Items:**

        - **`action` (required)**

          `string`, possible values: `"approval", "transfer", "buy", "sell", "fee"` — Type of action this transaction performs

        - **`chainId` (required)**

          `integer` — Blockchain network identifier

        - **`data` (required)**

          `string` — Transaction data payload

        - **`to` (required)**

          `string` — Transaction recipient address

        - **`from`**

          `string` — Transaction sender address

        - **`spender`**

          `string` — Spender address for approval transactions

        - **`value`**

          `string` — Transaction value in wei

      - **`estimatedExecutionTimeMs`**

        `number` — Estimated execution time in milliseconds

    - **`timestamp` (required)**

      `number` — Quote timestamp

    - **`blockNumber`**

      `string` — Block number when quote was generated

    - **`estimatedExecutionTimeMs`**

      `number` — Estimated execution time in milliseconds

**Example:**

```
{
  "result": {
    "message": "",
    "link": "",
    "id": "",
    "quote": {
      "blockNumber": "",
      "destinationAmount": "",
      "estimatedExecutionTimeMs": 1,
      "intent": {
        "amount": "",
        "destinationChainId": 1,
        "destinationTokenAddress": "",
        "originChainId": 1,
        "originTokenAddress": "",
        "receiver": "",
        "sender": ""
      },
      "originAmount": "",
      "steps": [
        {
          "originToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "destinationToken": {
            "chainId": 1,
            "address": "",
            "decimals": 1,
            "symbol": "",
            "iconUri": "",
            "prices": {
              "USD": 1,
              "EUR": 0.84
            }
          },
          "transactions": [
            {
              "chainId": 1,
              "to": "",
              "data": "",
              "action": "approval",
              "from": "",
              "spender": "",
              "value": ""
            }
          ],
          "originAmount": "",
          "destinationAmount": "",
          "estimatedExecutionTimeMs": 1
        }
      ],
      "timestamp": 1
    }
  }
}
```

##### Status: 500 Internal server error. This may occur due to network connectivity issues, wallet creation failures, or transaction execution failures.

### List Solana Wallets

- **Method:** `GET`
- **Path:** `/v1/solana/wallets`
- **Tags:** Solana

List all Solana wallets created for your project. Supports pagination with page and limit parameters.

**Authentication**: This endpoint requires backend authentication using the x-secret-key header. The secret key should never be exposed publicly.

#### Responses

##### Status: 200 Successfully retrieved Solana wallets with pagination metadata.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`pagination` (required)**

    `object` — Pagination details for the wallet list.

    - **`limit` (required)**

      `integer` — Number of wallets returned per page.

    - **`page` (required)**

      `integer` — Current page number.

    - **`totalCount` (required)**

      `number` — Total number of wallets available.

  - **`wallets` (required)**

    `array` — Array of Solana wallets created for your project.

    **Items:**

    - **`address` (required)**

      `string` — Base58 encoded Solana address.

    - **`createdAt` (required)**

      `string` — ISO 8601 timestamp indicating when the wallet was created.

    - **`updatedAt` (required)**

      `string` — ISO 8601 timestamp indicating when the wallet was last updated.

    - **`label`**

      `string | null` — Optional label associated with the wallet.

**Example:**

```
{
  "result": {
    "wallets": [
      {
        "address": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
        "label": null,
        "createdAt": "",
        "updatedAt": ""
      }
    ],
    "pagination": {
      "totalCount": 1,
      "page": 1,
      "limit": 1
    }
  }
}
```

##### Status: 401 Authentication required. Include x-secret-key or Authorization headers.

##### Status: 500 Internal server error occurred while listing wallets.

### Create Solana Wallet

- **Method:** `POST`
- **Path:** `/v1/solana/wallets`
- **Tags:** Solana

Create a new Solana wallet or return the existing wallet for a given label. Labels must be unique within your project.

**Authentication**: This endpoint requires backend authentication using the x-secret-key header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`label` (required)**

  `string` — Unique label to identify the wallet. Used for retrieval and management.

**Example:**

```
{
  "label": "treasury-solana-wallet"
}
```

#### Responses

##### Status: 200 Solana wallet retrieved for the provided label.

###### Content-Type: application/json

- **`result` (required)**

  `object` — Details for a Solana wallet in your project.

  - **`address` (required)**

    `string` — Base58 encoded Solana address.

  - **`createdAt` (required)**

    `string` — ISO 8601 timestamp indicating when the wallet was created.

  - **`updatedAt` (required)**

    `string` — ISO 8601 timestamp indicating when the wallet was last updated.

  - **`label`**

    `string | null` — Optional label associated with the wallet.

**Example:**

```
{
  "result": {
    "address": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
    "label": null,
    "createdAt": "",
    "updatedAt": ""
  }
}
```

##### Status: 201 Solana wallet created for the provided label.

###### Content-Type: application/json

- **`result` (required)**

  `object` — Details for a Solana wallet in your project.

  - **`address` (required)**

    `string` — Base58 encoded Solana address.

  - **`createdAt` (required)**

    `string` — ISO 8601 timestamp indicating when the wallet was created.

  - **`updatedAt` (required)**

    `string` — ISO 8601 timestamp indicating when the wallet was last updated.

  - **`label`**

    `string | null` — Optional label associated with the wallet.

**Example:**

```
{
  "result": {
    "address": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
    "label": null,
    "createdAt": "",
    "updatedAt": ""
  }
}
```

##### Status: 401 Authentication required. Include x-secret-key or Authorization headers.

##### Status: 500 Internal server error occurred while creating wallet.

### Sign Solana Message

- **Method:** `POST`
- **Path:** `/v1/solana/sign-message`
- **Tags:** Solana

Sign an arbitrary message with a Solana wallet. Supports both text and hexadecimal message formats with automatic format detection.

**Authentication**: This endpoint requires backend authentication using the x-secret-key header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`from` (required)**

  `string` — The Solana wallet address used for signing.

- **`message` (required)**

  `string` — Message to sign. Can be plain text or hexadecimal format (starting with 0x). The format is automatically detected.

**Example:**

```
{
  "from": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
  "message": "Welcome to thirdweb"
}
```

#### Responses

##### Status: 200 Message signed successfully. Returns the base58 signature.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`signature` (required)**

    `string` — Base58 encoded signature returned from the signer.

**Example:**

```
{
  "result": {
    "signature": ""
  }
}
```

##### Status: 401 Authentication required. Include x-secret-key or Authorization headers.

##### Status: 500 Internal server error occurred while signing the message.

### Send Solana Tokens

- **Method:** `POST`
- **Path:** `/v1/solana/send`
- **Tags:** Solana

Transfer native SOL or SPL tokens on Solana. Automatically handles token account creation for SPL tokens if needed.

**Authentication**: This endpoint requires backend authentication using the x-secret-key header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`amount` (required)**

  `string` — Amount to transfer expressed in base units (lamports for SOL or token decimals).

- **`chainId` (required)**

  `string`, possible values: `"solana:mainnet", "solana:devnet"` — Solana network identifier. Use solana:devnet for testing and solana:mainnet for production.

- **`from` (required)**

  `string` — Solana wallet address that will sign and submit the transfer.

- **`to` (required)**

  `string` — Destination Solana address.

- **`tokenAddress`**

  `string` — Optional SPL token mint address. When omitted a native SOL transfer is performed.

**Example:**

```
{
  "from": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
  "to": "FhtwVYF1wKAm7fWmE2N5P2eCv13wt2aT8W4Q9NQ9YcJH",
  "amount": "1000000",
  "chainId": "solana:devnet"
}
```

#### Responses

##### Status: 200 Transfer queued successfully. Returns the transaction identifier for status polling.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Idempotency key assigned to the queued transaction.

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 202 Transfer accepted for asynchronous processing. Returns the transaction identifier for status polling.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Idempotency key assigned to the queued transaction.

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 401 Authentication required. Include x-secret-key or Authorization headers.

##### Status: 500 Internal server error occurred while processing the transfer.

### Send Solana Transaction

- **Method:** `POST`
- **Path:** `/v1/solana/transactions`
- **Tags:** Solana

Submit a Solana transaction composed of one or more instructions. Transactions are queued and processed asynchronously.

**Authentication**: This endpoint requires backend authentication using the x-secret-key header. The secret key should never be exposed publicly.

#### Request Body

##### Content-Type: application/json

- **`chainId` (required)**

  `string`, possible values: `"solana:mainnet", "solana:devnet"` — Solana network identifier. Use solana:devnet for testing and solana:mainnet for production.

- **`from` (required)**

  `string` — Solana wallet address that will sign and submit the transaction.

- **`transactions` (required)**

  `array` — Set of instructions executed sequentially in a single transaction.

  **Items:**

  - **`accounts` (required)**

    `array` — Ordered list of accounts consumed by the instruction.

    **Items:**

    - **`address` (required)**

      `string` — Public key for the account.

    - **`isSigner` (required)**

      `boolean` — Whether this account must sign the transaction.

    - **`isWritable` (required)**

      `boolean` — Whether this account can be modified by the instruction.

  - **`data` (required)**

    `string` — Instruction data encoded using the provided encoding.

  - **`programId` (required)**

    `string` — Program address to invoke for this instruction.

  - **`encoding`**

    `string`, possible values: `"hex", "base64"`, default: `"base64"` — Encoding used for the instruction data payload.

**Example:**

```
{
  "from": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
  "chainId": "solana:devnet",
  "transactions": [
    {
      "programId": "11111111111111111111111111111111",
      "accounts": [
        {
          "address": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
          "isSigner": true,
          "isWritable": true
        },
        {
          "address": "FhtwVYF1wKAm7fWmE2N5P2eCv13wt2aT8W4Q9NQ9YcJH",
          "isSigner": false,
          "isWritable": true
        }
      ],
      "data": "02000000e888b30000000000",
      "encoding": "hex"
    }
  ]
}
```

#### Responses

##### Status: 200 Transaction queued successfully. Returns the transaction identifier for status polling.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Idempotency key assigned to the queued transaction.

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 202 Transaction accepted for asynchronous processing. Returns the transaction identifier for status polling.

###### Content-Type: application/json

- **`result` (required)**

  `object`

  - **`transactionId` (required)**

    `string` — Idempotency key assigned to the queued transaction.

**Example:**

```
{
  "result": {
    "transactionId": ""
  }
}
```

##### Status: 401 Authentication required. Include x-secret-key or Authorization headers.

##### Status: 500 Internal server error occurred while processing the transaction.

### Get Solana Transaction

- **Method:** `GET`
- **Path:** `/v1/solana/transactions/:transactionId`
- **Tags:** Solana

Retrieve the status and details of a queued Solana transaction using the identifier returned when the transaction was submitted.

**Authentication**: This endpoint requires backend authentication using the x-secret-key header. The secret key should never be exposed publicly.

#### Responses

##### Status: 200 Transaction status retrieved successfully.

###### Content-Type: application/json

- **`result` (required)**

  `object` — Transaction metadata and status information.

  - **`chainId` (required)**

    `string`, possible values: `"solana:mainnet", "solana:devnet"` — Solana network identifier. Use solana:devnet for testing and solana:mainnet for production.

  - **`clientId` (required)**

    `string` — Project client identifier.

  - **`createdAt` (required)**

    `string` — ISO 8601 timestamp when the transaction was queued.

  - **`from` (required)**

    `string` — Signer address used on submission.

  - **`id` (required)**

    `string` — Unique identifier for the transaction.

  - **`blockTime`**

    `integer | null` — Unix timestamp of the processed block.

  - **`cancelledAt`**

    `string | null`

  - **`confirmedAt`**

    `string | null` — Timestamp when the transaction reached the reported status.

  - **`confirmedAtSlot`**

    `string | null` — Slot where the transaction was confirmed, if available.

  - **`enrichedData`**

    `object`

  - **`errorMessage`**

    `string | null` — Error message if the transaction failed.

  - **`executionParams`**

    `object` — Resolved execution parameters used for the transaction.

  - **`executionResult`**

    `object` — Raw execution result payload, if present.

  - **`signature`**

    `string | null` — Signature recorded on-chain once available.

  - **`status`**

    `string | null`, possible values: `"QUEUED", "SUBMITTED", "CONFIRMED", "FAILED"` — Current status of the transaction in the processing pipeline.

  - **`transactionParams`**

    `object` — Original instruction payload submitted.

**Example:**

```
{
  "result": {
    "id": "",
    "chainId": "solana:devnet",
    "from": "8JBLmveV4YF5AQ7EVnKJgyj6etGgVkPp3tYqQMTu3p5B",
    "signature": null,
    "status": "QUEUED",
    "confirmedAt": null,
    "confirmedAtSlot": null,
    "blockTime": null,
    "createdAt": "",
    "errorMessage": null,
    "executionParams": null,
    "executionResult": null,
    "transactionParams": null,
    "clientId": "",
    "enrichedData": null,
    "cancelledAt": null
  }
}
```

##### Status: 401 Authentication required. Include x-secret-key or Authorization headers.

##### Status: 404 Transaction not found. The identifier may be invalid or expired.

##### Status: 500 Internal server error occurred while fetching transaction status.

### Chat

- **Method:** `POST`
- **Path:** `/ai/chat`
- **Tags:** AI

Thirdweb AI chat completion API (BETA).

Send natural language queries to interact with any EVM chain, read data, prepare transactions, swap tokens, deploy contracts, payments and more.

Compatible with standard OpenAI API chat completion format, can be used raw or with any popular AI library.

**Authentication**: Pass `x-client-id` header for frontend usage from allowlisted origins or `x-secret-key` for backend usage.

#### Request Body

##### Content-Type: application/json

- **`messages` (required)**

  `array` — Natural language query for the AI assistant

  **Items:**

  - **`content` (required)**

    `object`

  - **`role` (required)**

    `string`, possible values: `"user", "assistant", "system", "tool"`

- **`context`**

  `object` — Context for the AI assistant

  - **`auto_execute_transactions`**

    `boolean`, default: `false` — Whether to automatically execute transactions. If not provided, the default is false

  - **`chain_ids`**

    `array` — Optional chain IDs for context

    **Items:**

    `number`

  - **`from`**

    `string` — Optional wallet address that will execute transactions

  - **`session_id`**

    `string | null` — Optional session ID for conversation continuity. If not provided, a new session will be created

- **`stream`**

  `boolean` — Enable server streaming of the AI response

**Example:**

```
{
  "messages": [
    {
      "role": "user",
      "content": "Send 0.01 ETH to vitalik.eth"
    }
  ],
  "context": {
    "chain_ids": [
      8453
    ],
    "from": "0x1234567890123456789012345678901234567890"
  },
  "stream": false
}
```

#### Responses

##### Status: 200 AI assistant response or SSE stream when stream=true

###### Content-Type: application/json

- **`actions` (required)**

  `array`

  **Items:**

  **One of:**

  - **`data` (required)**

    `object`

    - **`chain_id` (required)**

      `number`

    - **`data` (required)**

      `string`

    - **`to` (required)**

      `string`

    - **`value` (required)**

      `string`

    - **`function`**

      `string | null`

  - **`request_id` (required)**

    `string`

  - **`session_id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"sign_transaction"`

  - **`source`**

    `string`, default: `"model"`

  * **`data` (required)**

    `object`

    - **`action` (required)**

      `string | null`

    - **`from_token` (required)**

      `object`

      - **`address` (required)**

        `string`

      - **`amount` (required)**

        `string`

      - **`chain_id` (required)**

        `number`

      - **`decimals` (required)**

        `number`

      - **`price` (required)**

        `number | null`

      - **`symbol` (required)**

        `string`

    - **`intent` (required)**

      `object`

      - **`amount` (required)**

        `string`

      - **`destination_chain_id` (required)**

        `number`

      - **`destination_token_address` (required)**

        `string`

      - **`maxSteps` (required)**

        `number`

      - **`origin_chain_id` (required)**

        `number`

      - **`origin_token_address` (required)**

        `string`

      - **`receiver` (required)**

        `string`

      - **`sender` (required)**

        `string`

    - **`to_token` (required)**

      `object`

      - **`address` (required)**

        `string`

      - **`amount` (required)**

        `string`

      - **`chain_id` (required)**

        `number`

      - **`decimals` (required)**

        `number`

      - **`price` (required)**

        `number | null`

      - **`symbol` (required)**

        `string`

    - **`transaction` (required)**

      `object`

      - **`chain_id` (required)**

        `number`

      - **`data` (required)**

        `string`

      - **`to` (required)**

        `string`

      - **`value` (required)**

        `string`

      - **`function`**

        `string | null`

  * **`request_id` (required)**

    `string`

  * **`session_id` (required)**

    `string`

  * **`type` (required)**

    `string`, possible values: `"sign_swap"`

  * **`source`**

    `string`, default: `"model"`

  - **`data` (required)**

    `object`

    - **`transaction_id` (required)**

      `string`

  - **`request_id` (required)**

    `string`

  - **`session_id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"monitor_transaction"`

  - **`source`**

    `string`, default: `"model"`

- **`message` (required)**

  `string` — The AI assistant's response

- **`request_id` (required)**

  `string`

- **`session_id` (required)**

  `string`

**Example:**

```
{
  "message": "I've prepared a native ETH transfer as requested. Would you like to proceed with executing this transfer?",
  "session_id": "123",
  "request_id": "456",
  "actions": [
    {
      "type": "sign_transaction",
      "data": {
        "chain_id": 8453,
        "to": "0x1234567890123456789012345678901234567890",
        "value": "10000000000000000",
        "data": "0x"
      },
      "session_id": "123",
      "request_id": "456",
      "source": "model"
    }
  ]
}
```

###### Content-Type: text/event-stream

**One of:**

- **`event` (required)**

  `string`, possible values: `"delta"`

- **`v` (required)**

  `string`

* **`data` (required)**

  `object`

* **`event` (required)**

  `string`, possible values: `"action"`

- **`data` (required)**

  `object`

  - **`data` (required)**

    `string`

  - **`request_id` (required)**

    `string`

  - **`session_id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"presence"`

  - **`source`**

    `string`, default: `"model"`

- **`event` (required)**

  `string`, possible values: `"presence"`

* **`data` (required)**

  `object`

  - **`request_id` (required)**

    `string`

  - **`session_id` (required)**

    `string`

  - **`type` (required)**

    `string`, possible values: `"init"`

  - **`source`**

    `string`, default: `"model"`

* **`event` (required)**

  `string`, possible values: `"init"`

- **`data` (required)**

  `object`

  - **`chain_ids`**

    `array | null`

  - **`networks`**

    `string | null`, possible values: `"all", "mainnet", "testnet"`

  - **`session_id`**

    `string | null`

  - **`wallet_address`**

    `string | null`

- **`event` (required)**

  `string`, possible values: `"context"`

* **`data` (required)**

  `object`

  - **`height` (required)**

    `number`

  - **`url` (required)**

    `string`

  - **`width` (required)**

    `number`

* **`event` (required)**

  `string`, possible values: `"image"`

- **`data` (required)**

  `boolean`

- **`event` (required)**

  `string`, possible values: `"done"`

* **`data` (required)**

  `string`

* **`event` (required)**

  `string`, possible values: `"error"`

**Example:**

```
{
  "event": "delta",
  "v": ""
}
```
