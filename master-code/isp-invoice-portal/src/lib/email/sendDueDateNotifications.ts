import nodemailer from 'nodemailer';


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendDueDateNotifications() {
  try {
    console.log('Fetching from:', process.env.NEXT_PUBLIC_API_URL + '/api/invoices');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/invoices`);
  

    if (!response.ok) throw new Error(`Failed to fetch invoices: ${response.statusText}`);
    const invoices = await response.json();

    const today = new Date();
    const sevenDaysFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);

    const invoicesToNotify = invoices.filter((invoice: any) => {
      const dueDate = new Date(invoice.invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      return (
        invoice.status !== 'Paid' &&
        (dueDate <= sevenDaysFromNow || dueDate < today) &&
        invoice.customerEmail
      );
    });

    for (const invoice of invoicesToNotify) {
      const dueDate = new Date(invoice.invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      const isOverdue = dueDate < today;

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: invoice.customerEmail,
        subject: isOverdue
          ? `Overdue Invoice #${invoice.invoiceNumber}`
          : `Invoice #${invoice.invoiceNumber} Due Soon`,
        text: isOverdue
          ? `Dear ${invoice.customerName},\n\nYour invoice #${invoice.invoiceNumber} for $${invoice.amount} was due on ${dueDate.toDateString()}. Please make payment as soon as possible.\n\nThank you!`
          : `Dear ${invoice.customerName},\n\nYour invoice #${invoice.invoiceNumber} for $${invoice.amount} is due on ${dueDate.toDateString()}. Please ensure payment is made on time.\n\nThank you!`,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Email sent to ${invoice.customerEmail} for invoice #${invoice.invoiceNumber}`);
    }

    return { success: true, notified: invoicesToNotify.length };
  } catch (error: any) {
    console.error('Error sending notifications:', error.message);
    return { success: false, error: error.message };
  }
}