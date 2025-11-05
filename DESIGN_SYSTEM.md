# Brutalist-Modern Design System

## Design Principles
- ❌ NO gradients anywhere
- ❌ NO rounded corners (no rounded-lg, rounded-2xl, etc.)
- ❌ NO soft shadows or glows
- ❌ NO scale transforms (hover:scale-105)
- ✅ Thick 2px borders everywhere
- ✅ Pure rectangles and squares
- ✅ White opacity system (white/10, white/20, white/30, white/50, white/60, white/70)
- ✅ Monospace typography for technical elements
- ✅ Uppercase text with tracking-wider/widest
- ✅ Sharp, intentional transitions

## Color System

### Backgrounds
```css
bg-black                 /* Primary background */
bg-white                 /* Primary buttons, accents */
bg-white/5               /* Subtle hover states */
bg-white/10              /* Very subtle backgrounds */
```

### Borders
```css
border-2 border-white/10    /* Default container borders */
border-2 border-white/20    /* Interactive element borders */
border-2 border-white/30    /* Stronger borders */
hover:border-white          /* Hover state */

/* Color-specific */
border-2 border-green-500/50
border-2 border-red-500/50
border-2 border-yellow-500/50
```

### Text Colors
```css
text-white               /* Headings */
text-white/70            /* Body text */
text-white/60            /* Secondary text */
text-white/50            /* Tertiary text */
text-white/40            /* Labels, metadata */
text-white/30            /* Placeholders */
```

## Typography

### Headings
```css
text-4xl font-bold tracking-tighter uppercase   /* Page titles */
text-3xl font-bold tracking-tight uppercase      /* Section titles */
text-2xl font-bold tracking-tight uppercase      /* Card titles */
text-xl font-bold tracking-tight uppercase       /* Subsection titles */
```

### Body Text
```css
text-lg text-white/70 leading-relaxed            /* Large body */
text-base text-white/70 leading-relaxed          /* Normal body */
text-sm text-white/60                            /* Small text */
```

### Labels/Metadata
```css
text-xs font-mono text-white/40 uppercase tracking-widest    /* Input labels */
text-xs font-mono text-white/40 tracking-widest              /* Metadata */
```

### Buttons
```css
font-bold uppercase tracking-wider              /* Button text */
```

## Layout Components

### Container/Card
```tsx
<div className="border-2 border-white/10 p-8">
  <div className="border-b-2 border-white/10 p-6">
    <h2 className="text-2xl font-bold tracking-tight uppercase">Title</h2>
  </div>
  <div className="p-8">
    {/* Content */}
  </div>
</div>
```

### Container with Corner Decorations
```tsx
<div className="border-2 border-white/10 p-12 relative overflow-hidden">
  <div className="absolute top-0 right-0 w-32 h-32 border-l-2 border-b-2 border-white/5"></div>
  <div className="absolute bottom-0 left-0 w-32 h-32 border-r-2 border-t-2 border-white/5"></div>
  {/* Content */}
</div>
```

### Grid Layout
```tsx
<div className="grid md:grid-cols-2 gap-8">
  {/* Items */}
</div>

<div className="grid md:grid-cols-3 divide-x-2 divide-white/10">
  {/* Divided items */}
</div>
```

## Interactive Elements

### Primary Button
```tsx
<button className="px-8 py-5 bg-white text-black hover:bg-white/90 transition-all font-bold uppercase tracking-wider">
  Button Text
</button>
```

### Secondary Button
```tsx
<button className="px-8 py-5 border-2 border-white/20 hover:border-white hover:bg-white/5 text-white transition-all font-bold uppercase tracking-wider">
  Button Text
</button>
```

### Icon Button
```tsx
<button className="p-3 border-2 border-white/20 hover:border-white hover:bg-white hover:text-black transition-all">
  <Icon className="w-5 h-5" />
</button>
```

### Input Field
```tsx
<div>
  <label className="block text-xs font-mono text-white/40 mb-2 uppercase tracking-widest">
    Label
  </label>
  <input
    className="w-full px-4 py-4 bg-black border-2 border-white/20 text-white placeholder-white/30 focus:outline-none focus:border-white transition-colors"
    placeholder="Placeholder"
  />
</div>
```

### Icon in Square Container
```tsx
<div className="w-10 h-10 border-2 border-white/30 flex items-center justify-center">
  <Icon className="w-5 h-5" />
</div>
```

## Navigation

### Header
```tsx
<header className="border-b-2 border-white/10 sticky top-0 z-10 bg-black">
  <div className="max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
    <div className="flex items-center gap-6">
      <div className="w-10 h-10 bg-white flex items-center justify-center">
        <Logo className="w-5 h-5 text-black" />
      </div>
      <h1 className="text-xl font-bold tracking-tight uppercase">Brand</h1>
    </div>
    <nav className="flex gap-4">
      {/* Nav items */}
    </nav>
  </div>
</header>
```

