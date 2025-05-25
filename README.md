# DebtCrusher

A debt management application that helps users track and manage their debts.

## Getting Started

### Prerequisites

- Node.js 16.x or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/thelokidev/DebtCrusher.git
cd DebtCrusher
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:9001

## Environment Variables

To run the application, you'll need to set up your environment variables:

1.  Create a new file named `.env.local` in the root of the project by copying the example file:
    ```bash
    cp .env.example .env.local
    ```
2.  Open `.env.local` and fill in the required values. At a minimum, you will need to provide:
    *   `GOOGLE_GENAI_API_KEY`: Your API key for Google AI (Genkit) services.

    Refer to `.env.example` for a full list of potential environment variables.
3.  The `.env.local` file is included in `.gitignore` and should not be committed to version control, as it contains sensitive information.

## Running Tests

This project uses [Jest](https://jestjs.io/) and [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for unit and component testing.

To run the tests, use the following command:

```bash
npm test
```
(If you use Yarn, you can run `yarn test`.)

## Features

- Track multiple debts and payment plans
- Analyze debt reduction progress with charts and reports
- Plan payments using different strategies (Snowball, Avalanche)
- Access debt negotiation tools and templates

## Overview

DebtCrusher provides the following features:

*   **Dashboard:** Add, view, and manage your debts. Plan payments using different strategies (Snowball, Avalanche, etc.) and track your progress towards becoming debt-free.
*   **Reports:** Analyze your debt reduction progress with charts and tables. View payment history and potential spending insights.
*   **Negotiation:** Access tools and guides to help negotiate with creditors, including letter templates and offer tracking.

## Security Notes

- Environment variables are used for sensitive configurations
- Production credentials should be securely stored and never exposed in the codebase
