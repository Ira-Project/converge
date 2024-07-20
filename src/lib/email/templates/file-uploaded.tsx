import { Body, Container, Head, Html, Preview, Section, Text } from "@react-email/components";
import { APP_TITLE } from "@/lib/constants";

export enum FileUploadType {
  ASSIGNMENT_DATA_IMPORT = 'Data Import',
  LESSON_PLAN = 'Lesson Plan',
}

export interface FileUploadedEmailTemplateProps {
  fileName: string
  type: FileUploadType
  userEmail: string
}

export const FileUploadedTemplate = ({ fileName, type, userEmail }: FileUploadedEmailTemplateProps) => {
  return (
    <Html>
      <Head />
      <Preview>New File Uploaded {APP_TITLE}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Text style={title}>{APP_TITLE}</Text>
            <Text style={text}>Hi,</Text>
            <Text style={text}>
              A new file has been uploaded on Ira Project by {userEmail}. The file is of type {type} and the name of the file is: {fileName}. 
            </Text>
            <Text style={text}>Better process it as soon as possible!</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: "#f6f9fc",
  padding: "10px 0",
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
