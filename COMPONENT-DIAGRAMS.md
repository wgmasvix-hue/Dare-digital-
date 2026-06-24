# DARE Digital Library - Component Diagrams

## 📋 Overview

This document provides detailed visual representations of the component architecture, showing component relationships, data flow, and integration patterns.

---

## 🎨 Component Hierarchy

### **Complete Component Tree**

```mermaid
graph TB
    App[App.jsx]
    Router[React Router]
    
    App --> ThemeProvider[ThemeProvider]
    App --> GamificationProvider[GamificationContext]
    App --> ToastProvider[ToastContext]
    
    ThemeProvider --> Router
    GamificationProvider --> Router
    ToastProvider --> Router
    
    Router --> Layout[Layout Components]
    Router --> Pages[Page Components]
    
    Layout --> NavBar[NavBar]
    Layout --> Footer[Footer]
    Layout --> Breadcrumbs[Breadcrumbs]
    Layout --> GlobalSearch[GlobalSearch]
    
    Pages --> Home[Home Page]
    Pages --> Library[Library Pages]
    Pages --> Dashboard[Dashboard Pages]
    Pages --> Tools[Tool Pages]
    Pages --> Auth[Auth Pages]
    
    style App fill:#0d9488,color:#fff
    style Router fill:#14b8a6,color:#fff
    style Layout fill:#2dd4bf,color:#000
    style Pages fill:#5eead4,color:#000
```

---

## 🏗️ Layout Components Structure

### **Main Layout Architecture**

```mermaid
graph TB
    subgraph "Layout Wrapper"
        NavBar[NavBar.jsx<br/>Navigation & User Menu]
        Breadcrumbs[Breadcrumbs.jsx<br/>Navigation Trail]
        GlobalSearch[GlobalSearch.jsx<br/>Universal Search]
        Footer[Footer.jsx<br/>Site Footer]
    end
    
    subgraph "NavBar Components"
        Logo[LogoIcon]
        ThemeToggle[ThemeToggle]
        UserMenu[User Menu Dropdown]
        MobileMenu[Mobile Menu]
        InstDropdown[InstitutionDropdown]
    end
    
    subgraph "Footer Components"
        Links[Quick Links]
        Social[Social Links]
        PowerTag[PowerTag - DARE Branding]
        Copyright[Copyright Info]
    end
    
    NavBar --> Logo
    NavBar --> ThemeToggle
    NavBar --> UserMenu
    NavBar --> MobileMenu
    NavBar --> InstDropdown
    
    Footer --> Links
    Footer --> Social
    Footer --> PowerTag
    Footer --> Copyright
    
    GlobalSearch --> SearchResults[Search Results Modal]
    
    style NavBar fill:#0d9488,color:#fff
    style Footer fill:#0d9488,color:#fff
    style GlobalSearch fill:#14b8a6,color:#fff
```

**Component Details:**

| Component | Props | State | Services |
|-----------|-------|-------|----------|
| **NavBar** | `user`, `onLogout` | `mobileMenuOpen`, `userMenuOpen` | `authService` |
| **GlobalSearch** | `placeholder` | `query`, `results`, `isSearching` | `books`, `search` |
| **Breadcrumbs** | `path` | - | - |
| **Footer** | - | - | - |

---

## 📚 Library Components Ecosystem

### **Library Feature Components**

```mermaid
graph TB
    subgraph "Library Pages"
        LibraryPage[Library.jsx]
        BookDetail[BookDetail.jsx]
        Reader[Reader.jsx]
    end
    
    subgraph "Core Library Components"
        BookCard[BookCard.tsx<br/>Individual Book Display]
        BookGrid[BookGrid.jsx<br/>Grid Layout]
        FilterPanel[FilterPanel.jsx<br/>Search Filters]
        SearchBar[SearchBar.jsx<br/>Library Search]
    end
    
    subgraph "Interactive Components"
        BookCardInt[BookCard Interactions]
        AIInsights[AIInsightModal.tsx]
        AiDrawer[AiInsightsDrawer.jsx]
        DaraChat[DaraChatModal.jsx]
        DigitRequest[DigitizationRequestModal.jsx]
    end
    
    subgraph "Resource Management"
        UploadResource[UploadResourceModal.jsx]
        UnifiedCard[UnifiedResourceCard.jsx]
        PublishDash[PublishingDashboard.jsx]
    end
    
    LibraryPage --> BookGrid
    LibraryPage --> FilterPanel
    LibraryPage --> SearchBar
    
    BookGrid --> BookCard
    
    BookCard --> BookCardInt
    BookCardInt --> AIInsights
    BookCardInt --> AiDrawer
    BookCardInt --> DaraChat
    BookCardInt --> DigitRequest
    
    BookDetail --> Reader
    BookDetail --> AIInsights
    
    style BookCard fill:#0d9488,color:#fff
    style FilterPanel fill:#14b8a6,color:#fff
    style AIInsights fill:#f59e0b,color:#fff
```

