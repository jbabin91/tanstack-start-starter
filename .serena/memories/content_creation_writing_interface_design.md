# Content Creation & Writing Interface Design Specification

## Overview

This document defines the content creation and writing interface for our Medium-like blogging platform, featuring a GitHub-style markdown editor with organization review workflows, co-authoring capabilities, and context-aware publishing.

**Related Documentation:**

- [Project Overview](../../../docs/overview/introduction.md) - Technical stack and project status
- [API Documentation](../../../docs/api/index.md) - Server function implementations
- [Development Guide](../../../docs/development/index.md) - Implementation patterns and standards

## Core Design Principles

### 1. GitHub-Style Simplicity

- Markdown-first editing with live preview toggle
- Clean, distraction-free writing environment
- Standard markdown features without custom extensions
- Familiar interface for developers and technical writers

### 2. Organization-Aware Publishing

- Clear distinction between personal posts and organization posts
- Review workflows for organization-official content
- Flexible moderation for user-to-organization posts
- Co-authoring support with proper attribution

### 3. Draft-Centric Workflow

- Auto-save functionality for seamless writing
- Draft sharing for collaborative feedback
- Organization templates and guidelines integration
- Context-aware draft management

## Editor Architecture

### Writing Interface Design

#### Markdown Editor Layout

