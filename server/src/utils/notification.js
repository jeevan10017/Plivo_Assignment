import { prisma } from '../db/db.js';
import { sendEmail } from './email.js';
import logger from './logger.js';

// Send notifications to all verified subscribers
export const notifySubscribers = async (organizationId, payload) => {
  try {
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId },
      include: {
        subscribers: {
          where: { verified: true },
        },
      },
    });

    if (!organization || organization.subscribers.length === 0) {
      return;
    }

    const { subject, text, html } = generateNotificationContent(organization.name, payload);

    const batchSize = 50;
    for (let i = 0; i < organization.subscribers.length; i += batchSize) {
      const batch = organization.subscribers.slice(i, i + batchSize);
      await Promise.all(
        batch.map((subscriber) => {
          const unsubscribeUrl = `${process.env.FRONTEND_URL}/${organization.slug}/unsubscribe/${subscriber.unsubscribeToken}`;
          const unsubscribeHtml = `
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
              <p>You're receiving this email because you subscribed to ${organization.name} status updates.</p>
              <p>To unsubscribe, <a href="${unsubscribeUrl}">click here</a>.</p>
            </div>
          `;

          return sendEmail({
            to: subscriber.email,
            subject,
            text: `${text}\n\nTo unsubscribe, visit: ${unsubscribeUrl}`,
            html: `${html}${unsubscribeHtml}`,
          });
        })
      );
    }
  } catch (error) {
    logger.error('Failed to notify subscribers', { error });
    throw error;
  }
};

function generateNotificationContent(orgName, payload) {
  switch (payload.type) {
    case 'INCIDENT_CREATED':
      return generateIncidentCreatedContent(orgName, payload.incident);
    case 'INCIDENT_UPDATED':
      return generateIncidentUpdatedContent(orgName, payload.incident, payload.update);
    case 'MAINTENANCE_SCHEDULED':
      return generateMaintenanceScheduledContent(orgName, payload.maintenance);
    case 'MAINTENANCE_UPDATED':
      return generateMaintenanceUpdatedContent(orgName, payload.maintenance, payload.update);
    default:
      throw new Error(`Unknown notification type: ${payload.type}`);
  }
}

function generateIncidentCreatedContent(orgName, incident) {
  const affectedServices = incident.services.map((s) => s.service.name).join(', ');

  const statusMap = {
    INVESTIGATING: 'investigating',
    IDENTIFIED: 'identified',
    MONITORING: 'monitoring',
    RESOLVED: 'resolved',
  };

  const impactMap = {
    CRITICAL: 'critical',
    MAJOR: 'major',
    MINOR: 'minor',
    MAINTENANCE: 'maintenance',
  };

  const status = statusMap[incident.status] || incident.status.toLowerCase();
  const impact = impactMap[incident.impact] || incident.impact.toLowerCase();
  const update = incident.updates[0] || { message: 'No details available.' };

  const subject = `[${orgName}] ${incident.title} (${impact} impact)`;

  const text = `
${orgName} Status Update

New Incident: ${incident.title}
Status: ${status}
Impact: ${impact}
Affected Services: ${affectedServices}

${update.message}

View Status Page: ${process.env.FRONTEND_URL}/${incident.organizationId}
`;

  const html = `
<h2>${orgName} Status Update</h2>
<div style="padding: 15px; border-left: 4px solid #f44336; margin-bottom: 20px;">
  <h3 style="margin-top: 0;">New Incident: ${incident.title}</h3>
  <p><strong>Status:</strong> ${status}</p>
  <p><strong>Impact:</strong> ${impact}</p>
  <p><strong>Affected Services:</strong> ${affectedServices}</p>
  <div style="margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
    ${update.message.replace(/\n/g, '<br>')}
  </div>
</div>
<p>
  <a href="${process.env.FRONTEND_URL}/${incident.organizationId}" 
     style="background-color: #4F46E5; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
    View Status Page
  </a>
</p>
`;

  return { subject, text, html };
}

function generateIncidentUpdatedContent(orgName, incident, update) {
  const affectedServices = incident.services.map((s) => s.service.name).join(', ');

  const statusMap = {
    INVESTIGATING: 'investigating',
    IDENTIFIED: 'identified',
    MONITORING: 'monitoring',
    RESOLVED: 'resolved',
  };

  const impactMap = {
    CRITICAL: 'critical',
    MAJOR: 'major',
    MINOR: 'minor',
    MAINTENANCE: 'maintenance',
  };

  const status = statusMap[update.status] || update.status.toLowerCase();
  const impact = impactMap[incident.impact] || incident.impact.toLowerCase();

  const subject = `[${orgName}] Update: ${incident.title} (${status})`;

  const text = `
${orgName} Status Update

Incident: ${incident.title}
New Status: ${status}
Impact: ${impact}
Affected Services: ${affectedServices}

${update.message}

View Status Page: ${process.env.FRONTEND_URL}/${incident.organizationId}
`;

  const html = `
<h2>${orgName} Status Update</h2>
<div style="padding: 15px; border-left: 4px solid #f59e0b; margin-bottom: 20px;">
  <h3 style="margin-top: 0;">Incident Update: ${incident.title}</h3>
  <p><strong>Status:</strong> ${status}</p>
  <p><strong>Impact:</strong> ${impact}</p>
  <p><strong>Affected Services:</strong> ${affectedServices}</p>
  <div style="margin-top: 10px; padding: 10px; background-color: #f9f9f9; border-radius: 4px;">
    ${update.message.replace(/\n/g, '<br>')}
  </div>
</div>
<p>
  <a href="${process.env.FRONTEND_URL}/${incident.organizationId}" 
     style="background-color: #4F46E5; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">
    View Status Page
  </a>
</p>
`;

  return { subject, text, html };
}


