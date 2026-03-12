import { Loader2 } from "lucide-react";

export default function Loading() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
                {/* Vòng ngoài mờ */}
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20" />
                {/* Vòng xoay */}
                <div className="absolute inset-0 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
                {/* Icon ở giữa */}
                <Loader2 className="h-8 w-8 animate-pulse text-amber-600" />
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-lg font-bold text-gray-800">Đang tải dữ liệu</p>
                <p className="text-sm text-gray-500">Vui lòng đợi trong giây lát...</p>
            </div>
        </div>
    );
}
