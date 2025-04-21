import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { Elements } from "@stripe/react-stripe-js";
import SellerOnboarding from "./pages/Onboarding";
import AppRoutes from "./routes";

// Pages
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import MarketplaceNew from "./pages/MarketplaceNew";
import Services from "./pages/Services";
import ServicesNew from "./pages/ServicesNew";
import ServiceDetail from "./pages/ServiceDetail";
import Events from "./pages/Events";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyAccount from "./pages/VerifyAccount";
import NotFound from "./pages/NotFound";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import MessagesPage from "./pages/Messages";
import MessagesInbox from "./pages/MessagesInbox";
import Notifications from "./pages/Notifications";
import Search from "./pages/Search";
import { loadStripe } from "@stripe/stripe-js";

const queryClient = new QueryClient();
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const App = () => (
    <BrowserRouter>
        <Elements stripe={stripePromise}>
            <QueryClientProvider client={queryClient}>
                <TooltipProvider>
                    <AuthProvider>
                        <CartProvider>
                            <Toaster />
                            <Sonner />
                            <AppRoutes />
                        </CartProvider>
                    </AuthProvider>
                </TooltipProvider>
            </QueryClientProvider>
        </Elements>
    </BrowserRouter>
);

export default App;
