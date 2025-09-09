import React from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import styles from "./GoogleSignUp.module.css";

export default function GoogleSignUp() {
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";

      const response = await fetch(`${apiUrl}/api/google-signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          credential: credentialResponse.credential,
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === "success") {
        const user = data.user;
        
        // Always redirect new Google users to the signup form
        if (data.isNewUser) {
          console.log("Redirecting new Google user to signup form", user);
          // Redirect to the sign-up form with Google user data
          navigate("/signup", {
            state: { 
              user,
              fromGoogle: true
            }
          });
          return;
        }

        if (data.requiresOTP) {
          navigate("/otp-verification", {
            state: { user, isNewUser: data.isNewUser || false },
          });
        } else {
          localStorage.setItem("user", JSON.stringify(user));
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("userRole", user.role);
          localStorage.setItem("userId", user.user_id.toString());
          localStorage.setItem("history_id", user.history_id);
          localStorage.setItem("first_name", user.First_name);
          localStorage.setItem("last_name", user.Last_name);

          if (user.customer_id) {
            localStorage.setItem("customer_id", user.customer_id.toString());
          }

          if (user.seller_id) {
            localStorage.setItem("seller_id", user.seller_id.toString());
          }

          // For Seller role, navigate to seller home page
          if (user.role === 'Seller') {
            // Use seller_id for navigation if available, otherwise use user_id
            const navigationId = user.seller_id || user.user_id;
            navigate(`/seller/home/${navigationId}`);
          }
          // For Customer role, navigate to customer home page
          else if (user.role === 'Customer') {
            navigate(`/home/${user.customer_id}`);
          }
        }
      } else {
        console.error("Google sign-up failed:", data.message);
        alert("Sign-up failed: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Google sign-up error:", error);
      alert("Sign-up failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    console.error("Google sign-up failed");
    alert("Google sign-up failed. Please try again.");
  };

  return (
    <div className={styles.googleSignUpWrapper}>
      <div className={styles.googleBtnContainer}>
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          useOneTap
          theme="outline"
          text="signin_with"
          shape="rectangular"
          locale="en"
          width="300px"
          logo_alignment="center"
        />
      </div>
    </div>
  );
}
