import Link from "next/link";
import { Phone, Mail, ShieldCheck, Truck, Menu, Search, ChevronDown } from "lucide-react";
import { siteConfig } from "@/lib/config/site";
import { createClient } from "@/lib/supabase/server";
import { buildCategoryTree } from "@/lib/utils";
import MobileMenu from "@/components/storefront/MobileMenu";
import CartHeaderIcon from "@/components/storefront/CartHeaderIcon";

// Server Component — fetch categories trực tiếp
async function getCategories() {
    const supabase = await createClient();
    const { data } = await supabase
        .from("categories")
        .select("*")
        .order("name", { ascending: true });
    return data ?? [];
}

export default async function StorefrontHeader() {
    const categories = await getCategories();
    const tree = buildCategoryTree(categories);
    const topCategories = categories.filter(c => !c.parent_id).slice(0, 6);

    return (
        <>
            {/* ── DESKTOP HEADER (3 Tiers) ─────────────────────────────────── */}
            <header className="hidden w-full flex-col bg-white lg:flex">

                {/* Tầng 1: Top Bar (Siêu mỏng, chữ nhỏ) */}
                {/* <div className="border-b border-gray-800 bg-gray-900 text-[11px] text-gray-300">
                    <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-between px-6">
                        <div className="flex items-center gap-6">
                            <span className="flex items-center gap-1.5 transition-colors hover:text-white cursor-default">
                                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                                Cam kết 100% chính hãng
                            </span>
                            <span className="flex items-center gap-1.5 transition-colors hover:text-white cursor-default">
                                <Truck className="h-3.5 w-3.5 text-amber-500" />
                                Giao hàng hỏa tốc nội thành 2H
                            </span>
                            <span className="flex items-center gap-1.5 transition-colors hover:text-white cursor-default">
                                Lắp đặt tận nơi
                            </span>
                        </div>
                        <div className="flex items-center gap-6 font-medium">
                            <a href={`mailto:${siteConfig.contact.email}`} className="flex items-center gap-1.5 transition-colors hover:text-white">
                                <Mail className="h-3.5 w-3.5" />
                                {siteConfig.contact.email}
                            </a>
                            <a href={siteConfig.contact.hotlineHref} className="flex items-center gap-1.5 text-amber-500 transition-colors hover:text-amber-400">
                                <Phone className="h-3.5 w-3.5" />
                                Hotline 24/7: {siteConfig.contact.hotline}
                            </a>
                        </div>
                    </div>
                </div> */}

                {/* Tầng 2: Main Header (To, Đậm) */}
                <div className="bg-white px-6">
                    <div className="mx-auto flex h-28 max-w-[1440px] items-center gap-12">
                        <Link href="/" className="group shrink-0 transition-opacity hover:opacity-80 flex flex-col justify-center">
                            {/* 
                              Thay thế cấu trúc text này bằng thẻ img logo thực tế của bạn khi có file:
                              <img src="/logo-ngang.png" className="h-12 w-auto object-contain" alt="Logo" />
                            */}
                            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">
                                {siteConfig.name}
                            </h1>
                            <span className="text-[10px] sm:text-xs font-bold tracking-[0.25em] text-gray-500 mt-1 uppercase hidden sm:block">
                                THƯƠNG HIỆU ĐÈN SỐ 1
                            </span>
                        </Link>

                        {/* Box Giữa: Thanh Search Dài */}
                        <div className="flex flex-1 flex-col">
                            <form action="/danh-muc" method="GET" className="relative flex w-full items-center overflow-hidden rounded-xl border-2 border-amber-500 bg-white shadow-sm transition-shadow focus-within:shadow-[0_0_0_4px_rgba(245,158,11,0.15)]">
                                <input
                                    type="text"
                                    name="q"
                                    placeholder="Tìm kiếm danh mục, tên sản phẩm..."
                                    className="h-[48px] w-full border-none bg-transparent px-6 text-sm font-medium text-gray-900 outline-none placeholder:text-gray-400 focus:outline-none focus:ring-0"
                                />
                                <button
                                    type="submit"
                                    className="flex h-[48px] w-[100px] shrink-0 items-center justify-center bg-amber-500 text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
                                >
                                    <Search className="h-5 w-5" />
                                </button>
                            </form>
                            <div className="mt-2.5 flex items-center gap-3 text-[11px] font-bold text-gray-400">
                                <span className="text-gray-500">Gợi ý tìm kiếm:</span>
                                {topCategories.slice(0, 4).map(cat => (
                                    <Link key={cat.id} href={`/danh-muc/${cat.slug}`} className="hover:text-amber-600 transition-colors uppercase">
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Box Phải: Cart + Gọi ngay */}
                        <div className="flex flex-nowrap shrink-0 items-center justify-end gap-5 whitespace-nowrap px-2">

                            <CartHeaderIcon showLabel />

                            <div className="h-10 w-px bg-gray-200" />

                            <a
                                href={siteConfig.contact.hotlineHref}
                                className="group flex items-center gap-3"
                            >
                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-50 text-amber-500 transition-transform group-hover:scale-110">
                                    <Phone className="h-6 w-6 fill-current" />
                                </div>
                                <div className="flex flex-col gap-0.5">
                                    <span className="text-sm font-bold leading-tight text-gray-900">
                                        {siteConfig.contact.hotline}
                                    </span>
                                    <span className="text-sm font-bold leading-tight text-gray-900">
                                        {siteConfig.contact.hotline2}
                                    </span>
                                </div>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Tầng 3: Category Nav Bar (Sticky Navbar) */}
                <div className="sticky top-0 z-[100] w-full bg-gradient-to-r from-amber-500 to-orange-600 shadow-md">
                    <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between px-6">

                        {/* NHÓM TRÁI: Khu vực Bán hàng */}
                        <div className="flex h-full items-center">
                            {/* Dropdown Tất Cả Danh Mục */}
                            <div className="group relative flex h-full cursor-pointer items-center justify-between gap-3 bg-black/15 px-6 font-bold text-white transition-colors hover:bg-black/25 min-w-[260px]">
                                <div className="flex items-center gap-3">
                                    <Menu className="h-5 w-5" />
                                    <span className="text-sm">TẤT CẢ DANH MỤC</span>
                                </div>
                                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:-rotate-180" />

                                {/* Mega Menu Dropdown (Flyout) */}
                                <div className="absolute left-0 top-full z-[100] hidden w-64 rounded-b-xl border border-t-0 border-gray-100 bg-white shadow-xl group-hover:block">
                                    <ul className="flex flex-col py-2">
                                        {tree.map(parent => (
                                            <li key={parent.id} className="group/item relative">
                                                <Link
                                                    href={`/danh-muc/${parent.slug}`}
                                                    className="flex w-full items-center justify-between px-6 py-3 text-sm font-bold text-gray-700 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                                >
                                                    {parent.name}
                                                    {parent.children.length > 0 && (
                                                        <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400 transition-colors group-hover/item:text-amber-500" />
                                                    )}
                                                </Link>

                                                {/* Sub Menu (Flyout ngang) */}
                                                {parent.children.length > 0 && (
                                                    <ul className="absolute left-full top-0 z-[100] hidden min-w-[240px] rounded-r-xl border border-l-0 border-gray-100 bg-white py-2 shadow-xl group-hover/item:block">
                                                        {parent.children.map(child => (
                                                            <li key={child.id}>
                                                                <Link
                                                                    href={`/danh-muc/${child.slug}`}
                                                                    className="block w-full px-5 py-2.5 text-sm font-semibold text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600"
                                                                >
                                                                    {child.name}
                                                                </Link>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="rounded-b-xl bg-gray-50 px-6 py-4">
                                        <Link href="/danh-muc" className="flex items-center justify-center text-sm font-bold text-amber-600 transition-colors hover:text-amber-700">
                                            XEM TOÀN BỘ SẢN PHẨM &rarr;
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Top Categories Navigation */}
                            <nav className="flex h-full items-center gap-1 pl-4">
                                {topCategories.map(cat => (
                                    <Link
                                        key={cat.id}
                                        href={`/danh-muc/${cat.slug}`}
                                        className="group/link relative flex h-full items-center px-4 text-sm font-semibold whitespace-nowrap text-white/95 transition-colors hover:text-white"
                                    >
                                        {cat.name}
                                        <span className="absolute bottom-0 left-0 h-1 w-full scale-x-0 origin-left bg-white transition-transform duration-300 group-hover/link:scale-x-100" />
                                    </Link>
                                ))}
                            </nav>
                        </div>

                        {/* NHÓM PHẢI: Khu vực Thông tin */}
                        <div className="flex h-full shrink-0 items-center justify-end gap-1 border-l border-white/20 pl-4">
                            <Link href="/tin-tuc" className="flex h-full items-center px-4 text-sm font-medium whitespace-nowrap text-white/80 transition-colors hover:text-white">
                                Tin tức
                            </Link>
                            <Link href="/gioi-thieu" className="flex h-full items-center px-4 text-sm font-medium whitespace-nowrap text-white/80 transition-colors hover:text-white">
                                Giới thiệu
                            </Link>
                            <Link href="/lien-he" className="flex h-full items-center px-4 text-sm font-medium whitespace-nowrap text-white/80 transition-colors hover:text-white">
                                Liên hệ
                            </Link>
                        </div>
                    </div>
                </div>
            </header>

            {/* ── MOBILE HEADER (Gắn gọn thành 1 thanh Navigation) ─────────── */}
            <header className="sticky top-0 z-50 flex h-14 w-full items-center justify-between border-b border-gray-100 bg-white px-4 shadow-sm lg:hidden">
                {/* Hamburger (Left) - via MobileMenu component */}
                <div className="flex shrink-0 items-center justify-start w-[80px]">
                    <MobileMenu categories={categories} />
                </div>

                {/* Logo (Center) */}
                <Link href="/" className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-opacity hover:opacity-80">
                    {/* Placeholder Logo ngang Mobile */}
                    <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600 whitespace-nowrap">
                        {siteConfig.name}
                    </h1>
                </Link>

                {/* Actions (Right) Search & Cart */}
                <div className="flex shrink-0 items-center justify-end gap-3 w-[80px]">
                    {/* Bấm vào search nhảy sang trang danh mục, autofocus */}
                    <Link href="/danh-muc" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-50 text-gray-600 transition-colors hover:bg-amber-50 hover:text-amber-600">
                        <Search className="h-5 w-5" />
                    </Link>
                    <CartHeaderIcon showLabel={false} />
                </div>
            </header>
        </>
    );
}
