import { useEffect, RefObject, useCallback } from 'react';

/**
 * A custom hook that automatically scrolls an element to the bottom
 * when dependencies change (like new messages or selected friend)
 * 
 * @param ref - React ref object pointing to the container to scroll
 * @param dependencies - Array of dependencies that trigger scrolling when changed
 * @param behavior - ScrollBehavior, either 'auto' (instant) or 'smooth' (animated)
 */
const useScrollToBottom = (
  ref: RefObject<HTMLElement>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies: any[] = [],
  behavior: ScrollBehavior = 'smooth'
): () => void => {
  const scrollToBottom = useCallback(() => {
    if (ref.current) {
      ref.current.scrollTo({
        top: ref.current.scrollHeight,
        behavior
      });
    }
  }, [ref, behavior]);

  useEffect(() => {
    scrollToBottom();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, scrollToBottom]);

  return scrollToBottom;
};

export default useScrollToBottom;