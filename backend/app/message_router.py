import re
from typing import Dict, Any, Optional


class MessageRouter:
    """Determines message intent and routes to appropriate handlers"""

    IMAGE_KEYWORDS = [
        'show', 'see', 'picture', 'photo', 'image', 'look', 'view',
        'what does', 'how does', 'appearance', 'looks like'
    ]

    ANIMAL_KEYWORDS = [
        'bird', 'fish', 'manatee', 'dolphin', 'heron', 'kingfisher',
        'turtle', 'sloth', 'monkey', 'iguana', 'crab', 'butterfly',
        'frog', 'snake', 'lizard', 'bat', 'otter', 'caiman'
    ]

    def analyze_intent(self, message: str) -> Dict[str, Any]:
        message_lower = message.lower()

        should_search_images = self._should_search_images(message_lower)
        extracted_animals = self._extract_animals(message_lower)

        return {
            "search_images": should_search_images,
            "animals": extracted_animals,
            "search_query": self._build_search_query(message_lower, extracted_animals)
        }

    def _should_search_images(self, message: str) -> bool:
        for keyword in self.IMAGE_KEYWORDS:
            if keyword in message:
                return True

        for animal in self.ANIMAL_KEYWORDS:
            if animal in message:
                has_visual_context = any(
                    word in message for word in ['show', 'see', 'picture', 'photo', 'image']
                )
                if has_visual_context:
                    return True

        return False

    def _extract_animals(self, message: str) -> list[str]:
        found_animals = []
        for animal in self.ANIMAL_KEYWORDS:
            if animal in message:
                found_animals.append(animal)
        return found_animals

    def _build_search_query(self, message: str, animals: list[str]) -> Optional[str]:
        if animals:
            return " ".join(animals)

        for keyword in self.IMAGE_KEYWORDS:
            if keyword in message:
                words = message.split()
                try:
                    idx = words.index(keyword)
                    if idx + 1 < len(words):
                        return " ".join(words[idx + 1:idx + 4])
                except ValueError:
                    continue

        return None


message_router = MessageRouter()
