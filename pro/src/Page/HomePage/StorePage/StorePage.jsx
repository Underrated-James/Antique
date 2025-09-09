import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../Compo/Header/Header";
import CardItem from "../../../Compo/CardItem/CardItem";
import Cart from "../../../Compo/Cart/Cart";
import { useCart } from "../../../Context/CartContext";
import styles from "./StorePage.module.css";

export default function StorePage() {
  const [storeInfo, setStoreInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCurrentUserSeller, setIsCurrentUserSeller] = useState(false);

  const { getTotalItems } = useCart();

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        // Use the correct backend URL
        const backendUrl = 'http://localhost:3000';
        const res = await fetch(`${backendUrl}/api/store/${id}`);
        const json = await res.json();

        if (json.status === "success") {
          setStoreInfo(json.store);
          setItems(json.products);
          setFilteredItems(json.products);

          const uniqueCategories = [
            ...new Set(json.products.map((item) => item.category)),
          ];
          setCategories(uniqueCategories);
          
          // Check if current user is the seller of this store
          const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
          if (currentUser && currentUser.seller_id && currentUser.seller_id.toString() === id) {
            setIsCurrentUserSeller(true);
          }
        } else {
          console.error("Failed to load store data");
        }
      } catch (error) {
        console.error("Error fetching store data:", error);
      }
    };

    fetchStoreData();
  }, [id]);

  const handleCardClick = (productId) => {
    navigate(`/item-detail/${productId}`);
  };
  
  const handleEditProfile = () => {
    console.log("Edit Profile button clicked");
    const sellerId = storeInfo?.seller_id || id; // Use storeInfo.seller_id if available, otherwise fall back to id
    console.log("Navigating to edit profile with seller ID from URL:", id);
    console.log("Navigating to edit profile with seller ID from storeInfo:", sellerId);
    navigate(`/seller/edit-profile/${sellerId}`);
  };

  const filterByCategory = (category) => {
    setActiveCategory(category);
    if (category === "All") {
      setFilteredItems(items);
    } else {
      setFilteredItems(items.filter((item) => item.category === category));
    }
  };

  if (!storeInfo) {
    return <div className={styles.loading}>Loading store...</div>;
  }

  // Use seller image if available, otherwise use Gmail profile picture or default logo
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  let imageSrc;
  
  if (storeInfo.seller_image && storeInfo.seller_image.startsWith('http')) {
     // If it's a URL (like Gmail profile picture)
     imageSrc = storeInfo.seller_image;
   } else if (storeInfo.seller_image) {
     // If it's a file path from our uploads
     // Check if it already has the full path
     if (storeInfo.seller_image.startsWith('/uploads/')) {
       imageSrc = `http://localhost:3000${storeInfo.seller_image}`;
     } else {
       imageSrc = `http://localhost:3000/uploads/${storeInfo.seller_image}`;
     }
   } else if (user.picture && isCurrentUserSeller) {
     // Fallback to user's Gmail picture if they're the seller
     imageSrc = user.picture;
   } else {
     // Default logo as last resort
     imageSrc = "/Vinque_logo.png";
   }

  return (
    <>
      <Header showItems={true} showSearchBar={false} />
      <div className={styles.storePage}>
        <div className={styles.storeHeader}>
          {isCurrentUserSeller && (
            <button onClick={handleEditProfile} className={styles.editProfileBtn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11l.178-.178z"/>
              </svg>
              Edit Profile
            </button>
          )}
          <div className={styles.profileWrapper}>
            <div className={styles.profileContainer}>
              <img
                src={imageSrc}
                alt="Store profile"
                className={styles.profileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  // If image fails, use default logo
                  e.target.src = "/Vinque_logo.png";
                }}
              />
            </div>

            {/* Verified Badge (Twitter-like checkmark) */}
            <div className={styles.verifiedBadge} title="Verified Seller">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="white"
                width="16"
                height="16"
              >
                <path d="M9 16.2l-3.5-3.5L4 14.2 9 19l12-12-1.5-1.5z" />
              </svg>
            </div>
          </div>

          <div className={styles.storeInfo}>
            <h2>{storeInfo.business_name}</h2>
            <p className={styles.tagline}>
              {storeInfo.business_description ? storeInfo.business_description : "Your trusted vintage seller."}
            </p>
            <div className={styles.metaInfo}>
              {storeInfo.business_address && (
                <span className={styles.location}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2ZM12 11.5C10.62 11.5 9.5 10.38 9.5 9C9.5 7.62 10.62 6.5 12 6.5C13.38 6.5 14.5 7.62 14.5 9C14.5 10.38 13.38 11.5 12 11.5Z"
                      fill="currentColor"
                    />
                  </svg>
                  {storeInfo.business_address}
                </span>
              )}
              <span className={styles.productsCount}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M20 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 18H4V12H20V18ZM20 8H4V6H20V8Z"
                    fill="currentColor"
                  />
                </svg>
                {storeInfo.total_products} Products
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter */}
        <div className={styles.categoryContainer}>
          <div className={styles.categoryButtons}>
            <button
              className={`${styles.categoryBtn} ${
                activeCategory === "All" ? styles.active : ""
              }`}
              onClick={() => filterByCategory("All")}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`${styles.categoryBtn} ${
                  activeCategory === cat ? styles.active : ""
                }`}
                onClick={() => filterByCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className={styles.productsGrid}>
          {filteredItems.map((item) => (
            <CardItem
              key={item.product_id}
              data={item}
              onCardClick={() => handleCardClick(item.product_id)}
            />
          ))}
        </div>
      </div>
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        
    </>
  );
}
