import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

export const MessageSearch = (props: {searchPosition: string}) => {
  const [input, setInput] = useState("");

  return (
    <div className="relative px-4">
      <input
        type="text"
        placeholder="Search Direct Messages"
        className="h-10 w-full rounded-full border-2 border-Intone-300 bg-transparent py-2 pl-8 pr-4 outline-none"
        name="q" // query parameter
        value={input}
        onChange={(e) => setInput(e.target.value)}
        autoComplete="off"
      />
      <FontAwesomeIcon
        icon={faSearch}
        className={`absolute ${props.searchPosition} top-[38%] h-3 w-3 text-Intone-300`}
      />
    </div>
  );
};
