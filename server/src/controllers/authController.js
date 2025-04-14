import { prisma } from '../db/db.js';
import logger from '../utils/logger.js';

export const handleClerkWebhook = async (req,res, next) => {
    try {
      const event = (req ).webhookEvent;
      const eventType = event.type;
      const data = event.data;
      
      logger.info(`Processing Clerk webhook: ${eventType}`, { eventId: event.id });
      
      switch (eventType) {
case 'user.created': {
  const clerkId = data.id;
  const primaryEmail = data.email_addresses.find(
    e => e.id === data.primary_email_address_id
  )?.email_address;

  await prisma.user.upsert({
    where: { clerkId },
    update: {
      email: primaryEmail,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim(),
      avatarUrl: data.image_url
    },
    create: {
      clerkId,
      email: primaryEmail || `${clerkId}@temp.user`,
      name: `${data.first_name || ''} ${data.last_name || ''}`.trim() || 'New User',
      avatarUrl: data.image_url,
      role: 'USER'
    }
  });
  break;
}
        case 'user.updated': {
          const clerkUserId = data.id;
          const email = data.email_addresses?.[0]?.email_address;
          const firstName = data.first_name || '';
          const lastName = data.last_name || '';
          const name = `${firstName} ${lastName}`.trim();
          const avatarUrl = data.image_url;
          
          await prisma.user.updateMany({
            where: { clerkId: clerkUserId },
            data: {
              email,
              name,
              avatarUrl,
            },
          });
          logger.info(`Updated user from Clerk webhook: ${clerkUserId}`);
          break;
        }
        
        case 'user.deleted': {
          const clerkUserId = data.id;
          await prisma.user.deleteMany({
            where: { clerkId: clerkUserId },
          });
          logger.info(`Deleted user from Clerk webhook: ${clerkUserId}`);
          break;
        }
        
        case 'organization.created': {
          const clerkOrgId = data.id;
          
          try {
            const clerkOrg = await clerkClient.organizations.getOrganization({
              organizationId: clerkOrgId
            });
        
            await prisma.organization.upsert({
              where: { clerkId: clerkOrgId },
              update: {
                name: clerkOrg.name,
                slug: clerkOrg.slug || generateSlug(clerkOrg.name),
                updatedAt: new Date()
              },
              create: {
                clerkId: clerkOrgId,
                name: clerkOrg.name,
                slug: clerkOrg.slug || generateSlug(clerkOrg.name),
                settings: { create: {} }
              }
            });
          } catch (error) {
            logger.error('Failed to sync organization from webhook', error);
          }
          break;
        }

        case 'organizationMembership.created': {
          const clerkUserId = data.public_user_data.user_id;
          const clerkOrgId = data.organization.id;
        
          const [user, org] = await Promise.all([
            prisma.user.findUnique({ where: { clerkId: clerkUserId }}),
            prisma.organization.upsert({
              where: { clerkId: clerkOrgId },
              update: {},
              create: {
                clerkId: clerkOrgId,
                name: data.organization.name,
                slug: generateSlug(data.organization.name),
                settings: { create: {} }
              }
            })
          ]);
        
          if (user) {
            await prisma.membership.upsert({
              where: {
                userId_organizationId: {
                  userId: user.id,
                  organizationId: org.id
                }
              },
              update: {},
              create: {
                userId: user.id,
                organizationId: org.id,
                role: data.role === 'org:admin' ? 'ADMIN' : 'USER'
              }
            });
          }
          break;
        }
        
        case 'organizationMembership.deleted': {
          // Handle removing user from organization
          const clerkOrgId = data.organization.id;
          const clerkUserId = data.public_user_data?.user_id || data.user_id;
          
          // Get user
          const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: {
              organization: true
            }
          });
          
          if (user && user.organization.clerkId === clerkOrgId) {
            logger.info(`User ${clerkUserId} removed from organization ${clerkOrgId}`);
          }
          break;
        }
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error processing Clerk webhook', { error });
      next(error);
    }
  };