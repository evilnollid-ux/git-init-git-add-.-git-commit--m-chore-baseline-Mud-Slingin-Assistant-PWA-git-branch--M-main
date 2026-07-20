# Mud Slingin Assistant

A complete offline-ready Progressive Web App for oilfield load tracking, equipment inspections, saved locations, running barrel totals, and exports.

## ✨ Features

### Dashboard & Quick Actions
- **Prominent metrics dashboard** showing liquid loads, solids loads, total barrels, and inspections
- **Quick action buttons** for adding liquid loads (80 bbl tanker) and solids loads (79 bbl slinger)
- **Recent activity work log** displaying last 5 actions with timestamps
- **One-handed mobile friendly** interface with large, accessible buttons

### Load Tracking
- **80-barrel tanker preset** for liquid materials
- **79-barrel slinger preset** for solids materials
- **Liquid vs. solids categorization** with separate running totals
- **Material types**: water-based mud, oil-based mud, water, oil-based cuttings, water-based cuttings, oil-based solids
- **Equipment tracking** with lease/rig, company, driver/truck names
- **GPS capture** (optional, with location accuracy)
- **Notes field** for additional details

### Tally & Totals
- **Real-time metrics** for all load types
- **Separate counters** for liquid loads, solids loads, and total barrels
- **Automatic calculations** based on barrel capacity
- **Persistent storage** — data survives page refresh and browser restart

### Equipment Inspections
- **Comprehensive checklist**: tires, engine oil, coolant, hydraulic fluid, lights, leaks/damage, brakes, safety equipment
- **Inspection results**: Passed, Needs attention, Out of service
- **Operator name** and meter/mileage tracking
- **Status badges** with visual indicators

### Location Management
- **Save visited locations** with GPS coordinates
- **Google Maps integration** for quick navigation
- **Location history** with company and notes

### History & Exports
- **Searchable record history** across all record types
- **Filter by record type** (loads, inspections, locations)
- **CSV export** for spreadsheet analysis
- **JSON backup/restore** for data portability and safety

### Mobile Optimization
- **High-contrast dark theme** designed for outdoor use
- **Tailwind-inspired design** with strong color contrast
- **Responsive layout** for phones, tablets, and desktops
- **Safe area support** for notched devices
- **Touch-friendly buttons** with 44px minimum height
- **Generous spacing** for one-handed operation

### PWA & Offline
- **Installable** as native app on Android, iOS, and desktop
- **Offline-first** with service worker caching
- **No internet required** after first load
- **Automatic updates** via cache versioning
- **Zero backend** — fully client-side data storage

## 🚀 Deploy with GitHub and Vercel

1. Create a new GitHub repository
2. Upload every file and folder from this project, preserving the `icons` folder
3. Commit the files to the `main` branch
4. In Vercel, choose **Add New Project** and import the repository
5. Framework preset: **Other**
6. Build command: leave blank
7. Output directory: leave blank
8. Deploy
9. Open the HTTPS Vercel address on your phone and choose **Add to Home screen** or use the app's **Install App** button

## 📊 Data & Storage

- Records are stored locally in the browser's localStorage on each device
- Use **Backup JSON** regularly to export data safely
- No account or login required
- Completely private — your data never leaves your device
- A future Supabase version can optionally synchronize multiple users and devices

## 🎨 Customization

- Colors and spacing defined in CSS custom properties (`:root`)
- Modify `--color-*` variables to change theme colors
- Adjust `--spacing-*` variables for layout sizing
- Tailwind-compatible structure for easy redesigns

## 📱 Browser Support

- Chrome/Edge (Android, Windows, Mac, Linux)
- Firefox (all platforms)
- Safari (iOS 13+, macOS)
- Requires modern JavaScript (ES2020)

## 🔒 Privacy & Security

✅ All data stored locally — no cloud sync (optional future feature)  
✅ No tracking or analytics  
✅ No ads or monetization  
✅ Works offline completely  
✅ No personal data collection  

## 📝 License

MIT — Use, modify, and distribute freely.
