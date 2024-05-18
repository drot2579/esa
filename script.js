console.time("a")
const toggleHidden = (els, act = 0) => {
    for (const el of els) { el.classList[act < 0 ? "remove" : act > 0 ? "add" : "toggle"]("hidden") }
}
const playBlur = (els) => {
    els.forEach((el) => {
        el.animate([{ filter: " brightness(1.3) drop-shadow(0 0 6px #fff)", textShadow: "0 0 4px #fff" }, {},],
            { duration: 250, })
    })
}
const limitDecimals = (num, dcm = 1) => (Number.isInteger(+num) ? +num : +num.toFixed(dcm))

/* ---------- ---------- ---------- -------- ---------- ---------- ---------- */
class Param {
    postFns = [];
    callPostFns() { this.postFns.forEach((fn) => fn()) }
    constructor(name, value = 0, attributes = {},decimalLimit = 1) {
        this.name = name;
        this.decimalLimit = decimalLimit;

        this.inputs = Array.from(document.querySelectorAll(`input.${name}`))
        this.outputs = Array.from(document.querySelectorAll(`input:not([type=date]).${name}, .ptext.${name}`))

        for (const input of this.inputs) {
            input.addEventListener("input", (e) => this.setValue(e.target.value))
            for (const attr in attributes) { input.setAttribute(attr, attributes[attr]) }
        }
        this.setValue(value)
    }
    setValue(x) {
        if (this.value == x) { return }
        if (this.name.toLowerCase().includes("date")) { x = x.split("-").reverse().join(".") }
        this.value = x = Number.isNaN(x - 0) ? x : (x - 0)
        if (typeof x == "number") { x = limitDecimals(x,this.decimalLimit) }
        for (const el of this.outputs) { el.value = el.innerText = x; playBlur([el]) }
        this.callPostFns()
    }
}

const [ertMax, ertMin, drbMax, drbMin, kgMax, kgMin, hgbCutoff] = [150, 75, 0.75, 0.35, 150, 0, 11];
let hgb = new Param("hgb", 10, { min: 5, max: 12, step: 0.1 })
let kg = new Param("kg", 50, { min: 0, max: kgMax, step: 0.5 })
let ert = new Param("ert", 7500, { min: 0, max: ertMax * kgMax, step: ertMin })
let ertPk = new Param("ertPk", 150, { min: 0, max: ertMax, step: ertMin })
let drb = new Param("drb", 37.5, { min: 0, max: drbMax * kgMax, step: drbMin })
let drbPk = new Param("drbPk", 0.75, { min: 0, max: drbMax, step: drbMin },2)
let fer = new Param("fer", 300, { min: 201, max: 1500, step: 1 })

let day = 1000 * 60 * 60 * 24
let date = new Date()
let currentDate = date.toISOString().slice(0, 10)
let firstOfMonth = date.toISOString().slice(0, 8) + "01"
let sixMonthsAgo = new Date(date - 180 * day).toISOString().slice(0, 10)

let hgbDate = new Param("hgbDate", firstOfMonth, { value: firstOfMonth, min: sixMonthsAgo, max: currentDate })
let ferDate = new Param("ferDate", firstOfMonth, { value: firstOfMonth, min: sixMonthsAgo, max: currentDate })

const updateDoses = () => {
    ert.setValue(ertPk.value * kg.value)
    drb.setValue(drbPk.value * kg.value)
}
const hgbToPk = () => {
    ertPk.setValue(hgb.value < hgbCutoff ? ertMax : ertMin)
    drbPk.setValue(hgb.value < hgbCutoff ? drbMax : drbMin)
    updateDoses()
}
hgb.postFns.push(hgbToPk)
kg.postFns.push(updateDoses)
ert.postFns.push(() => kg.setValue(ert.value / ertPk.value))
drb.postFns.push(() => kg.setValue(drb.value / drbPk.value))
console.timeEnd("a")


const rxxSwitch = document.querySelector("input[type=checkbox].rxx")
toggleHidden(document.querySelectorAll(".rxx"))
rxxSwitch.addEventListener("change", (e) => {
    toggleHidden(document.querySelectorAll(".rxx"))
})


const ertSwitchEl = document.querySelector("input[type=checkbox].ertVisible")
const drbSwitchEl = document.querySelector("input[type=checkbox].drbVisible")
const ertdrbFn = (e) => {
    if (!ertSwitchEl.checked && !drbSwitchEl.checked) {
        if (e.target == ertSwitchEl) { drbSwitchEl.checked = true }
        if (e.target == drbSwitchEl) { ertSwitchEl.checked = true }
    }
    toggleHidden(document.querySelectorAll(".ert"), ertSwitchEl.checked ? -1 : +1)
    toggleHidden(document.querySelectorAll(".drb"), drbSwitchEl.checked ? -1 : +1)

}
ertSwitchEl.addEventListener("change", ertdrbFn);
drbSwitchEl.addEventListener("change", ertdrbFn);
let popTimeout = null;


let pop = document.querySelector(".pop")
const popHandler = () => {
    pop.classList.remove("nopop")
    popTimeout = setTimeout(() => pop.classList.add("nopop"), 1000)
}

for (const el of document.querySelectorAll(".sentence")) {
    el.addEventListener("click", (e) => {
        let text = el.textContent.trim()
        text = text.replace(/[\ ,\n]+/g, " ")
        console.log(text);
        navigator.clipboard.writeText(text)
        popHandler()
    })
}
