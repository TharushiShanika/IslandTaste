# Island Taste — React Frontend

Responsive React + Vite frontend based on the supplied Island Taste UI designs.

## Requirements
- Node.js 18+ (20+ recommended)
- VS Code

## Run locally
1. Extract this ZIP file.
2. Open the `island-taste-frontend` folder in VS Code.
3. Open the VS Code terminal in this folder.
4. Run:

   ```bash
   npm install
   cp .env.example .env
   npm run dev
   ```

   On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.
5. Open the local URL printed by Vite (normally http://localhost:5173).

## Pages included
- Home
- Accommodation
- Room details
- Booking / reservation flow
- Dining
- Events
- Gallery
- About Us
- Contact Us
- Offer details

## Connect your existing Node.js backend
The API base URL is controlled by `VITE_API_BASE_URL` in `.env`.
The API helper is in `src/services/api.js`. Update the endpoint paths in that file
to match your actual Express routes. The frontend currently works in demo mode:
forms validate and show a success message, but do not persist bookings or messages
until the backend endpoints are connected.

Suggested API contract (change to match your backend):
- `POST /bookings/availability`
- `POST /bookings`
- `POST /contact`
- `POST /reviews`

Example Express CORS setup (in your backend):
```js
import cors from 'cors'
app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json())
```

## Images
The design screenshots supplied were flattened UI mockups rather than individual
image assets. This frontend uses remote Unsplash image URLs for hotel photography.
For production, replace these URLs in `src/data/siteData.js` with your own licensed
hotel photographs or local files in `public/assets`.

## Notes
- Navigation and page routes are implemented with React Router.
- Booking and contact forms have client-side validation and demo feedback.
- The mobile navigation, room filters, gallery category filters, FAQ accordion,
  date fields, and booking steps are interactive.
- No backend credentials or secrets should be placed in frontend code.
