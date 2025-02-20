export function getUrlParameter(url: string) {
    const urlObj = new URL(url);
    return new URLSearchParams(urlObj.search);
}