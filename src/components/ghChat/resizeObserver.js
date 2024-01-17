function setHeight(element) {
    var elementRect = element.getBoundingClientRect();
    var maxHeight = window.innerHeight - elementRect.top;

    element.style.maxHeight = maxHeight - 210 + 'px'; // height of bottom element is 180 and we have 30px padding
    element.style.minHeight = maxHeight - 210 + 'px';
}

function onWindowResize () {
    const elementsToSetHeight = document.querySelector('gh-chat');
    setHeight(elementsToSetHeight);
};

const resizeObserver = {
    subscribe() {
        onWindowResize();
        window.addEventListener('resize', onWindowResize);
    },
    destroy() {
        window.removeEventListener('resize', onWindowResize);
    },
};
export default resizeObserver;