**BookCard Component Props:**

```typescript
interface BookCardProps {
  book: {
    id: string;
    title: string;
    author: string;
    description?: string;
    coverUrl?: string;
    isbn?: string;
    publisher?: string;
    publishedDate?: string;
    pageCount?: number;
    categories?: string[];
    averageRating?: number;
    thumbnail?: string;
  };
  onRead?: (bookId: string) => void;
  onSave?: (bookId: string) => void;
  onShare?: (bookId: string) => void;
  showAIInsights?: boolean;
  compact?: boolean;
}
```

---

## 🎮 Gamification Components

### **Gamification System Architecture**

```mermaid
graph TB
    subgraph "Gamification Context"
        GamContext[GamificationContext.tsx<br/>Global State]
        GamService[leaderboardService.js]
    end
    
    subgraph "Display Components"
        BadgeDisplay[BadgeDisplay.jsx<br/>Achievement Badges]
        LevelUpModal[LevelUpModal.jsx<br/>Level Up Celebration]
        GamFeedback[GamificationFeedback.jsx<br/>Points Notification]
    end
    
    subgraph "Dashboard Integration"
        StudentDash[StudentDashboard.jsx]
        Leaderboard[Leaderboard.jsx]
        ReadingGoals[ReadingGoals.jsx]
    end
    
    subgraph "Triggers"
        BookRead[Book Read Event]
        QuizComplete[Quiz Completion]
        ContentUpload[Content Upload]
        DailyLogin[Daily Login]
    end
    
    GamContext --> GamService
    
    GamContext --> BadgeDisplay
    GamContext --> LevelUpModal
    GamContext --> GamFeedback
    
    BadgeDisplay --> StudentDash
    LevelUpModal --> StudentDash
    ReadingGoals --> StudentDash
    
    BookRead --> GamContext
    QuizComplete --> GamContext
    ContentUpload --> GamContext
    DailyLogin --> GamContext
    
    GamContext --> Leaderboard
    
    style GamContext fill:#8b5cf6,color:#fff
    style BadgeDisplay fill:#a78bfa,color:#fff
    style LevelUpModal fill:#c4b5fd,color:#000
```

**Gamification Events:**

```javascript
// Event Types
const GamificationEvents = {
  BOOK_READ: 'book_read',           // +10 points
  CHAPTER_COMPLETE: 'chapter_complete',  // +5 points
  QUIZ_PASSED: 'quiz_passed',       // +20 points
  CONTENT_SHARED: 'content_shared', // +5 points
  DAILY_LOGIN: 'daily_login',       // +2 points
  STREAK_MILESTONE: 'streak_milestone',  // +50 points
  BOOK_REVIEWED: 'book_reviewed',   // +15 points
  CONTENT_UPLOADED: 'content_uploaded',  // +30 points
};
```

---

## 🤖 AI Components Architecture

### **AI-Powered Features**

