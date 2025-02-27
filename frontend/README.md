# Email OTP Authentication Frontend

This is the frontend for the Email OTP Authentication system, built with React, TypeScript, and Vite.

## Project Structure

```
frontend/
├── src/
│   ├── assets/
│   │   └── styles/        # Global styles
│   ├── components/        # Reusable components
│   │   ├── auth/          # Authentication components
│   │   ├── profile/       # Profile components
│   │   └── ui/            # UI components (buttons, inputs, etc.)
│   ├── context/           # React context for state management
│   ├── hooks/             # Custom React hooks
│   ├── pages/             # Page components
│   ├── services/          # API services
│   ├── types/             # TypeScript type definitions
│   └── utils/             # Utility functions
├── .env                   # Environment variables
├── index.html             # HTML entry point
├── package.json           # Dependencies and scripts
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite configuration
```

## Features

- Email-based OTP authentication
- Form validation
- Responsive design
- Context-based state management
- Reusable UI components
- TypeScript for type safety

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file with the following content:
   ```
   VITE_API_URL=http://localhost:3000
   ```

3. Start the development server:
   ```
   npm run dev
   ```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests

## Best Practices Implemented

- **Component Structure**: Organized components by feature and type
- **State Management**: Used React Context API for global state
- **Custom Hooks**: Created reusable hooks for forms and other functionality
- **TypeScript**: Strong typing for better developer experience and fewer bugs
- **CSS Variables**: Used CSS variables for consistent theming
- **Responsive Design**: Mobile-friendly UI
- **Error Handling**: Proper error handling and user feedback
- **Form Validation**: Client-side validation for better UX
- **API Service Layer**: Centralized API calls in service modules

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```
