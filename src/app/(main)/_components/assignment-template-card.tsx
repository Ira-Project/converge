import {
  Card,
} from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { Paths } from "@/lib/constants";

interface AssignmentTemplateCardProps {
  id: string;
  name: string;
  imageUrl: string;
}

export function AssignmentTemplateCard({ id, name, imageUrl } : AssignmentTemplateCardProps) {

  return (
    <Link href={`${Paths.CreateAssignment}${id}`}>
      <Card className="w-96 relative">
        <Image 
          className="rounded-md w-full h-auto block bg-black bg-opacity-90"
          src={imageUrl} 
          alt={name} 
          width={0}
          height={0}
          sizes="100vw" />
        <p className="absolute bottom-4 left-4 text-white font-bold text-lg"> 
          {name}
        </p>
      </Card>
    </Link>
  );
}


