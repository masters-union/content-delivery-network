class LoadWidget {
    constructor(widgetId) {
        this.widgetId = widgetId;
        this.iframeLoaded = false;

        this.init();
    }
    init() {
        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            this.loadIframe();
        } else {
            document.addEventListener("DOMContentLoaded", () => this.loadIframe());
        }
        const observer = new MutationObserver(() => {
            if (!this.iframeLoaded) this.loadIframe();
        });
        observer.observe(document.body, { childList: true, subtree: true });
        if (!window.loadWidgetListener) {
            window.loadWidgetListener = true;
            window.widgetMessageHandler = this.handleMessage.bind(this);
            window.addEventListener("message", window.widgetMessageHandler);
        }
    }
    loadIframe() {
        const iframe = document.getElementById(this.widgetId);
        if (!iframe || this.iframeLoaded) return;

        this.iframeLoaded = true;
        iframe.setAttribute("frameBorder", "0");

        // let iFrameSrc = `http://localhost:7010/widget/${this.widgetId}`;
        let iFrameSrc = `https://widget.mastersunion.org/widget/${this.widgetId}`;
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.append("widgetHostURL", window.location.href);
        urlParams.append("parentReferrer", document.referrer || window.location.href || "");

        iframe.setAttribute("allow", "autoplay; camera; microphone; fullscreen; display-capture");
        iframe.setAttribute("sandbox", "allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox");

        iframe.src = `${iFrameSrc}?${urlParams.toString()}`;
    }
    handleMessage(event) {
        const allowedOrigins = [
            'https://widget.mastersunion.org',
            'http://localhost:7010',
        ];
        if (!allowedOrigins.includes(event.origin)) {
            console.warn('Message received from unauthorized origin:', event.origin);
            return;
        }
        if (event.data?.type === "REDIRECT" && event.data?.url) {
            window.location.href = event.data.url;
        }
        if (event.data?.type === "RESIZE" && event.data?.height) {
            const iframe = document.getElementById(event.data.widgetId);
            if (iframe) {
                iframe.style.height = `${event.data.height}px`;
            }
        }
    }
};
