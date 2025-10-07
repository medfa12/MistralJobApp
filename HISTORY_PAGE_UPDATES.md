# History Page Updates

## Summary
Enhanced the chat history page with delete all functionality, list/grid view toggle, sidebar synchronization, and improved UI.

## Changes Made

### 1. New API Endpoint: `/api/chat/conversations/delete-all`
**File:** `pages/api/chat/conversations/delete-all.ts`

- Deletes all conversations for the authenticated user
- Loops through all conversations and deletes:
  - All messages
  - All artifacts (via cascade)
  - All attachments from Cloudinary
- Returns the count of deleted conversations
- Includes proper error handling and authentication

### 2. Enhanced History Page UI
**File:** `app/history/page.tsx`

#### New Features:

**a) Delete All Button**
- Red "Delete All" button appears when conversations exist
- Opens a confirmation modal with warning
- Shows detailed information about what will be deleted
- Displays loading state during deletion
- Shows success toast with count of deleted conversations

**b) View Mode Toggle**
- Grid/List view toggle buttons in the header
- Grid view: 3-column responsive layout (existing)
- List view: Single column compact layout with all info in one row
- Icons: MdViewModule (grid) and MdViewList (list)
- Active state highlighted with brand color

**c) List View Layout**
- Compact horizontal layout
- Shows: Icon, Title, Model badge, Artifacts count, Attachments count, Date, Actions menu
- Better for scanning many conversations quickly
- Responsive and mobile-friendly

**d) Improved Header Layout**
- Reorganized header with better spacing
- Search bar, view toggle, and delete all button grouped together
- Responsive flexbox layout

#### State Management:
- Added `viewMode` state ('grid' | 'list')
- Added `deletingAll` loading state
- Added `isDeleteAllOpen` modal state

#### New Functions:
- `handleDeleteAll()`: Calls the delete-all API endpoint
- View mode toggle handlers

### 3. Pagination
**Status:** Already implemented ✅
- Load more button shows remaining count
- Pagination info displays "Showing X of Y conversations"
- Debounced search functionality
- Offset-based pagination with hasMore flag

## API Endpoints Used

### Existing:
- `GET /api/chat/conversations` - Fetch conversations with pagination
- `DELETE /api/chat/conversations/[id]` - Delete single conversation
- `PATCH /api/chat/conversations/[id]` - Rename conversation

### New:
- `DELETE /api/chat/conversations/delete-all` - Delete all user conversations

## UI Components

### Modals:
1. **Rename Modal** (existing)
   - Input field for new title
   - Cancel/Rename buttons

2. **Delete All Modal** (new)
   - Warning banner with icon
   - Detailed list of what will be deleted
   - Total conversation count
   - Cancel/Delete All buttons
   - Loading state during deletion

### View Modes:
1. **Grid View** (default)
   - Card-based layout
   - 3 columns on desktop, 2 on tablet, 1 on mobile
   - Hover effects with transform
   - Hidden menu button (shows on hover)

2. **List View** (new)
   - Single column layout
   - Horizontal information display
   - Always visible menu button
   - Compact spacing

## Icons Used
- `MdDeleteSweep` - Delete all button
- `MdViewModule` - Grid view toggle
- `MdViewList` - List view toggle
- `MdMessage` - Conversation icon
- `MdAttachFile` - Attachments indicator
- `MdMoreVert` - Options menu
- `MdEdit`, `MdDelete`, `MdVisibility` - Menu items

## Color Scheme
- Delete button: Red outline (`colorScheme="red"`)
- Active view toggle: Brand color (orange gradient)
- Warning banner: Red background with red text
- Maintains existing dark/light mode support

## Sidebar Synchronization

### Event-Based Communication
The history page now dispatches a custom `conversationUpdated` event whenever:
- A conversation is renamed
- A conversation is deleted
- All conversations are deleted

The sidebar listens for this event and automatically refreshes its conversation list.

### Implementation Details:
```typescript
// Dispatch event after any conversation change
if (typeof window !== 'undefined') {
  window.dispatchEvent(new CustomEvent('conversationUpdated'));
}
```

### Sidebar Refresh Triggers:
1. **Custom Event**: `conversationUpdated` event from history page
2. **Window Focus**: When user returns to the tab
3. **Visibility Change**: When tab becomes visible
4. **Polling**: Every 30 seconds (background refresh)
5. **Initial Load**: On component mount

This ensures the sidebar always shows the most up-to-date conversation list, regardless of where changes are made.

## Testing Recommendations
1. Test delete all with multiple conversations
2. Verify Cloudinary attachments are deleted
3. Test view mode toggle persistence (could add localStorage)
4. Test responsive layout on mobile
5. Test pagination with delete all
6. Verify search works with both view modes
7. Test empty state after delete all
8. **Test sidebar refresh**: Rename/delete conversations in history page and verify sidebar updates immediately
9. **Test cross-page sync**: Delete from sidebar, navigate to history page and verify it's updated
10. **Test delete all sync**: Delete all conversations and verify sidebar shows "No conversations yet"

