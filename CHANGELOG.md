# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Services layer (authService, userService) for API calls
- Toast notification system with use-toast hook
- Toaster component for toast notifications
- Plans section to landing page

### Changed
- Refactored LoginForm, ForgotPasswordForm, ExpenseForm to pure components
- Moved state management to page components (login, forgot-password, expenses)
- Updated AuthContext to handle gateway response structure changes
- Updated landing page to include Plans section
- Updated settings components to use new service pattern
- Updated LandingCTA styling with gradient background

### Removed
- Stores (useAuthStore, usePlanLimitsStore, useTransactionsStore, etc.)
- Deprecated API files
- 'Ver Planos' button from LandingHero
- Old settings service in favor of new service pattern

### Fixed
- API response handling to match gateway structure
