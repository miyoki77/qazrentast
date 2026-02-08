const STORAGE_KEY = "qazrentast_bookings_v4";

function formatDateTimeLocal(v){
  if(!v) return "";
  const [d,t] = v.split("T");
  return `${d} ${t}`;
}
function loadBookings(){
  try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }
  catch(e){ return []; }
}
function saveBookings(list){ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
function uid(){ return Math.random().toString(16).slice(2) + Date.now().toString(16); }

function tr(key, fallback){
  try{
    const lang = localStorage.getItem("qazrentast_lang") || "ru";
    return (window.dict && window.dict[lang] && window.dict[lang][key]) || fallback;
  }catch(e){ return fallback; }
}

function statusLabel(st){
  if(st === "cancelled") return tr("status_cancelled", "Отменена");
  if(st === "completed") return tr("status_completed", "Завершена");
  return tr("status_active", "Активна");
}

function render(){
  const tbody = document.querySelector("#bookingsBody");
  const empty = document.querySelector("#emptyState");
  const bookings = loadBookings();
  tbody.innerHTML = "";

  if(bookings.length === 0){ empty.style.display="block"; return; }
  empty.style.display="none";

  const cancelLabel = tr("cancel","Отменить");
  const completeLabel = tr("complete","Завершить");
  const confirmCancel = tr("cancel_confirm","Точно отменить бронь?");
  const confirmComplete = tr("complete_confirm","Завершить аренду и вернуть авто в парк?");

  for(const b of bookings){
    const trEl = document.createElement("tr");
    const actions = (b.status === "active")
      ? `<button class="btn" data-complete="${b.id}">${completeLabel}</button>
         <button class="btn" data-cancel="${b.id}" style="margin-left:8px">${cancelLabel}</button>`
      : `<span class="small">${statusLabel(b.status)}</span>`;

    trEl.innerHTML = `
      <td>${b.car}</td>
      <td>${formatDateTimeLocal(b.start)}</td>
      <td>${formatDateTimeLocal(b.end)}</td>
      <td>${b.name}</td>
      <td>${b.phone}</td>
      <td>${actions}</td>
    `;
    tbody.appendChild(trEl);
  }

  document.querySelectorAll("[data-cancel]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(!confirm(confirmCancel)) return;
      const id = btn.getAttribute("data-cancel");
      const list = loadBookings();
      const b = list.find(x=>x.id===id);
      if(!b || b.status !== "active") return;
      b.status = "cancelled";
      saveBookings(list);
      window.QRA_Inv?.invInc(b.car);
      render();
      window.dispatchEvent(new Event("qra_inventory_changed"));
    });
  });

  document.querySelectorAll("[data-complete]").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if(!confirm(confirmComplete)) return;
      const id = btn.getAttribute("data-complete");
      const list = loadBookings();
      const b = list.find(x=>x.id===id);
      if(!b || b.status !== "active") return;
      b.status = "completed";
      saveBookings(list);
      window.QRA_Inv?.invInc(b.car);
      render();
      window.dispatchEvent(new Event("qra_inventory_changed"));
    });
  });
}

function isKZPhone(v){
  const s = v.replace(/\s+/g,'').trim();
  return /^\+7\d{10}$/.test(s);
}

function validate(form){
  const {car,start,end,name,phone} = form;
  if(!car.value || !start.value || !end.value || !name.value.trim() || !phone.value.trim())
    return tr("fill_all","Заполните все обязательные поля.");
  if(!isKZPhone(phone.value))
    return tr("phone_bad","Введите номер KZ формата: +7XXXXXXXXXX");
  if(new Date(start.value) >= new Date(end.value))
    return tr("end_after","Окончание должно быть позже начала.");
  if(!window.QRA_Inv?.invCanBook(car.value))
    return tr("no_cars","Нет свободных авто этой модели. Выберите другую.");
  return null;
}

function setDefaultEnd(){
  const start = document.querySelector("#start");
  const end = document.querySelector("#end");
  if(!start || !end) return;
  start.addEventListener("change", ()=>{
    if(!start.value) return;
    const dt = new Date(start.value);
    dt.setHours(dt.getHours() + 2);
    const pad = (n)=> String(n).padStart(2,"0");
    end.value = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  });
}

function preselectCarFromUrl(){
  const params = new URLSearchParams(location.search);
  const car = params.get("car");
  if(!car) return;
  const sel = document.querySelector("#car");
  if(!sel) return;
  for(const opt of sel.options){
    if(opt.value === car || opt.textContent === car){
      sel.value = opt.value || opt.textContent;
      break;
    }
  }
}

document.addEventListener("DOMContentLoaded", ()=>{
  const form = document.querySelector("#bookingForm");
  const msg = document.querySelector("#formMsg");

  preselectCarFromUrl();
  setDefaultEnd();

  form.addEventListener("submit",(e)=>{
    e.preventDefault();
    msg.textContent="";
    const err = validate(form);
    if(err){ msg.textContent=err; return; }

    const b = {
      id: uid(),
      status: "active",
      car: form.car.value,
      start: form.start.value,
      end: form.end.value,
      name: form.name.value.trim(),
      phone: form.phone.value.replace(/\s+/g,'').trim(),
      note: form.note.value.trim()
    };

    window.QRA_Inv?.invDec(b.car);
    window.dispatchEvent(new Event("qra_inventory_changed"));

    const list = loadBookings(); list.unshift(b); saveBookings(list);
    form.reset();
    msg.textContent = tr("created","Бронь создана ✅");
    render();
  });

  render();
});