````text
┌─────────────────────────────────────────────────────────────────────┐
│ [Write] [Preview] [Split]     [Save Draft] [Publish] [Settings ⚙️] │
├─────────────────────────────────────────────────────────────────────┤
│ # Post Title                                                         │
│                                                                     │
│ ## Your markdown content here...                                    │
│                                                                     │
│ - Standard markdown formatting                                       │
│ - **Bold**, *italic*, `code`                                       │
│ - [Links](https://example.com)                                     │
│ - Images: ![alt text](image-url)                                   │
│                                                                     │
│ ```javascript                                                      │
│ // Code blocks with syntax highlighting                            │
│ const example = "supported";                                       │
│ ```                                                                │
│                                                                     │
│ > Blockquotes and other standard markdown                          │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ 📊 Words: 247 | Reading time: 1 min | Last saved: 2 min ago       │
└─────────────────────────────────────────────────────────────────────┘
````

#### Editor Modes

1. **Write Mode**: Full-width markdown editor
2. **Preview Mode**: Full-width rendered preview
3. **Split Mode**: Side-by-side editor and preview

### Publishing Context Selection

#### Context Header (appears above editor)

```typescript
// Organization Context Selector
interface PublishingContext {
  type: 'personal' | 'organization';
  organizationId?: string;
  publishingMode?: 'official' | 'member';
  coAuthors?: string[];
  requiresReview?: boolean;
}

// UI Layout
┌─────────────────────────────────────────────────────────────────────┐
│ Publishing as: [Personal ▼] | [+ Add Co-authors]                   │
│                                                                     │
│ Options when "TechCorp" selected:                                   │
│ ○ Post as TechCorp member (moderated by org)                      │
│ ○ Post as official TechCorp (requires review)                     │
│                                                                     │
│ Co-authors: [@jane] [@john] [+ Add]                                │
│                                                                     │
│ ⚠️ This post will require approval from TechCorp admins             │
└─────────────────────────────────────────────────────────────────────┘
```

## Organization Publishing Workflows

### Publishing Types & Review Process

#### 1. Personal Posts

- **Author**: Individual user
- **Context**: Personal profile
- **Review**: None required
- **URL**: `/@username/post-slug`
- **Attribution**: "By Jane Doe"

#### 2. Organization Member Posts

- **Author**: User posting to organization
- **Context**: Organization visibility
- **Review**: None required, but organization can moderate post-publication
- **URL**: `/organizations/techcorp/members/post-slug` or `/@username/post-slug?org=techcorp`
- **Attribution**: "By Jane Doe in TechCorp"
- **Moderation**: Org admins can hide/remove/flag

#### 3. Official Organization Posts

- **Author**: User posting on behalf of organization
- **Context**: Official organization content
- **Review**: Required approval from organization admins
- **URL**: `/organizations/techcorp/post-slug`
- **Attribution**: "By TechCorp" (with co-authors listed)
- **Workflow**: Draft → Review → Approved/Rejected → Published

#### 4. Co-authored Posts

- **Authors**: Multiple users collaborating
- **Context**: Any of the above types
- **Review**: Based on publishing type and organization requirements
- **Attribution**: "By TechCorp with Jane Doe, John Smith"
- **Permissions**: All co-authors can edit until published

### Review Workflow Interface

#### For Organization Admins

```text
┌─────────────────────────────────────────────────────────────────────┐
│ 📝 Posts Awaiting Review (3)                                        │
├─────────────────────────────────────────────────────────────────────┤
│ "How to Scale React Applications"                                   │
│ By Jane Doe, John Smith • Draft created 2 days ago                 │
│ 📊 1,247 words • 5 min read                                        │
│                                                                     │
│ [Preview] [Request Changes] [Approve & Publish] [Reject]           │
│                                                                     │
│ Comments from reviewers:                                            │
│ 💬 "Looks good, just fix the typo in paragraph 3" - Admin          │
├─────────────────────────────────────────────────────────────────────┤
│ "Product Launch Announcement"                                       │
│ By Marketing Team • Draft created 1 day ago                        │
│ [Review buttons...]                                                 │
└─────────────────────────────────────────────────────────────────────┘
```

#### For Authors

```text
┌─────────────────────────────────────────────────────────────────────┐
│ 📋 Your Submissions                                                 │
├─────────────────────────────────────────────────────────────────────┤
│ "How to Scale React Applications"                                   │
│ Status: 🟡 Under Review by TechCorp admins                         │
│ Submitted: 2 days ago • Last updated: 1 day ago                    │
│                                                                     │
│ Recent activity:                                                    │
│ 💬 Admin requested changes: "Fix typo in paragraph 3"              │
│ 📝 You updated the draft • 1 day ago                               │
│                                                                     │
│ [Edit Draft] [View Comments] [Withdraw Submission]                 │
└─────────────────────────────────────────────────────────────────────┘
```

## Co-authoring System

### Co-author Management

#### Adding Co-authors

```typescript
interface CoAuthor {
  userId: string;
  name: string;
  username: string;
  avatar?: string;
  role: 'editor' | 'viewer' | 'reviewer';
  addedBy: string;
  addedAt: Date;
}

// UI for adding co-authors
('Add co-authors: [@username] [Search users...]');
('Invite by email: [email@example.com] [Send invite]');
```

#### Co-author Permissions

- **Editor**: Can edit content, manage other co-authors, publish
- **Viewer**: Can view draft and leave comments
- **Reviewer**: Can view, comment, and approve for organization posts

#### Attribution Logic

```typescript
function generateByline(post: Post): string {
  const authors = post.coAuthors || [post.author];

  if (post.organizationId && post.publishingType === 'official') {
    // Official org post: "By TechCorp with Jane Doe, John Smith"
    const coAuthorNames = authors.map((a) => a.name).join(', ');
    return `By ${post.organization.name}${coAuthorNames ? ' with ' + coAuthorNames : ''}`;
  } else if (post.organizationId) {
    // Member post: "By Jane Doe, John Smith in TechCorp"
    const authorNames = authors.map((a) => a.name).join(', ');
    return `By ${authorNames} in ${post.organization.name}`;
  } else {
    // Personal post: "By Jane Doe, John Smith"
    return `By ${authors.map((a) => a.name).join(', ')}`;
  }
}
```

## Draft Management & Auto-save

### Auto-save System

#### Auto-save Behavior

- **Frequency**: Every 10 seconds while actively typing, immediately on pause (2 seconds of inactivity)
- **Indicators**: "Saving...", "Saved 2 minutes ago", "Failed to save - Retry"
- **Conflict Resolution**: Last-write-wins with conflict detection
- **Offline Support**: Cache locally, sync when connection restored

#### Draft States

```typescript
type DraftStatus =
  | 'editing' // Currently being edited
  | 'saved' // Auto-saved successfully
  | 'saving' // Save in progress
  | 'error' // Save failed
  | 'shared' // Shared for feedback
  | 'submitted' // Submitted for org review
  | 'under_review' // Being reviewed by org admins
  | 'approved' // Approved, ready to publish
  | 'rejected'; // Rejected, needs revisions
```

### Draft Sharing for Feedback

#### Share Draft Interface

```text
┌─────────────────────────────────────────────────────────────────────┐
│ 🔗 Share Draft for Feedback                                         │
├─────────────────────────────────────────────────────────────────────┤
│ Share with: [@username] [@username] [+ Add reviewer]               │
│                                                                     │
│ ○ Can view and comment                                              │
│ ○ Can view, comment, and edit                                       │
│                                                                     │
│ Message (optional):                                                 │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ Hey team, please review this draft before I submit it for      │ │
│ │ organization approval. Focus on technical accuracy in section 3 │ │
│ └─────────────────────────────────────────────────────────────────┘ │
│                                                                     │
│ 🔗 Shareable link: https://platform.com/draft/abc123              │
│ [Copy Link] [Send Notifications]                                   │
│                                                                     │
│ This draft will be accessible to reviewers until you publish it.   │
└─────────────────────────────────────────────────────────────────────┘
```

#### Draft Comments System

```typescript
interface DraftComment {
  id: string;
  draftId: string;
  authorId: string;
  content: string;
  lineNumber?: number; // For inline comments
  resolved: boolean;
  createdAt: Date;
  replies?: DraftComment[];
}

// UI for commenting
('💬 3 comments | 1 unresolved');
('[Resolve all] [Export comments]');

// Inline comments in preview mode
('Line 25: > This section needs more examples - @reviewer');
('[Reply] [Resolve]');
```

## Organization Templates & Guidelines

### Organization Settings for Content

#### Template System

```typescript
interface OrganizationTemplate {
  id: string;
  organizationId: string;
  name: string;
  description: string;
  content: string; // Markdown template
  category: 'blog-post' | 'announcement' | 'tutorial' | 'press-release';
  isDefault: boolean;
  createdBy: string;
  updatedAt: Date;
}

// UI for templates
('📝 Templates');
('- Blog Post Template (default)');
('- Product Announcement');
('- Technical Tutorial');
('- Press Release');
('[+ Create New Template]');
```

#### Writing Guidelines

```typescript
interface OrganizationGuidelines {
  organizationId: string;
  guidelines: {
    tone: string; // "Professional, friendly, technical"
    style: string; // "Use active voice, avoid jargon"
    structure: string; // "Always include introduction, conclusion"
    required_sections?: string[]; // ["Overview", "Implementation", "Conclusion"]
    review_checklist?: string[]; // ["Technical accuracy verified", "Legal review complete"]
  };
  enforcementLevel: 'suggestion' | 'required';
}

// UI in editor
('📋 TechCorp Writing Guidelines');
('✓ Use active voice');
('⚠️ Missing required section: Conclusion');
('[View Full Guidelines]');
```

## URL Structure & SEO

### URL Patterns

#### Personal Posts

```text
/@username/post-slug
/@janesmith/how-to-build-react-apps
```

#### Organization Member Posts

```text
/@username/post-slug (with org context)
/@janesmith/scaling-databases?org=techcorp
```

#### Official Organization Posts

```text
/organizations/org-slug/post-slug
/organizations/techcorp/product-launch-2024
```

#### Draft URLs

```text
/draft/[draft-id] (private, shareable)
/draft/abc123?token=xyz789 (shared for review)
```

### SEO & Meta Data

#### Post Metadata

```typescript
interface PostMetadata {
  title: string;
  description: string; // Auto-generated from first paragraph or custom
  tags: string[];
  category?: string;
  readingTime: number; // Auto-calculated
  wordCount: number;
  publishedAt: Date;
  updatedAt?: Date;
  canonicalUrl?: string;
  socialImage?: string; // Auto-generated or custom
}
```

#### Social Media Preview Generation

- Auto-generate Open Graph images with post title and author
- Extract description from first paragraph if not provided
- Include organization branding for org posts

## Editor Features & Markdown Support

### Supported Markdown Features

#### Standard Formatting

```markdown
# Headers (H1-H6)

**Bold text** and _italic text_
~~Strikethrough~~
`Inline code`

- Unordered lists

1. Ordered lists

- Nested lists

[Links](https://example.com)
![Images with alt text](image-url.jpg)

> Blockquotes
> Multi-line quotes

---

Horizontal rules

| Tables | Are   | Supported |
| ------ | ----- | --------- |
| Col 1  | Col 2 | Col 3     |
```

#### Code Blocks

`````markdown
````javascript
// Syntax highlighting for popular languages
const example = "code block";
function demo() {
  return "highlighted";
}
```\`
````
`````

````text

#### Extended Features

```markdown
- [x] Task lists / checkboxes
- [ ] Unchecked items

:emoji: Basic emoji support (:smile:, :heart:, etc.)

Footnotes[^1]
[^1]: Footnote content appears at bottom
```

### Editor Enhancements

#### Toolbar (Optional/Collapsible)

```text
[B] [I] [H1] [H2] [H3] [Quote] [Code] [Link] [Image] [List] [Table]
```

#### Keyboard Shortcuts

- `Cmd/Ctrl + B`: Bold
- `Cmd/Ctrl + I`: Italic
- `Cmd/Ctrl + K`: Link
- `Cmd/Ctrl + Shift + C`: Code block
- `Cmd/Ctrl + S`: Save draft
- `Cmd/Ctrl + Shift + P`: Preview toggle

#### Smart Features

- Auto-completion for usernames (@username)
- Auto-completion for tags (#javascript)
- Auto-linking of URLs
- Smart quotes and dashes
- Paste handling (convert from Word, Google Docs)

## Mobile Writing Experience

### Mobile Editor Considerations

#### Simplified Interface

```text
┌─────────────────────────────┐
│ [< Back] Post Title [Save]  │
├─────────────────────────────┤
│ # Your title here           │
│                             │
│ Write your content...       │
│                             │
│ [Preview] [Settings]        │
│                             │
├─────────────────────────────┤
│ [Aa] [#] [B] [I] [{}] [📷] │
└─────────────────────────────┘
```

#### Mobile-Specific Features

- Swipe to toggle preview mode
- Touch-friendly formatting toolbar
- Voice-to-text integration
- Camera integration for images
- Simplified co-author management

## Performance & Technical Considerations

### Editor Performance

- **Large Documents**: Virtual scrolling for posts >10k words
- **Real-time Sync**: Debounced auto-save with conflict resolution
- **Offline Mode**: LocalStorage backup with sync on reconnect
- **Memory Management**: Efficient markdown parsing and preview rendering

### Image Handling

```typescript
interface ImageUpload {
  file: File;
  alt: string;
  caption?: string;
  organizationId?: string; // For org asset library
}

// Upload process
// 1. Client-side resize/optimization
// 2. Upload to CDN/storage
// 3. Auto-generate multiple sizes
// 4. Insert markdown: ![alt](optimized-url)
```

### Collaboration Tech Stack

- **Real-time Sync**: WebSocket or Server-Sent Events
- **Conflict Resolution**: Operational Transform or CRDT
- **Draft Storage**: Database with efficient diff storage
- **Comment System**: Nested threads with line-number anchoring

This design creates a powerful but familiar writing experience that scales from individual creators to large organizations with complex review workflows.
````
