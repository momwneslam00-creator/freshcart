import HomeSlider from "@/components/HomeSlider";
import { BrandsSection, CategoriesSection, FeaturedProducts } from "@/components/HomeSections";

export default function HomePage() {
  return (
    <>
      <HomeSlider />
      <CategoriesSection />
      <FeaturedProducts />
      <BrandsSection />
    </>
  );
}
