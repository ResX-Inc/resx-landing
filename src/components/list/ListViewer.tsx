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

function isMobileDevice(): boolean {
  if (typeof window === "undefined") return false;

  const userAgent = navigator.userAgent || navigator.vendor;

  if (/android/i.test(userAgent)) return true;
  if (/iPad|iPhone|iPod/.test(userAgent)) return true;

  const hasTouchScreen =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isSmallScreen = window.innerWidth <= 768;

  return hasTouchScreen && isSmallScreen;
}

export function ListViewer({ userId, cityId, apiBaseUrl }: ListViewerProps) {
  const [data, setData] = useState<PublicListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState<"left" | "right">("right");

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    if (isMobileDevice()) {
      // Include cityId in deep link for city-specific favorites
      const deepLinkUrl = cityId
        ? `resx://list/${userId}?cityId=${cityId}`
        : `resx://list/${userId}`;
      const webFallbackUrl = cityId
        ? `https://resx.co/list/${userId}?cityId=${cityId}`
        : `https://resx.co/list/${userId}`;

      window.location.href = deepLinkUrl;

      setTimeout(() => {
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /android/i.test(navigator.userAgent);

        if (isIOS) {
          window.location.href = "https://apps.apple.com/app/resx/id6470303338";
        } else if (isAndroid) {
          window.location.href =
            "https://play.google.com/store/apps/details?id=com.resx.nyc";
        }
      }, 2500);

      return;
    }

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

        if (listData.favorites.length === 0) {
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

  if (isMobileDevice()) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="flex flex-col items-center gap-4 text-center">
          <h2 className="text-3xl font-medium text-white">
            Opening in ResX App...
          </h2>
          <p className="text-base text-white/50">
            If the app doesn't open automatically, you'll be redirected to
            download it.
          </p>
        </div>
      </div>
    );
  }

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
              <div
                key={restaurant.aliasId || restaurant.id}
                className="border-b border-[#282828] p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="h-[84px] w-[84px] flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                    {restaurant.detail?.logoUrl ||
                    restaurant.detail?.coverUrl ? (
                      <img
                        src={transformImageUrl(
                          restaurant.detail.logoUrl ||
                            restaurant.detail.coverUrl,
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
                          <span className="truncate">
                            {restaurant.cuisineTypes[0]}
                          </span>
                        )}
                    </div>
                  </div>
                </div>
              </div>
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
