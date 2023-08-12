import { useEffect, type RefObject } from 'react';

function useOutsideClick(ref: RefObject<HTMLDivElement>, callback: () => void): void {
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  });
}

export default useOutsideClick;
