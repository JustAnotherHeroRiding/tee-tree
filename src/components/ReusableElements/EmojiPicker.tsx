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
  animateFadeEnd: boolean;
  setAnimateFadeEnd: React.Dispatch<React.SetStateAction<boolean>>;
}

const EmojiSelector: React.FC<EmojiSelectorProps> = ({
    input,
    setInput,
    textLength,
    setTextLength,
    showEmojis,
    setShowEmojis,
    animateFadeEnd,
    setAnimateFadeEnd
  }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [firstRender, setFirstRender] = useState(true);
  
    useOutsideClick(ref, () => {
      if (showEmojis) {
        setAnimateFadeEnd(true);
        setTimeout(() => {
        setShowEmojis(false);
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
          !animateFadeEnd ? "opacity-100 block" : !showEmojis ? "opacity-0 hidden" : "opacity-0"
        }`}
      >
        <Picker
          theme={"dark" as Theme}
          emojiStyle={"native" as EmojiStyle}
          autoFocusSearch={false}
          lazyLoadEmojis={true}
          onEmojiClick={(emoji) => {
            setInput(input + emoji.emoji);
            setTextLength(textLength + emoji.emoji.length);
          }}
        />
      </div>
    );
  };
  

export default EmojiSelector;
