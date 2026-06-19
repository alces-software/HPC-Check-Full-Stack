// app/components/ClusterInstructionsPDF.jsx

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

import { marked } from "marked";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    backgroundColor: "#0f172a",
    color: "#ffffff",
    fontSize: 11,
    fontFamily: "Helvetica",
  },

  header: {
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },

  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 11,
    color: "#cbd5e1",
    marginBottom: 4,
  },

  statusRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },

  pill: {
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "#14532d",
    color: "#bbf7d0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    fontSize: 10,
  },

  stepCard: {
    borderWidth: 1,
    borderColor: "#334155",
    backgroundColor: "#1e293b",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },

  stepHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },

  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    flex: 1,
  },

  expectedTime: {
    fontSize: 9,
    color: "#93c5fd",
    borderWidth: 1,
    borderColor: "#1d4ed8",
    backgroundColor: "#1e3a8a",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },

  description: {
    color: "#cbd5e1",
    lineHeight: 1.5,
    marginBottom: 12,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 8,
  },

  methodItem: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
  },

  methodNumber: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#1d4ed8",
    color: "#bfdbfe",
    textAlign: "center",
    fontSize: 9,
    paddingTop: 4,
  },

  methodContent: {
    flex: 1,
    color: "#cbd5e1",
    lineHeight: 1.5,
    fontSize: 10,
  },

  outcomeGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  goodBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#22c55e",
    backgroundColor: "#14532d",
    borderRadius: 8,
    padding: 10,
  },

  badBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ef4444",
    backgroundColor: "#450a0a",
    borderRadius: 8,
    padding: 10,
  },

  goodLabel: {
    color: "#bbf7d0",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },

  badLabel: {
    color: "#fecaca",
    fontSize: 9,
    fontWeight: "bold",
    marginBottom: 4,
  },

  outcomeText: {
    color: "#cbd5e1",
    fontSize: 10,
    lineHeight: 1.4,
  },

  footer: {
    position: "absolute",
    bottom: 18,
    left: 36,
    right: 36,
    fontSize: 9,
    color: "#64748b",
    textAlign: "center",
  },

  markdownParagraph: {
    color: "#cbd5e1",
    lineHeight: 1.5,
    fontSize: 10,
    marginBottom: 6,
  },

  markdownBold: {
    fontWeight: "bold",
    color: "#ffffff",
  },

  markdownCode: {
    fontFamily: "Courier",
    backgroundColor: "#020617",
    color: "#e2e8f0",
    padding: 8,
    borderRadius: 4,

    fontSize: 10,
    marginLeft: 30,
    marginTop: 8,
    marginBottom: 10,


    lineHeight: 1.5,

  },

  markdownListItem: {
    color: "#cbd5e1",
    lineHeight: 1.5,
    fontSize: 10,
    marginBottom: 4,
  },
});


function MarkdownText({ children }) {
  const tokens = marked.lexer(children || "");

  return (
    <View>
      {tokens.map((token, index) => {
        if (token.type === "paragraph") {
          return (
            <Text key={index} style={styles.markdownParagraph}>
              {token.text}
            </Text>
          );
        }

        if (token.type === "heading") {
          return (
            <Text key={index} style={styles.sectionLabel}>
              {token.text}
            </Text>
          );
        }

        if (token.type === "code") {
          return (
            <Text key={index} style={styles.markdownCode}>
              {`\n${token.text}\n`}
            </Text>
          );
        }

        if (token.type === "list") {
          return (
            <View key={index}>
              {token.items.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.markdownListItem}>
                  • {item.text}
                </Text>
              ))}
            </View>
          );
        }

        if (token.type === "space") {
          return null;
        }

        return (
          <Text key={index} style={styles.markdownParagraph}>
            {token.raw}
          </Text>
        );
      })}
    </View>
  );
}


export default function ClusterInstructionsPDF({
  cluster,
  clusterId,
  steps,
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={styles.title}>
            {cluster.name} Instructions
          </Text>

          <Text style={styles.subtitle}>
            Cluster ID: {clusterId}
          </Text>

          <Text style={styles.subtitle}>
            Daily cluster checks and methods
          </Text>

        </View>

        {steps.length === 0 && (
          <Text style={styles.description}>
            No instructions available.
          </Text>
        )}

        {steps.map((step, index) => (
          <View key={step.id} style={styles.stepCard} wrap={false}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepTitle}>
                {index + 1}. {step.title}
              </Text>

              {step.expectedTime && (
                <Text style={styles.expectedTime}>
                  {step.expectedTime}
                </Text>
              )}
            </View>

            <Text style={styles.description}>
              {step.description}
            </Text>

            <Text style={styles.sectionLabel}>
              Methods
            </Text>

            {(step.methods || []).length === 0 ? (
              <Text style={styles.description}>
                No methods available.
              </Text>
            ) : (
              (step.methods || []).map((method, methodIndex) => (
                <View key={method.id} style={styles.methodItem}>
                  <Text style={styles.methodNumber}>
                    {methodIndex + 1}
                  </Text>

                  <Text style={styles.methodContent}>
                    <MarkdownText>{method.content}</MarkdownText>
                  </Text>
                </View>
              ))
            )}

            {(step.good || step.bad) && (
              <View style={styles.outcomeGrid}>
                {step.good && (
                  <View style={styles.goodBox}>
                    <Text style={styles.goodLabel}>
                      GOOD
                    </Text>

                    <Text style={styles.outcomeText}>
                      {step.good}
                    </Text>
                  </View>
                )}

                {step.bad && (
                  <View style={styles.badBox}>
                    <Text style={styles.badLabel}>
                      BAD
                    </Text>

                    <Text style={styles.outcomeText}>
                      {step.bad}
                    </Text>
                  </View>
                )}
              </View>
            )}
          </View>
        ))}

        <Text style={styles.footer}>
          Generated from cluster settings
        </Text>
      </Page>
    </Document>
  );
}