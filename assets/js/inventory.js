const INV_KEY = "qazrentast_inventory_v1";
const INV_DEFAULT = {
  "Hyundai Sonata": 2,
  "Kia K5": 2,
  "Toyota Camry (XV80)": 2,
  "Mercedes-Benz S-Class (W223)": 1,
  "Lexus LX 700h": 1,
  "BMW 7 Series": 1,
};

function loadInventory(){
  try{
    const raw = localStorage.getItem(INV_KEY);
    if(!raw) return {...INV_DEFAULT};
    const obj = JSON.parse(raw);
    return {...INV_DEFAULT, ...obj};
  }catch(e){
    return {...INV_DEFAULT};
  }
}
function saveInventory(inv){ localStorage.setItem(INV_KEY, JSON.stringify(inv)); }
function invGet(car){ const inv = loadInventory(); return inv[car] ?? 0; }
function invCanBook(car){ return invGet(car) > 0; }
function invDec(car){
  const inv = loadInventory();
  inv[car] = Math.max(0, (inv[car] ?? 0) - 1);
  saveInventory(inv);
}
function invInc(car){
  const inv = loadInventory();
  inv[car] = (inv[car] ?? 0) + 1;
  saveInventory(inv);
}
function invReset(){ saveInventory({...INV_DEFAULT}); }

window.QRA_Inv = { loadInventory, saveInventory, invGet, invCanBook, invDec, invInc, invReset, INV_DEFAULT };
