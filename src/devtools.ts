console.log("devtools");

chrome.devtools.panels.create(
    "Grapho",
    "src/assets/grapho-icon.png",
    "src/main.html",
    (panel) => {
        if (chrome.runtime.lastError) console.error(chrome.runtime.lastError);
        console.log("panel", panel);
    }
);

export { };