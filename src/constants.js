export const DESCRIPTION_TEXT = {
  LCP: 'The Largest Contentful Paint (LCP) metric is a web performance indicator that measures how quickly the main content of a website becomes visible to users. LCP marks the rendering milestone when visitors can see the largest page element.',
  INP: 'Interaction to Next Paint (INP) is a web performance metric that measures how quickly a website responds to user interactions like clicks or key presses. Specifically, it measures how much time elapses between a user interaction and the next time the user sees a visual update on the page.',
  CLS: 'Cumulative Layout Shift (CLS) measures the visual stability of a page by tracking unexpected layout movements of visible elements during its lifetime. A lower CLS score means a more stable, less jarring user experience.',
  TTFB: 'Time to First Byte (TTFB) measures how long it takes for the browser to receive the first byte of a response after requesting a page. It reflects both network latency and server processing speed, helping identify backend or connection bottlenecks.',
  FCP: 'First Contentful Paint (FCP) measures how long it takes for the browser to render the first piece of content — text, image, or canvas — from the DOM. It indicates when users first see something meaningful appear on the screen.',
}

export const DEBUG_INFO_KEYS = {
  LCP: ['startTime', 'loadTime', 'size', 'url'],
  INP: ['name', 'startTime', 'processingStart', 'processingEnd'],
}

export const debugFieldTooltips = {
  LCP: {
    startTime:
      'Time (in ms) when the largest contentful element started rendering.',
    loadTime:
      'Duration (in ms) it took to fully load the largest contentful element.',
    size: 'Rendered size (in bytes) of the largest contentful element (e.g., image or text).',
    url: 'URL of the resource contributing to the largest contentful paint.',
    navigationType: 'How the page was loaded (navigate, reload, back/forward).',
  },

  INP: {
    name: 'Type of user interaction that triggered the event (e.g., click, keydown).',
    startTime: 'Time (in ms) when the interaction started after navigation.',
    processingStart:
      'Time (in ms) when the browser began processing the interaction event.',
    processingEnd:
      'Time (in ms) when the browser finished processing the interaction event.',
    navigationType: 'How the page was loaded (navigate, reload, back/forward).',
  },

  TTFB: {
    domainLookupStart: 'Timestamp when DNS lookup started.',
    domainLookupEnd: 'Timestamp when DNS lookup completed.',
    connectStart:
      'Timestamp when the browser began establishing the connection.',
    connectEnd: 'Timestamp when the connection to the server was established.',
    secureConnectionStart:
      'Timestamp when the TLS/SSL handshake began (0 if not secure).',
    requestStart: 'Timestamp when the request was sent to the server.',
    responseStart:
      'Timestamp when the first byte of the response was received.',
    nextHopProtocol: 'Protocol used for the request (e.g., h2, http/1.1).',
    transferSize: 'Total bytes received, including headers and body.',
    encodedBodySize:
      'Compressed body size (in bytes) transferred over the network.',
    decodedBodySize: 'Uncompressed response size (in bytes) after decoding.',
    responseStatus: 'HTTP status code returned by the server.',
    type: 'Navigation type (e.g., navigate, reload, back-forward).',

    // Derived / calculated values
    dns: 'Time spent resolving the domain name (DNS lookup duration).',
    connect: 'Time taken to establish the TCP connection.',
    tls: 'Duration of the TLS/SSL handshake if a secure connection was used.',
    serverWait:
      'Time between sending the request and receiving the first byte (server wait).',
    ttfb: 'Total time to first byte — when the first response byte arrives.',
    serverProcessing:
      'Time the server took to generate and begin sending the response.',
    protocol: 'Network protocol used for this request (e.g., HTTP/2, HTTP/3).',
    navigationType: 'How the page was loaded (navigate, reload, back/forward).',
    renderBlockingStatus:
      'Indicates whether the resource was render-blocking during page load',
  },
}
