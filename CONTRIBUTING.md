# Contributing to Kobo Backup Manager

First off, thank you for considering contributing to Kobo Backup Manager! It's people like you that make this tool better for the entire Kobo community.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Development Workflow](#development-workflow)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

**Positive behavior includes:**
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what is best for the community
- Showing empathy towards others

**Unacceptable behavior includes:**
- Harassment, trolling, or derogatory comments
- Publishing others' private information
- Any conduct that would be inappropriate in a professional setting

## How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
1. Check the [existing issues](https://github.com/yourusername/kobo-backup-manager/issues) to avoid duplicates
2. Collect information about the bug (browser version, steps to reproduce, error messages)

**How to submit a good bug report:**
1. Use a clear and descriptive title
2. Describe the exact steps to reproduce the problem
3. Provide specific examples (files, screenshots, console logs)
4. Describe the behavior you observed and what you expected
5. Include your browser version and operating system

**Bug Report Template:**
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - Browser: [e.g., Chrome 120]
 - OS: [e.g., macOS 14.0]
 - Kobo Device: [e.g., Kobo Clara HD]

**Additional context**
Any other context about the problem.
```

### Suggesting Enhancements

**Before submitting an enhancement:**
1. Check if it's already been suggested
2. Determine if it aligns with the project's privacy-first philosophy
3. Consider if it benefits the majority of users

**How to submit a good enhancement suggestion:**
1. Use a clear and descriptive title
2. Provide a detailed description of the proposed enhancement
3. Explain why this enhancement would be useful
4. List any alternatives you've considered
5. Include mockups or examples if applicable

### Contributing Code

We welcome code contributions! Here's how to get started:

## Development Setup

### Prerequisites

- **Node.js** 18+ and npm 9+
- **Git** for version control
- **Modern browser** (Chrome 86+, Edge 86+, Opera 72+)
- **Kobo device** for testing (optional but recommended)

### Initial Setup

```bash
# 1. Fork the repository on GitHub

# 2. Clone your fork
git clone https://github.com/YOUR_USERNAME/kobo-backup-manager.git
cd kobo-backup-manager

# 3. Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/kobo-backup-manager.git

# 4. Install dependencies
npm install

# 5. Start development server
npm run dev
```

The app will be available at `http://localhost:5173/`

### Available Scripts

```bash
npm run dev          # Start development server with HMR
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
npm test            # Run test suite
npm run test:watch  # Run tests in watch mode
```

## Development Workflow

### 1. Create a Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

**Branch naming conventions:**
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or modifications
- `chore/` - Build process or tooling changes

### 2. Make Your Changes

- Write clean, readable code
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Test your changes thoroughly

### 3. Test Your Changes

```bash
# Run linter
npm run lint

# Run tests
npm test

# Test in browser
npm run dev
```

**Manual testing checklist:**
- [ ] Test backup creation flow
- [ ] Test restore flow
- [ ] Test error handling
- [ ] Test in multiple browsers
- [ ] Test with actual Kobo device
- [ ] Test edge cases

### 4. Commit Your Changes

See [Commit Messages](#commit-messages) section below.

### 5. Push and Create Pull Request

```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub.

## Style Guidelines

### JavaScript/React

- Use **ES6+** features (arrow functions, destructuring, etc.)
- Use **functional components** with hooks (no class components)
- Follow **React best practices** (proper key usage, memo when needed)
- Use **PropTypes** for component prop validation
- Keep components **small and focused** (single responsibility)
- Use **descriptive variable names** (no single letters except loop indices)

**Good:**
```jsx
export function BookCard({ book, onSelect }) {
  const { title, author, progress = 0 } = book;

  return (
    <div className="book-card">
      <h3>{title}</h3>
      <p>{author}</p>
      <ProgressBar percent={progress} />
    </div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    title: PropTypes.string.isRequired,
    author: PropTypes.string,
    progress: PropTypes.number,
  }).isRequired,
  onSelect: PropTypes.func,
};
```

**Bad:**
```jsx
export function BookCard(props) {
  return (
    <div className="book-card">
      <h3>{props.book.title}</h3>
      {/* Missing PropTypes, unclear structure */}
    </div>
  );
}
```

### CSS/Tailwind

- Use **Tailwind utility classes** instead of custom CSS when possible
- Follow **mobile-first** approach
- Use **design system colors** from tailwind.config.js
- Group utilities logically (layout → spacing → colors → typography)

**Good:**
```jsx
<button className="w-full px-6 py-3 bg-kobo-accent text-white rounded-lg hover:bg-kobo-accent-dark transition-colors">
  Click Me
</button>
```

### File Organization

- One component per file
- Name files to match component names (PascalCase.jsx)
- Group related files in folders
- Keep utility functions in separate files

**Structure:**
```
src/
├── components/
│   ├── common/
│   │   ├── Button.jsx
│   │   └── Card.jsx
│   └── backup/
│       ├── BackupWizard.jsx
│       └── DeviceSelector.jsx
├── hooks/
│   └── useFileSystem.js
└── utils/
    └── validation.js
```

## Commit Messages

Use **conventional commits** format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, missing semicolons)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or tooling changes

### Examples

**Good:**
```
feat(backup): add annotation export to Markdown

- Implement Markdown formatter for annotations
- Add export button to backup success screen
- Include metadata in exported file

Closes #123
```

```
fix(restore): prevent duplicate file writes

Fixed a bug where files were being written twice during restore
due to incorrect state management in the restore hook.

Fixes #456
```

**Bad:**
```
Update stuff
```

```
fix bug
```

## Pull Request Process

### Before Submitting

- [ ] Code follows the style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Linter passes (`npm run lint`)
- [ ] Documentation is updated
- [ ] Branch is up to date with main
- [ ] Commit messages follow conventions

### PR Template

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## How Has This Been Tested?
Describe your testing process.

## Checklist
- [ ] My code follows the style guidelines
- [ ] I have commented my code where needed
- [ ] I have updated the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix/feature works
- [ ] New and existing tests pass locally

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Additional Notes
Any additional information.
```

### Review Process

1. A maintainer will review your PR within a few days
2. They may request changes or ask questions
3. Address feedback by pushing new commits
4. Once approved, a maintainer will merge your PR

### After Merge

- Your contribution will be included in the next release
- You'll be added to the contributors list
- Thank you for making Kobo Backup Manager better! 🎉

## Privacy Guidelines

**Critical:** This project is privacy-first. Any contribution must maintain these principles:

- ❌ **NO** external API calls (except for optional cloud storage integration with user consent)
- ❌ **NO** analytics or tracking
- ❌ **NO** data collection
- ❌ **NO** server-side processing
- ✅ **YES** to local-only processing
- ✅ **YES** to transparent code
- ✅ **YES** to user control

If your contribution involves any data handling, clearly document:
- What data is processed
- Where it goes (should always be local)
- How users can verify this

## Questions?

- **General questions:** Open a [GitHub Discussion](https://github.com/yourusername/kobo-backup-manager/discussions)
- **Bug reports:** Open a [GitHub Issue](https://github.com/yourusername/kobo-backup-manager/issues)
- **Security concerns:** Email security@example.com

## Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- In-app credits (for significant contributions)

Thank you for contributing to Kobo Backup Manager! 🙌
