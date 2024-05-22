import { AnimatedSpinner } from "@/components/icons";

 export default async function Loading({}) {
  
  return (
    <div className="h-full flex items-center justify-center bg-blur">
      <AnimatedSpinner className="mx-auto mt-8 h-12 w-12 stroke-muted-foreground" />
    </div>
  );
};