```mermaid
graph TB
    subgraph "AI Chat Components"
        AIChat[AIChat.jsx<br/>Main Chat Interface]
        TrainerAI[TrainerAI.jsx<br/>Structured AI Tutor]
        AIViewer[AIViewer.tsx<br/>Document + AI]
    end
    
    subgraph "AI Services"
        AIService[ai.js]
        GeminiService[geminiService.ts]
        TransformerService[transformerService.ts]
    end
    
    subgraph "AI Modal Components"
        AIInsightModal[AIInsightModal.tsx]
        DaraChatModal[DaraChatModal.jsx]
    end
    
    subgraph "Teacher AI Tools"
        LessonPlanner[HBCLessonPlannerAssistant.jsx]
        AssessmentAid[HBCAssessmentAssistant.jsx]
        TeachingAid[HBCTeachingAidAssistant.jsx]
        RemedialAid[HBCRemedialAssistant.jsx]
        RubricAid[UnhuRubricAssistant.jsx]
    end
    
    AIChat --> AIService
    TrainerAI --> AIService
    AIViewer --> AIService
    
    AIService --> GeminiService
    AIService --> TransformerService
    
    AIInsightModal --> GeminiService
    DaraChatModal --> GeminiService
    
    LessonPlanner --> GeminiService
    AssessmentAid --> GeminiService
    TeachingAid --> GeminiService
    RemedialAid --> GeminiService
    RubricAid --> GeminiService
    
    style AIChat fill:#f59e0b,color:#fff
    style GeminiService fill:#dc2626,color:#fff
    style TransformerService fill:#dc2626,color:#fff
```

**AI Component Data Flow:**

```mermaid
sequenceDiagram
    participant User
    participant AIChat
    participant AIService
    participant GeminiAPI
    participant Context
    
    User->>AIChat: Type message
    AIChat->>AIService: sendMessage(content, context)
    AIService->>Context: Get conversation history
    Context-->>AIService: Previous messages
    AIService->>GeminiAPI: Generate response
    
    alt Streaming Mode
        GeminiAPI-->>AIService: Stream chunk 1
        AIService-->>AIChat: Update UI
        GeminiAPI-->>AIService: Stream chunk 2
        AIService-->>AIChat: Update UI
        GeminiAPI-->>AIService: Complete
    else Non-streaming
        GeminiAPI-->>AIService: Full response
        AIService-->>AIChat: Display response
    end
    
    AIChat->>Context: Save conversation
    AIChat->>User: Show response
```

---

## 👤 Dashboard Components

### **Role-Based Dashboard Architecture**

```mermaid
graph TB
    subgraph "Student Dashboard"
        StudentDash[StudentDashboard.jsx]
        StudentStats[Reading Statistics]
        StudentGoals[ReadingGoals.jsx]
        StudentBadges[BadgeDisplay]
        StudentHistory[Reading History]
    end
    
    subgraph "Lecturer Dashboard"
        LecturerDash[LecturerDashboard.jsx]
        ClassAnalytics[Class Analytics]
        StudentProgress[Student Progress]
        ContentManager[Content Manager]
        AssignmentTracker[Assignment Tracker]
    end
    
    subgraph "Author Dashboard"
        AuthorDash[AuthorDashboard.jsx]
        BookStats[Book Statistics]
        UploadWizard[UploadWizard.jsx]
        PublishDash[PublishingDashboard.jsx]
        RevenueTracker[Revenue Tracker]
    end
    
    subgraph "Shared Dashboard Components"
        Charts[Recharts Components]
        DataTables[Data Tables]
        ExportTools[Export Tools]
    end
    
    StudentDash --> StudentStats
    StudentDash --> StudentGoals
    StudentDash --> StudentBadges
    StudentDash --> StudentHistory
    
    LecturerDash --> ClassAnalytics
    LecturerDash --> StudentProgress
    LecturerDash --> ContentManager
    LecturerDash --> AssignmentTracker
    
    AuthorDash --> BookStats
    AuthorDash --> UploadWizard
    AuthorDash --> PublishDash
    AuthorDash --> RevenueTracker
    
    StudentStats --> Charts
    ClassAnalytics --> Charts
    BookStats --> Charts
    
    StudentProgress --> DataTables
    ContentManager --> DataTables
    
    style StudentDash fill:#3b82f6,color:#fff
    style LecturerDash fill:#8b5cf6,color:#fff
    style AuthorDash fill:#ec4899,color:#fff
```

**Dashboard Component Props:**

```typescript
// Student Dashboard
interface StudentDashboardProps {
  user: User;
  readingHistory: ReadingHistory[];
  achievements: Achievement[];
  goals: ReadingGoal[];
}

// Lecturer Dashboard
interface LecturerDashboardProps {
  user: User;
  classes: Class[];
  students: Student[];
  assignments: Assignment[];
}

// Author Dashboard
interface AuthorDashboardProps {
  user: User;
  books: Book[];
  sales: SalesData[];
  analytics: AnalyticsData;
}
```

