# TerraTale Conversational Eco-Guide

## Inspiration

My inspiration stemmed from a desire to bridge the gap between technology, language and nature, making environmental education accessible and engaging for everyone. I envisioned a tool that could transform a boat trip through the San San Pond Sak wetlands of Bocas del Toro, or a simple walk in a park for that matter, into an interactive learning experience without language barriers. The goal was to create a personal eco-guide that could answer questions and identify local flora and fauna in real-time, fostering a deeper connection with the natural world. I live in Bocas del Toro myself & my partner is a knowledgeable boat captain & guide. Most of his tour guests speak English, and while he speaks both Spanish & the local "Guari Guari", Panamanian Creole English, this tool will be of incredible help during his tours for both himself & his tour guests.

## What it does

TerraTale is an intelligent, conversational eco-guide designed to enhance the visitor experience in the San San Pond Sak wetlands. It features real-time voice interaction where users can have natural conversations about wildlife they encounter, asking questions like "I saw a bird with a special beak" and receiving instant audio responses. The system uses conversational AI to guide users to identify species through follow-up questions, then displays matching images from our curated wildlife database. Users can also interact through text chat, exploring the wetlands' diverse ecosystem including jaguars, manatees, sea turtles, and hundreds of bird species. The system intelligently recognizes user intent through contextual understanding of ongoing conversations, providing either detailed text explanations or performing semantic image searches to show relevant wildlife photos with proper scientific identification.

## How we built it

TerraTale features a modern full-stack architecture built on Supabase and serverless technologies:

**Frontend**: React with TypeScript, featuring a responsive UI with real-time audio streaming, text chat interface, and an immersive wildlife gallery. Built with Vite and Tailwind CSS for modern, performant design.

**Backend**:
- **Supabase Edge Functions** (Deno runtime) handle all API logic including chat, audio streaming, and wildlife search
- **Google Gemini 2.0 Flash with Multimodal Live API** powers real-time voice conversations with natural language understanding
- **Elasticsearch Cloud** serves as our semantic search engine, enabling natural language queries against wildlife images with fuzzy matching and relevance scoring
- **Supabase PostgreSQL** stores conversation history with Row Level Security policies for data protection
- **Python scripts** for data pipeline: fetching wildlife images from Wikimedia Commons, generating natural descriptions with Gemini, and syncing to both Supabase and Elasticsearch

**Key Technical Features**:
- WebSocket connection for real-time bidirectional audio streaming
- Base64 PCM audio encoding for browser-to-API communication
- Contextual conversation tracking that extracts species names from chat history to resolve vague queries like "show me a picture of that bird"
- Multi-field Elasticsearch queries with field boosting (english_name^3, species_name^2) and fuzziness tolerance

## Challenges we ran into

Our journey was filled with numerous technical hurdles:

*   **Real-time Audio Streaming**: Implementing WebSocket-based audio streaming with proper PCM encoding and managing audio chunk queues for smooth playback without stuttering
*   **Contextual Understanding**: Building a system that could look back through conversation history in Supabase to understand vague references like "that bird" and match them to specific species mentioned earlier using regex pattern matching
*   **Elasticsearch Integration**: Setting up multi-field semantic search with proper field boosting, fuzzy matching, and relevance score thresholds to filter out poor matches
*   **Edge Function Deployment**: Working within Supabase Edge Functions' Deno runtime constraints, managing CORS headers correctly, and handling environment variables across development and production
*   **Data Pipeline**: Building Python scripts to fetch wildlife data from Wikimedia Commons API, generate natural language descriptions with Gemini, and sync to both Supabase and Elasticsearch while handling rate limits and API errors
*   **Conversation State Management**: Implementing proper message storage and retrieval from Supabase to maintain conversation context across multiple turns
*   **Image Search Intent Detection**: Creating intelligent keyword detection to distinguish between questions ("what is a manatee?") and image requests ("show me photos of manatees")

## Accomplishments that we're proud of

We are incredibly proud of:

*   **Seamless Real-time Voice Chat**: Successfully implementing Google Gemini's Multimodal Live API with WebSocket streaming for natural, low-latency conversations
*   **Contextual Image Search**: Building a system that understands conversation context, extracting species names from previous messages to resolve ambiguous photo requests
*   **Production Wildlife Database**: Populating Elasticsearch with over 200 real wildlife species from the San San Pond Sak wetlands, complete with scientific names, English names, and natural descriptions
*   **Secure Serverless Architecture**: Implementing a fully serverless backend with Supabase Edge Functions, proper RLS policies, and environment variable management
*   **Intelligent Search Ranking**: Creating a multi-field Elasticsearch query that properly weights English names over scientific names and handles typos gracefully
*   **Robust Data Pipeline**: Building automated Python scripts that fetch, process, and sync wildlife data across multiple systems
*   **Responsive User Experience**: Creating smooth scrolling, lightbox image viewing, and a clean interface that works across devices

## What we learned

This project was a deep dive into modern serverless AI application development. We learned invaluable lessons in:

*   **Real-time Audio Processing**: The complexities of browser audio APIs, WebSocket management, and audio buffer handling for seamless streaming
*   **Conversational AI Design**: How to build systems that maintain context across multiple turns and resolve ambiguous references intelligently
*   **Semantic Search Architecture**: Implementing Elasticsearch with proper field boosting, fuzzy matching, and relevance scoring for natural language queries
*   **Serverless Constraints**: Working within Edge Function limitations, managing cold starts, and optimizing for stateless execution
*   **Data Pipeline Engineering**: Building robust ETL processes that handle API rate limits, transform data, and maintain consistency across databases
*   **Supabase Best Practices**: Implementing Row Level Security policies, managing conversation state, and structuring database schemas for chat applications
*   **Regex Pattern Matching**: Creating sophisticated patterns to extract species names with hyphens and multiple words from natural text
*   **CORS and Authentication**: Properly configuring headers and managing JWT verification for public-facing Edge Functions

## What's next for TerraTale Conversational Eco-Guide

Our immediate next steps include:

*   **Expanded Wildlife Database**: Adding more species coverage including amphibians, reptiles, insects, and marine life with high-quality photos
*   **Multi-language Support**: Implementing Spanish and Guari Guari language options to serve local communities and international visitors
*   **Offline Mode**: Creating a Progressive Web App with cached wildlife data for use in areas with limited connectivity
*   **Species Identification from Photos**: Adding visual recognition so users can upload photos of wildlife they encounter for automatic identification
*   **Conservation Status Education**: Highlighting endangered species and explaining conservation efforts in the San San Pond Sak wetlands
*   **Tour Guide Integration**: Building features specifically for boat captains including pre-loaded route information and common sightings by location
*   **Analytics Dashboard**: Tracking which species are most commonly searched to understand visitor interests and improve content
*   **Hybrid Search Enhancement**: Implementing Elasticsearch's hybrid search to combine semantic vectors with keyword matching for even more accurate results
