function observeElement() {
    // Set up a new observer
    var observer = new MutationObserver(function (mutations) {
        // Look through all mutations that just occured
        for (var i = 0; i < mutations.length; i++) {
            // If the addedNodes property has one or more nodes
            for (var j = 0; j < mutations[i].addedNodes.length; j++) {
                // if (mutations[i].addedNodes[j].querySelector(selector)) {
                if (mutations[i].addedNodes[j]) {
                    var logoutLinks = document.querySelectorAll('a[href="/accounts/logout"], a[href="/accounts/logout/"]')
                    if (logoutLinks) {
                        logoutLinks.forEach(function (logoutLink) {
                            logoutLink.style.display = 'none';
                        });
                    };
                }
                return;
            }
        }
    });

    observer.observe(document, { childList: true, subtree: true });
}

observeElement();
