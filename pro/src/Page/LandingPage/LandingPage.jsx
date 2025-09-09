import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LandingPage.module.css";
import CardItem from "../../Compo/CardItem/CardItem";
import Footer from "../../Compo/Footer/Footer";

export default function LandingPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const cardRefs = useRef([]);
  const [loading, setLoading] = useState(true);
  const [heroVisible, setHeroVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Use this path if videostore.mp4 is in your public/static folder
  const videoPath = "/videostore.mp4";

  // Hero animate on mount
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  // Fetch products (kept your logic)
  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:3000/api/card-item-all");
        const result = await res.json();
        if (result.status === "success") {
          const allProducts = result.data || [];
          const randomProducts = [];
          if (allProducts.length > 0) {
            const numToShow = Math.min(5, allProducts.length);
            const productsCopy = [...allProducts];
            for (let i = 0; i < numToShow; i++) {
              const randomIndex = Math.floor(Math.random() * productsCopy.length);
              randomProducts.push(productsCopy[randomIndex]);
              productsCopy.splice(randomIndex, 1);
            }
          }
          setItems(randomProducts);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  // Card animation with IntersectionObserver
  useEffect(() => {
    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add(styles.showCard);
              observer.unobserve(entry.target); // animate once
            }
          });
        },
        { threshold: 0.1 }
      );
      cardRefs.current.forEach((c) => c && observer.observe(c));
      return () => observer.disconnect();
    }
  }, [items]);

  // Show scroll-to-top button
  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Debug: check availability of the video (HEAD)
  useEffect(() => {
    const checkVideo = async () => {
      try {
        const r = await fetch(videoPath, { method: "HEAD" });
        console.log("Video HEAD response status:", r.status);
      } catch (err) {
        console.warn("Video HEAD request failed (may be cross-origin):", err);
      }
    };
    checkVideo();
  }, [videoPath]);

  const handleVideoError = (e) => {
    console.error("Video playback error:", e);
  };
  const handleVideoLoaded = () => console.log("Video loaded -> onLoadedData fired");

  return (
    <main className={styles.landingPage}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo} onClick={() => navigate("/")}>
          <img src="/Vinque_logo.png" alt="Vinque" />
        </div>
        <nav className={styles.nav}>
          <button onClick={() => navigate("/login")}>Login</button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className={`${styles.hero} ${heroVisible ? styles.showHero : ""}`}>
        <video
          className={styles.heroVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={handleVideoLoaded}
          onError={handleVideoError}
          // controls // <-- uncomment while debugging so you can manually play
        >
          <source src={videoPath} type="video/mp4" />
          Your browser doesn't support the video tag.
        </video>

        {/* optional overlay so text is readable */}
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <h1>Welcome to Vinque</h1>
          <p>Purchase your past with timeless treasures</p>
          <button onClick={() => navigate("/login")}>Get Started</button>
        </div>
      </section>

      {/* Featured Products */}
      <section className={styles.cardSection}>
        <h2 className={styles.sectionTitle}>Featured Products</h2>

        {loading ? (
          <p className={styles.loadingText}>Loading items...</p>
        ) : items.length === 0 ? (
          <p className={styles.loadingText}>No items found.</p>
        ) : (
          <div className={styles.grid}>
            {items.map((item, idx) => (
              <div
                key={item.product_id || idx}
                className={styles.cardItem}
                ref={(el) => (cardRefs.current[idx] = el)}
              >
                <CardItem data={item} onCardClick={() => navigate("/signup")} />
              </div>
            ))}
          </div>
        )}
      </section>

      {showScrollTop && (
        <button className={styles.scrollTopBtn} onClick={scrollToTop}>
          ↑
        </button>
      )}

      <Footer />
    </main>
  );
}
