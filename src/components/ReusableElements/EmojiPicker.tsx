import dynamic from "next/dynamic";
const Picker = dynamic(() => import("emoji-picker-react"), { ssr: false });
import type {
  Theme,
  EmojiStyle,
} from "emoji-picker-react/dist/types/exposedTypes";
import useOutsideClick from "../customHooks/outsideClick";
import {  useRef  } from "react";

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

  useOutsideClick(ref, () => {
    if (showEmojis) {
      setShowEmojis(false);
    }
  });

  return (
    <div
      ref={ref}
      className={`absolute right-0 top-4 z-10 ${
        showEmojis ? "animate-fadeIn opacity-100" : "animate-fadeOut opacity-0"
      } ${!showEmojis ? "hidden" : ""}`}
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
