function setHeight(element) {
    var elementRect = element.getBoundingClientRect();
    var maxHeight = window.innerHeight - elementRect.top;

    element.style.maxHeight = maxHeight - 210 + 'px'; // height of bottom element is 180 and we have 30px padding
    element.style.minHeight = maxHeight - 210 + 'px';
}

function setSidebarHeight(element) {
    var elementRect = element.getBoundingClientRect();
    var maxHeight = window.innerHeight - elementRect.top;

    element.style.maxHeight = maxHeight + 'px';
    element.style.minHeight = maxHeight + 'px';
}

function onWindowResize () {
    const ghChat = document.querySelector('gh-chat');
    setHeight(ghChat);

    const sidebar = document.querySelector('.users_sidebar');
    if (sidebar) {
        setSidebarHeight(sidebar);
    }
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