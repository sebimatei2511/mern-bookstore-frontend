import React, { useState, useEffect, use } from "react";
import axios from "axios";
import { FaShoppingCart } from "react-icons/fa";

import SearchFilterSort from "./SearchFilterSort";
import CardSidebar from "./CardSidebar";
import "./BookCatalog.css";

import { API_URL } from '../../config';

const BookCatalog = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartTotal, setCartTotal] = useState(0);

  // Încărcarea produselor la montarea componentei
  useEffect(() => {
    fetchProducts();
    fetchCartTotal(); // Incarca totalul cosului la initializare
  }, []);

  useEffect(() => {
    const checkRecentPayment = async () => {
      const sessionId = localStorage.getItem("lastCheckoutSession");
      const timestamp = localStorage.getItem("checkoutTimestamp");
      if (sessionId && timestamp) {
        // 5 minute
        const isRecent = Date.now() - parseInt(timestamp) < 300000;
        if (isRecent) {
          try {
            const response = await fetch(
              `${API_URL}/api/check-payment-status/${sessionId}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.paymentStatus === "paid") {
                await fetch(`${API_URL}/api/clear-cart`, {
                  method: "POST",
                });
              }
            }
            fetchCartTotal();
            localStorage.removeItem("lastCheckoutSession");
            localStorage.removeItem("checkoutTimestamp");
          } catch (error) {
            console.error("Error checking payment:", error);
          }
        } else {
          localStorage.removeItem("lastCheckoutSession");
          localStorage.removeItem("checkoutTimestamp");
        }
      }
    };
    // Verifică la încărcarea paginii
    checkRecentPayment();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/products`);
      console.log("Raspuns API:", response);
      console.log("Date raspuns:", response.data);
      if (response.data.success) {
        setProducts(response.data.products);
        setFilteredProducts(response.data.products);
      }
    } catch (error) {
      setError("Eroare la încărcarea produselor");
      console.error("Eroare la obținerea produselor:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartTotal = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/cart`);
      if (response.data.success) {
        setCartTotal(response.data.cart.totalItems);
      }
    } catch (error) {
      console.error("Eroare la incarcarea cosului: ", error);
    }
  };

  const addToCart = async (productId) => {
    try {
      const response = await axios.post(`${API_URL}/api/cart`, {
        productId,
        quantity: 1,
      });

      if (response.data.success) {
        // Actualizeaza totalul cosului
        setCartTotal(response.data.cart.totalItems);
        console.log("Produs adaugat in cos: ", response.data.cart);
      }
    } catch (error) {
      console.error("Eroare la adaugarea in cos: ", error);
      alert("Eroare la adaugarea produsului in cos");
    }
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => {
    setIsCartOpen(false);
    // Refetch pentru coș când se închide sidebar-ul
    fetchCartTotal();
  };

  if (loading) return <div className="loading">Se încarcă produsele...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app">
      {/* Header-ul aplicației cu logo și navigare */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            MERN BookStore
            <span className="version-badge">E-Commerce</span>
          </div>
          {/* Buton cos cu badge */}
          <button className="cart-button" onClick={openCart}>
            <FaShoppingCart className="cart-icon" />
            {cartTotal > 0 && <span className="cart-badge">{cartTotal}</span>}
          </button>
        </div>
      </header>

      {/* Componenta de cautare si filtrare */}
      <SearchFilterSort
        products={products}
        onFilteredProducts={setFilteredProducts}
      />

      {/* Afiseaza numarul de produse filtrare */}
      <div className="results-count">
        {filteredProducts.length} produse gasite
      </div>

      {/* Grid-ul pentru afișarea produselor */}
      <div className="products-grid">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            {/* Container pentru imagine cu hover overlay*/}
            <div className="product-image-container">
              <img
                src={product.imageUrl}
                alt={product.title}
                className="product-image"
              />

              {/* Overlay cu informații suplimentare la hover */}
              <div className="hover-overlay">
                <div className="hover-content">
                  <p>
                    <strong>ISBN: </strong> {product.isbn || "N/A"}
                  </p>
                  <p>
                    <strong>Editura: </strong>
                    {product.specifications.publisher || "N/A"}
                  </p>
                  <p>
                    <strong>Pagini: </strong>
                    {product.specifications.pages || "N/A"}
                  </p>
                  <p>
                    <strong>An Publicare: </strong>
                    {product.specifications.year || "N/A"}
                  </p>
                  <p>
                    <strong>Stoc Disponibil:</strong> {product.stock} bucăți
                  </p>

                  {product.rating && (
                    <p>
                      <strong>Evaluare: </strong>
                      {"★".repeat(Math.floor(product.rating))} (
                      {product.reviewCount} recenzii)
                    </p>
                  )}
                  <p className="description">
                    <strong>Descriere: </strong>
                    {product.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Informațiile produsului */}
            <div className="product-info">
              <h3>{product.title}</h3>
              <p className="author">scrisă de {product.author}</p>

              <div className="price-section">
                {product.discountPrice ? (
                  <>
                    <span className="original-price">
                      {product.price}
                      RON
                    </span>

                    <span className="current-price">
                      {product.discountPrice} RON
                    </span>
                  </>
                ) : (
                  <span className="current-price">
                    {product.price}
                    RON
                  </span>
                )}
              </div>

              <button
                className="btn btn-primary"
                onClick={() => addToCart(product.id)}
                disabled={product.stock === 0}
              >
                {product.stock === 0 ? "Stoc epuizat" : "Adaugă în coș"}
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="no-products">
          <h2>Nu sunt produse disponibile</h2>
          <p>Magazinul este în curs de actualizare. Reveniți curând!</p>
        </div>
      )}

      {/* Componenta CardSidebar */}
      <CardSidebar isOpen={isCartOpen} onClose={closeCart} />
    </div>
  );
};

export default BookCatalog;
