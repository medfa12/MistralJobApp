# Sidebar Synchronization Architecture

## Overview
The sidebar chat history automatically refreshes when changes occur anywhere in the application using a custom event-based system.

## Event Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Actions                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │                                         │
        │  History Page Actions:                  │
        │  • Rename conversation                  │
        │  • Delete conversation                  │
        │  • Delete all conversations             │
        │                                         │
        │  Sidebar Actions:                       │
        │  • Rename conversation                  │
        │  • Delete conversation                  │
        │                                         │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  API Call (PATCH/DELETE)                │
        │  • /api/chat/conversations/[id]         │
        │  • /api/chat/conversations/delete-all   │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Database Update                        │
        │  • Update conversation title            │
        │  • Delete conversation(s)               │
        │  • Delete Cloudinary attachments        │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Dispatch Custom Event                  │
        │  window.dispatchEvent(                  │
        │    new CustomEvent('conversationUpdated')│
        │  )                                      │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Sidebar Event Listener                 │
        │  window.addEventListener(               │
        │    'conversationUpdated',               │
        │    handleConversationUpdate             │
        │  )                                      │
        └─────────────────────────────────────────┘
                              │
                              ▼
        ┌─────────────────────────────────────────┐
        │  Sidebar Refreshes                      │
        │  fetchConversations(false)              │
        │  • Updates conversation list            │
        │  • No loading spinner                   │
        └─────────────────────────────────────────┘
```

## Components Involved

### 1. History Page (`app/history/page.tsx`)
**Responsibilities:**
- Display all conversations with pagination
- Handle rename, delete, and delete all operations
- Dispatch `conversationUpdated` event after successful operations

**Event Dispatch Locations:**
```typescript
// After rename
handleRename() {
  // ... API call ...
  window.dispatchEvent(new CustomEvent('conversationUpdated'));
}

// After delete
handleDelete() {
  // ... API call ...
  window.dispatchEvent(new CustomEvent('conversationUpdated'));
}

// After delete all
handleDeleteAll() {
  // ... API call ...
  window.dispatchEvent(new CustomEvent('conversationUpdated'));
}
```

### 2. Sidebar Links (`src/components/sidebar/components/Links.tsx`)
**Responsibilities:**
- Display recent conversations (limit 20)
- Listen for conversation updates
- Handle rename and delete from sidebar
- Auto-refresh on various triggers

**Event Listeners:**
```typescript
useEffect(() => {
  // 1. Window focus - user returns to tab
  window.addEventListener('focus', handleFocus);
  
  // 2. Visibility change - tab becomes visible
  document.addEventListener('visibilitychange', handleVisibilityChange);
  
  // 3. Custom event - conversation updated
  window.addEventListener('conversationUpdated', handleConversationUpdate);
  
  return () => {
    window.removeEventListener('focus', handleFocus);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('conversationUpdated', handleConversationUpdate);
  };
}, [fetchConversations]);

// 4. Polling - every 30 seconds
useEffect(() => {
  const interval = setInterval(() => fetchConversations(false), 30000);
  return () => clearInterval(interval);
}, [fetchConversations]);
```

## Refresh Strategies

### 1. Immediate Refresh (Event-Based)
- **Trigger**: Custom `conversationUpdated` event
- **Use Case**: User performs action in history page or sidebar
- **Behavior**: Instant refresh without loading spinner
- **Advantage**: Real-time synchronization

### 2. Focus Refresh
- **Trigger**: Window gains focus
- **Use Case**: User switches back to the tab
- **Behavior**: Silent refresh
- **Advantage**: Catches external changes

### 3. Visibility Refresh
- **Trigger**: Tab becomes visible
- **Use Case**: User switches between tabs
- **Behavior**: Silent refresh
- **Advantage**: Updates when tab is viewed

### 4. Polling Refresh
- **Trigger**: 30-second interval
- **Use Case**: Background updates
- **Behavior**: Silent refresh
- **Advantage**: Catches changes from other devices/sessions

### 5. Initial Load
- **Trigger**: Component mount
- **Use Case**: First render
- **Behavior**: Shows loading spinner
- **Advantage**: Initial data fetch

## Data Flow

```
┌──────────────┐         ┌──────────────┐         ┌──────────────┐
│              │         │              │         │              │
│  History     │────────▶│  API         │────────▶│  Database    │
│  Page        │  PATCH  │  Endpoint    │  UPDATE │              │
│              │  DELETE │              │  DELETE │              │
└──────────────┘         └──────────────┘         └──────────────┘
       │                                                  │
       │ Dispatch Event                                  │
       ▼                                                  │
┌──────────────┐                                         │
│              │                                         │
│  Window      │                                         │
│  Event Bus   │                                         │
│              │                                         │
└──────────────┘                                         │
       │                                                  │
       │ Listen Event                                    │
       ▼                                                  │
┌──────────────┐         ┌──────────────┐               │
│              │         │              │               │
│  Sidebar     │────────▶│  API         │───────────────┘
│  Links       │   GET   │  Endpoint    │    FETCH
│              │         │              │
└──────────────┘         └──────────────┘
```

## Benefits

1. **Real-time Sync**: Changes appear immediately across all components
2. **Decoupled Architecture**: Components don't need direct references
3. **Scalable**: Easy to add more listeners in other components
4. **Reliable**: Multiple fallback refresh strategies
5. **User-Friendly**: No manual refresh needed

## Future Enhancements

1. **WebSocket Integration**: For multi-device real-time sync
2. **Optimistic Updates**: Update UI before API response
3. **Local Storage Cache**: Persist conversations for offline viewing
4. **Debounced Events**: Prevent multiple rapid refreshes
5. **Selective Updates**: Only update changed conversations instead of full refresh

