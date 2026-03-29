# Passport OCR Upload Module

## Overview
This module provides functionality to upload passport images and automatically extract key information using AI-powered processing.

## Key Features
- **Automated Extraction:** Extracts the following fields from passport images:
  - Full Name
  - Date of Birth
  - Passport Number
  - Nationality
  - Date of Issue
  - Date of Expiry
- **Image Preprocessing:** Uses `browser-image-compression` to optimize images before processing, ensuring better results and faster uploads.
- **AI-Powered OCR:** Leverages the Gemini API (`@google/genai`) for accurate text extraction and structured data parsing.
- **User Interface:** Simple and intuitive UI for uploading passport images.
- **Structured Output:** Returns extracted data in a clean JSON format.

## Technical Stack
- **Frontend:** React, Vite, Tailwind CSS
- **Processing:** `browser-image-compression`
- **OCR/Extraction:** `@google/genai` (Gemini API)
- **UI Components:** `lucide-react`, `motion`

## Setup & Running

1. **Prerequisites:**
   - Node.js (v18+)
   - npm

2. **Installation:**
   ```bash
   npm install
   ```

3. **Running the Application:**
   ```bash
   npm run dev
   ```

## Code Structure
- `/src/components/PassportOCR.tsx`: Contains the UI and logic for passport image upload and OCR processing.
- `/src/services/ocrService.ts`: (If applicable) Handles the interaction with the Gemini API for data extraction.

## How it Works
1. User uploads a passport image.
2. The image is compressed using `browser-image-compression`.
3. The compressed image is sent to the Gemini API via the `@google/genai` SDK.
4. The API parses the image and returns the structured JSON data.
5. The UI displays the extracted information for the user to review.
