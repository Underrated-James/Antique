import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import styles from "./Header.module.css";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function Header({
  showSearchBar = true,
  showItems = true,
  isSeller = false,
  onSearch,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      console.log("🟢 Loaded user from storage:", parsedUser); // DEBUG
      setUser(parsedUser);

      // Fetch profile image if not already stored
      if (
        (parsedUser.customer_id || parsedUser.seller_id) &&
        !parsedUser.profile_pic &&
        !parsedUser.seller_image
      ) {
        const queryParam = parsedUser.customer_id
          ? `customer_id=${parsedUser.customer_id}`
          : `seller_id=${parsedUser.seller_id}`;

        fetch(`${API_URL}/api/header/search?${queryParam}`)
          .then((res) => res.json())
          .then((json) => {
            console.log("🟢 API /api/header/search response:", json); // DEBUG
            if (json.status === "success") {
              const updatedUser = { ...parsedUser };

              if (parsedUser.customer_id && json.profile_pic) {
                updatedUser.profile_pic = json.profile_pic;
              }
              if (
                parsedUser.seller_id &&
                (json.seller_image || json.profile_pic)
              ) {
                // ✅ support both seller_image and profile_pic
                updatedUser.seller_image =
                  json.seller_image || json.profile_pic;
              }

              console.log("🟢 Updated user with image:", updatedUser); // DEBUG
              setUser(updatedUser);
              localStorage.setItem("user", JSON.stringify(updatedUser));
            }
          })
          .catch((err) => {
            console.error("❌ Failed to fetch profile image:", err);
          });
      }
    }
  }, []);

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    onSearch?.(searchTerm);

    if (user?.customer_id) {
      navigate(`/home/${user.customer_id}?q=${encodeURIComponent(searchTerm)}`);
    } else if (user?.seller_id) {
      navigate(`/seller/home/${user.seller_id}?q=${encodeURIComponent(searchTerm)}`);
    } else {
      navigate(`/home?q=${encodeURIComponent(searchTerm)}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearchSubmit();
  };

  const handleNavigation = async (path) => {
    switch (path) {
      case "profile":
        user?.customer_id && navigate(`/profile/${user.customer_id}`);
        break;
      case "store":
        user?.seller_id && navigate(`/store/${user.seller_id}`);
        break;
      case "items":
        user?.customer_id && navigate(`/items/${user.customer_id}`);
        break;
      case "logout":
        if (user?.user_id && user?.role) {
          try {
            await fetch(`${API_URL}/api/logout`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                user_id: user.user_id,
                role: user.role,
              }),
            });
          } catch (err) {
            console.error("Logout failed:", err);
          }
        }
        localStorage.removeItem("user");
        localStorage.removeItem("customer_id");
        localStorage.removeItem("seller_id");
        localStorage.removeItem("history_id");
        navigate("/login");
        break;
      default:
        break;
    }
  };

  const handleLogoClick = () => {
    if (user?.seller_id) navigate(`/seller/home/${user.seller_id}`);
    else if (user?.customer_id) navigate(`/home/${user.customer_id}`);
    else navigate(`/`);
  };

  const isExternalUrl = (url) => {
    return url && (url.startsWith("http://") || url.startsWith("https://"));
  };

  // ✅ Choose correct image depending on role
  let imagePath = null;
  if (user?.customer_id) {
    imagePath = user.profile_pic || null;
  } else if (user?.seller_id) {
    imagePath = user.seller_image || user.profile_pic || null; // fallback
  }

  const profileSrc = imagePath
    ? isExternalUrl(imagePath)
      ? imagePath
      : `${API_URL}/uploads/${imagePath.replace(/^\/?uploads\/?/, "")}`
    : "/profile_icon.png";

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={handleLogoClick}>
        <img
          src="/Vinque_logo.png"
          alt="Vinque Logo"
          className={styles.logoImage}
        />
        <span>Vinque</span>
      </div>

      {showSearchBar && (
        <div className={styles.searchContainer}>
          <input
            type="text"
            className={styles.search}
            placeholder="Search here:"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className={styles.searchBtn} onClick={handleSearchSubmit}>
            <img
              src="/search.png"
              alt="search"
              className={styles.searchIcon}
            />
          </button>
        </div>
      )}

      <div className={styles.profileWrapper}>
        <div className={styles.profile}>
          <img
            src={profileSrc}
            alt="profile icon"
            className={styles.profileIcon}
          />
        </div>
        <div className={styles.dropdown}>
          <ul>
            {!isSeller &&
              user?.customer_id &&
              !location.pathname.includes("profile") && (
                <li onClick={() => handleNavigation("profile")}>Profile</li>
              )}
            {isSeller &&
              user?.seller_id &&
              !location.pathname.includes("store") && (
                <li onClick={() => handleNavigation("store")}>Store</li>
              )}
            {showItems &&
              user?.customer_id &&
              !location.pathname.includes("items") && (
                <li onClick={() => handleNavigation("items")}>Items</li>
              )}
            <li onClick={() => handleNavigation("logout")}>Logout</li>
          </ul>
        </div>
      </div>
    </header>
  );
}
