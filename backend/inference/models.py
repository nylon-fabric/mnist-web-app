from django.db import models
import uuid

class PredictionHistory(models.Model):
    """
    履歴内容用
    """
    batch_id = models.CharField(max_length=36, db_index=True, verbose_name="バッチID（共通ID）") # フロントでUUID
    digit_index = models.PositiveSmallIntegerField(verbose_name="桁の順序")
    digit = models.CharField(max_length=1, blank=True, null=True) # 予測値
    confidence = models.FloatField(blank=True, null=True) # 予測値の確率
    created_at = models.DateTimeField(auto_now_add=True) # 登録日

    def __str__(self):
        """
        管理画面やシェルでの表示用
        例
        >>> ph = PredictionHistory(digit='1', confidence='2')
        >>> print(ph)
        1 0.99 (2026-01-16 13:45)
        """
        return f"id:{self.batch_id}, index:{self.digit_index}, digit:{self.digit}, confidence:{self.confidence} ({self.created_at.strftime('%Y-%m-%d %H:%M')})"


class AIModelConfig(models.Model):
    """
    機械学習モデルの登録用
    """
    name = models.CharField(max_length=100, verbose_name="モデル名")
    api_url = models.URLField(verbose_name="推論APIのURL")
    is_active = models.BooleanField(default=False, verbose_name="有効フラグ")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="登録日時")
    description = models.TextField(blank=True, null=True, verbose_name="説明")

    def save(self, *args, **kwargs):
        # 有効化する場合、他のモデルをすべて無効化する
        if self.is_active:
            AIModelConfig.objects.exclude(pk=self.pk).update(is_active=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"name:{self.name} ({'Active' if self.is_active else 'Inactive'})"


class RetrainingData(models.Model):
    """
    モデルの結果格納（再学習用など）
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)# 主キー
    image = models.ImageField(upload_to='training_images/', verbose_name="手書き画像")
    predicted_digit = models.CharField(max_length=1, verbose_name="AI予測値")
    correct_digit = models.CharField(max_length=1, verbose_name="修正正解値")
    is_incorrect = models.BooleanField(default=False, verbose_name="間違いフラグ")
    model_version = models.CharField(max_length=100, verbose_name="モデル名")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="登録日時")

    def __str__(self):
        return f"{self.model_version}: AI({self.predicted_digit}) -> Human({self.correct_digit})"