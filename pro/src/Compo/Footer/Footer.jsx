import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.css";

export default function Footer() {
  const navigate = useNavigate();
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Show button when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerSection}>
          <h3>About Vinque</h3>
          <p>
            Vinque is your gateway to discovering antiques, collectibles, and
            rare finds from passionate sellers.
          </p>
        </div>

        <div className={styles.footerSection}>
          <h3>Quick Links</h3>
          <ul>
            <li onClick={() => navigate("/login")}>Login</li>
            <li onClick={() => navigate("/signup")}>Signup</li>
          </ul>
        </div>

        <div className={styles.footerSection}>
          <h3>Contact</h3>
          <p>Email: support@vinque.com</p>
          <p>Phone: +63 912 345 6789</p>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <p>© {new Date().getFullYear()} Vinque. All rights reserved.</p>
      </div>

      {/* Scroll To Top */}
      {showScrollTop && (
        <button className={styles.scrollTopBtn} onClick={scrollToTop}>
          ↑
        </button>
      )}
    </footer>
  );
}
