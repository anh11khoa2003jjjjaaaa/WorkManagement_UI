import React from 'react';
import { pdf, Document, Page, Text, Image, View, StyleSheet } from '@react-pdf/renderer';

// Định nghĩa styles cho PDF
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: 'Helvetica',
  },
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 12,
    marginBottom: 5,
  },
  image: {
    width: '100%',
    height: 200,
    objectFit: 'contain',
    marginBottom: 10,
    border: '1px solid #ddd',
    borderRadius: 4,
  },
});

// PDFDocument Component
const PDFDocument = ({ projectTask, images }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.section}>
        <Text style={styles.heading}>{projectTask.name}</Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Mô tả:</Text> {projectTask.description}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Thuộc dự án:</Text> {projectTask.project?.name || 'Chưa rõ'}
        </Text>
        <Text style={styles.text}>
          <Text style={{ fontWeight: 'bold' }}>Trạng thái:</Text> {projectTask.status?.description || 'Chưa rõ'}
        </Text>
      </View>
      <View>
        {images.map((image, index) => (
          <Image key={index} src={image.fullPath} style={styles.image} />
        ))}
      </View>
    </Page>
  </Document>
);

export { PDFDocument };
