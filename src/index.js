import {CSL} from "citeproc-plus"

// demo.js
// for citeproc-js CSL citation formatter

// Get the citations that we are supposed to render, in the CSL-json format
const fetchCitations = []
const fetchItems = []
for (let i=1, ilen=8;i<ilen;i++) {
    fetchCitations.push(fetch(`citations-${i}.json`).then(
        response => response.json()
    ))

    fetchItems.push(fetch(`items-${i}.json`).then(
        response => response.json()
    ))
}


// Initialize a system object, which contains two methods needed by the
// engine.
const citeprocSys = {
    // Given an identifier, this retrieves one citation item.  This method
    // must return a valid CSL-JSON object.
    retrieveItem(id) {
        return items.find(item => item.id === id);
    }
}
const citeDiv = document.getElementById('cite-div')

function runOneStep(idx) {
    const citationParams = citations[idx]
    const citationStrings = citeproc.processCitationCluster(citationParams[0], citationParams[1], [])[1]
    for (const citeInfo of citationStrings) {
        // Prepare node
        const newNode = document.createElement("div")
        newNode.setAttribute("id", `n${citeInfo[2]}`)
        newNode.innerHTML = citeInfo[1]
        // Try for old node
        const oldNode = document.getElementById(`node-${citeInfo[2]}`)
        if (oldNode) {
            citeDiv.replaceChild(newNode, oldNode)
        } else {
            citeDiv.appendChild(newNode)
        }
        newNode.scrollIntoView()
    }
    runRenderBib(idx+1)
}

const bibDiv = document.getElementById('bib-div')
const timeDiv = document.getElementById("time-div")
const timeSpan = document.getElementById("time-span")
let t0
let t1
// This runs at document ready, and renders the bibliography
function renderBib() {
    bibDiv.innerHTML = ''
    citeDiv.innerHTML = ''
    t0 = performance.now()
    runRenderBib(0)
}
function runRenderBib(idx) {
    if (idx === citations.length) {
        t1 = performance.now()
        timeSpan.innerHTML = `${t1 - t0} milliseconds`
        timeDiv.hidden = false
        // Bib
        const bibResult = citeproc.makeBibliography()
        if (bibResult) {
            bibDiv.innerHTML = bibResult[1].join('\n')
        }
    } else {
        setTimeout(() => {
            runOneStep(idx)
        }, 0)
    }
}

const csl = new CSL()

const styleSelector = document.querySelector('#style-selector')
csl.getStyles().then(
    styles => styleSelector.innerHTML += Object.entries(styles).map(([key, value]) => `<option value="${key}">${value}</option>`).join('')
)

let citeproc, items, citations
Promise.all([
    Promise.all(fetchCitations).then(
        citationBlocks => citations = citationBlocks.flat()
    ),
    Promise.all(fetchItems).then(
        itemBlocks => items = itemBlocks.flat()
    )
]).then(
    () => {
        styleSelector.addEventListener('change', async () => {
            citeproc = await csl.getEngine(citeprocSys, styleSelector.value)
            renderBib()
        })
        styleSelector.removeAttribute('disabled')
    }
)
