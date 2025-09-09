import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../../Compo/Header/Header";
import styles from "./ItemDetailPage.module.css";

export default function ItemDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState("");
  const [viewCount, setViewCount] = useState(0);

  // Track product view
  const trackProductView = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const customer_id = user?.user_id || "1";

      const response = await fetch("/api/track-product-view", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_id: id, customer_id }),
      });

      const data = await response.json();
      if (data.status === "success") setViewCount(data.viewCount || 0);
    } catch (error) {
      console.error("Error tracking product view:", error);
    }
  };

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/item-detail/${id}`);
        const result = await res.json();

        if (result.status === "success") {
          const data = result.data;

          const images = [data.image1_path, data.image2_path, data.image3_path].filter(Boolean);

          setProduct({
            id: data.product_id,
            name: data.product_name,
            price: data.price,
            description: data.description,
            verified: data.verified === 1 || data.verified === "1",
            category: data.category,
            historianName: data.Historian_Name,
            historianType: data.Historian_Type,
            images,
            seller: {
              sellerId: data.seller_id,
              storeName: data.store_name,
              storeImage: data.store_image || "/uploads/Vinque_logo.png",
              storePath: `/store/${data.seller_id}`,
              address: data.business_address,
              description: data.business_description,
            },
          });

          if (images.length > 0) setSelectedImage(images[0]);
        } else {
          console.error(result.message);
        }
      } catch (err) {
        console.error("Failed to fetch item data", err);
      }
    };

    fetchProduct();
  }, [id]);

  // Track views on mount
  useEffect(() => {
    if (id) trackProductView();
  }, [id]);

  const handleImageClick = (img) => setSelectedImage(img);

  const handleSellerClick = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const customer_id = user?.user_id;

    if (!customer_id) {
      alert("You must be logged in as a customer to view store details.");
      return;
    }

    try {
      const visitRes = await fetch("/api/visit-store", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id,
          seller_id: product.seller.sellerId,
        }),
      });

      const visitData = await visitRes.json();
      if (!visitRes.ok) throw new Error(visitData.message || "Visit failed");

      console.log("Visit recorded:", visitData.message);
    } catch (err) {
      console.error("Failed to record visit:", err);
    }

    navigate(product.seller.storePath);
  };

  const handleCheckout = () => navigate(`/checkout/${product.id}`);

  if (!product) return <div className={styles.loading}>Loading...</div>;

  return (
    <>
      <Header showSearchBar={false} isSeller={false} />
      <div className={styles.itemDetailPage}>
        <main className={styles.container}>
          <div className={styles.productDisplay}>
            {selectedImage && (
              <img
                src={selectedImage}
                alt={`Main view of ${product.name}`}
                className={styles.mainProductImage}
              />
            )}
            {product.images.length > 1 && (
              <div className={styles.thumbnailGallery}>
                {product.images.map((img, index) => (
                  <img
                    key={index}
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    className={`${styles.thumbnailImage} ${
                      img === selectedImage ? styles.activeThumbnail : ""
                    }`}
                    onClick={() => handleImageClick(img)}
                    onError={(e) => (e.target.src = "/uploads/Vinque_logo.png")}
                  />
                ))}
              </div>
            )}
          </div>

          <div className={styles.productDetails}>
            <h1>{product.name}</h1>
            <p className={styles.price}>
              ₱{Number(product.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>

            <div className={styles.detailSection}>
              <h4>Category</h4>
              <p>{product.category}</p>
            </div>

            <div className={styles.detailSection}>
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>

            <div className={styles.detailSection}>
              <h4>Verified Status</h4>
              <p>{product.verified ? "Verified" : "Not Verified"}</p>
            </div>

            {product.verified && (
              <>
                <div className={styles.detailSection}>
                  <h5>Historian Name:</h5>
                  <p>{product.historianName || "N/A"}</p>
                </div>
                <div className={styles.detailSection}>
                  <h5>Historian Type:</h5>
                  <p>{product.historianType || "N/A"}</p>
                </div>
              </>
            )}

            <button className={styles.buyButton} onClick={handleCheckout}>
              Check out
            </button>

            <div className={styles.sellerDetails} onClick={handleSellerClick}>
              <h2>Seller Details</h2>
              <h3>Store Name: {product.seller.storeName}</h3>
              <p>Address: {product.seller.address}</p>
              <p>{product.seller.description}</p>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
