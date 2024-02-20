class Search {
    /**
     * @readonly
     * @type { HTMLElement }
    */
    el = document.querySelector('main .search');

    updateUrl(url) {
        this.el.querySelector('.url').innerHTML = url;
    }
}

export const $search = new Search();