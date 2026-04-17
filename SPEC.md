# Smart Relief BD - Specification Document

## 1. Project Overview

**Project Name:** Smart Relief BD
**Type:** Emergency Response & Smart City Management Web Application
**Core Functionality:** Unified disaster response, health emergency, and civic issue reporting platform for Bangladesh
**Target Users:** Citizens, emergency responders, city administrators, healthcare providers

---

## 2. UI/UX Specification

### Color Palette
- **Background:** `#0A1628` (Deep Navy)
- **Primary Accent:** `#E63946` (Electric Red)
- **Text:** `#FFFFFF` (Clean White)
- **Success/Health:** `#2EC4B6` (Soft Teal)
- **Warning:** `#F4A261` (Amber)
- **Card Background:** `rgba(255, 255, 255, 0.05)` (Glassmorphism)
- **Grid Lines:** `rgba(255, 255, 255, 0.03)`

### Typography
- **Font Family:** "Poppins", sans-serif
- **Headings:** 
  - H1: 2.5rem, 700 weight
  - H2: 1.75rem, 600 weight
  - H3: 1.25rem, 500 weight
- **Body:** 1rem, 400 weight
- **Small/Labels:** 0.875rem, 400 weight

### Layout Structure
- **Max Container Width:** 1440px
- **Gutter:** 24px
- **Navbar Height:** 72px
- **Grid:** 12-column responsive grid

### Responsive Breakpoints
- **Mobile:** < 768px (single column)
- **Tablet:** 768px - 1024px (2 columns)
- **Desktop:** > 1024px (3+ columns)

---

## 3. Page Specifications

### 3.1 Main Dashboard (/)

#### Alert Ticker (Top)
- Full-width horizontal scrolling marquee
- Red background with white text
- Shows live alerts: "⚠ Flood Warning: Sylhet Division"
- Scroll speed: 50px/second

#### Hero Section - Mission Cards (3 columns)

**Card 1: EarthCare**
- Icon: Leaf/Earth (SVG)
- Data: 
  - AQI Gauge: Circular progress with gradient (green→red)
  - Flood Risk Badge: LOW/MEDIUM/HIGH/CRITICAL
  - Last Updated: "2 mins ago"
- Accent: Green to Red gradient based on severity
- Hover: Glow with accent color

**Card 2: HealthNet**
- Icon: Heartbeat/Cross (SVG)
- Data:
  - Nearest Hospital: "Bangabandhu Sheikh Mujib Medical University"
  - Distance: "2.3 km"
  - AI Symptom Check button (teal)
  - Mental Health Chatbot button
- Accent: Teal/Blue

**Card 3: SmartCity**
- Icon: City Buildings (SVG)
- Data:
  - Active Reports: "47"
  - Traffic Status: "MODERATE"
  - "Report an Issue" CTA button
- Accent: Amber/Orange

#### Statistics Bar (below hero)
- 4 counters in a row:
  - "2,847 Alerts Issued Today"
  - "143 Hospitals Connected"
  - "589 Issues Reported"
  - "12 Districts Under Watch"
- Numbers animate/count up on page load

### 3.2 Flood Map Page (/flood-map)

#### Layout
- Full-width map (Leaflet.js integration with Bangladesh bounds)
- Left sidebar panel (280px width)

#### Sidebar Components
- Toggle layers (checkboxes):
  - Flood Risk Zones
  - Hospitals
  - Citizen Reports
  - Emergency Routes
- Search bar: "Search area in Bangladesh..."
- Collapsible on mobile

#### Map Overlays
- Blue zones = Flood risk areas
- Red pins = Disaster alerts
- Green crosses = Hospitals
- Orange dots = Citizen issues
- Pin drop animation: bounce effect

#### Bottom Info Bar
- "Showing: Sylhet, Sunamganj, Netrokona — Flood Risk: HIGH"

### 3.3 Health Assistant Page (/health)

#### Split Layout (50/50)

**Left: Symptom Input Form**
- Heading: "Check Your Symptoms"
- Fields:
  - Age (number input)
  - Gender (select: Male, Female, Other)
  - Symptom Description (textarea)
- Checkboxes:
  - Fever, Headache, Chest Pain, Breathing Difficulty, Nausea, Fatigue
- Button: "Analyze with AI →" (teal background)

**Right: AI Response Panel**
- Chat bubble UI
- Response shows:
  - AI analysis text
  - Suggested action: "Visit nearest hospital" or "Rest & monitor"
  - Severity badge (Low/Medium/High)
- Bangla language toggle button

### 3.4 Report Issue Page (/report)

#### Layout
- Card-style form (centered, max-width 600px)
- Glassmorphism background

#### Form Fields
- Issue Type (dropdown):
  - Road Damage, Waterlogging, Power Outage, Medical Emergency, Other
- Location:
  - Map pin picker (simple click-to-set)
  - Text input for address
- Description (textarea)
- Photo Upload (file input)

#### Submit Button
- Text: "Report to City Authority"
- Accent: Primary red

#### Recent Reports Feed
- 3-4 cards below form
- Each card shows:
  - Issue type icon
  - Location
  - Description (truncated)
  - Status badge: Pending (amber) / In Progress (blue) / Resolved (green)

---

## 4. Component Specifications

### Navbar
- Height: 72px
- Logo: "Smart Relief BD" with shield + map pin icon
- Nav links: Dashboard | Flood Map | Health | Report Issue | Emergency SOS
- Right side: Live clock, Weather badge, Login button

### SOS Button (Floating)
- Position: Fixed, bottom-right
- Size: 64px diameter
- Default: Red circle with "SOS" text
- Animation: Continuous pulsing glow
- Hover: Expands to show 3 options:
  - 🚑 Call Ambulance (999)
  - 🚒 Fire Service (199)
  - 🚔 Police (999)

### Footer
- 3 columns: About, Quick Links, Contact
- Bottom: "Powered by EWU Robotics Club × NRF26 Hackathon"
- Social icons

---

## 5. Animations & Interactions

1. **Cards on Hover:** Subtle glow effect with accent color (box-shadow)
2. **AQI Gauge:** Animates from 0 to value on page load (1.5s ease-out)
3. **Alert Ticker:** Continuous horizontal scroll (CSS animation)
4. **SOS Button:** Pulsing red glow (box-shadow animation, 2s infinite)
5. **Map Pins:** Drop-in bounce animation on load
6. **Stat Counters:** Count up animation when scrolled into view
7. **Page Transitions:** Fade in effect (300ms)

---

## 6. Acceptance Criteria

- [ ] All pages load without errors
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Alert ticker scrolls horizontally
- [ ] SOS button expands on hover
- [ ] Navigation between all 4 pages works
- [ ] Cards glow on hover with accent colors
- [ ] Stat counters animate on page load
- [ ] Map shows with proper markers (if data available)
- [ ] Health form accepts input and shows AI response placeholder
- [ ] Report form renders with all fields
- [ ] Dark theme applied consistently throughout
- [ ] No console errors on any page