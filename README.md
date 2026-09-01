# QuizForge

QuizForge is a quiz and testing web application built with React, TypeScript, Vite, and Tailwind CSS. It provides a complete interface for creating an account, taking timed quizzes, reviewing results, tracking previous attempts, and comparing performance on a leaderboard.

The application communicates with a NestJS backend through a REST API.

## Live Demo

[QuizForge](https://quizapp-three-iota.vercel.app/)

## Features

### Authentication

* User registration
* User login
* Persistent authentication using an access token
* Automatic session restoration
* Automatic logout when the authentication session expires
* Protected routes for authenticated users
* Separate access control for administrator pages

### Dashboard

The dashboard provides an overview of the user's quiz activity, including:

* Total quizzes taken
* Average score
* Best score
* Current leaderboard rank
* Recommended quizzes
* Leaderboard preview
* Recent quiz attempts

### Quiz Browsing

Users can browse available quizzes and:

* Search quizzes by title, description, or category
* Filter quizzes by category
* Filter quizzes by difficulty
* Sort quizzes by newest, title, number of questions, or difficulty
* View individual quiz details before starting

### Quiz Taking

The quiz interface supports:

* Multiple questions
* Multiple answer choices
* Question navigation
* Answer selection
* Question progress tracking
* Timed quizzes
* Automatic submission when the timer expires
* Submission confirmation
* Handling of unanswered questions

### Results and Review

After submitting a quiz, users can view:

* Overall percentage
* Number of correct answers
* Number of incorrect answers
* Number of unanswered questions
* Points earned
* Total possible points
* Time taken
* Individual question review
* Selected answers
* Correct answers
* Explanations where available

Users can also retry a quiz or return to the quiz list.

### Attempt History

The history page displays previous attempts with information such as:

* Quiz name
* Date
* Score
* Correct answers
* Answered questions
* Incorrect answers
* Unanswered questions
* Time taken
* Whether an attempt is still in progress

Completed attempts can be opened to review their results.

### Leaderboard

The leaderboard displays user performance rankings, including:

* Rank
* User name
* Best score
* Average score
* Number of tests taken

The current user's position is highlighted when applicable.

### Profile

The profile page displays:

* User name
* Email address
* Total tests taken
* Average score
* Best score
* Current rank
* Recent activity

### Admin Quiz Management

Users with the `admin` role have access to an administration area for managing quiz content.

Administrators can:

* Create quizzes
* Edit quizzes
* Delete quizzes
* Set quiz titles
* Set descriptions
* Set categories
* Set difficulty
* Set time limits
* Add questions
* Edit questions
* Delete questions
* Add and remove answer choices
* Mark the correct answer
* Set question points
* Add explanations

The frontend requires exactly one correct answer when saving a question.

## Tech Stack

### Frontend

* React 19
* TypeScript
* Vite
* React Router
* Tailwind CSS
* Axios
* Lucide React
* clsx

### Development Tools

* ESLint
* Vite React plugin
* Tailwind CSS Vite plugin

The versions currently defined in `package.json` can be found there and should be treated as the source of truth.

## Project Structure

```text
quiz_frontend/
├── public/
│   ├── favicon.svg
│   └── icons.svg
│
├── src/
│   ├── api/
│   │   ├── admin.ts
│   │   ├── attempts.ts
│   │   ├── auth.ts
│   │   ├── client.ts
│   │   ├── leaderboard.ts
│   │   └── quizzes.ts
│   │
│   ├── assets/
│   │
│   ├── types/
│   │   └── index.ts
│   │
│   ├── App.tsx
│   ├── index.css
│   ├── main.tsx
│   └── vite-env.d.ts
│
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── vercel.json
└── vite.config.js
```

The API layer is separated into modules for authentication, quizzes, attempts, leaderboard functionality, and administration.

## Getting Started

### Prerequisites

Before running the project, make sure you have:

* Node.js — **[ADD REQUIRED NODE.JS VERSION]**
* npm
* Access to the application's backend API

> The repository does not currently specify a required Node.js version, so the version should be added here once one is established.

### Installation

Clone the repository:

```bash
git clone https://github.com/loixrang/quiz_frontend.git
```

Move into the project directory:

```bash
cd quiz_frontend
```

Install the dependencies:

```bash
npm install
```

### Environment Variables

The project uses the `VITE_API_URL` environment variable to specify the backend API URL.

Create a `.env` file in the project root:

```env
VITE_API_URL=YOUR_BACKEND_API_URL
```

The repository includes a `.env.example` file containing the current backend API configuration. The application also has a fallback API URL in the API client.

Do not commit private environment variables or secrets to the repository.

### Run the Development Server

Start the Vite development server:

```bash
npm run dev
```

Vite will provide the local development URL in the terminal.

### Build for Production

Create a production build with:

```bash
npm run build
```

### Preview the Production Build

To preview the production build locally:

```bash
npm run preview
```

### Lint the Project

Run ESLint with:

```bash
npm run lint
```

These scripts are defined in the project's `package.json`.

## API Integration

The frontend communicates with the backend using Axios.

The API client:

* Uses `VITE_API_URL` as the base URL
* Stores the authentication token in `localStorage`
* Sends the token using the `Authorization: Bearer <token>` header
* Handles common HTTP errors
* Automatically clears the stored token when a `401 Unauthorized` response is received
* Dispatches an authentication-expired event so the application can log the user out

### Authentication Endpoints

The frontend currently communicates with:

```text
POST /auth/signup
POST /auth/login
GET  /users/me
```

### Quiz Endpoints

```text
GET /quizzes
GET /quizzes/:id
```

### Attempt Endpoints

```text
POST /attempts/quiz/:quizId/start
POST /attempts/:attemptId/submit
GET  /attempts/history
GET  /attempts/:attemptId
GET  /attempts/leaderboard
```

### Admin Endpoints

The frontend also uses administrative endpoints for quiz, question, and answer management, including creating, updating, and deleting these resources.

## Application Routes

| Route                 | Description         | Access        |
| --------------------- | ------------------- | ------------- |
| `/`                   | Landing page        | Public        |
| `/login`              | Login page          | Public        |
| `/signup`             | Registration page   | Public        |
| `/dashboard`          | User dashboard      | Authenticated |
| `/quizzes`            | Browse quizzes      | Authenticated |
| `/quizzes/:id`        | Quiz details        | Authenticated |
| `/quiz/:id/take`      | Take a quiz         | Authenticated |
| `/results/:attemptId` | View quiz results   | Authenticated |
| `/history`            | Attempt history     | Authenticated |
| `/leaderboard`        | Global leaderboard  | Authenticated |
| `/profile`            | User profile        | Authenticated |
| `/admin`              | Quiz administration | Admin         |
| `*`                   | Not-found page      | Public        |

The routes and their authentication guards are defined in `src/App.tsx`.

## Authentication and Authorization

The application uses two route protection mechanisms:

* **Protected routes** require an authenticated user.
* **Admin-protected routes** require an authenticated user whose role is `admin`.

Authentication state is maintained through React context, while the access token and user information are stored in browser `localStorage`.

## Styling

The project uses Tailwind CSS for styling.

Tailwind is integrated through the Vite plugin, and the project imports Tailwind through `src/index.css`.

The application uses an Inter-based font stack and a light interface built around slate, violet, emerald, amber, and rose UI colors.

## Deployment

The project includes a `vercel.json` configuration with a rewrite that sends routes to `index.html`. This allows the React Router application to handle client-side routes correctly when deployed to Vercel.

### Vercel

To deploy the project to Vercel:

1. Import the repository into Vercel.
2. Set the required environment variable:

```text
VITE_API_URL
```

3. Deploy the project.

The exact production deployment configuration may depend on the Vercel project settings.

## Backend

The frontend communicates with a backend API.

Backend API:

```text
https://quiz-backend-rab3.onrender.com/
```

Backend repository:

```text
[ADD BACKEND REPOSITORY LINK]
```

Backend documentation:

```text
[ADD BACKEND DOCUMENTATION LINK IF AVAILABLE]
```

The backend URL is currently present in the project's environment example and API client.


## Development Notes

The main application logic is currently organized in `src/App.tsx`, while API communication is separated into the files under `src/api/`. Shared application data structures are defined in `src/types/index.ts`.

The application uses React Router's `BrowserRouter` and defines its routes directly in the main application component.

## Known Information to Complete

The following information is not explicitly defined in the repository and should be added manually:

* **Author:** [ADD AUTHOR NAME]
* **Backend repository:** [ADD BACKEND REPOSITORY LINK]
* **Required Node.js version:** [ADD NODE.JS VERSION]
* **License:** [ADD LICENSE]
* **Screenshots:** [ADD SCREENSHOTS]
* **Backend documentation:** [ADD DOCUMENTATION LINK]
* **Project description/organization:** [ADD ADDITIONAL PROJECT CONTEXT IF NEEDED]

## License

This project is licensed under the **MIT** license.

See the `LICENSE` file for more information.

## Author

**Edidiong Reuben**

* GitHub: https://github.com/Edidiong222
