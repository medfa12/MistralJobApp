# Mistral Artifacts Chat Integration Plan

## Overview
This document outlines the complete integration plan for adding Claude Artifacts-like functionality to the Mistral chat interface.

## Phase 1: Types & Data Structures ✅

### New Types to Add to `/src/types/types.ts`:

```typescript
export interface ArtifactData {
  identifier: string;         // Unique ID for the artifact
  type: 'react' | 'html' | 'javascript' | 'vue';
  title: string;              // Display title
  code: string;               // The actual code
  createdAt: string;          // ISO timestamp
  updatedAt?: string;         // ISO timestamp for updates
}

export interface MessageWithArtifact extends Message {
  artifact?: ArtifactData;     // Optional artifact attached to message
}

export interface InspectedCodeAttachment {
  type: 'inspected-code';
  elementTag: string;
  code: string;
  styles?: string;
  sourceArtifactId: string;
}
```

## Phase 2: Artifact Detection & Parsing

### Create `/src/utils/artifactParser.ts`:

```typescript
/**
 * Parses artifact tags from model response
 * Format: <artifact identifier="id" type="react" title="Title">```code```</artifact>
 */
export function parseArtifacts(text: string): {
  cleanText: string;
  artifacts: ArtifactData[];
}

/**
 * Extracts code from markdown code blocks
 */
export function extractCode(text: string): string

/**
 * Validates artifact code for security/safety
 */
export function validateArtifactCode(code: string, type: string): {
  valid: boolean;
  errors?: string[];
}
```

## Phase 3: Chat Integration

### Update `/app/chat/page.tsx`:

1. **Add artifact state**:
```typescript
const [artifacts, setArtifacts] = useState<Map<string, ArtifactData>>(new Map());
const [inspectedCodeAttachment, setInspectedCodeAttachment] = useState<InspectedCodeAttachment | null>(null);
```

2. **Process streaming responses**:
   - Detect artifact tags in real-time
   - Extract and parse artifacts
   - Store in artifacts Map
   - Display in chat

3. **Add artifact display in message**:
   - Show ArtifactRenderer component inline
   - Add "Open in full screen" button
   - Add "Edit code" button (opens in CodeView)

### Update `/src/components/MessageBoxChat.tsx`:

1. **Add artifact prop**:
```typescript
export default function MessageBox(props: { 
  output: string; 
  attachments?: Attachment[];
  artifact?: ArtifactData;  // NEW
})
```

2. **Render artifact**:
   - Show artifact below message text
   - Add collapsible section
   - Include artifact metadata (title, type)

## Phase 4: Inspect Element Integration

### Enhance `/src/components/artifact/PreviewView.tsx`:

1. **Add code extraction on element click**:
```typescript
const extractElementCode = (element: Element): string => {
  // Get element's HTML
  // Get computed styles
  // Format as readable code
  // Return formatted code
}
```

2. **Add attachment creation**:
```typescript
const handleElementSelect = (element: Element) => {
  const code = extractElementCode(element);
  onCodeAttach?.({
    type: 'inspected-code',
    elementTag: element.tagName,
    code,
    sourceArtifactId: artifact.identifier
  });
}
```

3. **Add callback prop**:
```typescript
interface Props {
  artifact: ArtifactData;
  onCodeAttach?: (attachment: InspectedCodeAttachment) => void;
}
```

### Update Chat Input Area:

1. **Show inspected code attachment**:
```tsx
{inspectedCodeAttachment && (
  <Flex 
    bg="purple.50" 
    p={3} 
    borderRadius="md"
    align="center"
    gap={2}
  >
    <Icon as={MdCode} />
    <Box flex={1}>
      <Text fontWeight="bold" fontSize="sm">
        Inspected: {inspectedCodeAttachment.elementTag}
      </Text>
      <Text fontSize="xs" color="gray.600" noOfLines={1}>
        {inspectedCodeAttachment.code.slice(0, 50)}...
      </Text>
    </Box>
    <IconButton 
      icon={<MdClose />}
      size="sm"
      onClick={() => setInspectedCodeAttachment(null)}
    />
  </Flex>
)}
```

2. **Include in message**:
   - Append inspected code to user message
   - Format as: "I'd like to modify this element: [code snippet]"
   - Send to model for contextual editing

## Phase 5: Database Schema

### Add artifacts table (if persistence needed):

