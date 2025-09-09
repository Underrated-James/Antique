import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../../Compo/Header/Header";
import styles from "./SellerEditProfile.module.css";

function SellerEditProfile() {
  const [businessName, setBusinessName] = useState("");
  const [businessDescription, setBusinessDescription] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [phoneNum, setPhoneNum] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const formRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  const { id: sellerId } = useParams();

  // Get user from localStorage safely
  let user = {};
  try { user = JSON.parse(localStorage.getItem("user")) || {}; } catch { user = {}; }

  // Fetch seller data
  useEffect(() => {
    const fetchSellerData = async () => {
      setLoadingData(true);
      try {
        if (!sellerId) throw new Error("Missing seller ID");
        const res = await fetch(`http://localhost:3000/api/seller/${sellerId}`);
        const data = await res.json();
        if (data.status === "success" && data.seller) {
          const s = data.seller;
          setBusinessName(s.business_name || "");
          setBusinessDescription(s.business_description || "");
          setBusinessAddress(s.business_address || "");
          setPhoneNum(s.phone_num || "");

          // Show current image first
          if (s.seller_image) {
            const imgPath = s.seller_image.startsWith("/uploads/")
              ? `http://localhost:3000${s.seller_image}`
              : `http://localhost:3000/uploads/${s.seller_image}`;
            setProfileImagePreview(imgPath);
          } else if (user.picture) {
            setProfileImagePreview(user.picture);
          } else {
            setProfileImagePreview(null);
          }
        } else {
          setError(data.message || "Failed to fetch data");
        }
      } catch (err) {
        setError(err.message || "Network error");
      } finally {
        setLoadingData(false);
      }
    };
    fetchSellerData();
  }, [sellerId]);

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return alert("Image must be <5MB");

    if (profileImagePreview?.startsWith("blob:")) URL.revokeObjectURL(profileImagePreview);
    setProfileImagePreview(URL.createObjectURL(file));
    setProfileImage(file);
  };

  const handleImageClick = () => fileInputRef.current?.click();

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!businessName.trim()) return alert("Business name required");

    const formData = new FormData();
    formData.append("business_name", businessName.trim());
    formData.append("business_description", businessDescription || "");
    formData.append("business_address", businessAddress || "");
    formData.append("phone_num", phoneNum || "");

    // Handle profile image
    if (!profileImage && user?.picture && profileImagePreview === user.picture) {
      formData.append("profile_pic_url", user.picture);
    } else if (profileImage) {
      formData.append("profile_image", profileImage);
    }

    try {
      setSubmitting(true);
      const res = await fetch(`http://localhost:3000/api/seller/update/${sellerId}`, {
        method: "PUT",
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        alert(result.message || "Profile updated successfully!");
        navigate(`/store/${sellerId}`);
      } else alert(result.error || "Update failed");
    } catch (err) {
      alert(err.message || "Network error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header showSearchBar={false} showItems={false} isSeller />
      <div className={styles.container}>
        <main className={styles.content}>
          {loadingData ? (
            <div className={styles.loading}><p>Loading profile...</p></div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : (
            <form ref={formRef} className={styles.editProfileForm} onSubmit={handleSubmit}>
              <h2 className={styles.mainHeading}>Edit Store</h2>

              <div className={styles.profileImageSection}>
                <div className={styles.profileImageContainer} onClick={handleImageClick}>
                  {profileImagePreview ? (
                    <img src={profileImagePreview} alt="Store" className={styles.profileImage} />
                  ) : (
                    <div className={styles.uploadPlaceholder}>Upload Image</div>
                  )}
                  <div className={styles.changePhotoText}>Change Photo</div>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className={styles.storeInfoSection}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Business Name *</label>
                  <input className={styles.formInput} value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Business Description</label>
                  <textarea className={styles.formTextarea} rows={4} value={businessDescription} onChange={(e) => setBusinessDescription(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Business Address</label>
                  <input className={styles.formInput} value={businessAddress} onChange={(e) => setBusinessAddress(e.target.value)} />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Phone Number</label>
                  <input className={styles.formInput} value={phoneNum} onChange={(e) => setPhoneNum(e.target.value)} />
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.saveButton} disabled={submitting}>{submitting ? "Saving..." : "Save Changes"}</button>
                <button type="button" className={styles.cancelButton} onClick={() => navigate(`/store/${sellerId}`)} disabled={submitting}>Cancel</button>
              </div>
            </form>
          )}
        </main>
      </div>
    </>
  );
}

export default SellerEditProfile;
