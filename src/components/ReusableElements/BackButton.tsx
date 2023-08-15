import { useRouter } from 'next/router'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowLeftLong } from '@fortawesome/free-solid-svg-icons'

const BackButton = () => {
  const router = useRouter()

  const handleClick = () => {
    router.back()
  }

  return (
    <button onClick={handleClick}>
      <FontAwesomeIcon className="h-8 w-8 max-w-[24px] max-h-[24px] rounded-3xl
        px-2 py-1 absolute top-4 left-4 hover:bg-slate-900 hover:text-white
        transform transition-all duration-300 hover:scale-125" 
        icon={faArrowLeftLong} />
    </button>
  )
}

export default BackButton
