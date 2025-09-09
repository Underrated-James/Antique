// frontend/src/Compo/CardItem/CardItem.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../Context/CartContext";
import styles from "./CardItem.module.css";

export default function CardItem({
  data,
  onCardClick,
  showViewCount = false,
  showPurchaseButton = false, // ✅ added default prop
}) {
  const navigate = useNavigate();
  const { addToCart, getItemQuantity } = useCart();
  const isVerified = data?.verified === 1;

  const imageSrc = (() => {
    if (!data?.image1_path) return "/placeholder.jpg";
    const cleanedPath = data.image1_path.startsWith("/uploads/")
      ? data.image1_path
      : `/uploads/${data.image1_path.replace(/^\/+/, "")}`;
    return cleanedPath;
  })();

  const handleCheckout = (e) => {
    e.stopPropagation(); // Prevent card click when clicking add button
    navigate(`/checkout/${data.product_id}`);
  };

  const itemQuantity = getItemQuantity(data.product_id);

  return (
    <div
      className={styles.card}
      onClick={() => onCardClick && onCardClick(data.product_id)}
    >
      <div className={styles.imageContainer}>
        <img className={styles.image} src={imageSrc} alt={data.product_name} />
      </div>
      
      <div className={styles.content}>
        <h3 className={styles.title}>{data?.product_name || "Unnamed Product"}</h3>
        <p className={styles.description}>
          {data?.description
            ? data.description.substring(0, 60) + "..."
            : "High-quality product with premium materials"}
        </p>
        
        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>₱{data?.price || 0}</span>
          {showViewCount && (
            <div className={styles.viewCounter}>
              <img src="/visibility.png" alt="views" className={styles.viewIcon} /> 
              <span className={styles.viewCount}>{data?.view_count || 0}</span>
            </div>
          )}
        </div>

        {/* ✅ Fixed spelling and logic */}
        {showPurchaseButton && ( 
          <button className={styles.addButton} onClick={handleCheckout}>
            Buy
          </button>
        )}
      </div>
    </div>
  );
}
