import dynamic from "next/dynamic";
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import type {
  Theme,
  EmojiStyle,
} from "emoji-picker-react/dist/types/exposedTypes";
import useOutsideClick from "../customHooks/outsideClick";
import { useEffect, useRef, useState } from "react";

interface EmojiSelectorProps {
  input: string;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  textLength: number;
  setTextLength: React.Dispatch<React.SetStateAction<number>>;
  showEmojis: boolean;
  setShowEmojis: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmojiSelector: React.FC<EmojiSelectorProps> = ({
    input,
    setInput,
    textLength,
    setTextLength,
    showEmojis,
    setShowEmojis,
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [firstRender, setFirstRender] = useState(true);
    const [animateFadeEnd, setAnimateFadeEnd] = useState(false);
  
    useOutsideClick(ref, () => {
      if (showEmojis) {
        setShowEmojis(false);
        setTimeout(() => {
          setAnimateFadeEnd(true);
          setTimeout(() => {
            setAnimateFadeEnd(false); // Reset animateFadeEnd after fade-out animation is complete
          }, 500);
        }, 500);
      }
    });
  
    useEffect(() => {
      if (firstRender) {
        setFirstRender(false);
      }
    }, [firstRender]);
  
    return (
      <div
        ref={ref}
        className={`absolute right-0 top-4 z-10 transition-all duration-500 ease-in-out ${
          showEmojis ? "opacity-100 block" : animateFadeEnd ? "opacity-0 hidden" : "opacity-0"
        }`}
      >
        <Picker
          theme={"dark" as Theme}
          emojiStyle={"native" as EmojiStyle}
          autoFocusSearch={false}
          lazyLoadEmojis={true}
          onEmojiClick={(emoji) => {
            console.log(emoji);
            setInput(input + emoji.emoji);
            setTextLength(textLength + emoji.emoji.length);
          }}
        />
      </div>
    );
  };
  

export default EmojiSelector;
