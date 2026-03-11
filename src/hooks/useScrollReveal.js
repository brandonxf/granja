import { useEffect } from 'react';

export function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );

    const observe = () => {
      const elements = document.querySelectorAll('.reveal:not(.revealed)');
      elements.forEach((el) => observer.observe(el));
    };

    observe();

    // Re-observe on DOM changes (for dynamic content)
    const mutationObserver = new MutationObserver(observe);
    mutationObserver.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
