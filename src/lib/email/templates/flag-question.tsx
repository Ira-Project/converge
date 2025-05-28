import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";

export interface FlagQuestionTemplateProps {
  studentName: string;
  questionText: string;
  report?: string;
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  border: "1px solid #f0f0f0",
  padding: "45px",
};

const text = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
};

const title = {
  ...text,
  fontSize: "22px",
  fontWeight: "700",
  lineHeight: "32px",
};

const heading = {
  ...text,
  fontSize: "18px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "20px",
};

const sectionTitle = {
  ...text,
  fontSize: "14px",
  fontWeight: "600",
  color: "#333",
  marginBottom: "8px",
};

const questionBox = {
  backgroundColor: "#f5f5f5",
  padding: "15px",
  margin: "20px 0",
  borderRadius: "5px",
};

const questionTextStyle = {
  fontSize: "16px",
  fontFamily:
    "'Open Sans', 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif",
  fontWeight: "300",
  color: "#404040",
  lineHeight: "26px",
  margin: "0",
};

const reportBox = {
  backgroundColor: "#fff3cd",
  padding: "15px",
  margin: "20px 0",
  borderRadius: "5px",
  borderLeft: "4px solid #ffc107",
};

const footerText = {
  ...text,
  marginTop: "30px",
  color: "#666",
};

export const FlagKnowledgeZapQuestionTemplate = ({ studentName, questionText, report }: FlagQuestionTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Knowledge Zap Question Flagged as Incorrect</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Text style={heading}>Knowledge Zap Question Flagged</Text>
            <Text style={text}>
              <strong>{studentName}</strong> has flagged a Knowledge Zap question as incorrect.
            </Text>
            
            <Section style={questionBox}>
              <Text style={sectionTitle}>Question:</Text>
              <Text style={questionTextStyle}>{questionText}</Text>
            </Section>
            
            {report && (
              <Section style={reportBox}>
                <Text style={sectionTitle}>Student's Comment:</Text>
                <Text style={text}>{report}</Text>
              </Section>
            )}
            
            <Text style={footerText}>
              Please review this question and take appropriate action if necessary.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Keep the old name for backward compatibility
export const FlagQuestionTemplate = FlagKnowledgeZapQuestionTemplate; 