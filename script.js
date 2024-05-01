class Parameter {
    static instances = {}
    constructor(name, value = null, decimals = 0,controlFn = null) {
        this.name = name
        this.mainValue = value
        this.decimals = decimals

        this.container = document.querySelector(`.${name}`)
        this.elements = document.querySelectorAll(`.${name} input`)
        
        this.updateElements()

        this.controlFn = controlFn

        Parameter.instances[name] = this
    }
    updateVal() { this.mainValue = +this.elements[0].value }
    updateElements() { this.elements.forEach((el) => { el.value = +this.mainValue }) }
    updateAll(value) {
        this.mainValue = +value.toFixed(this.decimals);
        this.updateElements()

        this.controlFn && this.controlFn(+value)
    }

}

const perKg = {
    high: { erit: 150, darbe: 0.75 },
    low: { erit: 75, darbe: 0.35 },
    none: { erit: 0, darbe: 0 },
    current: { erit: 150, darbe: 0.75 },
}

const isStartDose = new Parameter("isStartDose", 1, 0,(value) => {
    value - 0;
    let inputEl = isStartDose.elements[0]
    if (true) {
        [inputEl.nextElementSibling,inputEl.previousElementSibling].forEach((el) => {
            el.classList.toggle("selected")
        })
    } 
})
const kg = new Parameter("kg", 40, 1,(value) => {
    value > 120 ? kg.container.classList.add("fat") : kg.container.classList.remove("fat")
})
const eritPk = new Parameter("eritPk", 150, 0)
const darbePk = new Parameter("darbePk", 0.75, 2)
const eritDose = new Parameter("eritDose", 6000, 0)
const darbeDose = new Parameter("darbeDose", 30, 2)

function updatePksFromDosage() {
    perKg.current = isStartDose.mainValue ? perKg.high : perKg.low
    eritPk.updateAll(perKg.current.erit)
    darbePk.updateAll(perKg.current.darbe)
}

function updateDoses() {
    eritDose.updateAll(kg.mainValue * eritPk.mainValue)
    darbeDose.updateAll(kg.mainValue * darbePk.mainValue)
}
function isStartDoseListener(e) {
    isStartDose.updateAll(+e.target.value)
    updatePksFromDosage()
    updateDoses()
    
}
isStartDose.elements.forEach((el) => { el.addEventListener("input", isStartDoseListener) })

function kgFunc(e) {
    kg.updateAll(+e.target.value)
    updateDoses()
}
kg.elements.forEach((elem) => { elem.addEventListener("input", kgFunc) })


function eritDoseFunc(e) {
    eritDose.updateAll(+e.target.value)
    kg.updateAll(eritDose.mainValue / eritPk.mainValue)
    darbeDose.updateAll(kg.mainValue * darbePk.mainValue)
}
eritDose.elements.forEach((elem) => { elem.addEventListener("input", eritDoseFunc) })

function darbeDoseFunc(e) {
    darbeDose.updateAll(+e.target.value)
    kg.updateAll(darbeDose.mainValue / darbePk.mainValue)
    eritDose.updateAll(kg.mainValue * eritPk.mainValue)
}
darbeDose.elements.forEach((elem) => { elem.addEventListener("input", darbeDoseFunc) })


/* ---------- ----------> UI <---------- ---------- */

let rangesArr = document.querySelectorAll("input[type=range]:not(:disabled)")
let focusNum = 4**10 - 1
document.body.addEventListener("keypress", (e) => {
    if(!["w","s","f"].includes(e.key)){return}
    let focused = document.querySelector("input[type=range]:not(:disabled):focus")
    if(e.key == "w"){focusNum--}  
    if(e.key == "s"){focusNum++}
    if(e.key == "f"){focusNum = 4**10}

    rangesArr[ focusNum % rangesArr.length].focus()
})

document.querySelector("button.info").addEventListener("click", (e) => {
    document.querySelector(".pop > .info").classList.toggle("hidden")
})

