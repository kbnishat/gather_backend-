# Verisity University API Documentation

## Base URL

```text
http://localhost:3000/api/v1
```

Successful responses use this general shape. Result fields are spread at the top level by the current response helper:

```json
{
  "success": true,
  "message": "...",
  "meta": {},
  "students": []
}
```

Send the access token on protected requests:

```http
Authorization: Bearer <accessToken>
```

For login, refresh, and logout, the frontend must enable credentials:

```js
fetch(url, { credentials: "include" })
```

Common list query parameters are `searchTerm`, `page`, `limit`, `sort`, and `fields`. Example:

```text
?searchTerm=computer&page=1&limit=10&sort=-createdAt
```

## Authentication

### Register a student

`POST /auth/register` - public

```json
{
  "password": "student123",
  "student": {
    "name": { "firstName": "Nishat", "middleName": "", "lastName": "Rahman" },
    "gender": "male",
    "dateOfBirth": "2002-05-15",
    "email": "student@example.com",
    "contactNo": "01712345678",
    "emergencyContactNo": "01812345678",
    "bloodGroup": "O+",
    "presentAddress": "Dhaka",
    "permanentAddress": "Dhaka",
    "guardian": {
      "fatherName": "Father Name",
      "fatherOccupation": "Business",
      "fatherContactNo": "01712345679",
      "motherName": "Mother Name",
      "motherOccupation": "Teacher",
      "motherContactNo": "01712345680"
    },
    "localGuardian": {
      "name": "Guardian Name",
      "occupation": "Service",
      "contactNo": "01712345681",
      "address": "Dhaka"
    },
    "admissionSemester": "<academicSemesterObjectId>",
    "academicDept": "<academicDepartmentObjectId>"
  }
}
```

The response includes the generated student ID. Registration creates an active student.

### Login

`POST /auth/login` - public

```json
{ "id": "2025010001", "password": "student123" }
```

Returns `accessToken`, `refreshToken`, and `user`, and sets the refresh-token cookie.

### Refresh access token

`POST /auth/refresh-token` - public

No JSON body. The browser must send the `refreshToken` cookie. Returns a new `accessToken`.

### Logout

`POST /auth/logout` - public

No body. Clears the refresh-token cookie.

### Change password

`POST /auth/change-password` - authenticated student, faculty, admin, or super admin

```json
{ "oldPassword": "old-password", "newPassword": "new-password" }
```

### Forgot password

`POST /auth/forget-password` - public

```json
{ "id": "2025010001" }
```

### Reset password

`POST /auth/reset-password` - authenticated user

```json
{ "id": "2025010001", "newPassword": "new-password" }
```

## Users and Profiles

### Create student by staff

`POST /users/create-student` - admin

Use `multipart/form-data`:

- `file`: optional profile image
- `data`: JSON string containing `{ "password": "...", "student": { ...student fields... } }`

### Current profile

`GET /users/get-my-profile` - authenticated user

### User administration

- `GET /users/get-all-users` - admin or super admin; list query parameters
- `GET /users/get-user/:id` - admin or super admin
- `PATCH /users/update-user/:id` - admin or super admin; body `{ "status": "active" }`
- `DELETE /users/delete-user/:id` - admin or super admin; soft delete
- `GET /users/get-all-deleted-users` - admin or super admin
- `PATCH /users/restore-deleted-users` - admin or super admin

Valid user statuses: `in-progress`, `active`, `inactive`, `pending`, `blocked`.

## Admin Management

- `POST /admins/create-admin` - admin only; multipart `file` plus `data` JSON `{ "password?": "...", "adminData": { ... } }`
- `GET /admins/get-all-admins` - admin only; list query parameters
- `GET /admins/get-admin/:id` - admin only
- `PATCH /admins/update-admin/:id` - admin only; JSON `{ "admin": { ...partial admin fields } }` or multipart with optional `file`
- `DELETE /admins/delete-admin/:id` - admin only; soft delete

Admin profile fields include `name`, `gender`, `dateOfBirth`, `email`, `contactNo`, `emergencyContactNo`, `bloodGroup`, `presentAddress`, and `permanentAddress`.

## Students

- `GET /students/get-all-students` - faculty, admin, super admin; list query parameters
- `GET /students/get-all-deleted-students` - admin or super admin
- `GET /students/get-student/:id` - faculty, admin, super admin
- `PATCH /students/update-student/:id` - faculty, admin, super admin
- `DELETE /students/delete-student/:id` - faculty, admin, super admin; soft delete
- `PATCH /students/restore-deleted-students` - admin or super admin

Student update JSON body:

```json
{
  "student": {
    "name": { "firstName": "Updated", "lastName": "Name" },
    "contactNo": "01712345678",
    "presentAddress": "Updated address"
  }
}
```

Student profile image updates use multipart form data with an optional `file` and a `data` JSON field containing the same `{ "student": { ... } }` structure.

## Academic Setup

### Academic semesters

- `POST /academic-semester/create-semester` - admin or super admin; body `{ name, code, year, startMonth, endMonth }`
- `GET /academic-semester/get-all-semesters` - list query parameters
- `GET /academic-semester/get-all-deleted-semesters`
- `GET /academic-semester/get-semester/:id`
- `PATCH /academic-semester/update-semester/:id` - admin or super admin; partial semester body
- `DELETE /academic-semester/delete-semester/:id` - admin or super admin
- `PATCH /academic-semester/restore-deleted-semesters` - admin or super admin

Valid semester names are `Autumn`, `Summer`, and `Fall`. Valid codes are `01`, `02`, and `03`.

### Academic faculties

