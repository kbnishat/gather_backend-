# Event Management Portal API Guide

## Base URL

Local development:

```text
http://localhost:3000/api/v1
```

Replace the host with the deployed backend host in production.

## Authentication

Protected requests use the access token returned by login:

```http
Authorization: Bearer <accessToken>
Content-Type: application/json
```

The refresh token is also set as an HTTP-only cookie named `refreshToken`. Browser clients must send credentials for login, refresh, and logout:

```js
fetch(`${API_URL}/auth/login`, {
  method: "POST",
  credentials: "include",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
```

Axios equivalent:
Content type: `multipart/form-data`

Upload the image in a form field named `image`. Other form fields:

```text
title       = Technology Meetup 2026
subtitle    = Build, learn, and connect
date        = 2026-10-15T10:00:00.000Z
location    = Dhaka Convention Center
description = A full-day event for technology enthusiasts.
image       = <image file>
```

```json
{
  "success": true,
  "message": "...",
  "data": {
    "data": {}
  }
}
```

## Roles

- `user`: register, log in, view events, register for events, save events, view saved events
- `admin`: manage events, view registrations, view dashboard
- `super_admin`: all admin permissions and create admins

## Authentication Endpoints

### Register user

`POST /auth/register` - public

```json
{
  "password": "user123456",
  "name": "Nishat Rahman",
  "email": "nishat@example.com",
  "dateOfBirth": "2000-05-15",
```js
const formData = new FormData();
formData.append("title", "Updated Technology Meetup");
formData.append("date", "2026-10-20T10:00:00.000Z");
formData.append("location", "Updated location");
formData.append("image", replacementImageFile); // optional

const response = await fetch(`${API_URL}/events/${eventId}`, {
  method: "PATCH",
  headers: { Authorization: `Bearer ${accessToken}` },
  credentials: "include",
  body: formData,
});
```

The replacement image is uploaded to Cloudinary and the event's `image` value is updated to the new `secure_url`.
`gender` must be `male`, `female`, or `other`. `dateOfBirth` is optional and must be in the past.

### Login

`POST /auth/login` - public

Use either `email` or `id`.

```json
{
  "email": "nishat@example.com",
  "password": "user123456"
}
```

Successful login returns `accessToken`, `refreshToken`, and `user`. Store the access token in the frontend and send it in the Authorization header. The refresh token is also set as an HTTP-only cookie.

### Refresh access token

`POST /auth/refresh-token` - public

No JSON body. Send credentials so the browser includes the refresh-token cookie. Returns a new `accessToken`.

### Logout

`POST /auth/logout` - public

No JSON body. Send credentials so the refresh-token cookie can be cleared.

### Change password

`POST /auth/change-password` - authenticated user/admin/super admin

```json
{
  "oldPassword": "user123456",
  "newPassword": "newPassword123"
}
```

## User Profile and User Administration

### Get current profile

`GET /users/get-my-profile` - authenticated

### Update my profile

`PATCH /users/update-my-profile` - authenticated user, admin, or super admin

The same endpoint is used for both regular users and admins. The profile is selected from the access token, so no user ID is required.

Content type: `multipart/form-data`. Use the `image` field for an optional profile image upload. The image is uploaded to Cloudinary and saved as `profileImage`.

```json
{
  "name": "Updated Name",
  "dateOfBirth": "2000-05-15",
  "phone": "01812345678",
  "gender": "female",
  "otherDetails": "Updated profile details",
  "image": "<profile image file>"
}
```

All fields are optional, but at least one field is required. Email, password, role, status, and user ID cannot be changed through this endpoint.

### Get all users

`GET /users/get-all-users` - admin or super admin

### Get one user

`GET /users/get-user/:id` - admin or super admin

### Update user

`PATCH /users/update-user/:id` - admin or super admin

Use the fields supported by the user model, for example:

```json
{
  "name": "Updated Name",
  "phone": "01812345678",
  "gender": "female",
  "otherDetails": "Updated details"
}
```

## Admin Management

### Create admin

`POST /admins/create-admin` - super admin only

```json
{
  "password": "admin123456",
  "name": "Event Manager",
  "email": "manager@example.com",
  "phone": "01711111111"
}
```

The creating account must have the `super_admin` role.

## Event Endpoints

### List events

`GET /events` - public

Returns non-deleted events ordered by event date.

### Get one event

`GET /events/:id` - public

### Create event

`POST /events` - admin or super admin

```json
{
  "title": "Technology Meetup 2026",
  "subtitle": "Build, learn, and connect",
  "image": "https://example.com/images/technology-meetup.jpg",
  "date": "2026-10-15T10:00:00.000Z",
  "location": "Dhaka Convention Center",
  "description": "A full-day event for technology enthusiasts."
}
```

Required fields: `title`, `date`, and `location`. `subtitle`, `image`, and `description` are optional. The image must be a valid URL.

### Update event

`PATCH /events/:id` - admin or super admin

Send one or more event fields:

```json
{
  "title": "Updated Technology Meetup",
  "date": "2026-10-20T10:00:00.000Z",
  "location": "Updated location"
}
```

### Delete event

`DELETE /events/:id` - admin or super admin

This is a soft delete. Deleted events no longer appear in the public event list or saved-event details.

## Event Registration Endpoints

### Register for an event

`POST /event-registrations` - authenticated

```json
{
  "eventId": "EVENT_ID"
}
```

A user can register only once for the same event.

### Get my registrations

`GET /event-registrations/mine` - authenticated

Returns the signed-in user's registrations with populated event details.

### Cancel my registration

`DELETE /event-registrations/:eventId` - authenticated

### View all event registrations

`GET /event-registrations` - admin or super admin

Returns registered users and their events.

### View registrations for one event

`GET /event-registrations/event/:eventId` - admin or super admin

Returns the event, total registration count, and each registered user's name, email, phone, gender, and profile image.

Example response data:

```json
{
  "event": { "_id": "EVENT_ID", "title": "Technology Meetup 2026" },
  "registrationCount": 2,
  "registrations": [
    {
      "registeredAt": "2026-09-16T10:00:00.000Z",
      "user": {
        "id": "USER_ID",
        "name": "Nishat Rahman",
        "email": "nishat@example.com",
        "phone": "01712345678",
        "gender": "other",
        "profileImage": "https://res.cloudinary.com/..."
      }
    }
  ]
}
```

### Dashboard counts

`GET /event-registrations/dashboard` - admin or super admin

Returns counts such as:

```json
{
  "users": 120,
  "admins": 4,
  "events": 18,
  "registrations": 245,
  "upcomingEvents": 7
}
```

## Saved Event Endpoints

### Save an event

`POST /saved-events` - authenticated

```json
{
  "eventId": "EVENT_ID"
}
```

A user can save an event only once. The save belongs to the currently authenticated user.

### Get my saved events

`GET /saved-events/mine` - authenticated

Returns the signed-in user's saved events with populated event details, newest saved event first.

### Get one saved event

`GET /saved-events/:eventId` - authenticated

Returns the event only if the currently authenticated user saved it.

### Remove a saved event

`DELETE /saved-events/:eventId` - authenticated

## Frontend Request Helper

```js
async function apiRequest(path, options = {}) {
  const response = await fetch(`http://localhost:3000/api/v1${path}`, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...(options.headers || {}),
    },
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Request failed");
  return result;
}
```

For deployed frontend builds, define the base URL as an environment variable instead of hard-coding localhost, for example `VITE_API_URL` or `NEXT_PUBLIC_API_URL`.
