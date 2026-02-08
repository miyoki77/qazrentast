function getCardName(card){
  return card.getAttribute("data-display-name")
      || card.dataset.displayName
      || (card.querySelector(".car-name")?.textContent || "").trim();
}

function updateBadges(){
  const inv = window.QRA_Inv?.loadInventory?.() || {};
  document.querySelectorAll(".car-card").forEach(card=>{
    const car = getCardName(card);
    const n = inv[car] ?? 0;
    const badge = card.querySelector("[data-qty]");
    if(badge){
      badge.textContent = String(n);
      badge.classList.toggle("zero", n<=0);
      badge.title = `Available: ${n}`;
    }
    // optionally dim card when none
    card.classList.toggle("soldout", n<=0);
  });
}

function setupFleetFilters(){
  const search = document.querySelector("#fleetSearch");
  const typeSel = document.querySelector("#fleetType");
  const sortSel = document.querySelector("#fleetSort");
  const cards = Array.from(document.querySelectorAll(".car-card"));

  if(!search || !typeSel || !sortSel || cards.length===0) return;

  function apply(){
    const q = (search.value || "").toLowerCase().trim();
    const type = typeSel.value;
    const sort = sortSel.value;

    let visible = cards.filter(c=>{
      const name = (getCardName(c) || "").toLowerCase();
      const cardType = c.dataset.type || "all";
      const okName = !q || name.includes(q);
      const okType = (type === "all") || (cardType === type);
      return okName && okType;
    });

    const price = (c)=> parseInt(c.dataset.price||"0",10)||0;
    if(sort === "price_asc") visible.sort((a,b)=>price(a)-price(b));
    else if(sort === "price_desc") visible.sort((a,b)=>price(b)-price(a));
    else if(sort === "name") visible.sort((a,b)=>getCardName(a).localeCompare(getCardName(b)));

    const grid = document.querySelector("#fleetGrid") || cards[0].parentElement;
    cards.forEach(c=> c.style.display="none");
    visible.forEach(c=>{ c.style.display=""; grid.appendChild(c); });

    updateBadges();
  }

  [search,typeSel,sortSel].forEach(el=> el.addEventListener("input", apply));
  [typeSel,sortSel].forEach(el=> el.addEventListener("change", apply));

  window.addEventListener("qra_inventory_changed", updateBadges);
  apply();
}

document.addEventListener("DOMContentLoaded", ()=>{
  setupFleetFilters();
  updateBadges();
});