---

## 🔧 Tool Components

### **Educational Tools Ecosystem**

```mermaid
graph TB
    subgraph "HBC Teacher Tools"
        LessonPlanner[Lesson Planner Assistant]
        AssessmentAid[Assessment Assistant]
        TeachingAid[Teaching Aid Generator]
        RemedialAid[Remedial Assistant]
    end
    
    subgraph "University Tools"
        UnhuRubric[UNHU Rubric Assistant]
        ResearchTools[Research Tools]
    end
    
    subgraph "Integration Tools"
        GoogleWorkspace[GoogleWorkspaceIntegration.tsx]
        DSpaceConnect[DSpace Connection]
    end
    
    subgraph "Content Tools"
        PDFViewer[PDFViewer.tsx]
        MarkdownRenderer[InteractiveMarkdown.jsx]
        CitationMenu[CitationMenu.jsx]
    end
    
    TeacherTools[Teacher Tools Page] --> LessonPlanner
    TeacherTools --> AssessmentAid
    TeacherTools --> TeachingAid
    TeacherTools --> RemedialAid
    
    VocationalTools[Vocational Tools] --> UnhuRubric
    VocationalTools --> ResearchTools
    
    Integration[Integration Page] --> GoogleWorkspace
    Integration --> DSpaceConnect
    
    Reader[Reader Component] --> PDFViewer
    BookDetail[Book Detail] --> MarkdownRenderer
    BookDetail --> CitationMenu
    
    style LessonPlanner fill:#10b981,color:#fff
    style GoogleWorkspace fill:#6366f1,color:#fff
    style PDFViewer fill:#f97316,color:#fff
```

**Tool Component Communication:**

```mermaid
sequenceDiagram
    participant Teacher
    participant LessonPlanner
    participant GeminiAPI
    participant Storage
    
    Teacher->>LessonPlanner: Input: Subject, Grade, Topic
    LessonPlanner->>LessonPlanner: Validate inputs
    LessonPlanner->>GeminiAPI: Generate lesson plan
    GeminiAPI-->>LessonPlanner: Structured lesson plan
    LessonPlanner->>LessonPlanner: Format for display
    LessonPlanner->>Teacher: Show lesson plan
    
    alt Save Plan
        Teacher->>LessonPlanner: Click Save
        LessonPlanner->>Storage: Store lesson plan
        Storage-->>LessonPlanner: Confirmation
        LessonPlanner->>Teacher: Success notification
    end
    
    alt Export Plan
        Teacher->>LessonPlanner: Click Export (PDF/DOCX)
        LessonPlanner->>LessonPlanner: Generate export
        LessonPlanner->>Teacher: Download file
    end
```

---

## 🔒 Authentication Components

### **Auth Flow Components**

```mermaid
graph TB
    subgraph "Public Routes"
        Landing[Home.jsx]
        Login[Login.jsx]
        Signup[Signup.jsx]
    end
    
    subgraph "Protected Routes"
        ProtectedRoute[ProtectedRoute.tsx<br/>Route Guard]
        AuthCheck[Auth Check]
    end
    
    subgraph "Auth Components"
        LoginForm[Login Form]
        SignupForm[Signup Form]
        PasswordReset[Password Reset]
        InstitutionalLogin[InstitutionalLogin.jsx]
    end
    
    subgraph "Auth Services"
        AuthService[authService.js]
        Supabase[Supabase Auth]
        Firebase[Firebase Auth]
    end
    
    Landing --> Login
    Landing --> Signup
    
    Login --> LoginForm
    Login --> InstitutionalLogin
    Signup --> SignupForm
    
    LoginForm --> AuthService
    SignupForm --> AuthService
    InstitutionalLogin --> AuthService
    
    AuthService --> Supabase
    AuthService --> Firebase
    
    ProtectedRoute --> AuthCheck
    AuthCheck --> AuthService
    
    style ProtectedRoute fill:#dc2626,color:#fff
    style AuthService fill:#f59e0b,color:#fff
```

