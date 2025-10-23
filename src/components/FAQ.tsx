import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does TerraTale demonstrate quality software development in its technological implementation, especially with Google Cloud and partner services?",
    answer: `TerraTale showcases robust and modular software development practices. The backend is built with Python and FastAPI, providing a high-performance, asynchronous API. We leverage Google Cloud's Generative AI (Gemini API) extensively for:

• Natural Language Understanding: Processing user queries for intent recognition (question vs. image description).
• Text Generation: Crafting detailed responses from Papito, the park ranger.
• Speech Synthesis: Generating natural-sounding audio responses from Mateo, the playful manatee, utilizing the new Gemini LIVE API for real-time, low-latency audio.
• Embeddings: Creating vector representations of text for our Question Answering system.

We integrate Elasticsearch as a powerful partner service for:

• Vector Search: Storing and retrieving contextual information for the QA system, and performing semantic image searches.
• Data Storage: Managing our knowledge base and image metadata.

The architecture is designed for scalability and maintainability, with clear separation of concerns (AI core, QA system, Image Search). Crucially, we implement secure credential handling using Google Cloud service accounts and environment variables, ensuring sensitive information is never exposed in the codebase.`
  },
  {
    question: "Is the user experience and design of TerraTale well thought out?",
    answer: `Yes, the user experience is central to TerraTale's design. We've created an intuitive, conversational interface that mimics natural interaction. Key design elements include:

• Dual Personas (Mateo & Papito): Providing distinct, engaging voices for different types of information (playful audio summary vs. detailed text explanation).
• Voice Interaction: Enabling hands-free engagement, crucial for visitors exploring a park.
• Integrated Image Search & Identification (Vision): Seamlessly transitioning from a textual description to visual identification, enhancing understanding and engagement. For example, a user could describe: "I spotted a small, playful animal swimming, dark brown, looks like some type of otter." The system would then analyze images in its database, identify potential matches, and respond: "Ah, based on your description, I think you saw a Neotropical River Otter! Here's a photo."
• Context-Aware Responses: The system intelligently determines user intent, providing relevant information or visual aids without explicit commands.
• Pronunciation Guidance: Ensuring correct pronunciation of local terms like "tulivieja" for an authentic and respectful experience.`
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

• Multi-modal Interaction: Seamlessly blending conversational AI (text and speech) with advanced image search capabilities.
• Contextual AI for Specific Environments: Moving beyond generic chatbots to create a specialized, knowledgeable agent for a specific ecological site.
• Persona-Driven Engagement: The use of distinct, engaging personas (manatee and park ranger) adds a layer of personality and memorability not typically found in informational tools.
• Bridging Digital and Natural Worlds: Using cutting-edge AI to enhance real-world experiences in natural environments.`
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

The core innovation—combining conversational AI, vector search, image recognition, and persona-driven interaction—creates a flexible framework that can be customized for any domain requiring accessible, engaging information delivery.`
  },
  {
    question: "How does TerraTale address the Elastic Challenge: \"Build the Future of AI-Powered Search using Elastic's hybrid search capabilities and seamless integration with Google Cloud's generative AI tools to build a conversational and/or agent-based solution that transforms how people interact with data.\"?",
    answer: `TerraTale is a direct answer to the Elastic Challenge:

• AI-Powered Search: We utilize Elasticsearch's vector search capabilities for both our text-based Question Answering system and our innovative image search. This allows for semantic understanding beyond keywords.
• Hybrid Search: While currently focused on vector search, the architecture is ready for hybrid search, combining vector and keyword search for even more precise results.
• Seamless Google Cloud Integration: We deeply integrate Google Cloud's Gemini API for:
  - Generative AI: Powering conversational responses and summaries.
  - Embeddings: Generating vector representations for both text and images.
  - Speech-to-Text/Text-to-Speech: Enabling natural voice interaction.
• Conversational & Agent-Based Solution: TerraTale is a fully conversational agent, with distinct personas (Mateo and Papito) guiding the user experience.
• Transforms Interaction with Data: It transforms how people interact with complex environmental data by making it accessible, interactive, and visually engaging, moving beyond traditional static information sources. It allows users to "talk" to the park's knowledge base and "show" what they've seen.`
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
