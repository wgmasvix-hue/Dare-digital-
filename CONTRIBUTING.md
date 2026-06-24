# Contributing to DARE Digital Library

Thank you for your interest in contributing to DARE Digital Library! We're building Zimbabwe's first comprehensive digital library platform with AI-powered tutoring and research tools. Every contribution helps make education more accessible.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Documentation](#documentation)
- [Community](#community)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive experience for everyone. We pledge to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Harassment, discrimination, or offensive comments
- Trolling, insulting/derogatory comments, and personal attacks
- Publishing others' private information without permission
- Any conduct that could reasonably be considered inappropriate

### Enforcement

Instances of unacceptable behavior may be reported to the project maintainers. All complaints will be reviewed and investigated promptly and fairly.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**
- **Supabase account** (for database access)
- **Google Gemini API key** (for AI features)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click the "Fork" button on GitHub
   ```

2. **Clone your fork**
   ```bash
   git clone https://github.com/YOUR_USERNAME/Dare-digital-.git
   cd Dare-digital-
   ```

3. **Add upstream remote**
   ```bash
   git remote add upstream https://github.com/wgmasvix-hue/Dare-digital-.git
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_key
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_key
   ```

6. **Verify environment setup**
   ```bash
   npm run check-env
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:3000 in your browser.

---

## 🔄 Development Workflow

### Branch Strategy

We use a simplified Git workflow:

```
main (production)
  ↓
feature/your-feature-name
  ↓
Pull Request → Code Review → Merge
```

### Creating a Feature Branch

```bash
# Update your main branch
git checkout main
git pull upstream main

# Create a new feature branch
git checkout -b feature/add-book-export
# or
git checkout -b fix/search-bug
# or
git checkout -b docs/update-readme
```

### Branch Naming Convention

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feature/` | New features | `feature/ai-chat-history` |
| `fix/` | Bug fixes | `fix/login-redirect-error` |
| `docs/` | Documentation | `docs/api-documentation` |
| `refactor/` | Code refactoring | `refactor/auth-service` |
| `test/` | Adding tests | `test/book-card-component` |
| `chore/` | Maintenance tasks | `chore/update-dependencies` |
| `perf/` | Performance improvements | `perf/optimize-search` |

---

## 🎯 How to Contribute

### Types of Contributions

#### 🐛 Bug Reports

Found a bug? Help us fix it!

1. **Check existing issues** - Someone might have already reported it
2. **Create a new issue** with:
   - Clear, descriptive title
   - Steps to reproduce
   - Expected vs. actual behavior
   - Screenshots/videos (if applicable)
   - Environment details (browser, OS)
   - Error messages or console logs

**Bug Report Template:**
```markdown
**Description**
Brief description of the bug

**Steps to Reproduce**
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- OS: [e.g., Windows 11, macOS 13]
- Browser: [e.g., Chrome 120, Firefox 121]
- Device: [e.g., Desktop, iPhone 12]

**Screenshots**
If applicable, add screenshots

**Additional Context**
Any other information about the problem
```

#### ✨ Feature Requests

Have an idea? We'd love to hear it!

1. **Search existing issues** - Avoid duplicates
2. **Create a feature request** with:
   - Clear description of the feature
   - Use case / problem it solves
   - Proposed solution
   - Alternative solutions considered
   - Impact on existing functionality

**Feature Request Template:**
```markdown
**Is your feature request related to a problem?**
A clear description of what the problem is

**Describe the solution you'd like**
A clear description of what you want to happen

**Describe alternatives you've considered**
Alternative solutions or features you've considered

**Additional context**
Mockups, examples, or any other context
```

#### 💻 Code Contributions

Ready to code? Follow these steps:

1. **Find or create an issue**
2. **Comment on the issue** to let others know you're working on it
3. **Create a feature branch**
4. **Make your changes**
5. **Write/update tests**
6. **Update documentation**
7. **Run linter and tests**
8. **Submit a pull request**

#### 📚 Documentation

Documentation is crucial! You can help by:

- Fixing typos or unclear explanations
- Adding examples or tutorials
- Translating documentation
- Improving code comments
- Creating diagrams or visual aids

#### 🎨 Design

Design contributions are welcome:

- UI/UX improvements
- Icon designs
- Illustrations
- Accessibility enhancements
- Mobile responsiveness

---

## 📝 Coding Standards

### JavaScript/TypeScript Style Guide

We follow modern JavaScript/TypeScript best practices:

#### File Naming

```
Components:     PascalCase      BookCard.jsx, UserProfile.tsx
Services:       camelCase       authService.js, booksService.ts
Utils:          camelCase       formatDate.js, exportUtils.ts
Constants:      UPPER_SNAKE     API_ENDPOINTS.js
Styles:         kebab-case      book-card.module.css
```

#### Component Structure

```jsx
// 1. Imports
import React, { useState, useEffect } from 'react';
import { Book, Heart, Share } from 'lucide-react';
import { formatDate } from '../utils/formatDate';
import styles from './BookCard.module.css';

// 2. TypeScript Interface (if applicable)
interface BookCardProps {
  book: Book;
  onSave?: (bookId: string) => void;
  compact?: boolean;
}

// 3. Component
export const BookCard: React.FC<BookCardProps> = ({ 
  book, 
  onSave, 
  compact = false 
}) => {
  // 3.1. Hooks
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  // 3.2. Effects
  useEffect(() => {
    // Check if book is saved
  }, [book.id]);

  // 3.3. Event Handlers
  const handleSave = async () => {
    setLoading(true);
    try {
      await onSave?.(book.id);
      setIsSaved(true);
    } catch (error) {
      console.error('Failed to save book:', error);
    } finally {
      setLoading(false);
    }
  };

  // 3.4. Render Helpers
  const renderActions = () => (
    <div className={styles.actions}>
      <button onClick={handleSave} disabled={loading}>
        <Heart fill={isSaved ? 'red' : 'none'} />
      </button>
    </div>
  );

  // 3.5. Main Render
  return (
    <div className={styles.card}>
      <h3>{book.title}</h3>
      <p>{book.author}</p>
      {renderActions()}
    </div>
  );
};

// 4. Default Export (if needed)
export default BookCard;
```

#### Code Style

```javascript
// ✅ Good
const getUserBooks = async (userId) => {
  try {
    const books = await booksService.getByUser(userId);
    return books.filter(book => book.published);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    throw error;
  }
};

// ❌ Bad
const getUserBooks = async (userId) => {
  const books = await booksService.getByUser(userId);
  return books.filter(book => book.published);
  // No error handling!
};
```

### TypeScript Guidelines

```typescript
// ✅ Use interfaces for object types
interface User {
  id: string;
  email: string;
  role: 'student' | 'lecturer' | 'author';
  profile?: UserProfile;
}

// ✅ Use type for unions and complex types
type Status = 'idle' | 'loading' | 'success' | 'error';
type BookFilter = { category?: string; author?: string; year?: number };

// ✅ Avoid 'any' - use 'unknown' instead
const parseJson = (str: string): unknown => {
  return JSON.parse(str);
};

// ✅ Use optional chaining and nullish coalescing
const userName = user?.profile?.name ?? 'Guest';
```

### CSS/Styling Guidelines

We use **Tailwind CSS** for utility classes and **CSS Modules** for component-specific styles.

```jsx
// ✅ Tailwind for layout and common styles
<div className="flex items-center gap-4 p-6 rounded-lg shadow-md">
  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
    {title}
  </h2>
</div>

// ✅ CSS Modules for complex component styles
import styles from './BookCard.module.css';

<div className={styles.card}>
  <div className={styles.cover}>
    <img src={book.thumbnail} alt={book.title} />
  </div>
</div>
```

**CSS Module Conventions:**

```css
/* BookCard.module.css */

/* Use camelCase for class names */
.bookCard {
  position: relative;
  border-radius: 8px;
}

.bookCard:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

/* Use BEM-like naming for variations */
.bookCard--compact {
  padding: 1rem;
}

/* Support dark mode */
.bookCard {
  background-color: white;
}

:global(.dark) .bookCard {
  background-color: #1f2937;
}
```

### Service Layer Guidelines

```javascript
// services/booksService.js

import { supabase } from '../lib/supabase';

/**
 * Books service for managing book data
 */
export const booksService = {
  /**
   * Fetch all books with optional filters
   * @param {Object} filters - Filter options
   * @param {string} filters.category - Category filter
   * @param {string} filters.search - Search query
   * @returns {Promise<Book[]>} Array of books
   */
  async getAll(filters = {}) {
    try {
      let query = supabase.from('books').select('*');

      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Failed to fetch books:', error);
      throw error;
    }
  },

  /**
   * Fetch a single book by ID
   * @param {string} id - Book ID
   * @returns {Promise<Book>} Book object
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
};
```

---

## 📝 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

| Type | Description | Example |
|------|-------------|---------|
| `feat` | New feature | `feat(library): add book export functionality` |
| `fix` | Bug fix | `fix(auth): resolve login redirect issue` |
| `docs` | Documentation | `docs(readme): update installation steps` |
| `style` | Code style changes | `style(bookcard): fix indentation` |
| `refactor` | Code refactoring | `refactor(services): consolidate API calls` |
| `perf` | Performance improvement | `perf(search): optimize query performance` |
| `test` | Adding tests | `test(bookcard): add unit tests` |
| `chore` | Maintenance | `chore(deps): update dependencies` |
| `ci` | CI/CD changes | `ci(github): add automated tests` |
| `build` | Build system changes | `build(vite): update build config` |

### Scope (Optional)

Indicates the section of the codebase:

- `library` - Library features
- `auth` - Authentication
- `dashboard` - Dashboard components
- `ai` - AI features
- `api` - Backend API
- `ui` - UI components
- `docs` - Documentation

### Subject

- Use imperative mood ("add" not "added")
- Don't capitalize first letter
- No period at the end
- Keep it under 50 characters

### Examples

```bash
# Good commits
feat(library): add PDF export for books
fix(auth): resolve token expiration handling
docs(contributing): add commit guidelines
refactor(api): simplify error handling
perf(search): implement debounce for queries
test(bookcard): add snapshot tests

# Bad commits
added new feature
Fixed bug
Update
WIP
```

### Commit Body (Optional)

Provide more details about the changes:

```
feat(ai): add conversation history feature

Implemented persistent chat history for AI tutoring sessions.
Users can now review and continue previous conversations.

- Added chat_history table to database
- Created history API endpoints
- Updated AI chat component with history UI
- Added tests for history functionality

Closes #123
```

### Breaking Changes

If your commit introduces breaking changes:

```
feat(api)!: update authentication endpoints

BREAKING CHANGE: Authentication API endpoints have been restructured.

Old: POST /api/auth/login
New: POST /api/v2/auth/login

Migration guide: See docs/migration-v2.md
```

---

## 🔍 Pull Request Process

### Before Creating a PR

1. ✅ **Sync with upstream**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. ✅ **Run linter**
   ```bash
   npm run lint
   ```

3. ✅ **Test your changes**
   ```bash
   npm run build
   npm run preview
   ```

4. ✅ **Update documentation**
   - Update README if needed
   - Add/update code comments
   - Update CHANGELOG (if applicable)

5. ✅ **Commit your changes**
   ```bash
   git add .
   git commit -m "feat(library): add book filtering"
   git push origin feature/book-filtering
   ```

### Creating a Pull Request

1. Go to your fork on GitHub
2. Click "New Pull Request"
3. Select your feature branch
4. Fill out the PR template

### PR Title Format

Follow the same format as commit messages:

```
feat(library): add advanced search filters
fix(auth): resolve logout redirect issue
docs(api): add endpoint documentation
```

### PR Description Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Related Issue
Fixes #123
Related to #456

## Changes Made
- Added advanced search filters to library page
- Updated FilterPanel component
- Added filter tests
- Updated documentation

## Screenshots (if applicable)
Before: [screenshot]
After: [screenshot]

## Testing
- [ ] Tested locally
- [ ] Added/updated unit tests
- [ ] Added/updated integration tests
- [ ] Manual testing performed

## Checklist
- [ ] My code follows the project's style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings or errors
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally
- [ ] Any dependent changes have been merged

## Additional Notes
Any additional information or context
```

### Code Review Process

1. **Automated Checks**
   - Linting passes
   - Build succeeds
   - Tests pass (if applicable)

2. **Peer Review**
   - At least one approving review required
   - Address all review comments
   - Request re-review after changes

3. **Final Checks**
   - No merge conflicts
   - All conversations resolved
   - CI/CD pipeline passes

4. **Merge**
   - Maintainer will merge when approved
   - Squash and merge for clean history
   - Delete branch after merge

### Reviewing Pull Requests

When reviewing others' PRs:

- ✅ Be respectful and constructive
- ✅ Explain the reasoning behind suggestions
- ✅ Approve when changes look good
- ✅ Use GitHub's suggestion feature
- ❌ Don't block on minor style issues
- ❌ Don't approve without reviewing code

**Review Comment Examples:**

```markdown
# Good comments
✅ "This looks great! One suggestion: could we extract this logic into a separate function for better reusability?"

✅ "I noticed a potential edge case: what happens when the user is null? We might want to add a null check here."

✅ "Nice work on the performance optimization! The lazy loading really improves page load time."

# Bad comments
❌ "This is wrong."
❌ "Why did you do it this way?"
❌ "Needs work."
```

---

## 🧪 Testing Requirements

### Test Structure

```
src/
├── components/
│   └── BookCard/
│       ├── BookCard.tsx
│       ├── BookCard.test.tsx    # Component tests
│       └── BookCard.module.css
├── services/
│   └── booksService.ts
│   └── booksService.test.ts     # Service tests
```

### Writing Tests

#### Component Tests (React Testing Library)

```jsx
// BookCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { BookCard } from './BookCard';

describe('BookCard', () => {
  const mockBook = {
    id: '1',
    title: 'Test Book',
    author: 'Test Author',
  };

  it('renders book information', () => {
    render(<BookCard book={mockBook} />);
    
    expect(screen.getByText('Test Book')).toBeInTheDocument();
    expect(screen.getByText('Test Author')).toBeInTheDocument();
  });

  it('calls onSave when save button is clicked', () => {
    const onSave = jest.fn();
    render(<BookCard book={mockBook} onSave={onSave} />);
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(onSave).toHaveBeenCalledWith('1');
  });
});
```

#### Service Tests

```javascript
// booksService.test.js
import { booksService } from './booksService';
import { supabase } from '../lib/supabase';

jest.mock('../lib/supabase');

describe('booksService', () => {
  describe('getAll', () => {
    it('fetches all books', async () => {
      const mockBooks = [{ id: '1', title: 'Test Book' }];
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: mockBooks, error: null }),
      });

      const books = await booksService.getAll();
      
      expect(books).toEqual(mockBooks);
    });

    it('handles errors', async () => {
      const mockError = new Error('Failed to fetch');
      supabase.from.mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      });

      await expect(booksService.getAll()).rejects.toThrow('Failed to fetch');
    });
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test BookCard.test.tsx
```

### Test Coverage Goals

- **Critical paths:** 90%+ coverage
- **UI components:** 70%+ coverage
- **Services/utilities:** 80%+ coverage
- **Overall project:** 70%+ coverage

---

## 📚 Documentation

### Code Documentation

Use JSDoc for functions and classes:

```javascript
/**
 * Fetches books matching the search criteria
 * 
 * @param {Object} options - Search options
 * @param {string} options.query - Search query
 * @param {string[]} [options.categories] - Categories to filter by
 * @param {number} [options.limit=10] - Maximum number of results
 * @returns {Promise<Book[]>} Array of matching books
 * @throws {Error} If the search fails
 * 
 * @example
 * const books = await searchBooks({ query: 'AI', limit: 5 });
 */
async function searchBooks({ query, categories, limit = 10 }) {
  // Implementation
}
```

### Component Documentation

Document complex components with PropTypes or TypeScript:

```typescript
/**
 * BookCard component displays book information with interactive features
 * 
 * @component
 * @example
 * <BookCard 
 *   book={bookData} 
 *   onSave={handleSave}
 *   showAIInsights={true}
 * />
 */
interface BookCardProps {
  /** Book data to display */
  book: Book;
  /** Callback when save button is clicked */
  onSave?: (bookId: string) => void;
  /** Whether to show AI insights button */
  showAIInsights?: boolean;
  /** Use compact layout */
  compact?: boolean;
}
```

### README Updates

When adding new features, update the README with:

- Feature description
- Usage examples
- Configuration options
- Screenshots/demos

---

## 🌍 Community

### Communication Channels

- **GitHub Issues** - Bug reports, feature requests
- **GitHub Discussions** - General discussions, questions
- **Pull Requests** - Code reviews, collaboration

### Getting Help

- Check the [README](./README.md) and [ARCHITECTURE](./ARCHITECTURE.md) docs
- Search existing issues and discussions
- Ask questions in GitHub Discussions
- Tag maintainers if needed (@wgmasvix-hue)

### Becoming a Maintainer

Active contributors may be invited to become maintainers. Maintainers:

- Review and merge pull requests
- Triage issues
- Guide project direction
- Help onboard new contributors

---

## 🎓 Learning Resources

### React & TypeScript
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React TypeScript Cheatsheet](https://react-typescript-cheatsheet.netlify.app/)

### Tailwind CSS
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Supabase
- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Guide](https://supabase.com/docs/guides/auth)

### Google Gemini AI
- [Gemini API Documentation](https://ai.google.dev/docs)

### Testing
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

---

## 📄 License

By contributing to DARE Digital Library, you agree that your contributions will be licensed under the same license as the project.

---

## 🙏 Recognition

Contributors will be recognized in:

- GitHub Contributors page
- CONTRIBUTORS.md file
- Release notes
- Project documentation

Thank you for contributing to DARE Digital Library! Together, we're making education more accessible for everyone in Zimbabwe and beyond. 🇿🇼

---

**Questions?** Open an issue or start a discussion on GitHub!

**Last Updated:** 2026-06-24  
**Maintained by:** DARE Digital Library Team
