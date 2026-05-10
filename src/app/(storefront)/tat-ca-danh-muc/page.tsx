import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { siteConfig } from "@/lib/config/site";
import { Sparkles } from "lucide-react";
import { getCategoryTree } from "@/lib/db/queries/categories";

export const revalidate = 86400; // 1 day - max caching for egress protection

export const metadata: Metadata = {
    title: "Tất cả danh mục sản phẩm",
    description: `Khám phá toàn bộ danh mục sản phẩm chiếu sáng tại ${siteConfig.name}.`,
};

export default async function AllCategoriesDirectoryPage() {
    const tree = await getCategoryTree();
    
    const subtleBgs = [
        "bg-gradient-to-br from-amber-500/10 via-white to-amber-500/5 border-amber-500/20",
        "bg-gradient-to-br from-orange-500/10 via-white to-orange-500/5 border-orange-500/20",
        "bg-gradient-to-br from-yellow-500/10 via-white to-yellow-500/5 border-yellow-500/20"
    ];

    return (
        <div className="bg-slate-50 min-h-screen pb-20">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden bg-white border-b border-gray-200">
                {/* Decorative Glow Blob */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[800px] h-[160px] bg-gradient-to-b from-amber-400/10 to-transparent blur-3xl rounded-full pointer-events-none" />

                <div className="relative mx-auto max-w-[1440px] px-6 py-5 sm:py-10 lg:py-12 text-center flex flex-col items-center">
                    <div className="mb-2 sm:mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 px-3 py-1 sm:py-1.5 text-xs sm:text-sm font-bold text-amber-700 shadow-sm">
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                        <span>Hệ Sinh Thái Chiếu Sáng</span>
                        <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-500" />
                    </div>
                    <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-gray-900 mb-2 sm:mb-4">
                        Danh Sách <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-orange-600">Ngành Hàng</span>
                    </h1>
                    <p className="hidden sm:block max-w-2xl text-[15px] sm:text-base text-gray-500 leading-relaxed font-medium">
                        Khám phá hệ sinh thái sản phẩm chiếu sáng cao cấp. <br />
                        Từ dân dụng đến dự án chuyên nghiệp.
                    </p>
                </div>
            </div>
            {/* Main Content: Row-based Split Layout */}
            <div className="mx-auto max-w-[1440px] px-4 sm:px-6 mt-5 sm:mt-10 space-y-6 sm:space-y-10">
                {tree.map((parent, index) => {
                    const bgClass = subtleBgs[index % subtleBgs.length];
                    return (
                        <div key={parent.id} className={`flex flex-col lg:flex-row gap-6 lg:gap-8 rounded-[2rem] p-5 lg:p-8 shadow-sm border transition-all hover:shadow-lg ${bgClass}`}>
                            {/* Cột trái (Parent Info) */}
                            <div className="lg:w-[320px] shrink-0 flex flex-col justify-between lg:pr-6 border-b lg:border-b-0 lg:border-r border-gray-200/50 pb-8 lg:pb-0 relative z-10">
                                <div>
                                    {/* Ảnh Cha: Tăng kích thước (w-48 h-48) */}
                                    <div className="relative aspect-square w-40 sm:w-48 mx-auto lg:mx-0 overflow-hidden rounded-[1.5rem] bg-white shadow-md mb-8 ring-4 ring-white/50">
                                        {parent.image_url ? (
                                            <Image
                                                src={parent.image_url}
                                                alt={parent.name}
                                                fill
                                                sizes="(max-width: 768px) 160px, 192px"
                                                className="object-cover transition-transform duration-700 hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-gray-50">
                                                <div className="h-10 w-10 rounded-full bg-gray-200" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-center lg:text-left">
                                        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight uppercase mb-3">
                                            {parent.name}
                                        </h2>
                                        <p className="text-sm font-bold text-amber-700 bg-amber-100/60 w-fit px-4 py-1.5 rounded-full mx-auto lg:mx-0 mb-6 border border-amber-200/50">
                                            {parent.children.length} phân loại
                                        </p>
                                    </div>
                                </div>
                                <div className="text-center lg:text-left">
                                    <Link href={`/danh-muc/${parent.slug}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3.5 text-sm font-bold text-white transition-all hover:from-amber-500 hover:to-orange-500 hover:shadow-lg hover:shadow-amber-500/30">
                                        Xem tất cả {parent.name} &rarr;
                                    </Link>
                                </div>
                            </div>
                            {/* Cột phải (Children Grid) với nền bao bọc */}
                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 xl:gap-5">
                                {parent.children.length > 0 ? (
                                    parent.children.map(child => (
                                        <Link key={child.id} href={`/danh-muc/${child.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-b from-white to-gray-50/50 shadow-sm transition-all hover:border-amber-400 hover:-translate-y-1 hover:shadow-lg hover:shadow-amber-500/15">
                                            {/* Image Area: Square Aspect Ratio */}
                                            <div className="relative aspect-square w-full overflow-hidden bg-white border-b border-gray-50 p-2 sm:p-3">
                                                <div className="relative w-full h-full rounded-xl overflow-hidden shadow-inner bg-gray-50 border border-gray-100/50 group-hover:border-amber-200/50 transition-colors">
                                                    {child.image_url ? (
                                                        <Image
                                                            src={child.image_url as string}
                                                            alt={child.name}
                                                            fill
                                                            sizes="(max-width: 768px) 50vw, 25vw"
                                                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <div className="flex h-full w-full items-center justify-center">
                                                            <div className="h-8 w-8 rounded-full bg-gray-200" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Text Area: Size tăng mạnh */}
                                            <div className="flex flex-1 flex-col items-center justify-center p-3 sm:p-5 text-center bg-white">
                                                <span className="text-[15px] sm:text-[17px] font-bold text-gray-800 transition-colors group-hover:text-amber-700 leading-snug line-clamp-2">
                                                    {child.name}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="col-span-full flex h-full min-h-[200px] items-center justify-center rounded-2xl border-2 border-dashed border-gray-300/50 bg-white/50 py-12 text-base font-medium text-gray-400">
                                        Chưa có phân loại con
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}