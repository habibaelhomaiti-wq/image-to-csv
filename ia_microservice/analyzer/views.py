"""
Views for the analyzer app.
"""

import logging

from django.conf import settings
from rest_framework import status
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response

from analyzer.serializers import (
    MultiImageUploadSerializer,
    ProductAnalysisSerializer,
)
from analyzer.services.ai_service import AIService, AIServiceError

logger = logging.getLogger(__name__)


def validate_image_file(image_file):
    """Validate a single image file. Returns error response or None."""
    # Validate file size
    if image_file.size > settings.MAX_UPLOAD_SIZE:
        return Response(
            {'error': f'File too large. Maximum size: {settings.MAX_UPLOAD_SIZE // (1024*1024)}MB'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate file extension
    ext = image_file.name.split('.')[-1].lower() if image_file.name else ''
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        return Response(
            {'error': f'Invalid file type. Allowed: {settings.ALLOWED_IMAGE_EXTENSIONS}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    return None


@api_view(['GET'])
def health_check(request):
    """Health check endpoint."""
    return Response({
        'status': 'healthy',
        'service': 'ia-microservice',
        'ai_configured': bool(settings.OPENAI_API_KEY)
    }, status=status.HTTP_200_OK)


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def analyze(request):
    """
    Analyze product image(s) and extract product information.
    Accepts:
    - Single image: `image` field
    - Multiple images: `images` field (list of files, max 10)
    
    Always returns a list of result objects.
    """
    files = request.FILES
    image_files = []
    
    if 'images' in files:
        image_files = files.getlist('images')
    elif 'image' in files:
        image_files = [files['image']]
    else:
        return Response(
            {'error': 'No image(s) provided. Use "image" or "images" field.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validate image upload
    serializer = MultiImageUploadSerializer(data={'images': image_files})
    if not serializer.is_valid():
        return Response(
            {'error': 'Invalid images', 'details': serializer.errors},
            status=status.HTTP_400_BAD_REQUEST
        )

    validated_images = serializer.validated_data['images']

    # Validate file size and type for each image
    for image_file in validated_images:
        validation_error = validate_image_file(image_file)
        if validation_error:
            return validation_error

    try:
        # Prepare images for service
        images_to_process = []
        for image_file in validated_images:
            image_content = image_file.read()
            mime_type = image_file.content_type or 'image/jpeg'
            images_to_process.append((image_content, mime_type))

        # Perform AI analysis
        ai_service = AIService()
        results = ai_service.analyze(images_to_process)

        # Validate and format results
        validated_results = []
        for result in results:
            # Handle AI-level errors inside the batch
            if result.get('erreur'):
                validated_results.append(result)
                continue

            result_serializer = ProductAnalysisSerializer(data=result)
            if result_serializer.is_valid():
                validated_results.append(result_serializer.data)
            else:
                validated_results.append({
                    "nom": "",
                    "categorie": "",
                    "couleur": [],
                    "marque": "",
                    "description": "",
                    "confiance": 0.0,
                    "erreur": "Invalid AI response"
                })

        return Response(validated_results, status=status.HTTP_200_OK)

    except AIServiceError as e:
        logger.error(f"AI Service error: {str(e)}")
        return Response(
            {'error': 'AI analysis failed', 'details': str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response(
            {'error': 'Internal server error', 'details': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


