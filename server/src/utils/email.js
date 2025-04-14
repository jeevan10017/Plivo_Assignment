import nodemailer from 'nodemailer';
import { prisma } from '../db/db.js';
import logger from './logger.js';

let transporter;

// Initialize email transporter
export const initEmailTransporter = async () => {
  try {
    if (transporter) {
      transporter.close();
    }

    if (process.env.NODE_ENV !== 'production') {
      const testAccount = await nodemailer.createTestAccount();

      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });

      logger.info('Test email account created', { user: testAccount.user });
      return;
    }

    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT || '587'),
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      logger.info('Email transporter initialized from environment variables');
    } else {
      logger.warn('Email environment variables not set');
    }
  } catch (error) {
    logger.error('Failed to initialize email transporter', { error });
  }
};

// Send email
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    let orgId = null;
    const orgMatch = subject.match(/\[org:([a-f0-9-]+)\]/);
    if (orgMatch) {
      orgId = orgMatch[1];
      subject = subject.replace(/\[org:[a-f0-9-]+\]/, '').trim();
    }

    if (orgId) {
      const orgSettings = await prisma.organizationSettings.findFirst({
        where: { organizationId: orgId },
      });

      if (orgSettings?.emailEnabled && orgSettings.emailConfig) {
        const config = orgSettings.emailConfig;

        const orgTransporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: config.auth.user,
            pass: config.auth.pass,
          },
        });

        const info = await orgTransporter.sendMail({
          from: config.from,
          to,
          subject,
          text,
          html,
        });

        logger.info('Email sent', { messageId: info.messageId });

        if (process.env.NODE_ENV !== 'production') {
          logger.info('Preview URL', { url: nodemailer.getTestMessageUrl(info) });
        }

        return;
      }
    }

    if (!transporter) {
      await initEmailTransporter();
    }

    if (!transporter) {
      throw new Error('Email transporter not initialized');
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"Status Page" <status@example.com>',
      to,
      subject,
      text,
      html,
    });

    logger.info('Email sent', { messageId: info.messageId });

    if (process.env.NODE_ENV !== 'production') {
      logger.info('Preview URL', { url: nodemailer.getTestMessageUrl(info) });
    }
  } catch (error) {
    logger.error('Failed to send email', { error });
    throw error;
  }
};

// Send test email
export const testSendEmail = async ({ to, subject, text, html }) => {
  try {
    const email = await sendEmail({
      to,
      subject: `${subject} [Test]`,
      text: `${text}\n\nThis is a test email sent at ${new Date().toISOString()}`,
      html: `${html}<p>This is a test email sent at ${new Date().toISOString()}</p>`,
    });

    return email;
  } catch (error) {
    logger.error('Failed to send test email', { error });
    throw error;
  }
};
