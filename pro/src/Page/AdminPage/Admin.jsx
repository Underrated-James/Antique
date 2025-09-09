import { useState, useEffect } from "react";
import styles from "./Admin.module.css";
import Header from "../../Compo/Header/Header";

const API_URL = import.meta.env.VITE_BACKEND_URL || "";

export default function AdminPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [loginHistory, setLoginHistory] = useState([]);
  const [purchaseHistory, setPurchaseHistory] = useState([]);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [activeSection, setActiveSection] = useState("dashboard");

  useEffect(() => {
    const fetchLoginHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/A_History`);
        const data = await res.json();
        if (data.status === "success") setLoginHistory(data.data);
      } catch (err) {
        console.error("Failed to fetch login history:", err);
      }
    };

    const fetchPurchaseHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/purchases`);
        const data = await res.json();
        if (data.status === "success") setPurchaseHistory(data.data);
      } catch (err) {
        console.error("Failed to fetch purchase history:", err);
      }
    };

    const fetchPendingSellers = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/pending-sellers`);
        const data = await res.json();
        if (data.status === "success") setPendingSellers(data.data);
      } catch (err) {
        console.error("Failed to fetch pending sellers:", err);
      }
    };

    fetchLoginHistory();
    fetchPurchaseHistory();
    fetchPendingSellers();
  }, []);

  const filteredLogin = loginHistory.filter((entry) =>
    Object.values(entry).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const filteredPurchases = purchaseHistory.filter((entry) =>
    Object.values(entry).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleApproveSeller = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/approve-seller/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.status === "success") {
        setPendingSellers((prev) =>
          prev.filter((seller) => seller.user_id !== userId)
        );
        alert("Seller approved successfully!");
      }
    } catch (err) {
      console.error("Error approving seller:", err);
    }
  };

  const handleRejectSeller = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/api/admin/reject-seller/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.status === "success") {
        setPendingSellers((prev) =>
          prev.filter((seller) => seller.user_id !== userId)
        );
        alert("Seller rejected successfully!");
      }
    } catch (err) {
      console.error("Error rejecting seller:", err);
    }
  };

  // Stats
  const totalUsers = loginHistory.length;
  const activeUsers = loginHistory.filter(
    (user) => user.logout === "0000-00-00 00:00:00"
  ).length;
  const totalPurchases = purchaseHistory.length;
  const customerCount = loginHistory.filter(
    (user) => user.role === "Customer"
  ).length;
  const sellerCount = loginHistory.filter(
    (user) => user.role === "Seller"
  ).length;

  return (
    <>
      {/* Shared Header */}
      <Header isSeller={false} showSearchBar={false} />

      <div className={styles.adminContainer}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navItem} ${
                activeSection === "dashboard" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              <i className="bi bi-house-door"></i> Dashboard
            </button>
            <button
              className={`${styles.navItem} ${
                activeSection === "users" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("users")}
            >
              <i className="bi bi-people"></i> User Management
            </button>
            <button
              className={`${styles.navItem} ${
                activeSection === "purchases" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("purchases")}
            >
              <i className="bi bi-cart-check"></i> Purchases
            </button>
            <button
              className={`${styles.navItem} ${
                activeSection === "analytics" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("analytics")}
            >
              <i className="bi bi-graph-up"></i> Analytics
            </button>
            <button
              className={`${styles.navItem} ${
                activeSection === "pending-sellers" ? styles.active : ""
              }`}
              onClick={() => setActiveSection("pending-sellers")}
            >
              <i className="bi bi-person-plus"></i> Pending Sellers
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.content}>
          {activeSection === "dashboard" && (
            <>
              <div className={styles.pageHeader}>
                <h1>Admin Dashboard</h1>
                <p>Overview of platform activity</p>
              </div>
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <i className="bi bi-people"></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>{totalUsers}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <i className="bi bi-person-check"></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>{activeUsers}</h3>
                    <p>Active Users</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <i className="bi bi-cart-check"></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>{totalPurchases}</h3>
                    <p>Total Purchases</p>
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statIcon}>
                    <i className="bi bi-shop"></i>
                  </div>
                  <div className={styles.statContent}>
                    <h3>{sellerCount}</h3>
                    <p>Sellers</p>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "users" && (
            <>
              <div className={styles.pageHeader}>
                <h1>User Management</h1>
                <p>Manage user accounts and login history</p>
              </div>

              <div className={styles.searchBar}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <i className="bi bi-person-lines-fill"></i>
                  Login/Logout History
                </h2>
                <div className={styles.tableContainer}>
                  <div className={styles.table}>
                    <div className={styles.tableHeader}>
                      <div>User ID</div>
                      <div>First Name</div>
                      <div>Last Name</div>
                      <div>Role</div>
                      <div>Login</div>
                      <div>Logout</div>
                    </div>
                    <div className={styles.scrollableTable}>
                      {filteredLogin.map((user, index) => (
                        <div key={index} className={styles.tableRow}>
                          <div>{user.user_id}</div>
                          <div>{user.firstName}</div>
                          <div>{user.lastName}</div>
                          <div>
                            <span
                              className={`${styles.roleBadge} ${
                                styles[user.role?.toLowerCase()]
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                          <div>{user.login}</div>
                          <div>
                            {user.logout === "0000-00-00 00:00:00" ? (
                              <span className={styles.onlineBadge}>Online</span>
                            ) : (
                              user.logout
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "purchases" && (
            <>
              <div className={styles.pageHeader}>
                <h1>Purchase History</h1>
                <p>Track all purchase transactions</p>
              </div>

              <div className={styles.searchBar}>
                <i className="bi bi-search"></i>
                <input
                  type="text"
                  placeholder="Search purchases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>
                  <i className="bi bi-cart-check"></i>
                  Purchase Transactions
                </h2>
                <div className={styles.tableContainer}>
                  <div className={styles.table}>
                    <div className={styles.tableHeader}>
                      <div>Product ID</div>
                      <div>Item Name</div>
                      <div>Buyer</div>
                      <div>Purchase Date</div>
                      <div>Business Name</div>
                      <div>Business Address</div>
                    </div>
                    <div className={styles.scrollableTable}>
                      {filteredPurchases.map((item, index) => (
                        <div key={index} className={styles.tableRow}>
                          <div>{item.productId}</div>
                          <div>{item.itemName}</div>
                          <div>{item.buyer}</div>
                          <div>{item.date}</div>
                          <div>{item.businessName}</div>
                          <div>{item.businessAddress}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "analytics" && (
            <>
              <div className={styles.pageHeader}>
                <h1>Analytics</h1>
                <p>System performance and user insights</p>
              </div>

              <div className={styles.analyticsGrid}>
                <div className={styles.analyticsCard}>
                  <h3>User Distribution</h3>
                  <div className={styles.chartPlaceholder}>
                    <div className={styles.userStats}>
                      <div className={styles.userStat}>
                        <span className={styles.statLabel}>Customers</span>
                        <span className={styles.statValue}>{customerCount}</span>
                      </div>
                      <div className={styles.userStat}>
                        <span className={styles.statLabel}>Sellers</span>
                        <span className={styles.statValue}>{sellerCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles.analyticsCard}>
                  <h3>System Activity</h3>
                  <div className={styles.chartPlaceholder}>
                    <div className={styles.activityStats}>
                      <p>Total Logins: {totalUsers}</p>
                      <p>Active Sessions: {activeUsers}</p>
                      <p>Purchase Activity: {totalPurchases}</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeSection === "pending-sellers" && (
            <>
                          <div className={styles.pageHeader}>
                            <h1>Pending Seller Accounts</h1>
                            <p>Review and approve seller account applications</p>
                          </div>
                          
                          <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>
                              <i className="bi bi-person-plus"></i>
                              Seller Applications
                            </h2>
                            <div className={styles.sellerApplicationsContainer}>
                              {pendingSellers.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '20px', color: '#666'}}>
                                  No pending seller applications
                                </div>
                              ) : (
                                <div className={styles.sellerCardsGrid}>
                                  {pendingSellers.map((seller) => (
                                    <div key={seller.user_id} className={styles.sellerCard}>
                                      <div className={styles.sellerCardHeader}>
                                        <h3>{seller.business_name}</h3>
                                        <span className={`${styles.roleBadge} ${styles.pending}`}>
                                          {seller.approval_status}
                                        </span>
                                      </div>
                                      <div className={styles.sellerCardContent}>
                                        <div className={styles.sellerCardRow}>
                                          <span className={styles.sellerCardLabel}>Application ID:</span>
                                          <span>{seller.user_id}</span>
                                        </div>
                                        <div className={styles.sellerCardRow}>
                                          <span className={styles.sellerCardLabel}>Owner:</span>
                                          <span>{seller.First_name} {seller.Last_name}</span>
                                        </div>
                                        <div className={styles.sellerCardRow}>
                                          <span className={styles.sellerCardLabel}>Email:</span>
                                          <span>{seller.email}</span>
                                        </div>
                                        <div className={styles.sellerCardRow}>
                                          <span className={styles.sellerCardLabel}>Phone:</span>
                                          <span>{seller.phone_num}</span>
                                        </div>
                                        <div className={styles.sellerCardRow}>
                                          <span className={styles.sellerCardLabel}>PayPal Number:</span>
                                          <span>{seller.paypal_number || 'N/A'}</span>
                                        </div>
                                        <div className={styles.sellerCardRow}>
                                          <span className={styles.sellerCardLabel}>Business Permit:</span>
                                          {seller.business_permit ? (
                                            <a 
                                              href={`${import.meta.env.VITE_API_URL || ''}/uploads/${seller.business_permit}`} 
                                              target="_blank" 
                                              rel="noopener noreferrer"
                                              className={styles.viewPermitLink}
                                            >
                                              View Permit (Account)
                                            </a>
                                          ) : 'N/A'}
                                          {seller.business_permit_file && seller.business_permit_file !== seller.business_permit && (
                                            <>
                                              <br />
                                              <a 
                                                href={`${import.meta.env.VITE_API_URL || ''}/uploads/${seller.business_permit_file}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className={styles.viewPermitLink}
                                                style={{ marginTop: '5px', display: 'inline-block' }}
                                              >
                                                View Permit (Seller)
                                              </a>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                      <div className={styles.sellerCardActions}>
                                        <button 
                                          className={styles.approveBtn}
                                          onClick={() => handleApproveSeller(seller.user_id)}
                                        >
                                          Approve
                                        </button>
                                        <button 
                                          className={styles.rejectBtn}
                                          onClick={() => handleRejectSeller(seller.user_id)}
                                        >
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </>
          )}
        </main>
      </div>
    </>
  );
}
