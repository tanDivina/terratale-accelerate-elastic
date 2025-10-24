import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does TerraTale demonstrate quality software development in its technological implementation, especially with Google Cloud and partner services?",
    answer: `TerraTale showcases robust and modular software development practices built on modern web technologies. The frontend is built with React and TypeScript using Vite, while the backend leverages Supabase Edge Functions for serverless architecture. We leverage Google Cloud's Generative AI (Gemini API) extensively for:

• Natural Language Understanding: Processing user queries to understand intent and context.
• Text Generation: Crafting detailed, conversational responses about the San San Pond Sak Wetlands.
• Real-time Voice Interaction: Utilizing the Gemini LIVE API for natural voice conversations with real-time, low-latency audio streaming.

We integrate Elasticsearch as a powerful partner service for:

• Full-Text Search: Performing sophisticated wildlife image searches with fuzzy matching and multi-field queries.
• Data Indexing: Managing our biodiversity library with rich metadata including species names, conservation status, and natural descriptions.
• Query Optimization: Using field boosting and scoring to surface the most relevant wildlife images.

The architecture is designed for scalability and maintainability, with clear separation between chat functionality, voice interaction, and image search. We implement secure credential handling using environment variables in Supabase, ensuring sensitive information is never exposed in the codebase.`
  },
  {
    question: "Is the user experience and design of TerraTale well thought out?",
    answer: `Yes, the user experience is central to TerraTale's design. We've created an intuitive interface with three core features that work seamlessly together:

• Voice Chat with Mateo: A real-time voice conversation experience using Gemini LIVE API, enabling hands-free exploration perfect for visitors in the field.
• Text Chat: A conversational AI assistant that answers questions about the wetlands and can search and display wildlife images from our biodiversity library.
• Biodiversity Library: A searchable gallery featuring hundreds of wildlife species from the San San Pond Sak Wetlands, with detailed information about each species and their conservation status.

Key UX innovations include:

• Context-Aware Image Search: The chat system intelligently detects when users want to see photos and searches the Elasticsearch-powered biodiversity library.
• Conservation Status Filters: Quick-access buttons to explore species by their conservation status (Critically Endangered, Endangered, Vulnerable, etc.).
• Conversation History: Text chat maintains persistent conversation history using Supabase, allowing users to continue previous discussions.
• Image Lightbox: Full-screen image viewing with detailed species descriptions and navigation between related wildlife photos.`
  },
  {
    question: "What is the potential impact of TerraTale on its target communities?",
    answer: `TerraTale has significant potential impact on environmental education, eco-tourism, and local community engagement, particularly for places like the San San Pond Sak wetlands:

• Enhanced Education: Provides accessible, interactive information about local biodiversity and conservation efforts.
• Improved Visitor Experience: Offers a unique, personalized guide, making visits more informative and engaging.
• Conservation Awareness: By making information about endangered species (like manatees) and protected sites easily digestible, it fosters greater appreciation and support for conservation.
• Community Empowerment: Can be adapted to share local folklore, history, and cultural insights, connecting visitors more deeply with the region.
• Accessibility: Voice-first interaction lowers barriers for users with varying literacy levels or visual impairments.`
  },
  {
    question: "What sets TerraTale apart from traditional information systems?",
    answer: `TerraTale offers an innovative approach that distinguishes it from conventional solutions:

• Real-time Voice AI: Utilizing Gemini LIVE API for natural, low-latency voice conversations that feel authentic and engaging.
• Intelligent Search Integration: Seamlessly blending conversational AI with Elasticsearch-powered biodiversity search, automatically detecting user intent to display relevant wildlife images.
• Contextual Understanding: The chat system maintains conversation context through Supabase, enabling follow-up questions like "show me photos" to reference previously discussed species.
• Conservation-Focused Design: Built specifically to highlight endangered and threatened species, with dedicated filters for conservation status.
• Comprehensive Biodiversity Library: Leveraging Wikimedia Commons data, featuring hundreds of species with rich metadata including scientific names, common names, and natural descriptions.
• Modern Serverless Architecture: Built on Supabase Edge Functions for scalability and reliability, with React frontend for responsive user experience.`
  },
  {
    question: "How can TerraTale's concept be adapted for other sectors and applications?",
    answer: `TerraTale's architecture and approach are highly adaptable across multiple sectors:

• Museums & Cultural Heritage: Create knowledgeable guides for art galleries, historical sites, and cultural landmarks with persona-driven storytelling and image recognition for artifacts.
• Healthcare & Medical Education: Deploy conversational agents that help patients understand medical conditions, identify symptoms through image analysis, and provide accessible health information.
• Retail & E-commerce: Enable customers to describe products they're looking for, receive personalized recommendations, and get detailed product information through natural conversation.
• Education & Training: Build interactive learning experiences where students can ask questions, identify objects in their environment, and receive contextually relevant educational content.
• Real Estate & Property Tours: Offer virtual property guides that answer questions about neighborhoods, identify architectural features, and provide detailed information about listings.
• Agriculture & Farming: Assist farmers in identifying crop diseases, pests, or plant species through visual recognition combined with expert agricultural knowledge.
• Tourism & Hospitality: Extend to any tourist destination, providing multilingual support, local insights, and interactive exploration of attractions.

The core innovation—combining conversational AI, intelligent search, and biodiversity data—creates a flexible framework that can be customized for any domain requiring accessible, engaging information delivery.`
  },
  {
    question: "How does TerraTale address the Elastic Challenge: \"Build the Future of AI-Powered Search using Elastic's hybrid search capabilities and seamless integration with Google Cloud's generative AI tools to build a conversational and/or agent-based solution that transforms how people interact with data.\"?",
    answer: `TerraTale directly addresses the Elastic Challenge through:

• AI-Powered Search with Elasticsearch: We leverage Elasticsearch's sophisticated full-text search capabilities for our biodiversity library, using multi_match queries with field boosting, fuzzy matching (fuzziness: "AUTO"), and custom scoring to surface the most relevant wildlife images. The search intelligently queries across multiple fields (species names, common names, natural descriptions, conservation status) to deliver accurate results.

• Seamless Google Cloud Integration: We deeply integrate Google Cloud's Gemini API throughout the application:
  - Conversational AI: Gemini 2.5 Flash powers the text chat, providing detailed responses about the San San Pond Sak Wetlands with context awareness through conversation history.
  - Real-time Voice: Gemini LIVE API enables natural voice conversations with extremely low latency for in-field use.
  - Intent Recognition: The system intelligently determines when users want images versus text responses, automatically triggering Elasticsearch searches.

• Conversational & Agent-Based Solution: TerraTale is a fully conversational agent that combines natural language understanding with search. Users can ask questions like "tell me about endangered species" and the system will both provide a detailed response AND automatically search and display relevant images from the biodiversity library.

• Transforms Data Interaction: We transform how people interact with biodiversity data by:
  - Making complex ecological information accessible through natural conversation
  - Automatically surfacing visual evidence from 200+ species indexed in Elasticsearch
  - Maintaining conversation context to enable intuitive follow-up queries
  - Providing dedicated conservation status filters to explore threatened species

The result is an interactive experience where AI-powered search and generative AI work together seamlessly, allowing visitors to discover and learn about wetland wildlife through both conversation and visual exploration.`
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-stone-50 py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl text-stone-900 mb-4">
            <span className="italic">Frequently Asked</span> Questions
          </h2>
          <p className="text-stone-600">
            AI Accelerate: Unlocking New Frontiers Hackathon Project
          </p>
        </div>

        <div className="space-y-4">
          {faqData.map((item, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 flex items-start justify-between gap-4 text-left transition-colors hover:bg-stone-50"
              >
                <span className="text-lg font-medium text-stone-900 flex-1">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-stone-600 flex-shrink-0 transition-transform duration-200 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <div
                className={`overflow-hidden transition-all duration-200 ${
                  openIndex === index ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="px-6 pb-5 text-stone-700 leading-relaxed whitespace-pre-line">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
