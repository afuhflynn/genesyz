# Unused Dependencies Analysis

This document lists all unused dependencies in the IdeasVault codebase. These dependencies are installed but not imported or used anywhere in the codebase.

## Unused Production Dependencies

| Package Name | Version | Reason |
|--------------|---------|--------|
| @ai-sdk/openai | 3.0.7 | No imports or usage found in the codebase. |
| @ai-sdk/xai | 3.0.10 | No imports or usage found in the codebase. |
| @dnd-kit/sortable | 10.0.0 | No imports or usage found in the codebase. |
| @dnd-kit/utilities | 3.2.2 | No imports or usage found in the codebase. |
| @openrouter/ai-sdk-provider | 1.5.4 | No imports or usage found in the codebase. |
| @pinecone-database/pinecone | 6.1.3 | No imports or usage found in the codebase. |
| @radix-ui/react-navigation-menu | 1.2.14 | No imports or usage found in the codebase. |
| @react-pdf/renderer | 4.3.2 | No imports or usage found in the codebase. |
| @types/pdfkit | 0.17.4 | No imports or usage found in the codebase. |
| @types/pg | 8.16.0 | No imports or usage found in the codebase. |
| ai-sdk-ollama | 3.0.1 | No imports or usage found in the codebase. |
| list | 2.0.19 | No imports or usage found in the codebase. |
| motion | 12.26.2 | No imports or usage found in the codebase. |
| mprocs | 0.8.2 | No imports or usage found in the codebase. |
| streamdown | 2.0.1 | No imports or usage found in the codebase. |
| tokenlens | 1.3.1 | No imports or usage found in the codebase. |
| vitest | 4.0.16 | No imports or usage found in the codebase. |

## Unused Development Dependencies

| Package Name | Version | Reason |
|--------------|---------|--------|
| @tailwindcss/postcss | 4.1.18 | Not used in any scripts, config files, or build processes. |
| @types/bcryptjs | 3.0.0 | Not used in any scripts, config files, or build processes. |
| @types/nodemailer | 7.0.4 | Not used in any scripts, config files, or build processes. |
| babel-plugin-react-compiler | 1.0.0 | Not used in any scripts, config files, or build processes. |
| sharp | 0.34.5 | Not used in any scripts, config files, or build processes. |
| tw-animate-css | 1.4.0 | Not used in any scripts, config files, or build processes. |

## Recommendations

To optimize the project's dependencies, consider removing the unused packages listed above. This will:

1. Reduce the project's footprint
2. Improve installation time
3. Simplify dependency management
4. Reduce potential security vulnerabilities

## Verification

The analysis was performed by searching for import statements and usage patterns across all `.ts`, `.tsx`, and `.js` files in the codebase. Dependencies that were not found to be imported or used were flagged as unused.

## Next Steps

1. Review the list of unused dependencies
2. Remove the unused dependencies from `package.json`
3. Run `pnpm install` to update the lock file
4. Test the application to ensure no functionality is broken
5. Commit the changes to version control