- `POST /academic-faculty/create-academic-faculty` - admin or super admin; body `{ "name": "Science and Engineering" }`
- `GET /academic-faculty/get-all-academic-faculties` - list query parameters
- `GET /academic-faculty/get-academic-faculty/:id`
- `PATCH /academic-faculty/update-academic-faculty/:id` - admin or super admin; body `{ "name": "Updated name" }`
- `DELETE /academic-faculty/delete-academic-faculty/:id` - admin or super admin
- `GET /academic-faculty/get-all-deleted-academic-faculties`
- `PATCH /academic-faculty/restore-deleted-academic-faculties` - admin or super admin

### Academic departments

- `POST /academic-dept/create-academic-dept` - admin or super admin; body `{ "name": "Computer Science", "academicFaculty": "<facultyObjectId>" }`
- `GET /academic-dept/get-all-academic-depts` - list query parameters
- `GET /academic-dept/get-academic-dept/:id`
- `PATCH /academic-dept/update-academic-dept/:id` - admin or super admin; partial `{ name?, academicFaculty? }`
- `DELETE /academic-dept/delete-academic-dept/:id` - admin or super admin
- `GET /academic-dept/get-all-deleted-academic-depts`
- `PATCH /academic-dept/restore-deleted-academic-depts` - admin or super admin

## Courses

- `POST /courses/create-course` - admin or super admin
- `GET /courses/get-all-cources` - admin or super admin; list query parameters
- `GET /courses/get-course/:id` - admin or super admin
- `PATCH /courses/update-course/:id` - admin or super admin
- `DELETE /courses/delete-course/:id` - admin or super admin
- `PUT /courses/:courseId/assign-to-faculties` - admin or super admin; body `{ "faculties": ["<facultyId>"] }`
- `GET /courses/get-all-courses-assigned-to-faculty` - public
- `GET /courses/:courseId/get-assigned-faculties-by-course-id` - public
- `PUT /courses/:courseId/unassign-from-faculties` - admin or super admin; body `{ "faculties": ["<facultyId>"] }`
- `GET /courses/:facultyId/assigned-course-to-faculty` - admin or super admin

Course creation body:

```json
{
  "title": "Database Management Systems",
  "prefix": "CSE",
  "code": "305",
  "credit": 3,
  "prerequisiteCources": []
}
```

## Faculty

- `POST /faculty/create-faculty` - admin or super admin; multipart `file` plus `data` JSON `{ password?, facultyData }`
- `GET /faculty/get-all-faculties` - admin or super admin; list query parameters
- `GET /faculty/get-faculty/:id` - public
- `PATCH /faculty/update-faculty/:id` - admin or super admin; JSON or multipart
- `DELETE /faculty/delete-faculty/:id` - admin or super admin

Faculty data includes `name`, `email`, `experience`, `designation`, `contactNo`, `emergencyContactNo`, `gender`, `dateOfBirth`, `bloodGroup`, `presentAddress`, and `permanentAddress`.

## Semester Registration

- `POST /semister-registrations/create-semister-registration` - student, faculty, admin, or super admin
- `GET /semister-registrations/get-all-semister-registrations` - admin or super admin; list query parameters
- `GET /semister-registrations/get-semister-registration/:id` - admin or super admin
- `PATCH /semister-registrations/update-semister-registration/:id` - admin or super admin

Creation body:

```json
{
  "academicSemester": "<academicSemesterObjectId>",
  "status": "UPCOMING",
  "startDate": "2026-09-01",
  "endDate": "2026-12-31"
}
```

Valid statuses are uppercase: `UPCOMING`, `ONGOING`, and `COMPLETED`.

## Offered Courses

- `POST /offered-course/create-offered-course` - admin or super admin
- `GET /offered-course/get-my-offered-courses` - authenticated user; students receive courses available for their department
- `GET /offered-course/get-offered-course/:id` - authenticated user
- `PATCH /offered-course/update-offered-course/:id` - admin or super admin
- `DELETE /offered-course/delete-offered-course/:id` - admin or super admin

Creation body:

```json
{
  "semseterRegistration": "<registrationObjectId>",
  "academicDepartment": "<departmentObjectId>",
  "course": "<courseObjectId>",
  "faculty": "<facultyObjectId>",
  "maxCapacity": 40,
  "section": "A",
  "days": ["Sun", "Tue"],
  "startDate": "2026-09-01",
  "endDate": "2026-12-31"
}
```

The service validates semester dates, duplicate offerings, and faculty schedule conflicts.
The field name is intentionally `semseterRegistration` because that is the current backend contract.

## Enrolled Courses

- `POST /enrolled-course/create-enrolled-course` - student; body `{ "offeredCourse": "<offeredCourseObjectId>" }`
- `GET /enrolled-course/get-all-enrolled-courses` - admin or super admin; list query parameters
- `GET /enrolled-course/get-my-enrolled-courses` - student
- `GET /enrolled-course/get-enrolled-course/:id` - admin or super admin
- `PATCH /enrolled-course/update-enrolled-course/:id` - admin or super admin
- `DELETE /enrolled-course/delete-enrolled-course/:id` - student, admin, or super admin

Admin update body:

```json
{
  "semesterRegistration": "<registrationObjectId>",
  "offeredCourse": "<offeredCourseObjectId>",
  "student": "<studentObjectId>",
  "courseMarks": {
    "classTest1": 15,
    "midTerm": 25,
    "classTest2": 15,
    "finalExam": 35
  }
}
```

The enrollment delete route is currently registered, but its service does not remove the document. Do not show a successful deletion state until that backend behavior is fixed.

## Error format

Validation and authorization errors use this shape:

```json
{
  "success": false,
  "message": "Validation error",
  "error": [{ "path": "email", "message": "Invalid email address" }]
}
```

Common status codes: `400` validation/bad request, `401` missing or invalid authentication, `403` insufficient role, `404` missing resource, and `500` server error.