**Authentication Component Props:**

```typescript
// Login Component
interface LoginProps {
  onSuccess?: (user: User) => void;
  redirectTo?: string;
  showInstitutionalOption?: boolean;
}

// Signup Component
interface SignupProps {
  onSuccess?: (user: User) => void;
  defaultRole?: 'student' | 'lecturer' | 'author';
  institutionId?: string;
}

// ProtectedRoute Component
interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'student' | 'lecturer' | 'author' | 'admin';
  requiredPermissions?: string[];
  fallbackPath?: string;
}
```

---

## 🎯 Common & Utility Components

### **Shared Component Library**

```mermaid
graph TB
    subgraph "Common Components"
        ErrorBoundary[ErrorBoundary.jsx<br/>Error Handling]
        PageLoader[PageLoader.jsx<br/>Loading States]
        ScrollToTop[ScrollToTop.jsx<br/>Auto Scroll]
        ThemeToggle[ThemeToggle.tsx<br/>Dark/Light Mode]
        LogoIcon[LogoIcon.jsx<br/>DARE Logo]
        PowerTag[PowerTag.jsx<br/>Branding]
        AnimatedGrid[AnimatedPictureGrid.jsx<br/>Animations]
        InstDropdown[InstitutionDropdown.jsx]
    end
    
    subgraph "UI Components"
        Toast[Toast.jsx<br/>Notifications]
        DemoTour[DemoTour.jsx<br/>Onboarding]
        ScrollUpFAB[ScrollUpFAB.jsx<br/>Floating Button]
        TopProgressBar[TopProgressBar.jsx<br/>Loading Bar]
    end
    
    subgraph "PWA Components"
        InstallPrompt[InstallPrompt.jsx<br/>App Install]
        ServiceWorker[Service Worker Handler]
    end
    
    App[App.jsx] --> ErrorBoundary
    ErrorBoundary --> AllPages[All Pages]
    
    AllPages --> PageLoader
    AllPages --> ScrollToTop
    AllPages --> Toast
    
    NavBar[NavBar] --> ThemeToggle
    NavBar --> LogoIcon
    NavBar --> InstDropdown
    
    Footer[Footer] --> PowerTag
    
    Home[Home Page] --> AnimatedGrid
    Home --> DemoTour
    
    AllPages --> ScrollUpFAB
    AllPages --> TopProgressBar
    
    PWA[PWA Module] --> InstallPrompt
    PWA --> ServiceWorker
    
    style ErrorBoundary fill:#dc2626,color:#fff
    style Toast fill:#10b981,color:#fff
    style InstallPrompt fill:#8b5cf6,color:#fff
```

---

## 📊 Data Flow Patterns

### **State Management Flow**

```mermaid
graph LR
    subgraph "Component Layer"
        Comp[React Component]
    end
    
    subgraph "Hook Layer"
        UseAuth[useAuth Hook]
        UseTheme[useTheme Hook]
    end
    
    subgraph "Context Layer"
        AuthContext[Auth Context]
        ThemeContext[Theme Context]
        GamContext[Gamification Context]
        ToastContext[Toast Context]
    end
    
    subgraph "Service Layer"
        AuthService[authService]
        BooksService[books service]
        AIService[ai service]
    end
    
    subgraph "Data Layer"
        Supabase[(Supabase)]
        LocalStorage[(LocalStorage)]
    end
    
    Comp --> UseAuth
    Comp --> UseTheme
    
    UseAuth --> AuthContext
    UseTheme --> ThemeContext
    
    Comp --> GamContext
    Comp --> ToastContext
    
    AuthContext --> AuthService
    GamContext --> BooksService
    
    AuthService --> Supabase
    BooksService --> Supabase
    AIService --> Supabase
    
    ThemeContext --> LocalStorage
    GamContext --> LocalStorage
```

### **Component Communication Patterns**

