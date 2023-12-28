function setHeight(element) {
    var elementRect = element.getBoundingClientRect();
    var maxHeight = window.innerHeight - elementRect.top;

    element.style.maxHeight = maxHeight - 210 + 'px'; // height of bottom element is 180 and we have 30px padding
    element.style.minHeight = maxHeight - 210 + 'px';
}

function onWindowResize (selector) {
    const elementsToSetHeight = document.querySelector(selector);
    setHeight(elementsToSetHeight);
};

const resizeObserver = {
    subscribe(selector) {
        onWindowResize(selector);
        window.addEventListener('resize', onWindowResize);
    },
    destroy() {
        window.removeEventListener('resize', onWindowResize);
    },
};
export default resizeObserver;