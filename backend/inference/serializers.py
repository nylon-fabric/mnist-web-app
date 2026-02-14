
from rest_framework import serializers
from .models import AIModelConfig

class AIModelConfigSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIModelConfig
        fields = ['id', 'name']  # フロントに渡すのは、名前とidのみ
