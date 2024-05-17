import Image from "next/image";

export const Person = async (
  { name, avatar, joinedAt, } : 
  { name: string, avatar: string | null, joinedAt?: Date}
) => {
  
  return (
    <div className="flex flex-row items-center gap-4">
      <Image
        unoptimized={avatar === null}
        src={avatar ?? "https://source.boringavatars.com/marble/60/" + name}
        alt="Avatar"
        className="block h-8 w-8 rounded-full leading-none"
        width={64}
        height={64}
      />
      <p> {name} </p>
      {
        joinedAt && 
        <p className="text-sm text-muted-foreground ml-auto"> 
          Joined at {new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(joinedAt)}
        </p>
      }
    </div>
  );
}