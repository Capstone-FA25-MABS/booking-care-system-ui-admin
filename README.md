# Booking Care System - Admin UI

This project is the Admin User Interface (UI) for the Booking Care System. It provides administrative features for managing users, appointments, doctors, and system settings.

## Features

- **User Management:** Create, update, and delete user accounts.
- **Doctor Management:** Add and manage doctor profiles and schedules.
- **Appointment Management:** View, approve, or cancel patient appointments.
- **System Settings:** Configure system-wide settings and preferences.
- **Dashboard:** Overview of system statistics and recent activities.

## Getting Started

### Prerequisites

- Node.js (version X.X.X or higher)
- npm or yarn

### Installation

1. Clone the repository:
    ```bash
    git clone https://github.com/Capstone-FA25/booking-care-system-ui-admin.git
    ```
2. Navigate to the project directory:
    ```bash
    cd booking-care-system-ui-admin
    ```
3. Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Application

1. Start the development server:
    ```bash
    npm run dev
    ```
2. Open your browser and navigate to `http://localhost:5174`

### Running Tests

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

## Code Quality & Standards

This project enforces high code quality standards using multiple tools:

### SonarCloud Integration

- **Automated Code Analysis:** Every PR is analyzed for bugs, vulnerabilities, and code smells
- **Quality Gates:** PRs must pass quality gates before merging
- **Coverage Requirements:** Minimum 70% test coverage required
- **Security Scanning:** Automatic detection of security vulnerabilities

**Setup:** See [SonarCloud Setup Guide](./docs/SONARCLOUD_SETUP.md) for detailed configuration instructions.

### Quality Metrics

| Metric          | Requirement | Description                |
| --------------- | ----------- | -------------------------- |
| Coverage        | ≥ 70%       | Test coverage for all code |
| Reliability     | A Rating    | No bugs in new code        |
| Security        | A Rating    | No vulnerabilities         |
| Maintainability | A Rating    | Minimal technical debt     |
| Duplication     | ≤ 3%        | Low code duplication       |

### Development Workflow

1. **Pre-commit Checks:**
    - ESLint for code linting
    - Prettier for code formatting
    - TypeScript type checking

2. **Pull Request Checks:**
    - All pre-commit checks
    - Unit tests with coverage
    - SonarCloud analysis
    - Build verification

3. **Quality Gate Rules:**
    - ✅ Tests pass
    - ✅ Coverage ≥ 70%
    - ✅ No new bugs/vulnerabilities
    - ✅ Code style compliance

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting
npm test             # Run tests
npm run test:coverage # Run tests with coverage
npm run test:ui      # Run tests with UI
```
