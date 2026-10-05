# 🎫 WhyTicketHubPass Component

## 📋 Overview

Component React hiển thị section "Tại Sao Chọn TicketHub" với thiết kế **Boarding Pass / Digital Ticket** style, dark mode, cyberpunk aesthetic.

---

## ✨ Features

### 🎨 Design Elements:
- ✅ **Boarding Pass Style**: Giống vé máy bay điện tử
- ✅ **Dark/Cyberpunk Theme**: Zinc-950 background với neon accents
- ✅ **Grid Background**: Subtle grid pattern như HUD
- ✅ **Notch Decorations**: Khuyết tròn giả lập nếp xé vé
- ✅ **Dashed Dividers**: Đường nét đứt giữa các sections
- ✅ **Authentic Badge**: Badge xác thực với pulse effect
- ✅ **Barcode Footer**: Mã vạch và tracking number

### 🔧 Interactive Elements:
- ✅ **Live Countdown Timer**: Đếm ngược giữ chỗ (09:42s)
- ✅ **QR Refresh Timer**: Đổi QR mỗi 15s
- ✅ **Status Badges**: Real-time status indicators
- ✅ **Animated Dots**: Pulse effects cho LIVE status
- ✅ **Payment Methods**: Hiển thị các phương thức thanh toán

---

## 🚀 Usage

### 1. **Import Component**:
```tsx
import WhyTicketHubPass from '@/components/WhyTicketHubPass';
```

### 2. **Use in Page**:
```tsx
export default function Home() {
  return (
    <div>
      {/* Other sections */}
      <WhyTicketHubPass />
      {/* Other sections */}
    </div>
  );
}
```

### 3. **Replace trong Home.tsx**:
```tsx
// BEFORE: Old Features Section
<section className="relative py-12 md:py-20 overflow-hidden">
  {/* ... old code ... */}
</section>

// AFTER: New Boarding Pass Style
<WhyTicketHubPass />
```

---

## 📦 Dependencies

### Required:
```json
{
  "react": "^18.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```

### Icons Used (from lucide-react):
- `Ticket` - Pass header
- `CheckCircle2` - Payment checkmarks
- `CreditCard` - Payment icons
- `QrCode` - GatePass QR
- `Clock` - Countdown timer
- `Shield` - Verified badge
- `Zap` - QR refresh indicator

---

## 🎨 Styling Details

### Color Palette:
```css
/* Primary Colors */
--emerald: rgb(52, 211, 153)    /* Authentic/Active states */
--cyan: rgb(34, 211, 238)       /* Primary accent */
--blue: rgb(59, 130, 246)       /* Secondary accent */
--amber: rgb(251, 191, 36)      /* Warning/Timer */

/* Background */
--zinc-950: rgb(9, 9, 11)       /* Main background */
--zinc-900: rgb(24, 24, 27)     /* Card backgrounds */
--zinc-800: rgb(39, 39, 42)     /* Borders */

/* Status Colors */
--emerald: Ready status
--amber: Timer countdown
--cyan: QR refresh
--violet: Payment section
```

### Typography:
```css
/* Headers */
h2: text-3xl md:text-5xl (Section title)
h3: text-xl md:text-2xl (Item titles)

/* Body */
p: text-sm md:text-base (Descriptions)
span: text-xs (Badges, labels)

/* Monospace */
font-mono: Pass ID, timers, codes
```

---

## 🔧 Customization

### 1. **Change Initial Timer Values**:
```tsx
const [countdown, setCountdown] = useState(582); // 09:42 (change this)
const [qrRefresh, setQrRefresh] = useState(15);  // 15s (change this)
```

### 2. **Change Pass ID**:
```tsx
<span className="font-mono text-sm md:text-base text-zinc-400 tracking-wider">
  PASS <span className="text-cyan-400">#TK-YOUR-ID-HERE</span>
</span>
```

### 3. **Change Barcode Number**:
```tsx
<span className="font-mono text-xs text-zinc-600 tracking-widest">
  YOUR-TRACKING-NUMBER
</span>
```

### 4. **Add/Remove Payment Methods**:
```tsx
<div className="flex flex-wrap gap-2">
  {/* Add your payment method */}
  <div className="px-3 py-2 rounded-lg bg-zinc-900/80 border border-zinc-800">
    <span className="text-sm font-semibold text-white">NewMethod</span>
  </div>
</div>
```

### 5. **Customize Colors**:
```tsx
// Item 01 - Change from cyan to another color
<div className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">

// Item 02 - Change violet theme
<div className="bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 border border-violet-500/30">

// Item 03 - Change emerald theme
<div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 border border-emerald-500/30">
```

---

## 📐 Layout Structure

