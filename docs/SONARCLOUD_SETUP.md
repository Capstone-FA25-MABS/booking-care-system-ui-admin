# SonarCloud Integration Setup

This document explains how to set up SonarCloud integration for the booking care system admin UI project.

## Overview

SonarCloud integration provides:

- **Code Quality Analysis**: Detects bugs, vulnerabilities, and code smells
- **Coverage Reports**: Tracks test coverage metrics
- **Quality Gates**: Enforces quality standards before merging PRs
- **Security Analysis**: Identifies security hotspots and vulnerabilities
- **Maintainability**: Measures technical debt and code maintainability

## Setup Instructions

### 1. SonarCloud Project Setup

1. **Create SonarCloud Account**:
    - Go to [SonarCloud.io](https://sonarcloud.io)
    - Sign in with your GitHub account
    - Import your GitHub organization/repository

2. **Configure Project**:
    - Project Key: `booking-care-system-ui-admin`
    - Organization: `hiumx` (update this to match your organization)

### 2. GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

#### Required Secrets:

```
SONAR_TOKEN: Your SonarCloud token
```

#### How to get SONAR_TOKEN:

1. Go to SonarCloud → My Account → Security
2. Generate a new token
3. Copy the token
4. Add it to GitHub repository secrets

### 3. Quality Gate Rules

The project is configured with the following quality gate rules:

#### Coverage Requirements:

- **Overall Coverage**: ≥ 70%
- **New Code Coverage**: ≥ 80%
- **Lines to Cover**: All new lines must be covered

#### Code Quality Rules:

- **Reliability Rating**: A (no bugs)
- **Security Rating**: A (no vulnerabilities)
- **Maintainability Rating**: A (no code smells)
- **Duplicated Lines**: ≤ 3% on new code

#### Specific Thresholds:

```
Branches Coverage: ≥ 70%
Functions Coverage: ≥ 70%
Lines Coverage: ≥ 70%
Statements Coverage: ≥ 70%
```

### 4. Workflow Configuration

#### PR Checks Workflow:

- Runs on every pull request
- Performs code analysis
- Checks quality gate status
- **PR will fail if quality gate is not passed**

#### Preview/Main Branch Workflow:

- Runs on pushes to `develop` and `main` branches
- Generates comprehensive analysis reports
- Updates project metrics on SonarCloud

### 5. Exclusions and Inclusions

#### Excluded from Analysis:

- `src/assets/**` (static assets)
- `**/*.test.{ts,tsx}` (test files from coverage)
- `**/*.spec.{ts,tsx}` (spec files from coverage)
- `src/main.tsx` (entry point)
- `src/vite-env.d.ts` (type definitions)
- `src/declarations.d.ts` (declarations)
- `node_modules/**`
- `dist/**` and `build/**`

#### Test Files Configuration:

- Test files are analyzed for quality but excluded from coverage
- Located in: `src/**/*.{test,spec}.{ts,tsx}`

### 6. Local Development

#### Running Tests with Coverage:

```bash
# Run tests with coverage
npm run test:coverage

# View coverage report
open coverage/index.html
```

#### Running SonarCloud Locally (Optional):

```bash
# Install SonarScanner CLI
npm install -g sonarqube-scanner

# Run local analysis (requires SONAR_TOKEN)
sonar-scanner
```

### 7. Quality Gate Criteria

The workflow will **FAIL** if any of the following conditions are not met:

#### Blocking Conditions:

- ❌ Quality Gate status is "FAILED"
- ❌ Coverage drops below 70%
- ❌ New bugs are introduced
- ❌ New vulnerabilities are found
- ❌ Security hotspots are not reviewed
- ❌ Duplicated code exceeds 3%

#### Warning Conditions:

- ⚠️ Code smells in new code
- ⚠️ Technical debt ratio increases
- ⚠️ Cognitive complexity is high

### 8. Best Practices

#### For Developers:

1. **Write Tests**: Ensure new code has adequate test coverage
2. **Fix Issues Early**: Address SonarCloud issues before PR submission
3. **Review Security**: Address security hotspots promptly
4. **Reduce Complexity**: Keep functions and components simple
5. **Avoid Duplication**: Refactor duplicate code

#### For Code Reviews:

1. Check SonarCloud report before approving PRs
2. Ensure quality gate passes
3. Review security hotspots
4. Validate test coverage for new features

### 9. Troubleshooting

#### Common Issues:

**Quality Gate Fails**:

- Check coverage reports
- Review new bugs/vulnerabilities
- Fix code smells

**Token Issues**:

- Verify SONAR_TOKEN is correctly set
- Check token permissions
- Regenerate token if needed

**Coverage Issues**:

- Ensure tests are running correctly
- Check vitest configuration
- Verify lcov.info is generated

### 10. Integration with Pull Requests

#### PR Status Checks:

- ✅ **SonarCloud Analysis**: Code quality analysis
- ✅ **Quality Gate**: Pass/fail status
- ✅ **Coverage**: Test coverage metrics
- ✅ **Security**: Security vulnerability scan

#### PR Comments:

SonarCloud will automatically comment on PRs with:

- Quality gate status
- New issues found
- Coverage changes
- Security analysis results

## Customization

To modify quality gate rules:

1. Go to SonarCloud project → Project Settings → Quality Gates
2. Create custom quality gate or modify existing one
3. Update `sonar-project.properties` if needed

## Support

For issues with SonarCloud integration:

1. Check [SonarCloud Documentation](https://docs.sonarcloud.io)
2. Review GitHub Actions logs
3. Contact team lead for access issues
