

// returns the geometric distance between two points (how long is the arrow?)
function distance(x1, y1, x2, y2) {
    return Math.sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
}

// used to build a random filename
function newGuid() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        const v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// triggers a download of the provided data-uri
function downloadURI(uri, name) {
    let link = document.createElement("a");
    link.download = name;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
}

// take a snapshot of what's on the fabric wrapped canvas
function exportCanvas(fabricCanvas, originalUrlWithExtension) {
    const lossless = (originalUrlWithExtension.endsWith('.bmp') || originalUrlWithExtension.endsWith('.png'));
    const fmt = lossless ? 'png' : 'jpeg';
    const canvasCapture = fabricCanvas.toDataURL({
        format: fmt
    });
    downloadURI(canvasCapture, newGuid() + '.' + fmt);
}

// radio selects between multiple buttons
function radioButtonSelect(shapeToMake) {
    const all = ['ellipse-btn','rect-btn','arrow-btn','txt-btn'];
    $.each(all,function(idx,val) {
        selectButton(val,false);
    });
    selectButton(shapeToMake + '-btn',true);
}

// pushes a button in and down
function selectButton(id,sel) {
    const target = $("#" + id);
    const has = target.hasClass('paint-tools-btn-radiosel');
    if(sel && !has)
        target.addClass('paint-tools-btn-radiosel');
    else if(!sel && has) {
        target.removeClass('paint-tools-btn-radiosel');
    }
}




