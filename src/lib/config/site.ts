export const siteConfig = {
    name: "Led Xinh",
    description:
        "Hệ thống trưng bày sản phẩm chiếu sáng chuyên nghiệp. Đặt hàng trực tuyến và tư vấn miễn phí.",
    url: "https://lighting-catalog.vn",

    // ── Thông tin liên hệ (hardcode) ──────────────────────────────
    contact: {
        hotline: "0905 629 333",
        hotline2: "0984 679 286",
        hotlineHref: "tel:0905629333",
        zalo: "0905 629 333",
        zaloHref: "https://zalo.me/0905629333",
        facebook: "https://www.facebook.com/lightingcatalog",
        email: "ledxinh548@gmail.com",
        address: "48 P. Văn Trì, Minh Khai, Tây Tựu, Hà Nội, Việt Nam",
        workingHours: "Thứ 2 - Thứ 7: 8:00 - 18:00",
    },

    // ── SEO defaults ──────────────────────────────────────────────
    seo: {
        title: "Led Xinh - Giải pháp chiếu sáng chuyên nghiệp",
        description:
            "Khám phá bộ sưu tập đèn chiếu sáng đa dạng. Đặt hàng trực tuyến và tư vấn miễn phí từ đội ngũ chuyên gia.",
        keywords: [
            "đèn chiếu sáng",
            "đèn LED",
            "đèn trang trí",
            "giải pháp chiếu sáng",
            "lighting",
        ],
    },
} as const;

export type SiteConfig = typeof siteConfig;
