import { Button } from "@/components/ui/button";
import { GoogleIcon } from "./icons";

interface GoogleSignInProps {
  text: string;
}

export const GoogleSignIn: React.FC<GoogleSignInProps> = ({ text }: GoogleSignInProps) => {
  return (
    <>
      <Button variant="outline" className="w-full">
        <GoogleIcon className="mr-2" />
        {text}
      </Button>
    </>
  )
}