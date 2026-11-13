export const siteScript = String.raw`
(()=>{
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 if(!reduced&&'IntersectionObserver'in window){document.documentElement.classList.add('reveal-ready');const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target)}},{threshold:.14});document.querySelectorAll('[data-reveal]').forEach(node=>observer.observe(node))}
 document.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{const target=document.querySelector(link.getAttribute('href'));if(target){event.preventDefault();target.scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})}}));
 const language=document.querySelector('#site-language');if(language)language.addEventListener('change',()=>{const url=new URL(location.href);url.searchParams.set('lang',language.value);location.assign(url.href)});
})();
`;
