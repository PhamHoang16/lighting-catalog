import DOMPurify from "isomorphic-dompurify";

// Whitelist for react-quill rich text output
const ALLOWED_TAGS = [
    "p", "br", "strong", "em", "u", "s",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li", "blockquote",
    "a", "img",
    "table", "thead", "tbody", "tr", "td", "th",
    "code", "pre", "span", "div",
];

const ALLOWED_ATTR = [
    "href", "target", "rel",
    "src", "alt", "width", "height",
    "class", "style",
];

// Restrict style to safe properties only
DOMPurify.addHook("uponSanitizeAttribute", (node, data) => {
    if (data.attrName === "style") {
        const safe = (data.attrValue || "")
            .split(";")
            .filter((rule) => {
                const prop = rule.split(":")[0]?.trim().toLowerCase() ?? "";
                return ["color", "background-color", "text-align", "font-weight", "font-style", "text-decoration"].includes(prop);
            })
            .join(";");
        data.attrValue = safe;
    }
});

export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS,
        ALLOWED_ATTR,
        FORCE_BODY: false,
    });
}
