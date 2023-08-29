import Link from 'next/link';



const LogoHomePageLink = (props: { src: string }) => {


  return (
    <Link
            className={`${props.src === 'index' ? "" : "mt-2"} group flex flex-row 
            items-center justify-center rounded-xl hover:bg-Intone-100 hover:text-Intone-300`}
            href={"/"}
          >
            <svg
              className=" h-10 w-10 rounded-2xl p-1 group-hover:text-Intone-300"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M7 19v-2h10v2h-2c-.5 0-1 .2-1.4.6s-.6.9-.6 1.4v1h-2v-1c0-.5-.2-1-.6-1.4S9.5 19 9 19H7m4-13c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3s-.3-.4-.3-.7m2 2c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3s-.3-.4-.3-.7M9 8c0-.3.1-.5.3-.7s.4-.3.7-.3s.5.1.7.3s.3.4.3.7s-.1.5-.3.7s-.4.3-.7.3s-.5-.1-.7-.3S9 8.3 9 8m7.9-3.9c-1.4-1.4-3-2-4.9-2s-3.6.7-4.9 2S5 7.1 5 9s.7 3.6 2 4.9s3 2 4.9 2s3.6-.7 4.9-2s2-3 2-4.9s-.5-3.6-1.9-4.9m-1.4 8.4c-1 1-2.2 1.5-3.5 1.5s-2.6-.5-3.5-1.5S7 10.4 7 9s.5-2.6 1.5-3.5S10.6 4 12 4s2.6.5 3.5 1.5S17 7.6 17 9s-.5 2.6-1.5 3.5Z"
              ></path>
            </svg>
            <h1 className="logoNameClip:hidden">teeTree</h1>
          </Link>
  )
}

export default LogoHomePageLink
