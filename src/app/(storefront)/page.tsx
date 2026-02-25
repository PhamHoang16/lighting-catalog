import Hero from "@/components/storefront/Hero";
import FeaturedCategories from "@/components/storefront/FeaturedCategories";
import LatestProducts from "@/components/storefront/LatestProducts";

export default function HomePage() {
    return (
        <>
            <Hero />
            <FeaturedCategories />
            <LatestProducts />
        </>
    );
}
