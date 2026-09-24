# Hospital Bed Allocation System

A responsive hospital operations dashboard that demonstrates **constraint-based bed allocation** as a student project.

## Dashboard Preview

![Hospital Bed Allocation Dashboard](assets/dashboard-preview.jpg)

## Features

- Live bed board with Available, Occupied, Reserved, and Maintenance states
- Search and ward filtering
- Patient registration
- Waiting-patient allocation queue
- Constraint-based bed matching
- ICU, isolation, ward, gender, and availability checks
- Bed release/discharge workflow
- Allocation activity log
- Responsive desktop/mobile interface

## Allocation Logic

The prototype checks five hard constraints before assigning a bed:

1. The bed is available
2. Ward/care type is compatible
3. Gender restriction is compatible
4. ICU requirement is satisfied
5. Isolation requirement is satisfied

This is a **CSP-inspired rule-based prototype**. It does not use a trained machine-learning model and is not intended for real clinical deployment.

## Tech Stack

- React 19
- TypeScript
- Vite
- Lucide React
- Sonner notifications
- Express for serving the production build

## Run Locally

Prerequisites: Node.js 20+ and npm.

    git clone https://github.com/SrinikAlle/hospital-bed-allocation-system.git
    cd hospital-bed-allocation-system
    npm install
    npm run dev

Open the local URL shown by Vite, normally http://localhost:3000.

## Production Build

    npm run build
    npm start

## Project Structure

    client/
      src/
        App.tsx
        Home.tsx
        main.tsx
        styles.css
      index.html
    server/
      index.ts
    package.json
    tsconfig.json
    vite.config.ts

## Current Limitations

- Data is stored only in browser memory
- No authentication or database yet
- No real hospital-system integration
- Allocation uses deterministic rules rather than ML

## Future Improvements

- Persistent database storage
- Authentication and user roles
- Priority-aware scheduling
- Allocation history and reporting
- Backend validation/API
- Automated tests
- Deployment pipeline

## Author

**Srinik Alle**  
Data Science Student | AI · Full-Stack · Flutter Developer
