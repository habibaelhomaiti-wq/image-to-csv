"""
AI Service - Product image analysis using GPT-4 Vision.
"""

import base64
import json
import logging
from typing import List, Tuple

from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)

# System prompt for product analysis
SYSTEM_PROMPT = """Tu es un expert en analyse de produits. Pour chaque image que tu reçois, extrait les informations suivantes.

Réponds UNIQUEMENT avec un tableau JSON d'objets (un par image) dans ce format exact :
[
  {
    "nom": "Nom complet du produit",
    "categorie": "Catégorie du produit",
    "couleur": ["couleur1", "couleur2"],
    "marque": "Marque détectée (ou '' si non identifiable)",
    "description": "Description détaillée du produit (2-3 phrases)",
    "confiance": 0.92
  }
]

Règles :
- Retourne TOUJOURS un tableau JSON, même s'il n'y a qu'une seule image.
- Chaque objet dans le tableau doit correspondre à une image dans l'ordre où elles sont reçues.
- "nom" : Le nom complet et descriptif du produit
- "categorie" : La catégorie la plus précise possible
- "couleur" : Liste des couleurs principales visibles
- "marque" : La marque si visible, sinon chaîne vide ""
- "description" : Description professionnelle et détaillée (2-3 phrases)
- "confiance" : Score entre 0 et 1

Si une image ne peut pas être analysée, l'objet correspondant doit être :
{"nom": "", "categorie": "", "couleur": [], "marque": "", "description": "", "confiance": 0.0, "erreur": "Impossible d'analyser cette image"}

Réponds UNIQUEMENT avec le JSON, aucun texte supplémentaire."""


class AIServiceError(Exception):
    """Custom exception for AI service errors."""
    pass


class AIService:
    """Service for analyzing product images using GPT-4 Vision."""

    def __init__(self):
        api_key = settings.OPENAI_API_KEY
        if not api_key or "your-openai-api-key" in api_key:
            raise AIServiceError("OPENAI_API_KEY non configurée dans le fichier .env")

        # Détecte si c'est une clé OpenRouter ou OpenAI
        base_url = None
        if api_key.startswith("sk-or-"):
            base_url = "https://openrouter.ai/api/v1"
            logger.info("Utilisation de l'API OpenRouter")
        else:
            logger.info("Utilisation de l'API OpenAI standard")

        self.client = OpenAI(api_key=api_key, base_url=base_url)
        self.model = settings.OPENAI_MODEL

    def analyze(self, images: List[Tuple[bytes, str]]) -> List[dict]:
        """
        Analyze one or more product images in a single call.

        Args:
            images: List of (image_content, mime_type) tuples

        Returns:
            List of dicts with product analysis results
        """
        if not images:
            raise AIServiceError("No images provided")

        try:
            # Prepare multimodal content with text and all images
            user_content = [
                {"type": "text", "text": "Analyse ces produits et extrait les informations demandées pour chaque image."}
            ]
            
            for image_content, mime_type in images:
                base64_image = base64.b64encode(image_content).decode('utf-8')
                user_content.append({
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}
                })

            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": user_content
                    }
                ],
                max_tokens=max(1000, 500 * len(images)), # Scale tokens with number of images
                temperature=0.1,
            )

            return self._parse_response(response)

        except AIServiceError:
            raise
        except Exception as e:
            logger.error(f"AI service error: {str(e)}")
            raise AIServiceError(f"AI analysis failed: {str(e)}")

    def _parse_response(self, response) -> List[dict]:
        """Parse and validate AI response."""
        logger.info(f"AI response received - Model: {response.model}")
        
        result_text = response.choices[0].message.content
        if result_text is None:
            logger.error(f"AI returned empty response. Finish reason: {response.choices[0].finish_reason}")
            raise AIServiceError("AI returned empty response")

        result_text = result_text.strip()
        if not result_text:
            logger.error("AI returned whitespace-only response")
            raise AIServiceError("AI returned empty response")

        try:
            # Handle markdown code blocks
            if result_text.startswith("```"):
                result_text = result_text.strip("`").strip()
                if result_text.startswith("json"):
                    result_text = result_text[4:].strip()

            results = json.loads(result_text)
            
            # Ensure it's a list
            if not isinstance(results, list):
                results = [results]

            # Validate each result in the list
            for result in results:
                required_fields = ["nom", "categorie", "couleur", "marque", "description", "confiance"]
                for field in required_fields:
                    if field not in result:
                        result[field] = "" if field != "couleur" else []

                # Ensure couleur is a list
                if not isinstance(result.get("couleur"), list):
                    result["couleur"] = [result["couleur"]] if result["couleur"] else []

            return results

        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse AI response as JSON: {result_text}")
            raise AIServiceError(f"Invalid AI response format: {str(e)}")
