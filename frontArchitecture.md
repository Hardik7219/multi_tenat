# Frontend Architecture

## Overview
This application uses a modern Next.js App Router architecture. The architecture is designed for high scalability, enforcing a strict separation of concerns among the data fetching layer, reusable UI components, custom hooks, and page-level entry points.

## Data Flow
The flow of data strictly follows this unidirectional path:
1. **Pages (`app/`)**: Serve as entry points and boundaries for features. They remain as thin as possible, avoiding heavy business logic.
2. **Hooks (`hooks/`)**: Abstract away complex state and data fetching logic (e.g., `useTickets`). They connect the UI layer to the API services.
3. **Services (`services/`)**: The lowest layer on the frontend, handling all raw HTTP requests via `fetch` or `axios` to the backend Node.js APIs.
4. **Components (`components/`)**:
   - `ui/`: Stateless, generic foundational components (Button, Input, Card).
   - `features/`: Stateful components that may consume hooks but are reusable across different pages (e.g., `TicketList`).
5. **Types (`types/`)**: Shared TypeScript interfaces to ensure end-to-end type safety between API responses and frontend components.

## Directory Structure
```
web/
├── app/                  
│   ├── dashboard/        
│   ├── login/            
│   ├── signup/           
│   ├── tenats/          
│   └── tickets/          
├── components/           
│   ├── ui/               
│   └── features/         
├── hooks/                
├── services/             
│   └── apiServices/      
└── types/                
```

## Styling Strategy
The project leverages standard TailwindCSS utilities with custom vibrant colors, glassmorphism, and smooth transitions built directly into utility classes. The design prioritizes premium aesthetics without relying on external UI libraries like Shadcn.

## Constraints
All code files in the frontend strictly prohibit inline comments or block comments to maintain a clean aesthetic and enforce self-documenting code practices via descriptive naming conventions.
