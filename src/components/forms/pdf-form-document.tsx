import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register a font that supports Devanagari (Hindi)
Font.register({
  family: "NotoSans",
  fonts: [
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans/files/noto-sans-latin-400-normal.woff",
      fontWeight: 400,
    },
    {
      src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans/files/noto-sans-latin-700-normal.woff",
      fontWeight: 700,
    },
  ],
});

Font.register({
  family: "NotoSansDevanagari",
  src: "https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-devanagari/files/noto-sans-devanagari-latin-400-normal.woff",
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "NotoSans",
  },
  header: {
    marginBottom: 15,
    borderBottom: "2px solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 11,
    color: "#444",
    marginBottom: 2,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  infoLabel: {
    fontWeight: 700,
    width: 120,
  },
  infoValue: {
    flex: 1,
  },
  table: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#000",
  },
  tableHeaderRow: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#000",
    minHeight: 24,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    minHeight: 30,
  },
  cellNo: {
    width: 30,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
  },
  cellLabel: {
    width: 180,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  cellUnit: {
    width: 50,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
  },
  cellRange: {
    width: 70,
    padding: 4,
    borderRightWidth: 1,
    borderColor: "#ccc",
    textAlign: "center",
    fontSize: 8,
  },
  cellValue: {
    flex: 1,
    padding: 4,
    minHeight: 30,
  },
  labelEn: {
    fontSize: 10,
    fontWeight: 700,
  },
  labelHi: {
    fontSize: 8,
    color: "#666",
    fontFamily: "NotoSansDevanagari",
  },
  qcSection: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
  },
  qcTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
  },
  signatureRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 20,
  },
  signatureBox: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingTop: 30,
    textAlign: "center",
    fontSize: 9,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 30,
    right: 30,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#999",
  },
});

interface FieldSnapshot {
  fieldId: string;
  name: string;
  labelEn: string;
  labelHi: string;
  fieldType: string;
  unit: string | null;
  minValue: number | null;
  maxValue: number | null;
  required: boolean;
}

interface StageSnapshot {
  stageId: string;
  name: string;
  order: number;
  isQcGate: boolean;
  fields: FieldSnapshot[];
}

interface PdfFormProps {
  batchCode: string;
  productName: string;
  flavourName: string;
  date: string;
  stage: StageSnapshot;
}

export function PdfFormDocument({
  batchCode,
  productName,
  flavourName,
  date,
  stage,
}: PdfFormProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>DOKi QC Form</Text>
          <Text style={styles.subtitle}>
            Stage {stage.order}: {stage.name}
            {stage.isQcGate ? " [QC GATE]" : ""}
          </Text>
          <View style={{ marginTop: 8 }}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batch ID:</Text>
              <Text style={styles.infoValue}>{batchCode}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Product:</Text>
              <Text style={styles.infoValue}>{productName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Flavour:</Text>
              <Text style={styles.infoValue}>{flavourName}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{date}</Text>
            </View>
          </View>
        </View>

        {/* Field Table */}
        <View style={styles.table}>
          {/* Header row */}
          <View style={styles.tableHeaderRow}>
            <Text style={[styles.cellNo, { fontWeight: 700 }]}>#</Text>
            <Text style={[styles.cellLabel, { fontWeight: 700 }]}>
              Field / Measurement
            </Text>
            <Text style={[styles.cellUnit, { fontWeight: 700 }]}>Unit</Text>
            <Text style={[styles.cellRange, { fontWeight: 700 }]}>Range</Text>
            <Text style={[styles.cellValue, { fontWeight: 700 }]}>
              Value (fill in)
            </Text>
          </View>

          {/* Data rows */}
          {stage.fields.map((field, idx) => (
            <View key={field.fieldId} style={styles.tableRow}>
              <Text style={styles.cellNo}>{idx + 1}</Text>
              <View style={styles.cellLabel}>
                <Text style={styles.labelEn}>{field.labelEn}</Text>
                <Text style={styles.labelHi}>{field.labelHi}</Text>
              </View>
              <Text style={styles.cellUnit}>{field.unit ?? "—"}</Text>
              <Text style={styles.cellRange}>
                {field.minValue != null && field.maxValue != null
                  ? `${field.minValue}–${field.maxValue}`
                  : field.fieldType === "BOOLEAN"
                    ? "Y / N"
                    : "—"}
              </Text>
              <View style={styles.cellValue}>
                {/* Empty box for handwriting */}
              </View>
            </View>
          ))}
        </View>

        {/* QC Section for gate stages */}
        {stage.isQcGate && (
          <View style={styles.qcSection}>
            <Text style={styles.qcTitle}>QC Approval</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Result:</Text>
              <Text style={styles.infoValue}>
                PASS / FAIL (circle one)
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Notes:</Text>
              <Text style={styles.infoValue}>
                _____________________________________________
              </Text>
            </View>
            <View style={styles.signatureRow}>
              <View style={styles.signatureBox}>
                <Text>Inspector Name &amp; Signature</Text>
              </View>
              <View style={styles.signatureBox}>
                <Text>Date &amp; Time</Text>
              </View>
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text>DOKi QC Tool — {batchCode}</Text>
          <Text>
            Stage {stage.order}: {stage.name}
          </Text>
        </View>
      </Page>
    </Document>
  );
}
