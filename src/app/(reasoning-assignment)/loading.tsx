import { AnimatedSpinner } from "@/components/icons";

 export default async function Loading({}) {
  
  return (
    <div className="h-[calc(100vh-96px)] flex items-center justify-center bg-blur">
      <AnimatedSpinner className="m-auto h-12 w-12 stroke-muted-foreground" />
    </div>
  );
};