![alt text](https://raw.githubusercontent.com/sellersindustry/authical-backend/main/banner.png)

# Authical - Backend Server
This is the **Backend Server** for the Authical Authentication Framework, which
acts as the backend service. Built using NextJS this server is the handles all
the API calls made from the frontend to manage authenication, sessions, and
account information. It is this service that connects to your databases like
Redis and MongoDB to store user information.

You might also want to check out...
- **[Authical Core](https://github.com/sellersindustry/authical-core)** - Client and Server SDK for calling the backend server
- **[Authical UI Componetns](https://github.com/sellersindustry/authical-template-nextjs)** - Frontend UI components and NextJS template


<br>

### What is Authical?
Authical is an open source authentication framework that uses one-time passwords
to authenicate users. A user can simply enter their email (no matter if they are
a new user or an existing user) and they will receive an email within seconds
with a one-time password (OTP) they can enter to confirm their identity. Authical
is a easy to deploy framework that will manage one-time passwords, sessions, and
user accounts.

<br>

## Endpoint Authenication
There are two primary entities that will interact with the Authical authenication
server. The first and most common type of entity is the client, this is the end
user who is most likly interacting with the Authical server from their web browser.
The second type of entity is a machine, this would be a service implemented by
the developers that are using Authical as their autheication service. Machines
are able to execute all admin API methods (except the methods related to machine
tokens).


### Client Authenication
Client bearers are generated and returned by the server when
user finish the [authorize process](#verify-new-session).
Send this bearer as a bearer authorization header when making requests.
```javascript
btoa(`USER:${userID}:${sessionID}:${secret}`);
```

### Machine Authenication
Machine bearers are generated in the admin control panel or using the
[token add API endpoint](#admin-add-token).
Send this bearer as a bearer authorization header when making requests.
```javascript
btoa(`MACHINE:${tokenID}:${secret}`)
```

<br>


## Configuration
Docs Coming Soon...


<br>

## Setup
Docs Coming Soon...

<br>


## Future Ideas
- **Authical Badge** - Add Link to authical badge
- **MongoDB Integration** - Implement MongoDB Integrations for profile.
- **Azure Mail Integration** - Implement Azure email integration.
- **Query Users Admin** - Ability to query and list active users within the admin user management
- **Session Location** - Using the IP address get the location of the user. This
    location will have to be loaded from a interface API, so create a new interface
    also we should cache the varibles. [IP Location API](https://ipstack.com/).
    There is a chance Vercel will handle this for us and in this case is should already be handled.
- **Post Hog Integration** - Implement PostHog for logging.
- **Admin Panel Settings** - Add a more user-friendly way to update the settings.
- **React Package** - Create React package for UI assets.
- **Branding** - Load custom branding from server settings.
- **Multiple Request** - Prevent client from making multiple request at the
    same time that are duplicated.
- **Host URLs Trailing Forward Slash** - the SDKs and authical.config.ts host names must
    have no trailing backslash in their urls. Make it so it does not matter. Make a core
    utility to handle this.
- **Email OTP Copy** - In Outlook when notifications popup from emails it has a copy option to copy the otp.


<br>


## APIs Endpoints
| URL                              | Method   | Description                                      | Docs                                              |
| ---                              | ---      | ---                                              | ---                                               |
| `/auth/request`                  | `POST`   | Request new session                              | [Learn More](#request-new-session)                |
| `/auth/verify`                   | `POST`   | Verify new session                               | [Learn More](#verify-new-session)                 |
| `/session/`                      | `GET`    | Get current session                              | [Learn More](#get-current-session)                |
| `/session/`                      | `DELETE` | Revolk current session                           | [Learn More](#revolk-current-session)             |
| `/session/`                      | `POST`   | Refresh current session                          | [Learn More](#refresh-current-session)            |
| `/session/all`                   | `GET`    | Get all sessions                                 | [Learn More](#get-all-sessions)                   |
| `/session/all`                   | `DELETE` | Revolk all sessions                              | [Learn More](#revolk-all-sessions)                |
| `/session/[id]`                  | `GET`    | Get session by ID                                | [Learn More](#get-session-by-id)                  |
| `/session/[id]`                  | `DELETE` | Revolk session by ID                             | [Learn More](#revolk-session-by-id)               |
| `/profile/`                      | `GET`    | Get Profile                                      | [Learn More](#get-profile)                        |
| `/profile/`                      | `POST`   | Update Profile                                   | [Learn More](#update-profile)                     |
| `/profile/`                      | `DELETE` | Delete Profile                                   | [Learn More](#delete-profile)                     |
| `/profile/[email]`               | `POST`   | Add Email to Profile                             | [Learn More](#add-email)                          |
| `/profile/[email]`               | `DELETE` | Remove Email from Profile                        | [Learn More](#remove-email)                       |
| `/profile/[email]/primary`       | `POST`   | Set Primary Email for Profile                    | [Learn More](#set-primary-email)                  |
| `/profile/[email]/verify`        | `POST`   | Verify Email for Profile                         | [Learn More](#verify-new-email)                   |
| `/user/[id/email]`               | `GET`    | Get Profile by userID or email                   | [Learn More](#get-specific-users-profile)         |
| `/admin/settings`                | `GET`    | Get Settings                                     | [Learn More](#admin-get-settings)                 |
| `/admin/settings`                | `POST`   | Update Settings                                  | [Learn More](#admin-update-settings)              |
| `/admin/log`                     | `GET`    | Get Logs                                         | [Learn More](#admin-get-logs)                     |
| `/admin/user/[id/email]`         | `GET`    | Admin Get Profile by userID or email             | [Learn More](#admin-get-profile)                  |
| `/admin/user/[id/email]`         | `POST`   | Admin Update Profile by userID or email          | [Learn More](#admin-update-profile)               |
| `/admin/user/[id/email]`         | `DELETE` | Admin Delete by userID or email                  | [Learn More](#admin-delete-profile)               |
| `/admin/token`                   | `GET`    | Get all API Tokens                               | [Learn More](#admin-get-all-tokens)               |
| `/admin/token`                   | `POST`   | Create new API Token                             | [Learn More](#admin-add-token)                    |
| `/admin/token/[tokenID]`         | `GET`    | Get token by Token ID                            | [Learn More](#admin-get-token)                    |
| `/admin/token/[tokenID]`         | `DELETE` | Delete token by Token ID                         | [Learn More](#admin-delete-token)                 |
| `/admin/session/verify`          | `POST`   | Verify user session by bearer token              | [Learn More](#admin-session-verify)               |


### Request New Session
`POST:/auth/request` ***[No Auth Required](#endpoint-authenication)*** \
Requesting a new session will send a one time password to your email address.
Once you receive the password you can verify the login with the
[Verify New Session API](#verify-new-session). No account is required, will
auto create an account if one doesn't already exist. Will revolk current session
on your device.
```json5
// Example Request
{
    "email": "bob@example.com"
}

// Example Response
{
    "otpID": "371c26bf-6f04-421b-b659-677159842e7e"
}
```


### Verify New Session
`POST:/auth/verify` ***[No Auth Required](#endpoint-authenication)*** \
Verifying a new session with the OTP ID and the One Time Password sent to your
email address. Request a OTP with the
[Request New Session API](#request-new-session). Will revolk current session
on your device. The bear token that is returned should saved and henceforth be 
sent as an `Authorization` header such that `Bearer [token]`.
[See User Authenication](#client-authenication).
```json5
// Example Request
{
    "email": "bob@example.com",
    "otpID": "371c26bf-6f04-421b-b659-677159842e7e",
    "secret": "7528"
}

// Example Response
{
    "bearer": "ZGYwZDE2NWUtZjYzOS00OGM0LTkwY2ItM2="
}
```


### Get Current Session
`GET:/session` ***[Client Basic Auth Required](#client-authenication)*** \
Get the session information for the current session. Based on Authorization header.
```json5
// Example Response
{
    "id": "b81d9a79-936a-4f95-b402-530321952393",
    "user": "df0d165e-f639-48c4-90cb-3ba82450c613",
    "device": {
        "os": "",
        "browser": "",
        "ip": "",
        "location": "?"
    },
    "updated": "2023-10-13T01:22:33.352Z",
    "created": "2023-10-13T01:22:33.352Z"
}
```


### Revolk Current Session
`DELETE:/session` ***[Client Basic Auth Required](#client-authenication)*** \
Revolk the session information for the current session. Based on Authorization header.


### Refresh Current Session
`POST:/session` ***[Client Basic Auth Required](#client-authenication)*** \
Refresh the session information for the current session. This will increase the
lifespan of the token. By default session last 24 days. No new bearer token is
provided. Based on Authorization header.


### Get All Sessions
`GET:/session/all` ***[Client Basic Auth Required](#client-authenication)*** \
Get all the current active session for the current user.
```json5
// Example Response
[
    {
        "id": "b81d9a79-936a-4f95-b402-530321952393",
        "user": "df0d165e-f639-48c4-90cb-3ba82450c613",
        "device": {
            "os": "",
            "browser": "",
            "ip": "",
            "location": "?"
        },
        "updated": "2023-10-13T01:22:33.352Z",
        "created": "2023-10-13T01:22:33.352Z"
    }
]
```


### Revolk All Sessions
`DELETE:/session/all` ***[Client Basic Auth Required](#client-authenication)*** \
Revolk all the current active session for the current user - including current
session, will log user out.


### Get Session by ID
`GET:/session/[id]` ***[Client Basic Auth Required](#client-authenication)*** \
Get the session for a specific sessionID of the current user.
```json5
// Example Request URL
// /session/b81d9a79-936a-4f95-b402-530321952393

// Example Response
{
    "id": "b81d9a79-936a-4f95-b402-530321952393",
    "user": "df0d165e-f639-48c4-90cb-3ba82450c613",
    "device": {
        "os": "",
        "browser": "",
        "ip": "",
        "location": "?"
    },
    "updated": "2023-10-13T01:22:33.352Z",
    "created": "2023-10-13T01:22:33.352Z"
}
```


### Revolk Session by ID
`DELETE:/session/[id]` ***[Client Basic Auth Required](#client-authenication)*** \
Revolk the session for a specific sessionID of the current user. If this is the
current session will log the user out.
```json5
// Example Request URL
// /session/b81d9a79-936a-4f95-b402-530321952393
```


### Get Profile
`GET:/profile/` ***[Client Basic Auth Required](#client-authenication)*** \
Get user's profile information for the current session. The avatar is in base64
image format with the format `data:image/png;base64,` prepending it. The pending
emails are emails that have yet to be verified. While the previous emails are 
the emails that have been removed and are no longer connected to your account.
```json5
// Example Response
{
    "id": "f09496bc-ed7f-4e11-8f33-f610c5bbcabc",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAA....",
    "name": {
        "first": "",
        "last": ""
    },
    "email": {
        "primary": "bob@example.com",
        "active": [
            "bob@example.com"
        ],
        "pending": [{
            "email": "bob2@example.com",
            "update": "2023-10-13T01:22:33.352Z"
        }],
        "previous": [{
            "email": "notbob@example.com",
            "update": "2023-10-13T01:22:33.352Z"
        }]
    },
    "metadata": {},
    "isAdmin": false
}
```


### Update Profile
`POST:/profile/` ***[Client Basic Auth Required](#client-authenication)*** \
Update user's profile information for the current session. You are unable to
update any email details using this API. The avatar is
in base64 image format with the format `data:image/png;base64,` prepending it.
Additionally, the metadata must conform to the scehema defined in
the [config](#configuration).
```json5
// Example Request
{
    "avatar": "data:image/png;base64,iVBORw0KGgoAAA....",
    "name": {
        "first": "Bob",
        "last": "Smith"
    },
    "metadata": {}
}
```


### Delete Profile
`DELETE:/profile/` ***[Client Basic Auth Required](#client-authenication)*** \
Delete user's profile. This will remove all related user data including the
metadata and sessions, while also loging out the user.


### Add Email
`POST:/profile/[email]` ***[Client Basic Auth Required](#client-authenication)*** \
Add a new email address to your account.
```json5
// Example Request
// /profile/bob2@gmail.com
```


### Remove Email
`DELETE:/profile/[email]` ***[Client Basic Auth Required](#client-authenication)*** \
Remove an email address from your account.
```json5
// Example Request
// /profile/bob2@gmail.com
```


### Set Primary Email
`POST:/profile/[email]/primary` ***[Client Basic Auth Required](#client-authenication)*** \
Set a new primary email address for you account. Must be an already active email.
```json5
// Example Request
// /profile/bob2@gmail.com/primary
```


### Verify New Email
`POST:/profile/[email]/verify` ***[No Auth Required](#endpoint-authenication)*** \
Verify a new email address. Must pass the `secret` along in the body.
```json5
// Example Request
// /profile/bob2@gmail.com/verify
{
    "secret": "..."
}
```


### Get Specific Users Profile
`GET:/user/[id or email]` ***[Client Basic Auth Required](#client-authenication)*** \
Get another user's profile by userID or email address. For example you could
use either `/user/f09496bc-ed7f-4e11-8f33-f610c5bbcabc` or `/user/bob@example.com`.
```json5
// Example Response
{
    "id": "f09496bc-ed7f-4e11-8f33-f610c5bbcabc",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAA....",
    "name": {
        "first": "Bob",
        "last": "Smith"
    },
    "email": {
        "primary": "bob@example.com",
        "active": [
            "bob@example.com"
        ],
        "pending": [{
            "email": "bob2@example.com",
            "update": "2023-10-13T01:22:33.352Z"
        }],
        "previous": [{
            "email": "notbob@example.com",
            "update": "2023-10-13T01:22:33.352Z"
        }]
    },
    "metadata": {}
}
```


### Admin Get Settings
`GET:/admin/settings` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Get the Authical settings. This includes branding, session config, and email
templates.
```json5
// Example Response
{
    "branding": {
        "product": "Authical",
        "company": "Sellers LLC",
        "logo": "https://dummyimage.com/128x128/0475FF/FFFFFF/?text=%20%20Authical%20",
        "theme": {
            "light": {
                "primaryBackground": "#148FF5",
                "primaryForeground": "#FFFFFF",
                "secondaryBackground": "#000000",
                "secondaryForeground": "#FFFFFF"
            },
            "dark": {
                "primaryBackground": "#148FF5",
                "primaryForeground": "#FFFFFF",
                "secondaryBackground": "#FFFFFF",
                "secondaryForeground": "#000000"
            }
        },
        "authicalBranding": true
    },
    "admins": [],
    "account": {
        "whitelist": {
            "enable": false,
            "emails": []
        },
        "blacklist": {
            "enable": false,
            "emails": []
        },
        "ttl": {
            "otp": 600,
            "session": 2073600,
            "pendingEmail": 86400
        },
        "maxLoginAttempts": 3,
        "defaultAvatar": "data:image/png;base64,iVBORw0KGgoA...."
    },
    "emailTemplates": {
        "signup": {
            "title": "Welcome to {{branding.product}}! - One Time Password",
            "body": "...html..."
        },
        "signin": {
            "title": "Sign in to {{branding.product}}! - One Time Password",
            "body": "...html..."
        },
        "approveNewEmail": {
            "title": "Verify your email for {{branding.product}}",
            "body": "...html..."
        },
        "removeEmail": {
            "title": "Your email was removed for {{branding.product}}",
            "body": "...html..."
        },
        "changePrimaryEmail": {
            "title": "Your email was updated for {{branding.product}}",
            "body": "...html..."
        }
    }
}
```


### Admin Update Settings
`POST:/admin/settings` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Update the Authical settings. This includes branding, session config, and email
templates. These settings must conform with the settings schema.
```json5
// Example Request
{
    "branding": {
        "product": "Authical",
        "company": "Sellers LLC",
        "logo": "https://dummyimage.com/128x128/0475FF/FFFFFF/?text=%20%20Authical%20",
        "theme": {
            "light": {
                "primaryBackground": "#148FF5",
                "primaryForeground": "#FFFFFF",
                "secondaryBackground": "#000000",
                "secondaryForeground": "#FFFFFF"
            },
            "dark": {
                "primaryBackground": "#148FF5",
                "primaryForeground": "#FFFFFF",
                "secondaryBackground": "#FFFFFF",
                "secondaryForeground": "#000000"
            }
        },
        "authicalBranding": true
    },
    "admins": [],
    "account": {
        "whitelist": {
            "enable": false,
            "emails": []
        },
        "blacklist": {
            "enable": false,
            "emails": []
        },
        "ttl": {
            "otp": 600,
            "session": 2073600,
            "pendingEmail": 86400
        },
        "maxLoginAttempts": 3,
        "defaultAvatar": "data:image/png;base64,iVBORw0KGgoA...."
    },
    "emailTemplates": {
        "signup": {
            "title": "Welcome to {{branding.product}}! - One Time Password",
            "body": "...html..."
        },
        "signin": {
            "title": "Sign in to {{branding.product}}! - One Time Password",
            "body": "...html..."
        },
        "approveNewEmail": {
            "title": "Verify your email for {{branding.product}}",
            "body": "...html..."
        },
        "removeEmail": {
            "title": "Your email was removed for {{branding.product}}",
            "body": "...html..."
        },
        "changePrimaryEmail": {
            "title": "Your email was updated for {{branding.product}}",
            "body": "...html..."
        }
    }
}
```


### Admin Get Logs
`GET:/admin/log` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Get logs from authical console about RESTful requests. Specify the log page with
the URL paramater `page`. For example get the 1st page with `/admin/log?page=0`
and get the 10th page with `/admin/log?page=9`.
```json5
[
    {
        "timestamp": "2023-10-26T02:49:22.527Z",
        "event": "http://localhost:3000/admin/log?page=0",
        "message": "user: 97ce3baf-1460-462e-9fb6-55f7579c8c04, session: 97ce3baf-1460-462e-9fb6-55f7579c8c04"
    },
    {
        "timestamp": "2023-10-26T02:49:21.973Z",
        "event": "http://localhost:3000/admin/log?page=1",
        "message": "user: 97ce3baf-1460-462e-9fb6-55f7579c8c04, session: 97ce3baf-1460-462e-9fb6-55f7579c8c04"
    },
    {
        "timestamp": "2023-10-26T02:49:19.218Z",
        "event": "http://localhost:3000/admin/log?page=2",
        "message": "user: 97ce3baf-1460-462e-9fb6-55f7579c8c04, session: 97ce3baf-1460-462e-9fb6-55f7579c8c04"
    }
]
```


### Admin Get Profile
`GET:/admin/user/[id or email]` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Get user's profile by userID or email address. For example you could
use either `/user/f09496bc-ed7f-4e11-8f33-f610c5bbcabc` or `/user/bob@example.com`.
One notable difference between this API and [Get Profile](#get-profile) is that
this API exposes the secrets for pending email addresses.
```json5
// Example Response
{
    "id": "f09496bc-ed7f-4e11-8f33-f610c5bbcabc",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAA....",
    "name": {
        "first": "",
        "last": ""
    },
    "email": {
        "primary": "bob@example.com",
        "active": [
            "bob@example.com"
        ],
        "pending": [{
            "email": "bob2@example.com",
            "update": "2023-10-13T01:22:33.352Z",
            "secret": "HELLO"
        }],
        "previous": [{
            "email": "notbob@example.com",
            "update": "2023-10-13T01:22:33.352Z",
            "secret": "HELLO"
        }]
    },
    "isAdmin": false,
    "metadata": {}
}
```


### Admin Update Profile
`POST:/admin/user/[id or email]` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Update user's profile by userID or email address. For example you could
use either `/user/f09496bc-ed7f-4e11-8f33-f610c5bbcabc` or `/user/bob@example.com`.
You can the update any data you desire and it will override the stored data.
The only requirement is that the data is valid profile schema and all the email
addresses are available. The metadata provided must conform to metadata schema
set by the [config](#configuration).
```json5
// Example Request
{
    "id": "f09496bc-ed7f-4e11-8f33-f610c5bbcabc",
    "avatar": "data:image/png;base64,iVBORw0KGgoAAA....",
    "name": {
        "first": "",
        "last": ""
    },
    "email": {
        "primary": "bob@example.com",
        "active": [
            "bob@example.com"
        ],
        "pending": [{
            "email": "bob2@example.com",
            "update": "2023-10-13T01:22:33.352Z",
            "secret": "werwer"
        }],
        "previous": [{
            "email": "notbob@example.com",
            "update": "2023-10-13T01:22:33.352Z",
            "secret": "werwer"
        }]
    },
    "metadata": {}
}
```


### Admin Delete Profile
`DELETE:/admin/user/[id or email]` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Delete user's profile. This will remove all related user data including the
current OTPs and sessions, while also loging out the user.


### Admin Get All Tokens
`GET:/admin/token` ***[Client Admin Auth Required](#client-authenication)*** \
Get all active API tokens. This is not accessable using a machine token.
```json5
// Example Response
[
    {
        "id": "ec0156fa-877a-4da0-b0d6-ac354c0f8483",
        "description": "The Test Token"
    },
    {
        "id": "fd822326-8b0b-4fef-971f-c4c5cf9a1e90",
        "description": "Test 2"
    }
]
```


### Admin Add Token
`GET:/admin/token` ***[Client Admin Auth Required](#client-authenication)*** \
Get all active API tokens. This is not accessable using a machine token. Will
return the new tokens ID and secret. This is the only time the token will be able
to be accessed.
```json5
// Example Request
{
    "description": "The Test Token"
}

// Example Reponse
{
    "id": "fd822326-8b0b-4fef-971f-c4c5cf9a1e90",
    "secret": "...",
    "description": "The Test Token"
}
```


### Admin Get Token
`GET:/admin/token/[tokenID]` ***[Client Admin Auth Required](#client-authenication)*** \
Get specific token by token ID. This is not accessable using a machine token.
```json5
// Example Reponse
{
    "id": "fd822326-8b0b-4fef-971f-c4c5cf9a1e90",
    "description": "The Test Token"
}
```


### Admin Delete Token
`DELETE:/admin/token/[tokenID]` ***[Client Admin Auth Required](#client-authenication)*** \
Delete specific token by token ID. This is not accessable using a machine token.
```json5
// Example Request
// /admin/token/fd822326-8b0b-4fef-971f-c4c5cf9a1e90
```


### Admin Session Verify
`POST:/admin/session/verify` ***[Client Admin Auth Required](#client-authenication)*** or ***[Machine Auth Required](#machine-authenication)*** \
Verify a user session by bearer token and return the UserID and the sessionID.
If the session is not valid will return `undefined`.
```js
// Example Request
{
    "bearer": "bearer ...."
}

// Example Reponse 1
undefined

// Example Response 2
[
    "userID",
    "sessionID"
]
```