```
┌─────────────────────────────────────────┐
│ Header: PASS #TK-9482-VIP [AUTHENTIC]   │
├─────────────────────────────────────────┤
│ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━● │ ← Notch
│ [01] Dễ dàng đặt vé      [SẴN SÀNG]    │
│      Zone VIP • Row A • Seat 12  09:42s │
├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┤ ← Dashed
│ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━● │ ← Notch
│ [02] Thanh toán linh hoạt  [0% PHÍ ẨN] │
│      [VietQR] [MoMo] [VNPay] [Visa]     │
├┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┄┤
│ ●━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━● │ ← Notch
│ [03] Check-in thông minh    [LIVE 1s]   │
│      [QR] GatePass QR [SHA-256]         │
│          Đổi sau 15s • CHỐNG CHỤP       │
├─────────────────────────────────────────┤
│        ▐▌ ▌ ▐▐▌ ▌▐ ▌ ▐▐▌ ▌ ▐▌        │ ← Barcode
│           TH-8829-0012-VN                │
└─────────────────────────────────────────┘
```

---

## 🎯 Key Components Breakdown

### 1. **Header Section**:
- Pass ID with icon
- Authentic badge with pulse dot
- Border bottom separator

### 2. **Item Cards** (x3):
- Number badge with gradient
- Title and status badge
- Description text
- Interactive widget (different per item)
- Notch decorations on left/right
- Dashed divider below

### 3. **Footer Section**:
- Visual barcode (generated with div elements)
- Tracking number in monospace font

---

## 🔄 State Management

### Countdown Timer:
```tsx
const [countdown, setCountdown] = useState(582);

useEffect(() => {
  const timer = setInterval(() => {
    setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

### QR Refresh Timer:
```tsx
const [qrRefresh, setQrRefresh] = useState(15);

useEffect(() => {
  const timer = setInterval(() => {
    setQrRefresh((prev) => (prev > 0 ? prev - 1 : 15)); // Reset to 15
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

---

## 📱 Responsive Design

### Breakpoints:
- **Mobile** (< 768px): Full width, stacked layout
- **Desktop** (≥ 768px): Max-width container, larger text

### Responsive Classes:
```tsx
text-sm md:text-base     // Text sizing
text-xl md:text-2xl      // Headings
py-12 md:py-20          // Section padding
px-6                     // Card padding (fixed)
```

---

## ♿ Accessibility

- ✅ Semantic HTML structure
- ✅ Icon + text labels
- ✅ Sufficient color contrast
- ✅ Readable font sizes
- ✅ Clear visual hierarchy
- ⚠️ Add `aria-label` for timers if needed

---

## 🎭 Animation Effects

### Implemented:
- ✅ `animate-pulse` on status dots
- ✅ Live countdown (1s interval)
- ✅ QR refresh countdown
- ✅ Gradient backgrounds with opacity

### Optional Additions:
```tsx
// Add to badges for entrance animation
className="... animate-fadeIn"

// Add to cards for hover effect
className="... hover:scale-[1.02] transition-transform"
```

---

## 🐛 Troubleshooting

### Issue: Icons not showing
**Solution**: Install lucide-react
```bash
npm install lucide-react
# or
yarn add lucide-react
```

### Issue: Grid pattern not visible
**Solution**: Check opacity and background color contrast

### Issue: Timers not counting
**Solution**: Ensure useEffect cleanup is working correctly

### Issue: Layout breaks on mobile
**Solution**: Check container padding and max-width

---

## 📊 Performance

- ✅ **No heavy dependencies**: Only uses lucide-react
- ✅ **CSS-only animations**: No JS animation libraries
- ✅ **Efficient re-renders**: Only timer state updates
- ✅ **Cleanup effects**: Proper interval clearing

---

## 🎓 Best Practices

1. **Component Organization**: Single file, self-contained
2. **Tailwind First**: All styling via Tailwind classes
3. **TypeScript**: Full type safety
4. **Clean Code**: Readable structure, comments where needed
5. **Reusability**: Easy to customize via props (if extended)

---

## 🚀 Future Enhancements

### Potential Additions:
- [ ] Make timers configurable via props
- [ ] Add animation on scroll (AOS library)
- [ ] Add sound effects on interactions
- [ ] Make pass data dynamic via props
- [ ] Add share/download ticket feature
- [ ] Add real QR code generation
- [ ] Add locale support (i18n)

---

## 📚 References

- [Lucide Icons](https://lucide.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Boarding Pass Design Inspiration](https://dribbble.com/tags/boarding-pass)

---

**Component Status**: ✅ Production Ready
**Version**: 1.0.0
**Last Updated**: 2026-09-15
**Author**: TicketHub Team
