function initSliders(){
  document.querySelectorAll("[data-slider]").forEach(sl=>{
    const mainImg = sl.querySelector("[data-slider-main]");
    const thumbs = Array.from(sl.querySelectorAll("[data-slider-thumb]"));
    if(!mainImg || thumbs.length === 0) return;

    let idx = 0;
    function set(i){
      idx = (i + thumbs.length) % thumbs.length;
      const src = thumbs[idx].getAttribute("data-src");
      mainImg.src = src;
      thumbs.forEach((t,j)=> t.classList.toggle("active", j===idx));
    }
    sl.querySelector("[data-slider-prev]")?.addEventListener("click", ()=> set(idx-1));
    sl.querySelector("[data-slider-next]")?.addEventListener("click", ()=> set(idx+1));
    thumbs.forEach((t,j)=> t.addEventListener("click", ()=> set(j)));
    set(0);
  });
}
document.addEventListener("DOMContentLoaded", initSliders);
