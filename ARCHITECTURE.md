# Preproute Architecture & Design Document

This document outlines the architectural decisions, design patterns, and systemic workflows that power the Preproute frontend application.

## 1. High-Level Architecture

Preproute is built as a Single Page Application (SPA) using React 18, bootstrapped by Vite for blazing-fast HMR and optimized production builds. 
The application communicates with a secure Node.js REST API using an Axios client wrapped in a customized Interceptor layer.

### Core Philosophy
- **Feature-Driven Structure:** Code is organized by domain features (\	est\, \questions\, \publish\, \uth\) rather than by technical roles (e.g., all reducers in one folder). This ensures high cohesion and scalability.
- **Fail-Fast Validation:** The UI strictly prevents malformed payloads from ever reaching the network layer.

## 2. Key Components & Workflows

### 2.1 The Unified Test Editor (\UnifiedTestEditor.tsx\)
Traditionally, applications separate "Test Configuration" and "Question Creation" into entirely different page routes. 
**Design Decision:** We architected a **Unified Editor** that manages the entire lifecycle within a single parent component.
- **Why?** It preserves state across steps. Users can toggle between configuring the test details and writing questions without triggering route changes, reducing loading states and preventing accidental data loss.
- **State Flow:** The parent component acts as the "Source of Truth," holding the master \questions\ array and \	estConfig\. Child components (\QuestionForm\, \TestConfigForm\) receive data via props and pass updates up via refs/callbacks.

### 2.2 Advanced Auto-Save System
The platform implements a background auto-save feature to ensure no work is lost.
- **Concurrency Locking:** A dual-barrier locking mechanism using React \useRef\ (e.g., \isAutoSavingRef\) prevents race conditions where a slow network response overlaps with a new auto-save trigger.
- **Debouncing:** Edits push an active timer (5s) that resets on every keystroke, ensuring API calls only fire during natural typing pauses.

### 2.3 Strict Frontend Validation Barrier
A significant architectural choice was made to handle data schema validation on the client-side *before* emitting network requests.
- **The Problem:** Opaque \400 Bad Request\ errors from the backend can crash the app if it dynamically attempts to save half-finished questions.
- **The Solution:** The \handleSaveAll\ and \	riggerAutoSave\ functions loop over the payload. If a question is missing critical data (e.g., missing a correct option, or having less than 2 options), the Auto-Save silently skips it. Manual saves explicitly halt and present localized Toast UI errors to guide the user.

### 2.4 API Interceptor Layer (\pi.ts\)
We utilize a global Axios interceptor. 
- **Error Normalization:** The interceptor parses complex nested Zod/Mongoose error structures from the backend and normalizes them into human-readable strings (e.g., mapping \"difficulty is required"\ to a clean UI toast).
- **Session Management:** The interceptor seamlessly injects JWT Bearer tokens into every request and automatically handles \401 Unauthorized\ logouts if a session expires.

## 3. UI/UX & Design System

### Pixel-Perfect Fidelity
The application maps 1:1 with Figma designs. Custom components like the \QuestionSidebar\ and \Test Publish Card\ utilize Tailwind CSS for utility-first styling.
- **Responsiveness:** Components employ \lex-wrap\ and intelligent breakpoint scaling (\md:flex-row\) to adapt smoothly to varying screen sizes.
- **Micro-interactions:** Framer Motion is integrated to provide subtle scale/hover interactions on buttons and smooth progress bar animations, adding a premium feel to the educational software.

## 4. Security
- **Protected Routing:** The application uses a higher-order component (\ProtectedRoute\) to wrap sensitive routes. If a user lacks a valid auth context, they are forcefully redirected to the login flow.
- **JWT Storage:** Tokens are managed securely in-memory and synchronized via browser storage, ensuring persistence without sacrificing XSS safety.
