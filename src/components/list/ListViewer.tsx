import { useEffect, useState } from "react";

interface Restaurant {
  id: number;
  aliasId: string;
  name: string;
  detail?: {
    logoUrl?: string;
    coverUrl?: string;
  };
  rating?: {
    rating: number;
  };
  location?: {
    address?: string;
    city?: {
      id: number;
      name: string;
    };
  };
  cuisineTypes?: string[];
}

interface PublicListData {
  userName: string;
  favorites: Restaurant[];
  total: number;
}

interface ListViewerProps {
  userId: string;
  cityId?: string;
  apiBaseUrl: string;
}

// Transform image URLs that start with "uploads/" to use CloudFront
const transformImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return "";

  // If URL starts with "uploads/", prepend CloudFront domain
  if (imageUrl.startsWith("uploads/")) {
    // Use environment variable or fall back to staging
    const cloudfrontDomain =
      import.meta.env.PUBLIC_CLOUDFRONT_DOMAIN ||
      "on-resx-staging-media.uruguay-staging.tech";
    return `https://${cloudfrontDomain}/${imageUrl}`;
  }

  return imageUrl;
};

function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 768;
}

const ResXLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="103"
    height="28"
    fill="none"
    viewBox="0 0 619 170"
  >
    <path
      stroke="#fff"
      strokeWidth="1"
      strokeOpacity="0.2"
      fill="url(#resx-fill-mobile)"
      d="m543.9 84.211-3.1-3.2 31.4-37.8c8 4.6 18.6 3.9 25.8-1.9 8.6-6.9 11.2-18.9 6.3-28.6-.1-.2-.2-.3-.3-.5 0-.1-.1-.1-.1-.2-4.5-8.3-14.1-13.1-23.3-11.8-9.6 1.3-17.5 8.6-19.5 18.1-1.5 6.9.4 14.2 5 19.8l-30.9 37.2-3.6-3.7-53.3-56.6c-5.8-6.2-14-9.7-22.5-9.7h-11.7l74.5 79.3 4.7 5-59.5 71.7c-1.6 2-.9 4.3.6 5.6 1.5 1.3 3.9 1.5 5.6-.4l5.3-6.3 11.1 9.2.4-15.5 15.2-3.2-11.1-9.2 38-45.8 2.1 2.3 50.6 53.9c7.8 8.3 18.8 13.1 30.2 13.1h7.1l-75-80.8Zm24.6-61.9c.4-6.5 4.9-12.1 11.2-13.8.8-.2 1.6-.4 2.5-.5 5.8-.5 11.6 2.5 14.8 7.9 3.3 6.7 1.9 14.2-3.8 18.9-1.4 1.2-3.1 2.1-4.9 2.6-11.1 3.4-20.3-5.7-19.8-15.1Zm-464.1 45.9c0-19.5-15.8-30.6-37.9-30.6H0v99.1h2.5c5.3 0 9.6-4.3 9.6-9.6v-28.4h47.1l26.1 30.1c4.3 5 10.5 7.8 17.1 7.8h5.2l-33.8-38.4c18.2-2 30.6-12.8 30.6-30Zm-92.5 19.5v-39.1h53.8c16 0 26.6 6.1 26.6 19.5s-10.6 19.5-26.6 19.5H11.9v.1Zm243.8 49h-95.8v-99.1h94.4c0 6.1-4.9 11-11 11h-71.5v32.1h64.4c3 0 5.5 2.5 5.5 5.5s-2.5 5.5-5.5 5.5h-64.4v33.8h72.9c6.1.1 11 5.1 11 11.2Zm160.5-28.7c0 18.3-18.5 31.7-50.8 31.7-21.7 0-42.5-6.8-57.9-20.4 4.5-4.8 11.8-5.6 17.4-2 12.1 7.9 25.4 11.4 41.2 11.4 23.9 0 37.9-7.5 37.9-19.8 0-12-14.6-15-41.3-17.3-26.5-2.3-51.8-8.1-51.8-27.6 0-18.7 23.5-29.3 50-29.3 21.5 0 39.2 7.5 50.7 17.7-5 4.3-12.2 4.8-17.8 1.4-8.9-5.2-20-8-32.3-8.1-17.7-.1-38.4 4.8-38.4 17.8 0 12.3 18.7 14.9 42 16.7 30.2 2.4 51.1 8.2 51.1 27.8Z"
    />
    <defs>
      <linearGradient
        id="resx-fill-mobile"
        x1="-.014"
        x2="618.907"
        y1="84.503"
        y2="84.503"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#6C2D16" />
        <stop offset=".169" stopColor="#B87C54" />
        <stop offset=".211" stopColor="#CE9468" />
        <stop offset=".451" stopColor="#844729" />
        <stop offset=".64" stopColor="#D69C6F" />
        <stop offset=".78" stopColor="#925D34" />
        <stop offset="1" stopColor="#6C2D16" />
      </linearGradient>
    </defs>
  </svg>
);

