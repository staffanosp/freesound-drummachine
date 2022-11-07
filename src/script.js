"use strict";

const slotsContainerEl = document.querySelector("#slots_container");
const audiosContainerEl = document.querySelector("#audios_container");
const newSamplesBtnEl = document.querySelector("#newSamplesBtn");

const slots = {};
const addSlot = (id, label, tags, src, key) =>
  (slots[id] = {
    label,
    tags,
    src,
    key,
    locked: false,
    loading: false,
  });

addSlot("slot01", "kick", ["kick"], "", "A");
addSlot("slot02", "snare", ["snare"], "", "S");
addSlot("slot03", "closed hh", ["closed", "hihat"], "", "D");
addSlot("slot04", "open hh", ["open", "hihat"], "", "F");

const keyToSlot = {};

for (let [slot, props] of Object.entries(slots)) {
  keyToSlot["Key" + props.key] = slot;

  //add elements to the DOM
  //UI:
  slotsContainerEl.innerHTML += `
  <div data-slot="${slot}" class="slot-container">
  <div class="slot__loading">
    <span class="load-spinner"></span>
  </div> 
    <div class="slot__slot">
        <div class="slot__slot__key">${props.key}
        </div>${props.label}
    </div>
  </div>
  `;

  //Audio:
  audiosContainerEl.innerHTML += `<audio data-slot="${slot}" src="${props.src}"></audio>`;
}

const isAnySlotLoading = () => {
  for (let [_, props] of Object.entries(slots)) {
    if (props.loading) return true;
  }
  return false;
};

async function getRandomSampleUrl(tags) {
  const tagsQuery = tags.map((tag) => "tag:" + tag).join("%20");

  const res = await fetch(
    `https://freesound.org/apiv2/search/text/?token=E1OojwrkSjrxZYsv1rdfzFh8Iqn8Pt50gBsSITJD&page_size=50&filter=${tagsQuery}%20ac_single_event:true%20ac_loop:false%20avg_rating:%5B3%20TO%20%2A%5D&fields=id,name,previews`
  );

  const data = await res.json();
  const urls = data.results;
  const url =
    urls[Math.floor(Math.random() * urls.length)].previews["preview-hq-mp3"];

  return url;
}

async function newSampleInSlot(slot) {
  slots[slot].loading = true;
  newSamplesBtnEl.disabled = isAnySlotLoading();

  const slotEl = document.querySelector(`div[data-slot="${slot}"] .slot__slot`);
  const slotLoadingEl = document.querySelector(
    `div[data-slot="${slot}"] .slot__loading`
  );
  const audioEl = document.querySelector(`audio[data-slot="${slot}"]`);

  slotEl.classList.add("slot__slot--loading");
  slotLoadingEl.classList.add("--visible");

  const src = await getRandomSampleUrl(slots[slot].tags);
  slots[slot].src = src;
  audioEl.src = slots[slot].src;

  slotEl.classList.remove("slot__slot--loading");
  slotLoadingEl.classList.remove("--visible");
  slots[slot].loading = false;

  newSamplesBtnEl.disabled = isAnySlotLoading();
}

function newSamplesInAllSlots() {
  for (let [slot, props] of Object.entries(slots)) {
    if (props.locked) continue;
    newSampleInSlot(slot);
  }
}

newSamplesInAllSlots();

function playSound(slot) {
  if (slots[slot].loading) return;

  const slotEl = document.querySelector(
    `div[data-slot="${slot}"]  .slot__slot`
  );
  const audioEl = document.querySelector(`audio[data-slot="${slot}"]`);

  slotEl.classList.add("slot__slot--playing");

  setTimeout(() => slotEl.classList.remove("slot__slot--playing"), 0);

  audioEl.currentTime = 0;
  audioEl.play();
}

const slotsEls = document.querySelectorAll("div[data-slot]");
slotsEls.forEach((slotEl) => {
  slotEl.addEventListener("click", () =>
    playSound(slotEl.getAttribute("data-slot"))
  );
});

newSamplesBtnEl.addEventListener("click", () => {
  newSamplesInAllSlots();
});

window.addEventListener("keydown", (e) => {
  const slot = keyToSlot[e.code];
  if (!slot) return;
  playSound(keyToSlot[e.code]);
});
