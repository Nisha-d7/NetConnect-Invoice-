import { Document, Page, Text, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 20, textAlign: 'center', marginBottom: 20 },
  text: { fontSize: 12, marginBottom: 5 },
});

export const InvoicePDF = ({ invoice }: { invoice: any }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.title}>Invoice</Text>
      <Text style={styles.text}>Customer: {invoice.customerName || 'N/A'}</Text>
      <Text style={styles.text}>Email: {invoice.customerEmail || 'N/A'}</Text>
      <Text style={styles.text}>Invoice #: {invoice.invoiceNumber || 'N/A'}</Text>
      <Text style={styles.text}>Date: {invoice.invoiceDate || 'N/A'}</Text>
      <Text style={styles.text}>Amount: ${invoice.amount || 0}</Text>
      <Text style={styles.text}>Tax: ${invoice.tax || 0}</Text>
      <Text style={styles.text}>Discount: ${invoice.discount || 0}</Text>
      <Text style={styles.text}>Status: ${invoice.status || 'N/A'}</Text>
      {invoice.description && <Text style={styles.text}>Description: {invoice.description}</Text>}
      {invoice.notes && <Text style={styles.text}>Notes: {invoice.notes}</Text>}
    </Page>
  </Document>
);