```mermaid
graph TB
    subgraph "Parent-Child Communication"
        Parent[Parent Component]
        Child1[Child Component 1]
        Child2[Child Component 2]
        
        Parent -->|Props| Child1
        Parent -->|Props| Child2
        Child1 -->|Callback| Parent
        Child2 -->|Callback| Parent
    end
    
    subgraph "Sibling Communication via Context"
        Sibling1[Component A]
        Context[Shared Context]
        Sibling2[Component B]
        
        Sibling1 -->|Update| Context
        Context -->|Subscribe| Sibling2
    end
    
    subgraph "Event-Based Communication"
        Publisher[Event Publisher]
        EventBus[Event Bus / PubSub]
        Subscriber1[Subscriber 1]
        Subscriber2[Subscriber 2]
        
        Publisher --> EventBus
        EventBus --> Subscriber1
        EventBus --> Subscriber2
    end
```

---

## 🎨 Component Styling Patterns

### **Styling Architecture**

```mermaid
graph TB
    subgraph "Global Styles"
        TailwindConfig[tailwind.config.js]
        IndexCSS[index.css]
        GlobalVars[CSS Variables]
    end
    
    subgraph "Component Styles"
        TailwindClasses[Tailwind Classes]
        CSSModules[CSS Modules]
        InlineStyles[Inline Styles]
    end
    
    subgraph "Theme System"
        ThemeContext[Theme Context]
        DarkMode[Dark Mode]
        LightMode[Light Mode]
    end
    
    TailwindConfig --> TailwindClasses
    IndexCSS --> GlobalVars
    
    GlobalVars --> ThemeContext
    ThemeContext --> DarkMode
    ThemeContext --> LightMode
    
    TailwindClasses --> Components[React Components]
    CSSModules --> Components
    InlineStyles --> Components
    
    DarkMode --> Components
    LightMode --> Components
```

**Styling Convention:**

| Pattern | Use Case | Example |
|---------|----------|---------|
| **Tailwind Utility Classes** | Layout, spacing, basic styling | `className="flex gap-4 p-6"` |
| **CSS Modules** | Component-specific complex styles | `BookCard.module.css` |
| **Global CSS** | Theme variables, resets | `index.css` |
| **Inline Styles** | Dynamic styles based on props | `style={{ width: progress + '%' }}` |

---

## 📱 Responsive Design Patterns

### **Responsive Component Strategy**

```mermaid
graph TB
    subgraph "Breakpoints"
        Mobile[Mobile: < 640px]
        Tablet[Tablet: 640px - 1024px]
        Desktop[Desktop: > 1024px]
    end
    
    subgraph "Adaptive Components"
        NavBar[NavBar]
        MobileNav[Mobile Navigation]
        DesktopNav[Desktop Navigation]
        
        BookGrid[BookGrid]
        SingleCol[1 Column Layout]
        MultiCol[3-4 Column Layout]
        
        Dashboard[Dashboard]
        StackedCards[Stacked Cards]
        GridCards[Grid Layout]
    end
    
    Mobile --> MobileNav
    Tablet --> DesktopNav
    Desktop --> DesktopNav
    
    NavBar --> MobileNav
    NavBar --> DesktopNav
    
    Mobile --> SingleCol
    Tablet --> MultiCol
    Desktop --> MultiCol
    
    BookGrid --> SingleCol
    BookGrid --> MultiCol
    
    Mobile --> StackedCards
    Tablet --> GridCards
    Desktop --> GridCards
    
    Dashboard --> StackedCards
    Dashboard --> GridCards
```

**Responsive Patterns:**

```jsx
// Conditional Rendering
{isMobile ? <MobileMenu /> : <DesktopMenu />}

// Tailwind Responsive Classes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

// useMediaQuery Hook
const isMobile = useMediaQuery('(max-width: 640px)');
```

---

## 🔄 Component Lifecycle & Effects

### **Component Interaction Timeline**

```mermaid
sequenceDiagram
    participant Mount
    participant Component
    participant Service
    participant Context
    participant API
    
    Mount->>Component: Component mounts
    Component->>Component: useEffect (mount)
    Component->>Service: Fetch initial data
    Service->>API: API request
    API-->>Service: Data response
    Service-->>Component: Update state
    Component->>Component: Re-render
    
    Component->>Context: Subscribe to context
    Context-->>Component: Context value
    
    Note over Component: User interaction
    
    Component->>Service: User action
    Service->>API: Update request
    API-->>Service: Success
    Service->>Context: Update global state
    Context-->>Component: Notify change
    Component->>Component: Re-render
    
    Component->>Component: useEffect (unmount)
    Component->>Mount: Component unmounts
```

