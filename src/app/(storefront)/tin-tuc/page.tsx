import { createStaticClient } from "@/lib/supabase/static";
import type { Metadata } from "next";
import { siteConfig } from "@/lib/config/site";
import Breadcrumbs from "@/components/storefront/Breadcrumbs";
import NewsHeroBlock from "@/components/storefront/news/NewsHeroBlock";
import NewsPopularScroll from "@/components/storefront/news/NewsPopularScroll";
import NewsListBlock from "@/components/storefront/news/NewsListBlock";
import type { Post } from "@/lib/types/database";

export const revalidate = 60;

export const metadata: Metadata = {
    title: `Tin tức & Kiến thức chiếu sáng | ${siteConfig.name}`,
    description: `Cập nhật tin tức mới nhất, chia sẻ kiến thức về đèn chiếu sáng, thiết kế ánh sáng và giải pháp lighting từ ${siteConfig.name}.`,
};

async function getPosts() {
    const supabase = createStaticClient();
    const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    return (data ?? []) as Post[];
}

export default async function NewsListPage() {
    const allPosts = await getPosts();

    // Khối 1: Nổi bật (is_featured = true)
    const featuredPosts = allPosts.filter(p => p.is_featured);
    // Nếu chưa đủ 3 bài nổi bật thì lấy đại bài mới nhất bù vào
    const heroPosts = featuredPosts.length >= 3 
        ? featuredPosts.slice(0, 3) 
        : [...featuredPosts, ...allPosts.filter(p => !p.is_featured)].slice(0, 3);

    // Khối 2: Xem nhiều (is_popular = true)
    const popularPosts = allPosts.filter(p => p.is_popular);
    // Tương tự, nếu không đủ lấy đại list còn lại
    const scrollPosts = popularPosts.length >= 4 
        ? popularPosts.slice(0, 10) 
        : [...popularPosts, ...allPosts.filter(p => !p.is_popular)].slice(0, 10);

    // Khối 3: Tất cả bài viết
    const listPosts = allPosts; // (thực tế sau này nối API sẽ có phân trang ở đây)

    return (
        <div className="bg-gray-50/50 min-h-screen">
            {/* Breadcrumbs */}
            <div className="border-b border-gray-100 bg-white">
                <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
                    <Breadcrumbs items={[{ label: "Tin tức" }]} />
                </div>
            </div>

            {/* Container */}
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6">
                
                {/* ════════════════════════════════════════════════════════
                    KHỐI 1: TIN NỔI BẬT NHẤT (HERO BLOCK)
                    Nằm vị trí cao nhất
                   ════════════════════════════════════════════════════════ */}
                {heroPosts.length > 0 && (
                    <section className="pt-8 pb-10 md:pt-10 md:pb-12">
                        <NewsHeroBlock posts={heroPosts} />
                    </section>
                )}

                {/* Divider Line */}
                <div className="h-px bg-gray-200" />

                {/* ════════════════════════════════════════════════════════
                    KHỐI 2: XEM NHIỀU TUẦN QUA (HORIZONTAL SCROLL)
                    Nằm ở giữa
                   ════════════════════════════════════════════════════════ */}
                {scrollPosts.length > 0 && (
                    <section className="py-10 md:py-12">
                        <NewsPopularScroll posts={scrollPosts} />
                    </section>
                )}

                {/* Divider Line */}
                <div className="h-px bg-gray-200" />

                {/* ════════════════════════════════════════════════════════
                    KHỐI 3: TẤT CẢ BÀI VIẾT (LIST VIEW)
                    Dạng dọc truyền thống
                   ════════════════════════════════════════════════════════ */}
                {listPosts.length > 0 && (
                    <section className="py-10 md:py-16">
                        <NewsListBlock posts={listPosts} />
                    </section>
                )}
            </div>
        </div>
    );
}
