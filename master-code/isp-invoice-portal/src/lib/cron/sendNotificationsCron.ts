import cron from 'node-cron';
import { sendDueDateNotifications } from '../email/sendDueDateNotifications';
import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(process.cwd(), '.env.local') });

console.log('Starting cron scheduler...');
console.log('Current working directory:', process.cwd());
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
console.log('EMAIL_USER:', process.env.EMAIL_USER);

cron.schedule('*/1 * * * *', async () => {
  console.log('Running due date notification job at', new Date().toISOString());
  try {
    const result = await sendDueDateNotifications();
    console.log('Job result:', result);
  } catch (error: any) {
    console.error('Job error:', error.message);
  }
});