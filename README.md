# Lyceum LMS Front-End

**Note:** This `secure` branch represents the default, monolithic architecture of the Lyceum LMS frontend which was favored for downstream AWS deployment requirement. For the microservice-architected version, please refer to the `SOA` branch.

This repository contains the official frontend for the Lyceum Learning Management System (LMS). It is a 100% client-side **React** single-page application (SPA) that provides a modern, responsive user interface for all three system roles: Administrators, Instructors, and Students.

This application is stateless and communicates with a distributed backend via secure REST APIs. It provides role-specific views and workflows based on the authenticated user's credentials.

-----

## High-Level Architecture

The front end is built as a **single-page application (SPA)** with:

  * **React** for component-based UI
  * **React Router** for client-side routing
  * **Fetch-based API client** for backend communication
  * **Role-aware navigation** that adjusts available views and actions based on authenticated user role

Key characteristics:

  * **Role-based layout** – core screens grouped by persona (Admin, Instructor, Student)
  * **API-driven data** – all stateful data is sourced from backend endpoints
  * **Targets distinct microservices** – explicitly routes requests to the correct backend service (Registrar or Gradebook)

-----

## Features & Core Components

This UI provides distinct portals for each user role. The components a user can access are determined by their role, which is provided by the backend after a successful login.

### Common Components

  * **Login.js:** Handles user authentication by capturing credentials and sending them to the backend.
  * **Logout.js:** Clears the user's session and authentication token.

### Student Experience

  * **CourseEnroll:** View open sections and enroll in/drop them (subject to backend rules).
  * **ScheduleView:** View current schedule by term.
  * **AssignmentsStudentView:** View assignments and scores.
  * **Transcript:** View transcript-style history of completed courses and final grades.

### Instructor Experience

  * **InstructorSectionsView:** View assigned sections.
  * **AssignmentsView / AssignmentAdd / AssignmentUpdate:** Manage assignments per section (create, update, delete).
  * **AssignmentGrade:** Enter and update assignment-level scores (0-100) for all students.
  * **EnrollmentsView:** View student roster and enter/update final course grades.

### Administrator Experience

  * **Admin Portal:** A suite of components to:
      * Manage users (create, update, delete)
      * Manage courses (create, update, delete)
      * Manage sections (create, schedule, assign instructors)

All flows use backend APIs for validation (e.g., deadlines, duplication checks, permission checks).

-----

## Technology Stack

  * **React 18+** (for building the component-based UI)
  * **React Router** (for client-side routing)
  * **Vite** (for rapid dev server and optimized production bundling)
  * **JavaScript (ES6+) / JSX**
  * **HTML5 / CSS3**
  * **Material-UI** (for styling and UI components)
  * **Fetch API** (for all HTTP communication)
  * **Node.js & npm** (for tooling and dependency management)

-----

## System Architecture & Communication

A critical aspect of this frontend is its communication with a **distributed backend** composed of two separate microservices. The frontend is responsible for directing its API calls to the correct service.

API calls are routed to one of two different servers:

### 1\. Registrar Service (e.g., `http://localhost:8080`)

  * **Purpose:** Handles identity, catalog, and enrollment.
  * **Used for:**
      * User Login (`/login`)
      * All Admin functions (managing Users, Courses, Sections)
      * Student Enrollment
      * Student Schedule & Transcripts
      * Receiving final grade data

### 2\. Gradebook Service (e.g., `http://localhost:8081`)

  * **Purpose:** Handles all academic and grading activities.
  * **Used for:**
      * All Assignment-related functions (CRUD)
      * All Assignment Grading functions
      * Submitting final course grades

The application code uses environment variables or a constants file (e.g., `Constants.js`) to define these base URLs (e.g., `VITE_REGISTRAR_API_URL` and `VITE_GRADEBOOK_API_URL`).

-----

## Security Integration

The front end integrates with JWT-based authentication provided by the backend.

1.  **Login flow**

      * User submits email + password (via `Login.js`) to the Registrar Service's `/login` endpoint.
      * Backend returns a JWT and role metadata.

2.  **Token handling**

      * Token stored in **`sessionStorage`**.
      * Attached as `Authorization: Bearer <token>` on subsequent API calls to *both* the Registrar and Gradebook services.

3.  **Role-aware UI**

      * Navigation and pages rendered based on the authenticated user’s role.
      * Protected views guarded client-side and enforced server-side.

4.  **Logout**

      * Client (`Logout.js`) clears the token from `sessionStorage` and user context.
      * User returned to login screen.