---

## 🧩 Component Composition Patterns

### **Composition Examples**

```mermaid
graph TB
    subgraph "Container/Presenter Pattern"
        Container[Container Component<br/>Logic & State]
        Presenter[Presenter Component<br/>Pure UI]
        
        Container --> Presenter
    end
    
    subgraph "Compound Components"
        Parent[Parent Component]
        Child1[Child Component 1]
        Child2[Child Component 2]
        SharedContext[Shared Context]
        
        Parent --> SharedContext
        SharedContext --> Child1
        SharedContext --> Child2
    end
    
    subgraph "Higher-Order Components"
        HOC[withAuth HOC]
        WrappedComp[Wrapped Component]
        Enhanced[Enhanced Component]
        
        HOC --> WrappedComp
        WrappedComp --> Enhanced
    end
    
    subgraph "Render Props"
        ParentRP[Parent with Render Prop]
        RenderFn[Render Function]
        ChildRP[Child UI]
        
        ParentRP -->|Provides Data| RenderFn
        RenderFn -->|Renders| ChildRP
    end
```

**Pattern Examples:**

```jsx
// Container/Presenter Pattern
const BookCardContainer = ({ bookId }) => {
  const [book, setBook] = useState(null);
  useEffect(() => {
    fetchBook(bookId).then(setBook);
  }, [bookId]);
  return <BookCardPresenter book={book} />;
};

// Compound Components
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>

// Higher-Order Component
const ProtectedComponent = withAuth(MyComponent);

// Render Props
<DataProvider>
  {({ data, loading }) => (
    <div>{loading ? 'Loading...' : <List data={data} />}</div>
  )}
</DataProvider>
```

---

## 🎯 Component Best Practices

### **Component Design Guidelines**

1. **Single Responsibility**
   - Each component should do one thing well
   - Split complex components into smaller pieces

2. **Props Interface**
   - Use TypeScript interfaces for prop definitions
   - Provide sensible defaults
   - Document complex props with JSDoc

3. **State Management**
   - Keep state as close to where it's used as possible
   - Lift state up when multiple components need it
   - Use context for truly global state

4. **Performance**
   - Use React.memo for expensive pure components
   - Memoize callbacks with useCallback
   - Memoize computed values with useMemo
   - Lazy load heavy components

5. **Accessibility**
   - Use semantic HTML elements
   - Add ARIA labels where needed
   - Ensure keyboard navigation works
   - Test with screen readers

6. **Testing**
   - Write unit tests for component logic
   - Test user interactions
   - Test edge cases and error states

---

## 📦 Component Export Patterns

### **Module Organization**

```javascript
// Named exports for multiple components
export { BookCard } from './BookCard';
export { BookGrid } from './BookGrid';
export { BookDetail } from './BookDetail';

// Default export for main component
export default LibraryPage;

// Barrel exports (index.js)
export * from './components/library';
export * from './components/dashboard';
export * from './components/common';

// Type exports
export type { BookCardProps, BookGridProps } from './types';
```

---

## 🔍 Component Discovery Map

### **Finding Components by Feature**

| Feature | Component Path | Key Components |
|---------|----------------|----------------|
| **Library** | `src/components/library/` | BookCard, FilterPanel, SearchBar |
| **Dashboard** | `src/components/dashboard/` | ReadingGoals, Analytics |
| **AI Tools** | `src/components/` | AIChat, TrainerAI, AIViewer |
| **Layout** | `src/components/layout/` | NavBar, Footer, GlobalSearch |
| **Auth** | `src/pages/` | Login, Signup, ProtectedRoute |
| **Gamification** | `src/components/gamification/` | BadgeDisplay, LevelUpModal |
| **Teacher Tools** | `src/components/tools/` | HBC Assistants, Rubric Tools |
| **Common** | `src/components/common/` | ErrorBoundary, ThemeToggle |
| **UI** | `src/components/ui/` | Toast, ScrollUpFAB, DemoTour |

---

**Last Updated:** 2026-06-24  
**Version:** 1.0.0  
**Related:** See [ARCHITECTURE.md](./ARCHITECTURE.md) for system-level architecture
