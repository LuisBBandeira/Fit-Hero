import aiohttp
import asyncio
import os
import logging
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

class WebhookService:
    def __init__(self):
        self.webhook_url = os.getenv('MAIN_APP_WEBHOOK_URL', 'http://localhost:3000/api/ai/webhook')
        self.webhook_secret = os.getenv('AI_WEBHOOK_SECRET', 'fit-hero-ai-webhook-secret')
        self.enabled = os.getenv('WEBHOOKS_ENABLED', 'true').lower() == 'true'
        
    async def send_webhook(
        self,
        player_id: str,
        event_type: str,
        data: Optional[Dict[Any, Any]] = None,
        retry_count: int = 3
    ) -> bool:
        """
        Send webhook notification to main application
        """
        if not self.enabled:
            logger.info(f"📤 Webhooks disabled, skipping: {event_type} for player {player_id}")
            return True
            
        logger.info(f"📤 Sending webhook: {event_type} for player {player_id}")
        
        payload = {
            'player_id': player_id,
            'event_type': event_type,
            'data': data or {},
            'timestamp': asyncio.get_event_loop().time()
        }
        
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {self.webhook_secret}'
        }
        
        for attempt in range(retry_count):
            try:
                async with aiohttp.ClientSession() as session:
                    async with session.post(
                        self.webhook_url,
                        json=payload,
                        headers=headers,
                        timeout=aiohttp.ClientTimeout(total=10)
                    ) as response:
                        if response.status == 200:
                            logger.info(f"✅ Webhook sent successfully: {event_type}")
                            return True
                        else:
                            error_text = await response.text()
                            logger.warning(f"⚠️ Webhook failed with status {response.status}: {error_text}")
                            
            except asyncio.TimeoutError:
                logger.warning(f"⏰ Webhook timeout (attempt {attempt + 1}/{retry_count})")
            except Exception as e:
                logger.warning(f"❌ Webhook error (attempt {attempt + 1}/{retry_count}): {str(e)}")
            
            if attempt < retry_count - 1:
                # Exponential backoff: 1s, 2s, 4s
                await asyncio.sleep(2 ** attempt)
        
        logger.error(f"🚨 Failed to send webhook after {retry_count} attempts: {event_type}")
        return False
    
    async def notify_workout_plan_generated(self, player_id: str, plan_data: Dict[Any, Any]):
        """Notify that workout plan generation completed"""
        return await self.send_webhook(
            player_id=player_id,
            event_type='workout_plan_generated',
            data={
                'month': plan_data.get('month'),
                'year': plan_data.get('year'),
                'workout_days': plan_data.get('workout_days'),
                'plan_id': plan_data.get('plan_id'),
                'success': True
            }
        )
    
    async def notify_meal_plan_generated(self, player_id: str, plan_data: Dict[Any, Any]):
        """Notify that meal plan generation completed"""
        return await self.send_webhook(
            player_id=player_id,
            event_type='meal_plan_generated',
            data={
                'month': plan_data.get('month'),
                'year': plan_data.get('year'),
                'daily_calories': plan_data.get('daily_calories'),
                'plan_id': plan_data.get('plan_id'),
                'success': True
            }
        )
    
    async def notify_ai_activation_completed(self, player_id: str, results: Dict[Any, Any]):
        """Notify that complete AI activation finished"""
        return await self.send_webhook(
            player_id=player_id,
            event_type='ai_activation_completed',
            data={
                'workout_plan_success': results.get('workout_plan_success', False),
                'meal_plan_success': results.get('meal_plan_success', False),
                'errors': results.get('errors', []),
                'activation_complete': True
            }
        )
    
    async def notify_ai_activation_failed(self, player_id: str, error_details: Dict[Any, Any]):
        """Notify that AI activation failed"""
        return await self.send_webhook(
            player_id=player_id,
            event_type='ai_activation_failed',
            data={
                'error_message': error_details.get('error'),
                'error_type': error_details.get('type', 'unknown'),
                'retry_possible': error_details.get('retry_possible', True)
            }
        )

# Global webhook service instance
webhook_service = WebhookService()
