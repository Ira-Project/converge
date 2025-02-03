import Image from 'next/image';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from './ui/dialog';

interface ImageModalProps {
  imageSrc: string;
  label: string;
  alt?: string;
}

export function ImageModal({ imageSrc, label, alt }: ImageModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="text-muted-foreground underline text-xs">{label}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl p-8">
        <DialogTitle className="hidden">{label}</DialogTitle>
        <div className="relative mx-auto my-auto">
          <Image
            src={imageSrc}
            alt={alt ?? label}
            className="max-h-[90vh] max-w-full object-contain"
            height={500}
            width={500}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
