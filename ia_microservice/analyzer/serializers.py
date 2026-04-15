from rest_framework import serializers


class ProductAnalysisSerializer(serializers.Serializer):
    """Serializer for product analysis results from AI."""

    nom = serializers.CharField(max_length=255, allow_blank=False)
    categorie = serializers.CharField(max_length=255, allow_blank=True, default="")
    couleur = serializers.ListField(child=serializers.CharField(max_length=100), allow_empty=True, default=[])
    marque = serializers.CharField(max_length=255, allow_blank=True, default="")
    description = serializers.CharField(max_length=2000, allow_blank=True, default="")
    confiance = serializers.FloatField(min_value=0.0, max_value=1.0, default=0.0)


class ImageUploadSerializer(serializers.Serializer):
    """Serializer for single image upload validation."""

    image = serializers.ImageField()


class MultiImageUploadSerializer(serializers.Serializer):
    """Serializer for multiple image upload validation."""

    images = serializers.ListField(
        child=serializers.ImageField(),
        min_length=1,
        max_length=10,
        allow_empty=False,
    )
