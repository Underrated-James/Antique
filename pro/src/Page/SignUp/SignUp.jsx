import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

export default function SignupPage() {
  const navigate = useNavigate();

  const [role, setRole] = useState("customer");
  const [businessPermit, setBusinessPermit] = useState(null);
  const [password, setPassword] = useState("");
  const [recheckPassword, setRecheckPassword] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paypal, setPaypal] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    if (password !== recheckPassword) {
      alert("Passwords do not match.");
      return;
    }

    const formData = new FormData();
    formData.append("username", username.trim());
    formData.append("email", email.trim());
    formData.append("first_name", firstName.trim());
    formData.append("last_name", lastName.trim());
    formData.append("phone", phone.trim());
    formData.append("address", address.trim());
    formData.append("password", password.trim());
    formData.append("role", role === "customer" ? "Customer" : "Seller");

    if (role === "seller") {
      if (businessPermit) {
        formData.append("businessPermit", businessPermit);
      }
      if (paypal) {
        formData.append("paypal", paypal.trim());
      }
    }

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${apiUrl}/api/signup`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || "Signup failed");
      }

      if (role === "seller") {
        alert("Your seller application has been submitted and is pending approval.");
        navigate("/login");
      } else {
        navigate(`/home/${result.user.user_id}`);
      }
    } catch (err) {
      console.error(err);
      alert("Signup failed: " + err.message);
    }
  };

  return (
    <main className={styles["signup-page"]}>
      <form className={styles["signup-form"]} onSubmit={handleSignup}>
        <h1 className={styles["signup-title"]}>Sign Up</h1>

        {/* Role selection */}
        <fieldset className={styles["form-group"]}>
          <legend className={styles["form-label"]}>I am a:</legend>
          <div className={styles["radio-group"]}>
            <label className={styles["radio-label"]}>
              <input
                className={styles["radio-input"]}
                type="radio"
                value="customer"
                checked={role === "customer"}
                onChange={() => setRole("customer")}
              />
              Customer
            </label>
            <label className={styles["radio-label"]}>
              <input
                className={styles["radio-input"]}
                type="radio"
                value="seller"
                checked={role === "seller"}
                onChange={() => setRole("seller")}
              />
              Seller
            </label>
          </div>
        </fieldset>

        {/* Two-column row for username & email */}
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Username</label>
            <input
              className={styles["form-input"]}
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Email</label>
            <input
              className={styles["form-input"]}
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        {/* Two-column row for first & last name */}
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>First Name</label>
            <input
              className={styles["form-input"]}
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </div>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Last Name</label>
            <input
              className={styles["form-input"]}
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </div>
        </div>

        {/* Phone + Address */}
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Phone</label>
            <input
              className={styles["form-input"]}
              type="text"
              placeholder="09xxxxxxxxx"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Address</label>
            <input
              className={styles["form-input"]}
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Passwords */}
        <div className={styles["form-row"]}>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Password</label>
            <input
              className={styles["form-input"]}
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className={styles["form-group"]}>
            <label className={styles["form-label"]}>Re-enter Password</label>
            <input
              className={styles["form-input"]}
              type="password"
              required
              value={recheckPassword}
              onChange={(e) => setRecheckPassword(e.target.value)}
            />
          </div>
        </div>

        {/* Seller-only fields */}
        {role === "seller" && (
          <>
            <div className={styles["form-group"]}>
              <label className={styles["form-label"]}>PayPal Number (optional)</label>
              <input
                className={styles["form-input"]}
                type="text"
                value={paypal}
                onChange={(e) => setPaypal(e.target.value)}
              />
            </div>

            <div className={styles["form-group"]}>
              <label className={styles["form-label"]}>Business Permit (PDF or Image)</label>
              <input
                className={styles["form-input"]}
                type="file"
                accept="application/pdf,image/*"
                onChange={(e) => setBusinessPermit(e.target.files[0])}
                required
              />
            </div>
          </>
        )}

        <button type="submit" className={styles["submit-btn"]}>
          Sign Up
        </button>
      </form>
    </main>
  );
}
