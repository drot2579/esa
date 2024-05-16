console.time("a")
const toggleHidden = (els) => { for (const el of els) {el.classList.toggle("hidden")}
 }
const playBlur = (els) => {
    els.forEach((el) => {
        el.animate([
            { filter: " brightness(1.3) drop-shadow(0 0 6px #fff)", textShadow: "0 0 2px #fff" },
            { filter: " brightness(1)" },
        ],
            { duration: 250, })
    }
    )
}
const limitDecimals = (num, dcm = 1) => (Number.isInteger(+num) ? +num : +num.toFixed(dcm))

/* ---------- ---------- ---------- -------- ---------- ---------- ---------- */
const paramInstances = []
const inpKeys = ["number", "range", "date",]
class Param {
    postFns = [];
    callPostFns() { this.postFns.forEach((fn) => fn()) }
    constructor(name, value = 0, attributes = {}) {
        this.name = name;

        this.inputs = Array.from(document.querySelectorAll(`input.${name}`))
        this.outputs = Array.from(document.querySelectorAll(`input:not([type=date]).${name}, .paramtext.${name}`))

        for (const input of this.inputs) {
            input.addEventListener("input",(e) => this.setValue(e.target.value))
            for (const attr in attributes) { input.setAttribute(attr, attributes[attr]) }
        }
        this.setValue(value)
        paramInstances.push(this)
    }
    setValue(x) {
        if (this.value == x) { return }
        if (this.name.toLowerCase().includes("date")) { x = x.split("-").reverse().join(".") }
        this.value = x = Number.isNaN(x - 0) ? x : (x - 0);
        if (typeof x == "number") { x = limitDecimals(x) }
        for (const el of this.outputs) {  el.value = el.innerText = x; playBlur([el]) }
        this.callPostFns()
    }

}


let hgb = new Param("hgb", 10, { min: 5, max: 12, step: 0.1 })
let kg = new Param("kg", 50, { min: 0, max: 150, step: 0.5 })
let ert = new Param("ert", 7500, { min: 0, max: 150 * 150, step: 75 })
let ertPk = new Param("ertPk", 150, { min: 0, max: 150, step: 75 })
let drb = new Param("drb", 37.5, { min: 0, max: 0.75 * 150, step: 0.35 })
let drbPk = new Param("drbPk", 0.75, { min: 0, max: 0.75, step: 0.05 })
let fer = new Param("fer", 300, { min: 0, max: 1500, step: 1 })

let day = 1000 * 60 * 60 * 24
let date = new Date()
let currentDate = date.toISOString().slice(0, 10)
let sixMonthsAgo = new Date(date - 180 * day).toISOString().slice(0, 10)

let hgbDate = new Param("hgbDate", currentDate, { min: sixMonthsAgo, max: currentDate })
let ferDate = new Param("ferDate", currentDate, { min: sixMonthsAgo, max: currentDate })
delete hgbDate.outputs.date
delete ferDate.outputs.date

const updateDoses = () => {
    ert.setValue(ertPk.value * kg.value)
    drb.setValue(drbPk.value * kg.value)
}
const hgbToPk = () => {
    ertPk.setValue(hgb.value < 11 ? 150 : 75)
    drbPk.setValue(hgb.value < 11 ? 0.75 : 0.35)
    updateDoses()
}
hgb.postFns.push(hgbToPk)
kg.postFns.push(updateDoses)
ert.postFns.push(() => kg.setValue(ert.value / ertPk.value))
drb.postFns.push(() => kg.setValue(drb.value / drbPk.value))
console.timeEnd("a")


const chc = document.querySelector("input[type=checkbox]")
toggleHidden(document.querySelectorAll(".rxx"))

chc.addEventListener("change", (e) => {
    toggleHidden(document.querySelectorAll(".rxx"))
})