```sql
CREATE TABLE artifacts (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id),
  message_id UUID REFERENCES messages(id),
  identifier VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255),
  code TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP
);

CREATE INDEX idx_artifacts_conversation ON artifacts(conversation_id);
CREATE INDEX idx_artifacts_identifier ON artifacts(identifier);
```

## Phase 6: System Prompt Update

### Update `/src/utils/chatStream.ts`:

Replace simple system prompt with artifact-aware prompt:

```typescript
import { artifactSystemPrompt } from './artifactSystemPrompt';

const systemPrompt = artifactSystemPrompt;
```

## Implementation Checklist

### Step 1: Core Infrastructure
- [ ] Create artifact types in types.ts
- [ ] Create artifactParser.ts utility
- [ ] Create artifactSystemPrompt.ts
- [ ] Add artifact state to chat page

### Step 2: Artifact Display
- [ ] Update MessageBoxChat to show artifacts
- [ ] Add ArtifactRenderer integration
- [ ] Add artifact metadata display
- [ ] Add expand/collapse functionality

### Step 3: Artifact Detection
- [ ] Parse artifact tags from response
- [ ] Extract code from markdown blocks
- [ ] Validate artifact code
- [ ] Store artifacts in state

### Step 4: Inspect Element Feature
- [ ] Add onCodeAttach callback to PreviewView
- [ ] Implement element code extraction
- [ ] Add attachment UI in chat input
- [ ] Include attachment in message sending

### Step 5: Message Context
- [ ] Format inspected code for model
- [ ] Add artifact context to messages
- [ ] Handle artifact updates
- [ ] Preserve artifact history

### Step 6: Database (Optional)
- [ ] Add artifacts table migration
- [ ] Add artifact save/load API endpoints
- [ ] Integrate with message persistence
- [ ] Add artifact versioning

### Step 7: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add artifact deletion
- [ ] Add artifact export
- [ ] Add keyboard shortcuts
- [ ] Add mobile responsiveness

## Usage Flow

### Creating an Artifact:

1. User: "Create a todo list component"
2. Model responds with artifact tag:
   ```
   Here's a todo list component:

   <artifact identifier="todo-list" type="react" title="Todo List">
   ```jsx
   function TodoList() {
     const [todos, setTodos] = React.useState([]);
     // ...
   }
   window.App = TodoList;
   ```
   </artifact>
   ```
3. System detects artifact tag
4. Parses and renders ArtifactRenderer
5. Shows live preview in chat

### Inspecting an Element:

1. User clicks 🔍 in preview tab
2. User hovers over button element
3. User clicks button
4. System extracts button code & styles
5. Shows attachment chip in input area
6. User types: "Make this button bigger"
7. System includes button code in message
8. Model receives context and updates artifact

### Updating an Artifact:

1. User: "Add a delete button to each todo"
2. Model responds with same identifier:
   ```
   <artifact identifier="todo-list" type="react" title="Todo List with Delete">
   ```jsx
   // Updated code with delete functionality
   ```
   </artifact>
   ```
3. System detects existing identifier
4. Updates artifact in state
5. ArtifactRenderer shows updated version

## Security Considerations

1. **Sandbox all artifact code**:
   - Use iframe with sandbox attribute
   - Restrict allow-scripts, allow-same-origin only
   - No network access from artifacts

2. **Validate code before rendering**:
   - Check for dangerous patterns
   - Block eval(), Function(), etc.
   - Sanitize HTML

3. **Limit artifact size**:
   - Max 10KB code per artifact
   - Max 10 artifacts per conversation
   - Rate limit artifact creation

4. **CSP headers**:
   - Add Content-Security-Policy
   - Restrict script sources to CDN only
   - No inline event handlers in HTML

## Testing Plan

1. **Unit Tests**:
   - artifactParser.ts functions
   - Code extraction utilities
   - Validation functions

2. **Integration Tests**:
   - Artifact detection in responses
   - Artifact rendering
   - Inspect element feature

3. **E2E Tests**:
   - Full artifact creation flow
   - Artifact update flow
   - Inspect and modify flow

## Performance Considerations

1. **Lazy load artifacts**:
   - Don't render all at once
   - Use intersection observer
   - Virtualize long conversations

2. **Debounce inspect hover**:
   - Avoid excessive re-renders
   - Use requestAnimationFrame

3. **Memoize artifact components**:
   - React.memo for ArtifactRenderer
   - useMemo for parsed artifacts

## Next Steps

After reviewing this plan:
1. Approve/modify the approach
2. Start with Phase 1 (types)
3. Implement artifact detection
4. Add UI integration
5. Test thoroughly
6. Deploy to production


