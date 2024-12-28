import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image"
import { useEffect, useState } from "react";

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

  const [api, setApi] = useState<CarouselApi>()

  const [current, setCurrent] = useState(0)
  const [, setCount] = useState(0)

  useEffect(() => {
    if (!api) {
      return
    }
 
    setCount(api.scrollSnapList().length)
    setCurrent(api.selectedScrollSnap() + 1)
 
    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1)
    })
  }, [api])



  return (
    <Carousel setApi={setApi}>
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
      <div className="flex justify-center gap-2 flex-row mt-4">
          {
            TUTORIAL_STEPS.map((_, index) => (
              <button 
                onClick={() => api?.scrollTo(index)}
                key={index}
                className={`w-2 h-2 rounded-full ${current === index + 1 ? 'bg-primary' : 'bg-muted-foreground'}`}>
              </button>
            ))
          }
      </div>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  )
}
