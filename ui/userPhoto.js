export default class UserPhoto {
    constructor(element, onUpLoad) {
        this.element = element;
        this.onUpLoad = onUpLoad;

        this.element.addEventListener('dragover', (e) => {
            if(e.dataTransfer.items.length && e.dataTransfer.items[0].kind === 'file') {
                e.preventDefault();
            }
        });

        this.element.addEventListener('drop', (e) => {
            const file = e.dataTransfer.items[0].gatAsFile();
            const reader = new FileReader();

            reader.readAsDataURL(file);
            reader.addEventListener('load', () => this.onUpLoad(reader.result));
            e.preventDefault();
        });
    }

    set(photo) {
        this.element.style.backgroundImage = `url(${photo})`;
    }
}