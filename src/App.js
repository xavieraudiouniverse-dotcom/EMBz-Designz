import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/context/CartContext";
import { StoreLayout } from "@/components/layout/StoreLayout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { Toaster } from "@/components/ui/sonner";

import HomePage from "@/pages/HomePage";
import ShopPage from "@/pages/ShopPage";
import ProductPage from "@/pages/ProductPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderConfirmationPage from "@/pages/OrderConfirmationPage";
import TrackingPage from "@/pages/TrackingPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentCancelPage from "@/pages/PaymentCancelPage";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminCatalog from "@/pages/admin/AdminCatalog";
import AdminProducts from "@/pages/admin/AdminProducts";

const Store = ({ children }) => <StoreLayout>{children}</StoreLayout>;

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<Store><HomePage /></Store>} />
          <Route path="/shop" element={<Store><ShopPage /></Store>} />
          <Route path="/product/:id" element={<Store><ProductPage /></Store>} />
          <Route path="/checkout" element={<Store><CheckoutPage /></Store>} />
          <Route path="/order/:externalNumber" element={<Store><OrderConfirmationPage /></Store>} />
          <Route path="/payment/success" element={<Store><PaymentSuccessPage /></Store>} />
          <Route path="/payment/cancel" element={<Store><PaymentCancelPage /></Store>} />
          <Route path="/track" element={<Store><TrackingPage /></Store>} />

          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/catalog" element={<AdminCatalog />} />
          <Route path="/admin/products" element={<AdminProducts />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors />
    </div>
  );
}

function Root() {
  return (
    <CartProvider>
      <App />
    </CartProvider>
  );
}

export default Root;
