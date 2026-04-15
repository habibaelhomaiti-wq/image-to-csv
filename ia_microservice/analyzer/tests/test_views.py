"""
Tests for the analyzer app.
"""

from django.test import TestCase, override_settings
from django.conf import settings
from rest_framework.test import APIClient
from io import BytesIO
from PIL import Image


def create_test_image(color='red'):
    """Create a simple test image."""
    img = Image.new('RGB', (100, 100), color=color)
    buffer = BytesIO()
    img.save(buffer, format='JPEG')
    buffer.seek(0)
    buffer.name = 'test_image.jpg'
    return buffer


@override_settings(OPENAI_API_KEY='test-key')
class HealthCheckTest(TestCase):
    """Tests for the health check endpoint."""

    def setUp(self):
        self.client = APIClient()

    def test_health_check_returns_200(self):
        """Health check endpoint should return 200 OK."""
        response = self.client.get('/api/health/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['status'], 'healthy')
        self.assertEqual(response.data['service'], 'ia-microservice')


class SingleImageUploadTest(TestCase):
    """Tests for single image upload."""

    def setUp(self):
        self.client = APIClient()

    def test_analyze_without_image_returns_400(self):
        """POST without image should return 400."""
        response = self.client.post('/api/analyze/')
        self.assertEqual(response.status_code, 400)
        self.assertIn('No image', response.data['error'])

    def test_analyze_with_invalid_image_returns_400(self):
        """POST with invalid data should return 400."""
        response = self.client.post('/api/analyze/', {'image': 'not_a_file'})
        self.assertEqual(response.status_code, 400)


class MultiImageUploadTest(TestCase):
    """Tests for multiple image upload."""

    def setUp(self):
        self.client = APIClient()

    def test_analyze_multiple_without_images_returns_400(self):
        """POST without images should return 400."""
        response = self.client.post('/api/analyze/')
        self.assertEqual(response.status_code, 400)

    def test_analyze_single_still_works(self):
        """Single image upload should still work with 'image' field."""
        img = create_test_image()
        response = self.client.post('/api/analyze/', {'image': img}, format='multipart')
        # Should not be 400 (validation error), will be 503 since no real API key
        self.assertNotEqual(response.status_code, 400)

    def test_analyze_multiple_validation(self):
        """Multiple image upload validation."""
        img1 = create_test_image('red')
        img2 = create_test_image('blue')
        response = self.client.post(
            '/api/analyze/',
            {'images': [img1, img2]},
            format='multipart'
        )
        # Should pass validation (will fail on AI call without real key)
        self.assertNotEqual(response.status_code, 400)

    def test_analyze_multiple_empty_list_returns_400(self):
        """POST with empty images list should return 400."""
        response = self.client.post(
            '/api/analyze/',
            {'images': []},
            format='multipart'
        )
        self.assertEqual(response.status_code, 400)

    def test_analyze_multiple_too_many_images(self):
        """POST with more than 10 images should return 400."""
        images = [create_test_image() for _ in range(11)]
        response = self.client.post(
            '/api/analyze/',
            {'images': images},
            format='multipart'
        )
        self.assertEqual(response.status_code, 400)
