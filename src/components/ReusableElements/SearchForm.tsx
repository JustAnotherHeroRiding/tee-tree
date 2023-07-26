import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

export const SearchInput = (props: {
    location: string;
  }) => {

  return (
    <form action="/i/search" method="get" className={`${props.location === 'main' ? 'w-1/2 hidden trendsbreakpoint:block' : 'w-full trendsbreakpoint:hidden'} mx-auto relative mt-2 `}>
              <input
                type="text"
                placeholder="Search"
                className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
                name="q" // query parameter
              />
              <input type="hidden" name="src" value="typed_query" />
              <input type="hidden" name="selector" value="top" />
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-[4%] top-[38%] h-3 w-3 text-Intone-300"
              />
            </form>
  )
}