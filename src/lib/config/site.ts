export const siteConfig = {
    name: "Lighting Catalog",
    description:
        "Hệ thống trưng bày sản phẩm chiếu sáng chuyên nghiệp. Nhận báo giá và tư vấn miễn phí.",
    url: "https://lighting-catalog.vn",

    // ── Thông tin liên hệ (hardcode) ──────────────────────────────
    contact: {
        hotline: "0909 123 456",
        hotlineHref: "tel:0909123456",
        zalo: "0909 123 456",
        zaloHref: "https://zalo.me/0909123456",
        facebook: "https://www.facebook.com/lightingcatalog",
        email: "hoangpham1618@gmail.com",
        address: "123 Đường Nguyễn Văn Linh, Quận 7, TP. Hồ Chí Minh",
        workingHours: "Thứ 2 - Thứ 7: 8:00 - 18:00",
    },

    // ── SEO defaults ──────────────────────────────────────────────
    seo: {
        title: "Lighting Catalog - Giải pháp chiếu sáng chuyên nghiệp",
        description:
            "Khám phá bộ sưu tập đèn chiếu sáng đa dạng. Nhận báo giá và tư vấn miễn phí từ đội ngũ chuyên gia.",
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
