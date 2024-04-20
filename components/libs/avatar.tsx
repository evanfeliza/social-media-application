import Image from 'next/image';



const Avatar = ({ email }: { email?: string }) => {

    const handleEmail = ({ email }: { email?: string }) => {
        if (email === undefined) {
            return "unknown"
        } else {
            const seed = email.split('@')[0];
            return seed
        }
    }
    const seed = handleEmail({ email })
    const imageUrl = `https://api.dicebear.com/8.x/initials/svg?seed=${seed}`;

    return <>
        <Image
            src={imageUrl}
            width={100}
            height={100}
            alt={`${seed}`}
            priority
        /></>
}

export default Avatar