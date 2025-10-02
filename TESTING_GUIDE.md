# Testing Guide - Hover Cards & Attachment Support

## ✅ Build Status: SUCCESS

All code has been integrated and compiled successfully:
- TypeScript: ✅ No errors
- Next.js Build: ✅ Completed
- All dependencies: ✅ Resolved

---

## 🔍 Debug Logging Added

I've added console.log statements to help you see what's happening:

### When you hover over a model button, you should see:
```
🎯 HOVER MODEL: mistral-small-latest
📍 Position: { x: 450, y: 520 }
```

### When you move mouse away:
```
👋 LEAVE MODEL
```

### This will tell us if:
1. Event handlers are firing
2. Position is being calculated
3. State is updating

---

## 🎯 Step-by-Step Testing Instructions

### 1. Start Your Server
```bash
npm run dev
```

### 2. Login (IMPORTANT!)
- Go to: `http://localhost:3000/auth/login`
- The chat page redirects if you're not authenticated

### 3. Navigate to Chat
- Go to: `http://localhost:3000/chat`
- Open Browser DevTools (F12 or Cmd+Option+I)
- Go to "Console" tab to see debug logs

### 4. Expand Model Selector
- Look for button near top that says "Change Model" or "Hide Models"
- **Click it** to show the 4 model buttons
- If it's already showing models, you're good

### 5. Test Hover
- **Slowly** move your mouse over "Mistral Small" button
- **Wait** 200-300ms
- **Check console** for:
  - `🎯 HOVER MODEL: mistral-small-latest`
  - `📍 Position: { x: ..., y: ... }`

### 6. Look for Card
- A card should appear **below** the button showing:
  ```
  [Icon] Mistral Small
         v25.06 • mistral-small-2506
  
  Fast and efficient for simple tasks with vision support
  
  [128K context] [8K output]
  
  Pricing (per 1M tokens)
  $0.20 input  $0.60 output
  
  Supported Attachments
  📷 Images: PNG, JPEG, WEBP, GIF • 10MB
  📄 Documents: PDF • 50MB
  
  Key Features
  ✓ Fast responses
  ✓ Cost-effective
  ✓ General purpose
  ✓ Vision & Document QnA
  ```

### 7. Test Other Models
- Hover over "Mistral Large" → Should show Images + Documents
- Hover over "Magistral Small" → Should show ONLY Images (no documents)
- Hover over "Magistral Medium" → Should show ONLY Images

### 8. Test Transitions
- Move mouse from one model to another without leaving
- Card should smoothly transition to new model info

---

## 🐛 Troubleshooting

### Case 1: Console shows logs but no card appears

**Problem**: Event handlers fire but component doesn't render

**Solutions**:
1. Check z-index - card has `zIndex={1000}`, something might be covering it
2. Check if `<Box position="relative">` is properly wrapping the models
3. Try adding `!important` to z-index in ModelOverviewCard.tsx
4. Check if framer-motion AnimatePresence is working

**Quick Fix**:
```tsx
// In ModelOverviewCard.tsx, change:
zIndex={1000}
// To:
zIndex="9999 !important"
```

### Case 2: No console logs appear

**Problem**: Event handlers not firing

**Solutions**:
1. Verify model selector is expanded (click "Change Model")
2. Check if elements have `pointer-events: none` in CSS
3. Try clicking the button instead of hovering - if click works, hover should too
4. Check browser console for JavaScript errors

**Quick Test**:
```tsx
// Add onClick to test if events work at all:
onClick={() => console.log('CLICK WORKS')}
```

### Case 3: Card appears in wrong position

**Problem**: Positioning calculation issue

**Solutions**:
1. Check console for position values - should be reasonable numbers
2. Try different browser/zoom level
3. Card uses `transform="translateX(-50%)"` to center - might need adjustment

**Quick Fix**:
```tsx
// In chat page.tsx handleModelHover, change:
x: rect.left + rect.width / 2,
// To:
x: rect.left,
// Remove transform in ModelOverviewCard
```

### Case 4: Page won't load/crashes

**Problem**: Runtime error

**Solutions**:
1. Check browser console for error message
2. Check terminal for server errors
3. Clear .next folder and rebuild:
```bash
rm -rf .next
npm run dev
```

---

## 📋 What Each File Does

### `src/config/models.ts`
- Defines model data with attachment support
- Each model has `supportedAttachments` array
- Each model has `attachmentLimits` object

### `src/components/ModelOverviewCard.tsx`
- The animated card component
- Receives model data as prop
- Shows attachment info from model config
- Uses Framer Motion for animations

### `app/chat/page.tsx` (Modified)
- Added hover state management
- Added event handlers
- Renders ModelOverviewCard conditionally
- Tracks mouse position for card placement

---

## 🎨 Expected Visual Result

When hovering, you should see a **white/dark card** (depending on theme) with:
- Rounded corners (16px)
- Shadow
- Model icon in gradient circle
- Version badge
- All model details
- **Attachment section with icons** 📷📄
- Smooth fade-in animation

---

## 📞 Next Steps Based on Results

### If it works:
1. Remove console.log statements (clean up)
2. Integrate AttachmentUpload component
3. Connect to API for file upload

### If nothing appears:
1. Share console output (any logs or errors)
2. Share Network tab (any failed requests)
3. Share screenshot of page

### If card appears but looks wrong:
1. Adjust positioning in handleModelHover
2. Modify card styles in ModelOverviewCard.tsx
3. Check z-index conflicts

---

## 🚀 Quick Commands

```bash
# Build and check for errors
npm run build

# Start dev server
npm run dev

# TypeScript check
npx tsc --noEmit

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

## 📦 Files to Check

1. **Open in browser**: http://localhost:3000/chat
2. **Check console**: Browser DevTools → Console tab
3. **Inspect element**: Right-click model button → Inspect
4. **View source**: Check if ModelOverviewCard renders in DOM

---

**Test now and report back what you see in the console!** 🔍

