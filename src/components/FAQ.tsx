import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "What is TerraTale?",
    answer: `TerraTale is an AI-powered interactive guide for exploring the San San Pond Sak Wetlands in Panama. It combines conversational AI, real-time voice interaction, and a comprehensive biodiversity library to create an engaging educational experience about wildlife conservation and wetland ecosystems.

The platform features three main components:

• Voice Chat: Natural, multilingual voice conversations using Google's Gemini LIVE API for hands-free exploration.
• Text Chat: An AI assistant that answers questions and intelligently searches for wildlife images.
• Biodiversity Library: A searchable gallery featuring over 60 wildlife and plant species with detailed conservation information.`
  },
  {
    question: "How does the voice chat work?",
    answer: `The voice chat feature uses Google's Gemini LIVE API to enable real-time, natural conversations with low latency. You can speak directly to Mateo, your virtual guide, and receive immediate audio responses about the wetlands, wildlife, and conservation efforts.

This hands-free experience is perfect for:

• Field visits where typing isn't convenient
• Accessibility for users who prefer voice interaction
• Multilingual support for international visitors
• Natural, conversational learning experiences

The voice AI maintains context throughout the conversation, allowing for follow-up questions and deeper exploration of topics.`
  },
  {
    question: "How do I search for wildlife species?",
    answer: `You can search for wildlife species in several ways:

• Text Chat: Simply ask questions like "show me photos of manatees" or "what endangered birds live here?" The AI will automatically search and display relevant images.
• Direct Search: Use the search bar in the Biodiversity Library to find specific species by common name, scientific name, or conservation status.
• Conservation Filters: Click on conservation status buttons (Critically Endangered, Endangered, Vulnerable, etc.) to browse species by their protection level.
• Browse Gallery: Scroll through the complete collection of wildlife images.

The search system uses intelligent matching to understand variations in species names and natural language queries, making it easy to find what you're looking for.`
  },
  {
    question: "What information is available about each species?",
    answer: `Each species in the biodiversity library includes:

• Common Names: English and local names for easy identification
• Scientific Names: Proper taxonomic classification
• High-Quality Images: Photos sourced from Wikimedia Commons
• Natural Descriptions: Detailed information about appearance, behavior, and habitat
• Conservation Status: Current IUCN Red List classification (Least Concern, Vulnerable, Endangered, etc.)
• Habitat Information: Where the species is found within the wetlands

The data is curated to provide both scientific accuracy and accessible information for visitors of all knowledge levels.`
  },
  {
    question: "Is TerraTale available in multiple languages?",
    answer: `Yes, the voice chat feature supports multilingual conversations through Google's Gemini LIVE API. The AI can understand and respond in multiple languages, making TerraTale accessible to international visitors exploring the San San Pond Sak Wetlands.

The text chat and written content are currently in English, but the conversational AI can translate and explain concepts in the user's preferred language during voice interactions.`
  },
  {
    question: "Can TerraTale be adapted for other locations or uses?",
    answer: `Absolutely! TerraTale's architecture is designed to be adaptable across various sectors:

• National Parks & Wildlife Reserves: Deploy similar guides for any protected area with localized biodiversity data
• Museums & Cultural Heritage Sites: Create interactive guides for art galleries, historical landmarks, and cultural centers
• Educational Institutions: Build learning tools for biology, ecology, and environmental science courses
• Botanical Gardens & Zoos: Provide engaging visitor experiences with species information and conservation messaging
• Tourism Destinations: Offer multilingual, interactive guides for any location

The core technology combining conversational AI, intelligent search, and rich media content can be customized for any domain requiring accessible, engaging information delivery.`
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
            Learn more about TerraTale and how to use the platform
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
