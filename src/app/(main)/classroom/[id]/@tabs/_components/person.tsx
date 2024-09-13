import Image from "next/image";
import Avatar from 'boring-avatars'

export const Person = async (
  { name, avatar, joinedAt, } : 
  { name?: string, avatar: string | null, joinedAt?: Date}
) => {
  
  return (
    <div className="flex flex-row items-center gap-4">
      {
        avatar ?
        <Image
          unoptimized={avatar === null}
          src={avatar}
          alt="Avatar"
          className="block h-8 w-8 rounded-full leading-none"
          width={64}
          height={64} /> 
        :
        <Avatar name={name} size={32} variant="bauhaus" />
      }
      
      <p> {name ?? "Anonymous"} </p>
      {
        joinedAt && 
        <p className="text-sm text-muted-foreground ml-auto"> 
          Joined at {new Intl.DateTimeFormat('en-US', { dateStyle: 'full' }).format(joinedAt)}
        </p>
      }
    </div>
  );
}