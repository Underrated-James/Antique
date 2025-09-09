import { useNavigate } from 'react-router-dom';
import styles from './NavTabs.module.css';

export default function NavTabs({ activeTab, customerId }) {
  const navigate = useNavigate();

  return (
    <div className={styles.navTabs}>
      <button 
        className={`${styles.navTab} ${activeTab === 'home' ? styles.active : ''}`}
        onClick={() => navigate(`/home/${customerId}`)}
      >
        Home
      </button>
      <button 
        className={`${styles.navTab} ${activeTab === 'shop' ? styles.active : ''}`}
        onClick={() => navigate(`/shop/${customerId}`)}
      >
        Shop
      </button>
      <button 
        className={`${styles.navTab} ${activeTab === 'about' ? styles.active : ''}`}
        onClick={() => navigate(`/about/${customerId}`)}
      >
        About
      </button>
    </div>
  );
}