import { Injectable } from '@nestjs/common';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class MailService {
  constructor() {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }
  async sendNewPasswordEmail(email: string, newPassword: string) {
    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER,
      subject: 'Your New Password',
      html: `<p>Your new password is: <strong>${newPassword}</strong></p>`,
    };
    await sgMail.send(msg);
  }

  async sendForgotPasswordEmail(email: string, resetLink: string): Promise<void> {
    const msg = {
      to: email,
      from: process.env.SENDGRID_SENDER,
      subject: 'Reset Your Password',
      html: `<p>Click the link below to reset your password:</p><a href="${resetLink}">Reset Password</a>`,
    };
    await sgMail.send(msg);
  }

  async sendActivationEmail(email: string, activationLink: string): Promise<void> {
    const senderEmail = process.env.SENDGRID_SENDER;
    const senderName = process.env.SENDGRID_FROM_NAME;

    if (!senderEmail || !senderName) {
      throw new Error('Sender email or name is not defined');
    }

    const msg = {
      to: email,
      from: {
        email: senderEmail,
        name: senderName,
      },
      subject: 'Activate your account',
      text: `Please click the link below to activate your account: ${activationLink}`,
      html: `<p>Please click the link below to activate your account:</p><a href="${activationLink}">Activate</a>`,
    };

    try {
      await sgMail.send(msg);
      console.log('Activation email sent successfully');
    } catch (error) {
      console.error('Error sending activation email:', error.response.body);
      throw new Error('Email sending failed');
    }
  }

  async sendEmail(to: string, subject: string, text: string) {
    const msg = {
      to,
      from: {
        email: `${process.env.SENDGRID_SENDER}`,
        name: `${process.env.SENDGRID_FROM_NAME}`,
      },
      subject,
      text,
    };

    try {
      await sgMail.send(msg);
      console.log('Email sent successfully');
    } catch (error) {
      console.error('Error sending email:', error.response.body);
      throw new Error('Email sending failed');
    }
  }

}
