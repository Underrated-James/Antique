// frontend/src/Page/HomePage/ProcessItemPage/ProcessItemPage.jsx
import React, { useEffect, useState, useRef } from 'react';
import Header from '../../../Compo/Header/Header';
import styles from './ProcessItemPage.module.css';
import { useNavigate, useParams } from 'react-router-dom';

export default function ProcessItemPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [paymentCompleted, setPaymentCompleted] = useState(false);
    const paypalRef = useRef();

    // First useEffect: Fetch product data
    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`http://localhost:3000/api/checkout/${id}`);
                const result = await res.json();

                if (result.status === "success") {
                    const data = result.data;
                    const imageUrl = data.image1_path.startsWith('/uploads/') ? data.image1_path : `/uploads/${data.image1_path}`;
                
                } else {
                    console.error(result.message);
                    // Set mock data for testing PayPal integration
                    setProduct({
                        name: "Vintage Antique Item (Demo)",
                        price: 1000,
                        imageUrl: "https://via.placeholder.com/400x300?text=Demo+Product",
                        
                    });
                }
            } catch (error) {
                console.error("Failed to fetch product:", error);
                // Set mock data for testing PayPal integration
                setProduct({
                    name: "Vintage Antique Item (Demo)",
                    price: 1000,
                    imageUrl: "https://via.placeholder.com/400x300?text=Demo+Product",
                   
                });
            }
        };

        fetchProduct();
    }, [id]);

    // Second useEffect: Initialize PayPal buttons
    useEffect(() => {
        if (product && window.paypal && !paymentCompleted && paypalRef.current) {
            // Clear any existing PayPal buttons
            paypalRef.current.innerHTML = '';
            
            const firstDownPayment = product.price * 0.5;
            
            window.paypal.Buttons({
                createOrder: (data, actions) => {
                    return actions.order.create({
                        purchase_units: [{
                            amount: {
                                value: firstDownPayment.toFixed(2)
                            }
                        }]
                    });
                },
                onApprove: (data, actions) => {
                    return actions.order.capture().then((details) => {
                        console.log('Transaction completed by', details.payer.name.given_name);
                        console.log('Transaction details:', details);
                        
                        // Show success message
                        alert(`Payment completed by ${details.payer.name.given_name}! Transaction ID: ${details.id}`);
                        
                        setPaymentCompleted(true);
                        
                        // Save order details to backend
                        const saveOrder = async () => {
                            try {
                                // Get user ID from localStorage customer_id or user object
                                let userId = localStorage.getItem('customer_id');
                                if (!userId) {
                                    const user = JSON.parse(localStorage.getItem('user') || '{}');
                                    userId = user.customer_id;
                                }
                                if (!userId) {
                                    userId = '1'; // fallback
                                }
                                const orderData = {
                                    user_id: parseInt(userId),
                                    product_id: parseInt(id),
                                    product_name: product.name,
                                    price: product.price,
                                    down_payment: firstDownPayment,
                                    remaining_payment: product.price - firstDownPayment,
                                    paypal_transaction_id: details.id,
                                    payer_name: details.payer.name.given_name + ' ' + (details.payer.name.surname || '')
                                };
                                
                                const response = await fetch('/api/orders', {
                                    method: 'POST',
                                    headers: {
                                        'Content-Type': 'application/json',
                                    },
                                    body: JSON.stringify(orderData)
                                });
                                
                                const result = await response.json();
                                if (result.status === 'success') {
                                    console.log('Order saved successfully:', result.order_id);
                                } else {
                                    console.error('Failed to save order:', result.message);
                                }
                            } catch (error) {
                                console.error('Error saving order:', error);
                            }
                        };
                        
                        // Save order and then navigate
                        saveOrder();
                        
                        // Navigate to orders page after successful payment
                        setTimeout(() => {
                            // Get user ID from localStorage customer_id or user object
                            let userId = localStorage.getItem('customer_id');
                            if (!userId) {
                                const user = JSON.parse(localStorage.getItem('user') || '{}');
                                userId = user.customer_id;
                            }
                            if (!userId) {
                                userId = '1'; // fallback
                            }
                            navigate(`/items/${userId}`);
                        }, 2000);
                    });
                },
                onError: (err) => {
                    console.error('PayPal error:', err);
                    alert('Payment failed. Please try again.');
                }
            }).render(paypalRef.current);
        }
    }, [product, paymentCompleted, navigate]);

    if (!product) return <div>Loading...</div>;

    const downPaymentPercentage = 0.5;
    const firstDownPayment = product.price * downPaymentPercentage;
    const secondDownPayment = product.price - firstDownPayment;

    return (
        <>
            <Header isSeller={false} showSearchBar={false} />
            <div className={styles.container}>
                <main className={styles.mainContent}>
                    <div className={styles.productImageContainer}>
                        <img src={product.imageUrl} alt={`Image of ${product.name}`} className={styles.productImage} />
                    </div>

                    <div className={styles.checkoutDetails}>
                        <h2>Checkout Details</h2>
                        <div className={styles.detailItem}><h3>Product:</h3><p>{product.name}</p></div>
                        <div className={styles.detailItem}><h3>Total Price:</h3><p>₱{product.price.toLocaleString()}</p></div>
                        <p className={styles.transactionInfo}>
                            50% online down payment. Remaining paid at pickup.
                        </p>
                        <div className={styles.detailItem}><h3>1st Payment:</h3><p>₱{firstDownPayment.toLocaleString()}</p></div>
                        <div className={styles.detailItem}><h3>2nd Payment:</h3><p>₱{secondDownPayment.toLocaleString()}</p></div>
                    </div>

                    <div className={styles.paymentMethod}>
                        <h2>Online Payment</h2>
                        <p className={styles.paymentNote}>
                            *₱{firstDownPayment.toLocaleString()} will be processed online via PayPal.
                        </p>
                        <div ref={paypalRef} className={styles.paypalButtonContainer}></div>
                        {paymentCompleted && (
                            <div className={styles.paymentSuccess}>
                                <p>✅ Payment completed successfully! Redirecting...</p>
                            </div>
                        )}
                    </div>

                    <div className={styles.sellerInfo}>
                        <h2>Seller Info</h2>
                        <p><strong>Shop:</strong> {product.seller.name}</p>
                        <p><strong>Contact:</strong> {product.seller.contact}</p>
                        <p><strong>Location:</strong> {product.seller.location}</p>
                    </div>
                    {!paymentCompleted && (
                        <div className={styles.orderInstructions}>
                            <p>Complete your payment above to place the order.</p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}