## Loading States

### Spinner
```tsx
<div className="w-16 h-16 border-4 border-white/20 border-t-white animate-spin"></div>
```

### Loading Screen
```tsx
<div className="min-h-screen bg-black text-white flex items-center justify-center">
  <div className="border-2 border-white/10 p-12">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-white/20 border-t-white mx-auto mb-6 animate-spin"></div>
      <p className="text-xl font-mono uppercase tracking-wider text-white/60">Loading...</p>
    </div>
  </div>
</div>
```

## Error States

### Error Message
```tsx
<div className="border-2 border-red-500/50 p-4">
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 border-2 border-red-500 flex items-center justify-center">
      <X className="w-3 h-3 text-red-500" />
    </div>
    <p className="text-red-500 text-sm">Error message</p>
  </div>
</div>
```

### Success Message
```tsx
<div className="border-2 border-green-500/50 p-4">
  <div className="flex items-center gap-3">
    <div className="w-5 h-5 border-2 border-green-500 flex items-center justify-center">
      <Check className="w-3 h-3 text-green-500" />
    </div>
    <p className="text-green-500 text-sm">Success message</p>
  </div>
</div>
```

## Spacing System

### Padding
```css
p-4      /* 16px - Tight */
p-6      /* 24px - Default */
p-8      /* 32px - Comfortable */
p-10     /* 40px - Spacious */
p-12     /* 48px - Very spacious */
```

### Gaps
```css
gap-3    /* 12px - Tight */
gap-4    /* 16px - Default */
gap-6    /* 24px - Comfortable */
gap-8    /* 32px - Spacious */
```

### Margins
```css
mb-6     /* 24px - Default */
mb-8     /* 32px - Section spacing */
mb-12    /* 48px - Large section spacing */
```

## Specific Patterns

### Stats Card
```tsx
<div className="border-2 border-white/10 p-6">
  <p className="text-xs font-mono text-white/40 uppercase tracking-widest mb-2">Label</p>
  <p className="text-4xl font-bold tracking-tighter">42</p>
  <p className="text-sm text-white/60 mt-2">Description</p>
</div>
```

### Session/Item Card
```tsx
<div className="border-2 border-white/10 p-6 hover:bg-white/5 transition-colors">
  <div className="flex items-start justify-between mb-4">
    <div>
      <h3 className="text-xl font-bold tracking-tight uppercase">Title</h3>
      <p className="text-sm font-mono text-white/40 mt-1">Metadata</p>
    </div>
    <div className="px-3 py-1 border-2 border-green-500/50 text-green-500 text-xs font-mono uppercase">
      Status
    </div>
  </div>
  <p className="text-white/70">Description...</p>
</div>
```

### Action Button Group
```tsx
<div className="grid md:grid-cols-3 gap-4">
  <button className="p-6 border-2 border-white hover:bg-white hover:text-black transition-all group">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-2 border-white/30 group-hover:border-black flex items-center justify-center">
        <Icon className="w-6 h-6" />
      </div>
      <span className="font-bold uppercase tracking-wider text-sm">Label</span>
    </div>
  </button>
</div>
```

## Examples from Completed Pages

See:
- `frontend/app/feedback/[sessionId]/page.tsx` - Complete example
- `frontend/app/login/page.tsx` - Form example
- `frontend/app/register/page.tsx` - Multi-field form example

## Quick Conversion Guide

### Old → New

```css
/* Remove these */
rounded-lg → (remove)
rounded-2xl → (remove)
rounded-full → (remove)
bg-gradient-to-* → bg-black or bg-white
from-* via-* to-* → (remove)
shadow-* → (remove)
hover:scale-* → (remove)
backdrop-blur-sm → (remove most cases)

/* Replace these */
border border-gray-800 → border-2 border-white/10
bg-gray-900 → bg-black
text-gray-400 → text-white/60
px-6 py-3 → px-8 py-5 (for buttons)
```

## Key Points

1. **Everything is squared** - No rounded corners anywhere
2. **Borders are thick** - Always use `border-2` or `border-4`
3. **White with opacity** - Use white/10, white/20, etc. instead of gray-800, gray-900
4. **Uppercase headers** - All major text should be uppercase with tracking
5. **Monospace for technical** - Use font-mono for labels, metadata, code
6. **No soft effects** - No blurs, glows, or soft shadows
7. **Sharp transitions** - Simple color/border changes only
8. **Structured grids** - Use grid layouts with divide-x-2 for sections