The backend remains the source of truth for authorization; unauthorized/forbidden responses trigger redirects or error displays.

**Example fetch call:**

```javascript
const jwt = sessionStorage.getItem('jwt');
// Example call to the Gradebook service
const response = await fetch(`${VITE_GRADEBOOK_API_URL}/assignments`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': jwt
  },
  body: JSON.stringify({ title, dueDate })
});
```

-----

## Setup & Local Development

### Prerequisites

  * **Node.js** (LTS recommended)
  * **npm** (bundled with Node)
  * **Crucially:** The Lyceum Backend Services (both the **Registrar** and **Gradebook**) must be running locally, e.g., on ports `8080` and `8081`.

### Steps

1.  **Clone repository**
    ```bash
    git clone https://github.com/Lyceum-LMS/Lyceum.git
    cd Lyceum
    ```
2.  **Install dependencies**
    ```bash
    npm install
    ```
3.  **Configure backend URLs for development**
    In the appropriate configuration file (e.g. `Constants.js` or `.env`):
    ```js
    export const VITE_REGISTRAR_API_URL = "http://localhost:8080";
    export const VITE_GRADEBOOK_API_URL = "http://localhost:8081";
    ```
4.  **Run the dev server**
    ```bash
    npm run dev
    ```
      * Opens the SPA (commonly at `http://localhost:5173`).
      * Ensure *both* backend services are running so API calls succeed.

### Test Credentials

The backend database is populated with test users.

  * **Admin:** `admin@csumb.edu` (password: `admin`)
  * **Instructor:** `dwisneski@csumb.edu` (password: `dwisneski2024`)
  * **Student:** `user@csumb.edu` (password: `user`)

-----

## Production Build & Deployment

To create an optimized, static production build:

```bash
npm run build
```

This command generates an optimized bundle (commonly in a `dist/` folder) containing the static `index.html` and minified JavaScript/CSS assets.

### Deployment Options

1.  **Bundled Deployment (Single Origin)**

      * Copy the `dist/` folder's contents into the `src/main/resources/static` directory of one of the Spring Boot backend services (e.g., the Registrar service).
      * The Spring Boot service will then serve the React application directly.
      * **Pros:** Single origin, no CORS complexity.

2.  **Static Hosting**

      * The contents of the `dist/` folder can be uploaded to any static web host (e.g., AWS S3 with CloudFront, Netlify, Vercel).
      * **Cons:** Requires backend services to be exposed separately and configured for CORS.

-----

## Testing & Quality

Quality practices for the front end include:

  * **Manual verification of core flows** with the backend
  * **Automated end-to-end tests** (e.g., Selenium or equivalent) that:
      * Launch the UI
      * Execute representative journeys (enrollment, assignment management, grading)
      * Assert visible outcomes and backend side effects

The UI is designed with stable element identifiers where appropriate to support automated testing.

-----

## Development Milestones

### Phase 1 – Requirements & Architecture Definition

  * Captured functional and non-functional requirements for the LMS.
  * Defined core roles and workflows.
  * Modeled domain entities: users, courses, sections, enrollments, assignments, grades.
  * Selected React SPA for the client and RESTful Spring Boot for the backend.

### Phase 2 – Core UI & API Integration

  * Implemented primary React views for administrator, instructor, and student roles.
  * Integrated with backend REST endpoints for:
      * User, course, and section management
      * Enrollment and gradebook operations
  * Formalized request/response contracts, status codes, and error handling.

### Phase 3 – UX Refinement & Data-Oriented Views

  * Introduced role-specific dashboards and navigation.
  * Added integrations for:
      * Open-section discovery
      * Consolidated schedule and transcript views
  * Simplified client logic by delegating validation and aggregation to the backend.

### Phase 4 – Testability & End-to-End Validation

  * Coordinated with backend tests to validate end-to-end scenarios.
  * Exposed stable hooks for automated browser-based tests.
  * Hardened error paths and boundary conditions based on integration results.

### Phase 5 – Service Boundary Alignment

  * Adapted configuration to support backend service decomposition (Registrar and Gradebook services).
  * Ensured UI correctly routes API calls to the appropriate service endpoint.
  * Formalized data contracts across both microservices.

### Phase 6 – Security Integration

  * Integrated JWT-based authentication:
      * Login view and token acquisition
      * Role-based rendering and guarded routes
  * Standardized token propagation for protected API calls.

### Phase 7 – Deployment-Ready Front End

  * Optimized build pipeline via Vite for production.
  * Integrated static bundle into backend deployment for simplified hosting.
  * Validat-ed compatibility with containerized and cloud-hosted environments.