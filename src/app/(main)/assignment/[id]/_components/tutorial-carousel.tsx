import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"

const TUTORIAL_STEPS = [
  {
    description: "Enter your explanation in the box below. Remember the same explanation applies to all questions so try to explain concepts rather than giving answers.",
    imageUrl: '/images/Tutorial Step 1.png'
  },
  {
    description: "Questions appear to the right. Once you submit an explanation the AI will attempt these questions. The question status will change and you will also see the AI’s answer. In addition you can click the down arrow to see how the AI arrived at the answer.",
    imageUrl: '/images/Tutorial Step 2.png'
  },
  {
    description: "Remember there are no penalties for wrong answers. You can try as many as explanations as you need. Once you’re satisfied submit the test using the button on the bottom right. All the best!",
    imageUrl: '/images/Tutorial Step 4.png'
  },
]


export function TutorialCarousel() {
  return (
    <Carousel>
      <CarouselContent>
        {
          TUTORIAL_STEPS.map((item, index) => (
            <CarouselItem key={index}>
              <div className="flex flex-col gap-4">
                <p className="text-muted-foreground text-sm text-center">
                  {item.description}
                </p>
                <Image 
                  height={491}
                  width={756}
                  src={item.imageUrl} 
                  alt={`Tutorial Step ${index + 1}`} />
              </div>
            </CarouselItem>
          ))
        }
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
