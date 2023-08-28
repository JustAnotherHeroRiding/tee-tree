import { useRouter } from 'next/router'
import Link from 'next/link';


const MessagesLink = () => {
  const router = useRouter()
  const isSelected = router.pathname.startsWith('/messages');



  return (
    <Link
    className=" flex flex-row items-center justify-center rounded-xl hover:bg-Intone-100 hover:text-Intone-300"
    href={"/messages"}
  >
    <svg
        className={`h-10 w-10 rounded-2xl p-1 ${isSelected ? 'text-Intone-300 bg-Intone-100' : 'group-hover:text-Intone-300'}`}
        xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"

    >
      <path
         fill={isSelected ? "currentColor" : "none"}
         stroke={isSelected ? "none" : "currentColor"}
        d="m20.34 9.32l-14-7a3 3 0 0 0-4.08 3.9l2.4 5.37a1.06 1.06 0 0 1 0 .82l-2.4 5.37A3 3 0 0 0 5 22a3.14 3.14 0 0 0 1.35-.32l14-7a3 3 0 0 0 0-5.36Zm-.89 3.57l-14 7a1 1 0 0 1-1.35-1.3l2.39-5.37a2 2 0 0 0 .08-.22h6.89a1 1 0 0 0 0-2H6.57a2 2 0 0 0-.08-.22L4.1 5.41a1 1 0 0 1 1.35-1.3l14 7a1 1 0 0 1 0 1.78Z"
      />
    </svg>
    <h1 className={`logoNameClip:hidden ${isSelected ? 'font-bold' : ""}`}>Messages</h1>
  </Link>
  )
}

export default MessagesLink
