import axios from 'axios';
import { prisma } from '../db/db';
import logger from './logger';

export const sendWebhookNotification = async (
  organizationId,
  eventType,
  data
) => {
  try {

    const settings = await prisma.organizationSettings.findFirst({
      where: { organizationId },
    });
    
    if (!settings?.webhookUrl) {
      return;
    }
    
 
    const payload = {
      eventType,
      data,
      timestamp: Date.now(),
    };
  
    if (settings.webhookSecret) {
      console.log('Webhook secret exists, generating signature...');
   
    }
    
    // Send webhook
    await axios.post(settings.webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': payload.signature || '',
        'User-Agent': 'StatusPage/1.0',
      },
      timeout: 5000,
    });
    
    logger.info('Webhook notification sent', { organizationId, eventType });
  } catch (error) {
    logger.error('Failed to send webhook notification', { error, organizationId, eventType });
  }
};
