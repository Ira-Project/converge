import React from 'react';
import { Badge } from '@/components/ui/badge';
import { type ActivityType } from '@/lib/constants';
import { getMetaDataFromActivityType } from '@/lib/utils/activityUtils';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface ActivityWikiCardProps {
  type: ActivityType;
}

export const ActivityWikiCard: React.FC<ActivityWikiCardProps> = ({ type }) => {
  const {
    id,
    iconImage,
    title,
    tutorialUrl,
    tags,
    descriptionLong,
    citations,
    colour,
    isActive,
  } = getMetaDataFromActivityType(type, "");

  return (
    <>
      {isActive && (
        <div>
          <div className="flex flex-col items-start gap-4">
            <div className="flex flex-col gap-4">
              <div className={cn(
                "flex gap-4",
                {
                  "text-amber-700": colour === "amber",
                  "text-rose-700": colour === "rose",
                  "text-lime-700": colour === "lime",
                  "text-teal-700": colour === "teal",
                }
              )}>  
                <Image src={iconImage} alt={title} width={60} height={60} />
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 flex-1">
                  <div className="text-2xl font-semibold">{title}</div>
                  <div className="flex gap-2 flex-wrap">
                    {tags.map((tag) => (
                      <Badge 
                        key={tag}   
                        variant="secondary"
                        className={cn(
                          "h-5 text-white",
                          {
                            "bg-amber-700": colour === "amber",
                            "bg-rose-700": colour === "rose",
                            "bg-lime-700": colour === "lime",
                            "bg-teal-700": colour === "teal",
                          }
                        )}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>  
              <div className="text-sm space-y-4">
                {descriptionLong.split('\n').map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="max-w-2xl">
                <div className="relative pb-[56.18%] h-0 border-0">
                  <iframe 
                    src={tutorialUrl} 
                    className="absolute w-full h-full"
                    allowFullScreen
                  />
                </div>
              </div>
              {citations && (
                <div className="space-y-1">
                  {citations.map((citation, index) => (
                    <div key={index} className="flex gap-2 text-muted-foreground text-xs" id={`${id}-citation-${index + 1}`}>
                      <span>[{index + 1}]</span>
                      <span>{citation}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <hr className="my-8 border-t border-gray-200" />
        </div>
      )}
    </>
  );
};