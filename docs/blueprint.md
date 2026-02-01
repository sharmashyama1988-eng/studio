# **App Name**: Vyom AI

## Core Features:

- On-Device LLM Inference: Run the Gemma 2B model using MediaPipe LLM Inference API, leveraging the GPU delegate for optimal speed.
- Offline Chat: Enable complete offline functionality for continuous chat, without reliance on network connectivity. Chat history stored locally in SQLite via Room.
- Hybrid Web Search Tool: Provide a tool for fetching real-time web data via a custom search API and injecting it into the LLM's context for context-aware responses.
- Asynchronous Inference: Manage AI inference on background threads using Kotlin Coroutines to prevent UI freezes during long running prompts. Background thread choice is handled by the LLM to allow the background thread to decide when the LLM response requires data from an outside data source.
- Local Chat History: Maintain chat history stored within a Room database, stored directly on the end-user's device.  Ensuring end-user privacy.
- Model Loading: Load a Gemma 2B (.bin or .tflite, INT4 quantized) model from local storage for edge inference.

## Style Guidelines:

- Primary color: Deep blue (#3F51B5), evoking trust and intelligence, reminiscent of the night sky (Vyom = sky/space).
- Background color: Very light gray (#F5F5F5) for a clean and modern feel.
- Accent color: Electric purple (#7E57C2), providing a high contrast to the deep blue and hinting at futuristic technology.
- Body and headline font: 'Inter', sans-serif, for a modern, neutral feel suitable for both headlines and body text.
- Code font: 'Source Code Pro' for displaying any code snippets in context.
- Use minimalist, geometric icons representing AI, search, and other related functions.
- Incorporate subtle animations for loading states and transitions to enhance user experience, and reduce any perception of slowness.