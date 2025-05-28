import { Html, Head, Preview, Body, Container, Text, Section } from '@react-email/components';
import { APP_TITLE } from '@/lib/constants';

interface FlagStepTemplateProps {
  studentName: string;
  stepText: string;
  report?: string;
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const title = {
  fontSize: '32px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const heading = {
  fontSize: '24px',
  lineHeight: '1.3',
  fontWeight: '700',
  color: '#484848',
  margin: '30px 0 15px',
};

const text = {
  margin: '0 0 15px',
  fontSize: '15px',
  lineHeight: '1.4',
  color: '#3c4149',
};

const stepBox = {
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  padding: '20px',
  margin: '20px 0',
  backgroundColor: '#f8f9fa',
};

const reportBox = {
  border: '1px solid #f0f0f0',
  borderRadius: '5px',
  padding: '20px',
  margin: '20px 0',
  backgroundColor: '#fff3cd',
};

const sectionTitle = {
  fontSize: '16px',
  fontWeight: '600',
  color: '#484848',
  margin: '0 0 10px',
};

const stepTextStyle = {
  fontSize: '14px',
  lineHeight: '1.4',
  color: '#3c4149',
  margin: '0',
  fontFamily: 'monospace',
};

const footerText = {
  fontSize: '14px',
  lineHeight: '1.4',
  color: '#666',
  marginTop: '30px',
};

export const FlagStepTemplate = ({ studentName, stepText, report }: FlagStepTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>Step Solve Step Flagged as Incorrect</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Text style={heading}>Step Solve Step Flagged</Text>
            <Text style={text}>
              <strong>{studentName}</strong> has flagged a Step Solve step as incorrect.
            </Text>
            
            <Section style={stepBox}>
              <Text style={sectionTitle}>Step:</Text>
              <Text style={stepTextStyle}>{stepText}</Text>
            </Section>
            
            {report && (
              <Section style={reportBox}>
                <Text style={sectionTitle}>Student's Comment:</Text>
                <Text style={text}>{report}</Text>
              </Section>
            )}
            
            <Text style={footerText}>
              Please review this step and take appropriate action if necessary.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}; 