export function ListViewer({ userId, cityId, apiBaseUrl }: ListViewerProps) {
  const [data, setData] = useState<PublicListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [isMobile, setIsMobile] = useState(false);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const checkMobile = () => setIsMobile(isMobileViewport());
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const fetchList = async () => {
      try {
        // Build URL with optional cityId for city-specific filtering
        const url = cityId
          ? `${apiBaseUrl}/api/favorites/public/${userId}?cityId=${cityId}`
          : `${apiBaseUrl}/api/favorites/public/${userId}`;

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(
            response.status === 404 ? "List not found" : "Failed to load list",
          );
        }

        const listData = await response.json();
        setData(listData);

        const userNameElement = document.getElementById("user-name");
        const restaurantCountElement =
          document.getElementById("restaurant-count");
        const titleContainer = document.getElementById("title-container");
        const titleHeading = document.getElementById("title-heading");
        const restaurantSubtitle = document.getElementById(
          "restaurant-subtitle",
        );
        const divider1 = document.getElementById("divider-1");

        const isMobileView = isMobileViewport();

        if (listData.favorites.length === 0 || isMobileView) {
          if (titleContainer) titleContainer.style.display = "none";
          if (divider1) divider1.style.display = "none";
        } else {
          if (titleContainer) titleContainer.style.display = "block";
          if (divider1) divider1.style.display = "block";

          if (userNameElement) {
            userNameElement.textContent = listData.userName;
          }

          if (restaurantCountElement) {
            const count = listData.total;
            restaurantCountElement.textContent = `${count} ${count === 1 ? "Restaurant" : "Restaurants"}`;
          }

          // Animate in the title after data is loaded
          if (titleContainer) {
            titleContainer.classList.remove("opacity-0");
            titleContainer.classList.add(
              "animate-in",
              "fill-mode-both",
              "fade-in",
            );
          }
          if (titleHeading) {
            titleHeading.classList.add(
              "animate-in",
              "fill-mode-both",
              "blur-in-sm",
              "slide-in-from-left-3",
              "fade-in",
              "delay-100",
              "duration-1000",
              "ease-out",
            );
          }
          if (restaurantSubtitle) {
            restaurantSubtitle.classList.add(
              "animate-in",
              "fill-mode-both",
              "fade-in",
              "delay-200",
              "duration-1000",
              "ease-out",
            );
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");

        const titleContainer = document.getElementById("title-container");
        const divider1 = document.getElementById("divider-1");
        if (titleContainer) titleContainer.style.display = "none";
        if (divider1) divider1.style.display = "none";
      } finally {
        setLoading(false);
      }
    };

    fetchList();
  }, [userId, cityId, apiBaseUrl]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg text-white/50">Loading...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-8">
        <div className="flex max-w-md flex-col items-center gap-4 text-center">
          <h2 className="mb-2 text-2xl font-medium text-white">
            List Not Available
          </h2>
          <p className="text-base leading-relaxed text-white/60">
            This list may have been removed, made private, or doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(data.favorites.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentRestaurants = data.favorites.slice(startIndex, endIndex);

  const changePage = (newPage: number, newDirection: "left" | "right") => {
    setDirection(newDirection);
    setIsAnimating(true);

    window.scrollTo({ top: 0, behavior: "smooth" });

    setTimeout(() => {
      setCurrentPage(newPage);
      setIsAnimating(false);
    }, 500);
  };

  const handlePreviousPage = () => {
    const newPage = Math.max(currentPage - 1, 1);
    if (newPage !== currentPage) {
      changePage(newPage, "left");
    }
  };

  const handleNextPage = () => {
    const newPage = Math.min(currentPage + 1, totalPages);
    if (newPage !== currentPage) {
      changePage(newPage, "right");
    }
  };

  const handlePageClick = (page: number) => {
    if (page !== currentPage) {
      const newDirection = page > currentPage ? "right" : "left";
      changePage(page, newDirection);
    }
  };

  const handleDownloadClick = () => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) {
      window.location.href = "https://apps.apple.com/app/resx/id6470303338";
    } else {
      window.location.href =
        "https://play.google.com/store/apps/details?id=com.resx.nyc";
    }
  };

  const RestaurantCard = ({ restaurant }: { restaurant: Restaurant }) => (
    <div className="border-b border-[#282828] p-4">
      <div className="flex items-center gap-4">
        <div className="h-[84px] w-[84px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
          {restaurant.detail?.logoUrl || restaurant.detail?.coverUrl ? (
            <img
              src={transformImageUrl(
                restaurant.detail.logoUrl || restaurant.detail.coverUrl,
              )}
              alt={restaurant.name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gray-700" />
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-[6px]">
          <h3 className="truncate text-base leading-4 font-[860] text-white">
            {restaurant.name}
          </h3>

          {restaurant.location?.address && (
            <p className="truncate text-xs leading-[18px] text-[#d1d1d1]">
              {restaurant.location.address}
            </p>
          )}

          <div className="flex items-start gap-1 text-xs leading-[18px] text-[#d1d1d1]">
            {restaurant.rating?.rating && (
              <>
                <span>★ {restaurant.rating.rating.toFixed(1)}</span>
                {restaurant.cuisineTypes &&
                  restaurant.cuisineTypes.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="truncate">
                        {restaurant.cuisineTypes[0]}
                      </span>
                    </>
                  )}
              </>
            )}
            {!restaurant.rating?.rating &&
              restaurant.cuisineTypes &&
              restaurant.cuisineTypes.length > 0 && (
                <span className="truncate">{restaurant.cuisineTypes[0]}</span>
              )}
          </div>
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="relative min-h-screen bg-[#191919] px-4 pt-30 pb-8">
        {/* Mobile Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-medium text-white">
              {data.userName}'s Favorites
            </h1>
            <p className="mt-1 text-sm text-white/50">
              {data.total} {data.total === 1 ? "restaurant" : "restaurants"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ResXLogo />
            <button
              onClick={handleDownloadClick}
              className="flex items-center justify-center gap-2 rounded-full border border-[#FFD9A1] bg-[#FFD9A1] px-3 py-2 text-sm font-medium text-black"
              style={{ width: "129px" }}
            >
              Download now
            </button>
          </div>
        </div>

        {/* Restaurant List */}
        {data.favorites.length === 0 ? (
          <div className="flex min-h-[50vh] items-center justify-center p-8">
            <div className="flex max-w-md flex-col items-center gap-4 text-center">
              <h2 className="mb-2 text-2xl font-medium text-white">
                No Favorites Yet
              </h2>
              <p className="text-base leading-relaxed text-white/60">
                This user hasn't added any favorite restaurants to their list
                yet.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col">
            {data.favorites.map((restaurant) => (
              <RestaurantCard
                key={restaurant.aliasId || restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden px-4 pt-16 pb-32">
      {data.favorites.length === 0 ? (
        <div className="flex min-h-[50vh] items-center justify-center p-8">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <h2 className="mb-2 text-2xl font-medium text-white">
              No Favorites Yet
            </h2>
            <p className="text-base leading-relaxed text-white/60">
              This user hasn't added any favorite restaurants to their list yet.
            </p>
          </div>
        </div>
      ) : (
        <>
          <div
            className={`mx-auto grid max-w-[1240px] grid-cols-1 gap-x-10 gap-y-1 transition-all duration-500 ease-in-out md:grid-cols-2 lg:grid-cols-3 ${
              isAnimating
                ? direction === "right"
                  ? "-translate-x-12 opacity-0"
                  : "translate-x-12 opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            {currentRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.aliasId || restaurant.id}
                restaurant={restaurant}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-4">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="text-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => handlePageClick(page)}
                      className={`flex h-[32px] min-w-[32px] items-center justify-center rounded text-sm ${
                        currentPage === page
                          ? "font-medium text-white"
                          : "text-white/50 hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-white/50 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
