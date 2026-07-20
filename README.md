# Mud Slingin Assistant

A complete offline-ready Progressive Web App for oilfield load tracking, equipment inspections, saved locations, running barrel totals, and exports.

## Included features

- 80-barrel tanker and 79-barrel slinger presets
- Liquid, cuttings, and oil-based solids logging
- Automatic running totals for loads and barrels
- Equipment inspection checklists
- GPS capture and Google Maps links
- Searchable history
- CSV export
- JSON backup and restore
- Offline use through a service worker
- Installable on Android, iPhone, and desktop when hosted over HTTPS
- No database or paid service required for the initial version

## Deploy with GitHub and Vercel

1. Create a new GitHub repository.
2. Upload every file and folder from this project, preserving the `icons` folder.
3. Commit the files to the `main` branch.
4. In Vercel, choose **Add New Project** and import the repository.
5. Framework preset: **Other**.
6. Build command: leave blank.
7. Output directory: leave blank.
8. Deploy.
9. Open the HTTPS Vercel address on your phone and choose **Add to Home screen** or use the app's **Install App** button.

## Important data note

Records are stored locally in the browser on each device. Use **Backup JSON** regularly. A future Supabase version can synchronize multiple users and devices.
