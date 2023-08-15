import { useRouter } from 'next/router'

export function FormkitArrowleft() {
  return (
    <svg
      className="absolute left-4 top-4 h-8 w-8 transform rounded-3xl transition-all duration-300 
      hover:scale-125 hover:bg-slate-900 hover:text-white"
      width="1.78em"
      height="1em"
      viewBox="0 0 16 9"
      xmlns="http://www.w3.org/2000/svg"
      fill="#FFFFFF"
    >
      <path
        fill="#FFFFFF"
        d="M12.5 5h-9c-.28 0-.5-.22-.5-.5s.22-.5.5-.5h9c.28 0 .5.22.5.5s-.22.5-.5.5Z"
      ></path>
      <path
        fill="#FFFFFF"
        d="M6 8.5a.47.47 0 0 1-.35-.15l-3.5-3.5c-.2-.2-.2-.51 0-.71L5.65.65c.2-.2.51-.2.71 0c.2.2.2.51 0 .71L3.21 4.51l3.15 3.15c.2.2.2.51 0 .71c-.1.1-.23.15-.35.15Z"
      ></path>
    </svg>
  );
}

const BackButton = () => {
  const router = useRouter()

  const handleClick = () => {
    router.back()
  }

  return (
    <button onClick={handleClick}>
      <FormkitArrowleft />
    </button>
  )
}

export default BackButton
