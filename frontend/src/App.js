import { useState, useEffect, useCallback, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams, useLocation, Navigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Menu, X, Home, Users, FileText, Calendar, Image, Settings, LogOut, 
  ChevronRight, Clock, MapPin, Mail, Phone, Building, Plus, Edit, Trash2,
  CheckCircle, Circle, AlertCircle, Search, Filter, Download, Eye, BookOpen,
  Activity, FileCheck, Star, Heart, Target, Award, Sparkles, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_13832b27-906b-4dfc-9ff8-e595f672e269/artifacts/xienulzh_logo.png";

// Auth Context
const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(Cookies.get("token") || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      if (token) {
        try {
          const res = await axios.get(`${API}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(res.data);
        } catch {
          Cookies.remove("token");
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [token]);

  const login = async (username, password, secretCode) => {
    const res = await axios.post(`${API}/auth/login`, { username, password, secretCode });
    Cookies.set("token", res.data.access_token, { expires: 1 });
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const signup = async (username, password, secretCode, fullName) => {
    const res = await axios.post(`${API}/auth/signup`, { username, password, secretCode, fullName });
    Cookies.set("token", res.data.access_token, { expires: 1 });
    setToken(res.data.access_token);
    setUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    Cookies.remove("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => useContext(AuthContext);

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/admin/sign-in" replace />;
  return children;
};

// Loading Screen
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center gradient-hero">
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full"
    />
  </div>
);

// Custom Cursor
const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseOver = (e) => {
      if (e.target.closest("button, a, .card-hover, input, textarea, select")) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      <div 
        className={`custom-cursor ${isHovering ? "hover" : ""}`}
        style={{ left: position.x, top: position.y }}
      />
      <div 
        className="cursor-dot"
        style={{ left: position.x, top: position.y }}
      />
    </>
  );
};

// Animated Logo Component
const AnimatedLogo = ({ size = "md", className = "" }) => {
  const sizes = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
    hero: "w-64 h-64"
  };
  
  return (
    <div className={`relative ${sizes[size]} ${className}`}>
      {/* Outer glow ring */}
      <motion.div 
        className="absolute inset-[-4px] rounded-full"
        style={{
          background: "conic-gradient(from 0deg, transparent, rgba(0,191,255,0.4), transparent, rgba(0,255,136,0.3), transparent)"
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />
      {/* Inner ring */}
      <motion.div 
        className="absolute inset-[-2px] rounded-full border border-cyan-400/30"
        animate={{ scale: [1, 1.02, 1], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Logo container */}
      <div className="relative w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#012a3a] to-[#013220] p-1">
        <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-br from-[#013220]/50 to-[#005f73]/50 flex items-center justify-center">
          <img 
            src={LOGO_URL} 
            alt="Logo" 
            className="w-[85%] h-[85%] object-contain"
          />
        </div>
      </div>
      {/* Glow effect */}
      <div className="absolute inset-0 rounded-full bg-cyan-400/20 blur-xl -z-10" />
    </div>
  );
};

// Navigation
const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const leftLinks = [
    { path: "/", label: "Beranda" },
    { path: "/about", label: "Tentang" },
    { path: "/events", label: "Event" },
  ];
  
  const rightLinks = [
    { path: "/articles", label: "Artikel" },
    { path: "/gallery", label: "Galeri" },
    { path: "/documentation", label: "Lainnya" },
  ];

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 pt-4"
    >
      <div className="container-custom">
        {/* Floating Navbar */}
        <div className={`mx-auto max-w-4xl transition-all duration-500 ${
          scrolled 
            ? "bg-[#0a1a1f]/95 backdrop-blur-xl shadow-2xl shadow-black/20" 
            : "bg-[#0a1a1f]/80 backdrop-blur-md"
        } rounded-full px-6 py-2`}>
          <div className="flex items-center justify-center gap-4">
            {/* Left Links */}
            <div className="hidden lg:flex items-center gap-6">
              {leftLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-300 hover:text-cyan-400 ${
                    location.pathname === link.path
                      ? "text-cyan-400"
                      : "text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Center Logo */}
            <Link to="/" className="relative mx-4">
              <AnimatedLogo size="md" />
            </Link>

            {/* Right Links */}
            <div className="hidden lg:flex items-center gap-6">
              {rightLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-medium transition-all duration-300 hover:text-cyan-400 ${
                    location.pathname === link.path
                      ? "text-cyan-400"
                      : "text-white/80"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden text-white ml-auto"
              onClick={() => setIsOpen(!isOpen)}
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Admin Button - Floating right */}
        <Link to="/admin" className="hidden lg:block fixed top-6 right-6">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-10 h-10 rounded-full bg-[#0a1a1f]/80 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-cyan-400 transition-colors border border-white/10"
          >
            <Users size={18} />
          </motion.div>
        </Link>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-4 mx-4 bg-[#0a1a1f]/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden border border-white/10"
            >
              <div className="p-4 space-y-2">
                {[...leftLinks, ...rightLinks].map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsOpen(false)}
                    className={`block px-4 py-3 rounded-xl transition-colors ${
                      location.pathname === link.path
                        ? "bg-cyan-500/20 text-cyan-400"
                        : "text-white/80 hover:bg-white/5"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link to="/admin" onClick={() => setIsOpen(false)}>
                  <Button className="w-full mt-2 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white">
                    Admin Panel
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

// Footer
const Footer = () => (
  <footer className="bg-[#010d15] text-white py-16 border-t border-white/10">
    <div className="container-custom">
      <div className="grid md:grid-cols-4 gap-12">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <AnimatedLogo size="sm" />
            <span className="font-bold text-xl">Geunaseh Jeumala</span>
          </div>
          <p className="text-white/60 text-sm leading-relaxed">
            Merangkul langit dengan kasih sayang, membangun generasi berilmu dan berakhlak mulia.
          </p>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4 text-cyan-400">Navigasi</h4>
          <ul className="space-y-2 text-sm text-white/60">
            <li><Link to="/" className="hover:text-cyan-400 transition-colors">Beranda</Link></li>
            <li><Link to="/about" className="hover:text-cyan-400 transition-colors">Tentang</Link></li>
            <li><Link to="/events" className="hover:text-cyan-400 transition-colors">Event</Link></li>
            <li><Link to="/articles" className="hover:text-white transition-colors">Artikel</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Konten</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li><Link to="/documentation" className="hover:text-white transition-colors">Dokumentasi</Link></li>
            <li><Link to="/activities" className="hover:text-white transition-colors">Kegiatan</Link></li>
            <li><Link to="/reports" className="hover:text-white transition-colors">Laporan</Link></li>
            <li><Link to="/gallery" className="hover:text-white transition-colors">Galeri</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold mb-4">Kontak</h4>
          <ul className="space-y-2 text-sm text-white/70">
            <li className="flex items-center gap-2">
              <Mail size={16} />
              info@geunasehjeumala.org
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} />
              +62 812 3456 7890
            </li>
          </ul>
        </div>
      </div>
      
      <Separator className="my-8 bg-white/20" />
      
      <div className="text-center text-sm text-white/60">
        © 2025 Geunaseh Jeumala. All rights reserved.
      </div>
    </div>
  </footer>
);

// Animation wrapper
const PageWrapper = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
};

// Section animation
const AnimatedSection = ({ children, className = "", delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

// ==================== PUBLIC PAGES ====================

// Home Page
const HomePage = () => {
  const [pageData, setPageData] = useState(null);
  const [events, setEvents] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pageRes, eventsRes, articlesRes] = await Promise.all([
          axios.get(`${API}/pages/home`),
          axios.get(`${API}/events`),
          axios.get(`${API}/articles`)
        ]);
        setPageData(pageRes.data);
        setEvents(eventsRes.data.slice(0, 3));
        setArticles(articlesRes.data.slice(0, 3));
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const features = [
    { icon: BookOpen, title: "Kajian Rutin", desc: "Pendalaman ilmu agama dan pengembangan diri" },
    { icon: Heart, title: "Bakti Sosial", desc: "Membantu masyarakat yang membutuhkan" },
    { icon: Target, title: "Pelatihan", desc: "Workshop dan skill development" },
    { icon: Award, title: "Event Tahunan", desc: "Acara besar tahunan organisasi" },
  ];

  return (
    <PageWrapper>
      {/* Hero Section */}
      <section className="min-h-screen relative flex items-center gradient-hero overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="container-custom relative z-10 pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Badge className="bg-white/20 text-white mb-6 backdrop-blur-sm">
                Selamat Datang
              </Badge>
              <h1 className="text-5xl lg:text-7xl font-bold text-white mb-6 font-['Playfair_Display']">
                {pageData?.heroTitle || "Geunaseh Jeumala"}
              </h1>
              <p className="text-xl text-white/80 mb-8">
                {pageData?.heroSubtitle || "Bersama Membangun Generasi Berilmu dan Berakhlak"}
              </p>
              <p className="text-white/60 mb-8">
                {pageData?.heroDescription || "Organisasi mahasiswa yang berdedikasi untuk pengembangan pendidikan, dakwah, dan sosial kemasyarakatan."}
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/about">
                  <Button size="lg" className="bg-white text-emerald-800 hover:bg-white/90">
                    Tentang Kami <ArrowRight className="ml-2" size={18} />
                  </Button>
                </Link>
                <Link to="/events">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                    Lihat Event
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-emerald-400 blur-3xl opacity-30 rounded-full" />
                <img 
                  src={LOGO_URL} 
                  alt="Logo" 
                  className="relative w-80 h-80 object-contain animate-float"
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center pt-2">
            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4">Program Kami</Badge>
            <h2 className="text-4xl font-bold mb-4">Program Unggulan</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Berbagai program yang kami jalankan untuk membentuk generasi berkualitas
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Card className="card-hover border-0 shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-primary flex items-center justify-center">
                      <feature.icon className="text-white" size={28} />
                    </div>
                    <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                    <p className="text-gray-600 text-sm">{feature.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section className="py-24">
        <div className="container-custom">
          <AnimatedSection className="flex justify-between items-end mb-12">
            <div>
              <Badge className="mb-4">Upcoming</Badge>
              <h2 className="text-4xl font-bold">Event Terbaru</h2>
            </div>
            <Link to="/events">
              <Button variant="outline">
                Lihat Semua <ChevronRight size={18} />
              </Button>
            </Link>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <AnimatedSection key={event.id} delay={i * 0.1}>
                <Link to={`/events/${event.slug}`}>
                  <Card className="card-hover overflow-hidden border-0 shadow-lg">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={event.bannerImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-6">
                      <Badge variant="outline" className="mb-3">{event.date}</Badge>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        {event.location || "TBA"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Articles Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <AnimatedSection className="flex justify-between items-end mb-12">
            <div>
              <Badge className="mb-4">Blog</Badge>
              <h2 className="text-4xl font-bold">Artikel Terbaru</h2>
            </div>
            <Link to="/articles">
              <Button variant="outline">
                Lihat Semua <ChevronRight size={18} />
              </Button>
            </Link>
          </AnimatedSection>

          <div className="grid md:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <AnimatedSection key={article.id} delay={i * 0.1}>
                <Link to={`/articles/${article.slug}`}>
                  <Card className="card-hover overflow-hidden border-0 shadow-lg h-full">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={article.coverImage || "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800"} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex gap-2 mb-3">
                        {(article.tags || []).slice(0, 2).map((tag, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold text-lg mb-2 line-clamp-2">{article.title}</h3>
                      <p className="text-gray-600 text-sm line-clamp-2">{article.summary}</p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 gradient-primary">
        <div className="container-custom text-center">
          <AnimatedSection>
            <h2 className="text-4xl font-bold text-white mb-6">
              Bergabunglah Bersama Kami
            </h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Mari bersama-sama membangun generasi yang berilmu dan berakhlak mulia untuk masa depan yang lebih baik.
            </p>
            <Link to="/events">
              <Button size="lg" className="bg-white text-emerald-800 hover:bg-white/90">
                Ikuti Event Kami
              </Button>
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </PageWrapper>
  );
};

// About Page with Galaxy Effect
const AboutPage = () => {
  const [members, setMembers] = useState([]);
  const [pageData, setPageData] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersRes, pageRes] = await Promise.all([
          axios.get(`${API}/members`),
          axios.get(`${API}/pages/about`)
        ]);
        setMembers(membersRes.data);
        setPageData(pageRes.data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, []);

  const handleMouseMove = useCallback((e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height
    });
  }, []);

  return (
    <PageWrapper>
      {/* Galaxy Hero Section */}
      <section 
        className="min-h-screen relative galaxy-container flex items-center justify-center overflow-hidden pt-20"
        onMouseMove={handleMouseMove}
      >
        {/* Stars background */}
        {[...Array(100)].map((_, i) => (
          <motion.div
            key={`star-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.8 + 0.2,
            }}
            animate={{
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 3,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}

        {/* Member names as stars */}
        {members.map((member, i) => {
          const baseX = 10 + (i % 5) * 18 + Math.random() * 10;
          const baseY = 15 + Math.floor(i / 5) * 15 + Math.random() * 8;
          const depth = Math.random() * 0.5 + 0.5;
          
          const parallaxX = (mousePos.x - 0.5) * 50 * (1 - depth);
          const parallaxY = (mousePos.y - 0.5) * 50 * (1 - depth);
          
          return (
            <motion.div
              key={member.id}
              className="star-name"
              style={{
                left: `${baseX}%`,
                top: `${baseY}%`,
                fontSize: `${10 + depth * 8}px`,
                opacity: 0.4 + depth * 0.6,
                filter: `blur(${(1 - depth) * 2}px)`,
              }}
              animate={{
                x: parallaxX,
                y: parallaxY,
              }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
              whileHover={{ scale: 1.3, opacity: 1, filter: "blur(0px)" }}
            >
              {member.name}
            </motion.div>
          );
        })}

        {/* Central text */}
        <motion.div 
          className="relative z-10 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            animate={{ 
              textShadow: [
                "0 0 20px rgba(0,191,255,0.5)",
                "0 0 40px rgba(0,191,255,0.8)",
                "0 0 20px rgba(0,191,255,0.5)"
              ]
            }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <h1 className="text-6xl lg:text-8xl font-bold text-white font-['Playfair_Display'] mb-4">
              Geunaseh Jeumala
            </h1>
          </motion.div>
          <p className="text-xl text-cyan-300/80 max-w-2xl mx-auto px-4">
            "Kasih Sayang Langit"
          </p>
          <p className="text-white/60 mt-4 text-sm">
            Gerakkan mouse untuk menjelajahi anggota kami
          </p>
        </motion.div>
      </section>

      {/* About Content */}
      <section className="py-24">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4">Tentang Kami</Badge>
            <h2 className="text-4xl font-bold mb-6">
              {pageData?.heroTitle || "Mengenal Lebih Dekat"}
            </h2>
            <p className="text-gray-600 max-w-3xl mx-auto">
              {pageData?.heroDescription || "Geunaseh Jeumala adalah organisasi mahasiswa yang didirikan dengan visi untuk membentuk generasi muda yang berilmu, berakhlak mulia, dan bermanfaat bagi masyarakat."}
            </p>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <AnimatedSection>
              <Card className="h-full border-0 shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center mb-4">
                    <Eye className="text-white" size={24} />
                  </div>
                  <CardTitle>Visi</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Menjadi organisasi mahasiswa terdepan dalam pembentukan generasi muda yang berilmu, berakhlak mulia, dan berkontribusi positif bagi bangsa dan agama.
                  </p>
                </CardContent>
              </Card>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <Card className="h-full border-0 shadow-lg">
                <CardHeader>
                  <div className="w-14 h-14 rounded-2xl gradient-primary-reverse flex items-center justify-center mb-4">
                    <Target className="text-white" size={24} />
                  </div>
                  <CardTitle>Misi</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                      Menyelenggarakan kajian dan pendidikan untuk peningkatan ilmu
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                      Mengembangkan potensi dan bakat anggota
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                      Membangun solidaritas dan ukhuwah islamiyah
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="text-emerald-500 mt-1 flex-shrink-0" size={16} />
                      Melaksanakan kegiatan sosial yang bermanfaat
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </AnimatedSection>
          </div>

          {/* Structure */}
          <AnimatedSection className="text-center mb-12">
            <Badge className="mb-4">Struktur</Badge>
            <h2 className="text-3xl font-bold">Pengurus Organisasi</h2>
          </AnimatedSection>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {members.slice(0, 10).map((member, i) => (
              <AnimatedSection key={member.id} delay={i * 0.05}>
                <Card className="card-hover border-0 shadow-md">
                  <CardContent className="p-4 text-center">
                    <div className="w-16 h-16 mx-auto mb-3 rounded-full gradient-primary flex items-center justify-center text-white text-xl font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <h4 className="font-medium text-sm mb-1">{member.name}</h4>
                    <p className="text-xs text-gray-500">{member.position}</p>
                    <Badge variant="secondary" className="text-xs mt-2">{member.division}</Badge>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

// Philosophy Page
const PhilosophyPage = () => {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    axios.get(`${API}/pages/philosophy`).then(res => setPageData(res.data)).catch(console.error);
  }, []);

  const values = [
    { icon: BookOpen, title: "Ilmu", desc: "Menuntut ilmu adalah kewajiban, kami berkomitmen untuk terus belajar dan mengajarkan", color: "from-emerald-500 to-teal-500" },
    { icon: Heart, title: "Akhlak", desc: "Akhlak mulia adalah cerminan iman yang benar", color: "from-cyan-500 to-blue-500" },
    { icon: Users, title: "Ukhuwah", desc: "Persaudaraan sejati yang dibangun atas dasar iman", color: "from-teal-500 to-emerald-500" },
    { icon: Award, title: "Amanah", desc: "Bertanggung jawab dalam setiap tugas yang dipercayakan", color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <PageWrapper>
      {/* Hero */}
      <section className="min-h-[60vh] gradient-hero flex items-center pt-20">
        <div className="container-custom">
          <AnimatedSection className="text-center text-white">
            <Badge className="bg-white/20 text-white mb-6">Filosofi</Badge>
            <h1 className="text-5xl lg:text-6xl font-bold mb-6 font-['Playfair_Display']">
              {pageData?.heroTitle || "Filosofi Geunaseh Jeumala"}
            </h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              {pageData?.heroDescription || "Geunaseh Jeumala berasal dari bahasa Aceh yang bermakna 'Kasih Sayang Langit'. Nama ini mencerminkan nilai-nilai kasih sayang, ketulusan, dan keberkahan."}
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Meaning */}
      <section className="py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <Badge className="mb-4">Makna Nama</Badge>
              <h2 className="text-4xl font-bold mb-6">Geunaseh Jeumala</h2>
              <p className="text-gray-600 mb-6 text-lg">
                <strong>"Geunaseh"</strong> berarti kasih sayang dalam bahasa Aceh, sedangkan <strong>"Jeumala"</strong> berarti langit atau sesuatu yang tinggi dan mulia.
              </p>
              <p className="text-gray-600">
                Gabungan keduanya melambangkan aspirasi kami untuk menyebarkan kasih sayang yang suci dan mulia, seperti kasih sayang dari langit yang menerangi bumi.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="relative">
                <div className="absolute inset-0 gradient-primary blur-3xl opacity-20 rounded-3xl" />
                <img 
                  src={LOGO_URL} 
                  alt="Logo" 
                  className="relative w-full max-w-md mx-auto"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <AnimatedSection className="text-center mb-16">
            <Badge className="mb-4">Nilai-Nilai</Badge>
            <h2 className="text-4xl font-bold">Nilai-Nilai Inti</h2>
          </AnimatedSection>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, i) => (
              <AnimatedSection key={i} delay={i * 0.1}>
                <Card className="card-hover border-0 shadow-lg h-full">
                  <CardContent className="p-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                      <value.icon className="text-white" size={28} />
                    </div>
                    <h3 className="font-bold text-xl mb-3">{value.title}</h3>
                    <p className="text-gray-600">{value.desc}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

// Events Page
const EventsPage = () => {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    axios.get(`${API}/events`).then(res => setEvents(res.data)).catch(console.error);
  }, []);

  return (
    <PageWrapper>
      <section className="min-h-[40vh] gradient-hero flex items-center pt-20">
        <div className="container-custom">
          <AnimatedSection className="text-center text-white">
            <Badge className="bg-white/20 text-white mb-6">Events</Badge>
            <h1 className="text-5xl font-bold font-['Playfair_Display']">Event & Kegiatan</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((event, i) => (
              <AnimatedSection key={event.id} delay={i * 0.1}>
                <Link to={`/events/${event.slug}`}>
                  <Card className="card-hover overflow-hidden border-0 shadow-lg h-full">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={event.bannerImage || "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800"} 
                        alt={event.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="outline">
                          <Calendar size={12} className="mr-1" />
                          {event.date}
                        </Badge>
                        {event.capacity > 0 && (
                          <Badge variant="secondary">{event.capacity} peserta</Badge>
                        )}
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{event.title}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <Clock size={14} />
                        {event.time || "TBA"}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <MapPin size={14} />
                        {event.location || "TBA"}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {events.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Belum ada event yang tersedia
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

// Event Detail Page
const EventDetailPage = () => {
  const { slug } = useParams();
  const [event, setEvent] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "", email: "", phone: "", organization: "", notes: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    axios.get(`${API}/events/${slug}`).then(res => setEvent(res.data)).catch(console.error);
  }, [slug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await axios.post(`${API}/events/${event.id}/register`, { ...formData, eventId: event.id });
      setSuccess(true);
      setFormData({ fullName: "", email: "", phone: "", organization: "", notes: "" });
    } catch (err) {
      setError(err.response?.data?.detail || "Gagal mendaftar");
    }
    setSubmitting(false);
  };

  if (!event) return <LoadingScreen />;

  return (
    <PageWrapper>
      <section className="min-h-[50vh] gradient-hero flex items-end pb-16 pt-32">
        <div className="container-custom">
          <AnimatedSection>
            <Badge className="bg-white/20 text-white mb-4">{event.date}</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">{event.title}</h1>
            <div className="flex flex-wrap gap-4 text-white/80">
              <div className="flex items-center gap-2">
                <Clock size={18} />
                {event.time || "TBA"}
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={18} />
                {event.location || "TBA"}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <AnimatedSection>
                {event.bannerImage && (
                  <img 
                    src={event.bannerImage} 
                    alt={event.title}
                    className="w-full rounded-2xl shadow-lg mb-8"
                  />
                )}
                <h2 className="text-2xl font-bold mb-4">Deskripsi Event</h2>
                <div className="prose max-w-none text-gray-600" dangerouslySetInnerHTML={{ __html: event.description || "Belum ada deskripsi" }} />
              </AnimatedSection>
            </div>

            <div>
              <AnimatedSection delay={0.2}>
                <Card className="sticky top-24 border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle>Daftar Sekarang</CardTitle>
                    <CardDescription>Isi form di bawah untuk mendaftar</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {success ? (
                      <Alert className="bg-emerald-50 border-emerald-200">
                        <CheckCircle className="text-emerald-500" />
                        <AlertDescription className="text-emerald-700">
                          Pendaftaran berhasil! Kami akan menghubungi Anda.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <Alert variant="destructive">
                            <AlertCircle />
                            <AlertDescription>{error}</AlertDescription>
                          </Alert>
                        )}
                        <div>
                          <Label>Nama Lengkap *</Label>
                          <Input 
                            required 
                            value={formData.fullName}
                            onChange={e => setFormData({...formData, fullName: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Email *</Label>
                          <Input 
                            type="email" 
                            required 
                            value={formData.email}
                            onChange={e => setFormData({...formData, email: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Nomor HP *</Label>
                          <Input 
                            required 
                            value={formData.phone}
                            onChange={e => setFormData({...formData, phone: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Organisasi / Divisi</Label>
                          <Input 
                            value={formData.organization}
                            onChange={e => setFormData({...formData, organization: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label>Catatan</Label>
                          <Textarea 
                            value={formData.notes}
                            onChange={e => setFormData({...formData, notes: e.target.value})}
                          />
                        </div>
                        <Button type="submit" className="w-full gradient-primary" disabled={submitting}>
                          {submitting ? "Mendaftar..." : "Daftar"}
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

// Articles Page
const ArticlesPage = () => {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    axios.get(`${API}/articles`).then(res => setArticles(res.data)).catch(console.error);
  }, []);

  return (
    <PageWrapper>
      <section className="min-h-[40vh] gradient-hero flex items-center pt-20">
        <div className="container-custom">
          <AnimatedSection className="text-center text-white">
            <Badge className="bg-white/20 text-white mb-6">Blog</Badge>
            <h1 className="text-5xl font-bold font-['Playfair_Display']">Artikel</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, i) => (
              <AnimatedSection key={article.id} delay={i * 0.1}>
                <Link to={`/articles/${article.slug}`}>
                  <Card className="card-hover overflow-hidden border-0 shadow-lg h-full">
                    <div className="aspect-video bg-gray-100 overflow-hidden">
                      <img 
                        src={article.coverImage || "https://images.unsplash.com/photo-1585036156171-384164a8c675?w=800"} 
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    </div>
                    <CardContent className="p-6">
                      <div className="flex gap-2 mb-3">
                        {(article.tags || []).slice(0, 2).map((tag, j) => (
                          <Badge key={j} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{article.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{article.summary}</p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {articles.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Belum ada artikel yang tersedia
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

// Article Detail Page
const ArticleDetailPage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);

  useEffect(() => {
    axios.get(`${API}/articles/${slug}`).then(res => setArticle(res.data)).catch(console.error);
  }, [slug]);

  if (!article) return <LoadingScreen />;

  return (
    <PageWrapper>
      <section className="min-h-[50vh] gradient-hero flex items-end pb-16 pt-32">
        <div className="container-custom">
          <AnimatedSection>
            <div className="flex gap-2 mb-4">
              {(article.tags || []).map((tag, i) => (
                <Badge key={i} className="bg-white/20 text-white">{tag}</Badge>
              ))}
            </div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">{article.title}</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              {article.coverImage && (
                <img 
                  src={article.coverImage} 
                  alt={article.title}
                  className="w-full rounded-2xl shadow-lg mb-8"
                />
              )}
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content || article.summary }} />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

// Gallery Page
const GalleryPage = () => {
  const [media, setMedia] = useState([]);

  useEffect(() => {
    axios.get(`${API}/media`).then(res => setMedia(res.data)).catch(console.error);
  }, []);

  return (
    <PageWrapper>
      <section className="min-h-[40vh] gradient-hero flex items-center pt-20">
        <div className="container-custom">
          <AnimatedSection className="text-center text-white">
            <Badge className="bg-white/20 text-white mb-6">Media</Badge>
            <h1 className="text-5xl font-bold font-['Playfair_Display']">Galeri</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24">
        <div className="container-custom">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {media.map((item, i) => (
              <AnimatedSection key={item.id} delay={i * 0.05}>
                <Card className="card-hover overflow-hidden border-0 shadow-lg">
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {item.type === "video" ? (
                      <div className="w-full h-full flex items-center justify-center bg-gray-800">
                        <Image className="text-white" size={48} />
                      </div>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                      />
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h4 className="font-medium text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500 truncate">{item.description}</p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>

          {media.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Belum ada media yang tersedia
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

// Documents Page (Documentation, Activities, Reports)
const DocumentsPage = ({ docType, title }) => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    axios.get(`${API}/documents?doc_type=${docType}`).then(res => setDocuments(res.data)).catch(console.error);
  }, [docType]);

  return (
    <PageWrapper>
      <section className="min-h-[40vh] gradient-hero flex items-center pt-20">
        <div className="container-custom">
          <AnimatedSection className="text-center text-white">
            <Badge className="bg-white/20 text-white mb-6">{docType}</Badge>
            <h1 className="text-5xl font-bold font-['Playfair_Display']">{title}</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-24">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map((doc, i) => (
              <AnimatedSection key={doc.id} delay={i * 0.1}>
                <Link to={`/${docType}/${doc.slug}`}>
                  <Card className="card-hover border-0 shadow-lg h-full">
                    <CardContent className="p-6">
                      <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mb-4">
                        <FileText className="text-white" size={24} />
                      </div>
                      <h3 className="font-semibold text-xl mb-2">{doc.title}</h3>
                      <p className="text-gray-600 line-clamp-2">{doc.description}</p>
                    </CardContent>
                  </Card>
                </Link>
              </AnimatedSection>
            ))}
          </div>

          {documents.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Belum ada {title.toLowerCase()} yang tersedia
            </div>
          )}
        </div>
      </section>
    </PageWrapper>
  );
};

// Document Detail Page
const DocumentDetailPage = () => {
  const { slug } = useParams();
  const [doc, setDoc] = useState(null);

  useEffect(() => {
    axios.get(`${API}/documents/${slug}`).then(res => setDoc(res.data)).catch(console.error);
  }, [slug]);

  if (!doc) return <LoadingScreen />;

  return (
    <PageWrapper>
      <section className="min-h-[40vh] gradient-hero flex items-end pb-16 pt-32">
        <div className="container-custom">
          <AnimatedSection>
            <Badge className="bg-white/20 text-white mb-4">{doc.docType}</Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-white">{doc.title}</h1>
          </AnimatedSection>
        </div>
      </section>

      <section className="py-16">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: doc.content || doc.description }} />
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
};

// ==================== ADMIN PAGES ====================

// Admin Layout
const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/admin/sign-in");
  };

  const menuItems = [
    { path: "/admin", icon: Home, label: "Dashboard" },
    { path: "/admin/pages", icon: FileText, label: "Halaman" },
    { path: "/admin/articles", icon: BookOpen, label: "Artikel" },
    { path: "/admin/media", icon: Image, label: "Media" },
    { path: "/admin/documents", icon: FileCheck, label: "Dokumen" },
    { path: "/admin/events", icon: Calendar, label: "Event" },
    { path: "/admin/tasks", icon: Activity, label: "AI Agent" },
    { path: "/admin/members", icon: Users, label: "Anggota" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 h-full w-64 gradient-primary z-50 transform transition-transform duration-300 lg:translate-x-0 ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3 mb-8">
            <img src={LOGO_URL} alt="Logo" className="h-10 w-10 object-contain" />
            <span className="font-bold text-white">Admin Panel</span>
          </Link>

          <nav className="space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  location.pathname === item.path
                    ? "bg-white/20 text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center gap-3 mb-4 text-white/80">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-medium text-white">{user?.fullName || user?.username}</div>
              <div className="text-xs text-white/60">Admin</div>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full border-white/20 text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-30">
          <div className="flex items-center justify-between px-6 py-4">
            <button 
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
            <div className="flex-1" />
            <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
              Lihat Website →
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

// Admin Sign In
const AdminSignIn = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", secretCode: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(formData.username, formData.password, formData.secretCode);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Login gagal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <img src={LOGO_URL} alt="Logo" className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Masuk ke dashboard admin</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label>Username</Label>
                <Input 
                  required 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <Label>Secret Code</Label>
                <Input 
                  type="password" 
                  required 
                  value={formData.secretCode}
                  onChange={e => setFormData({...formData, secretCode: e.target.value})}
                  placeholder="Masukkan kode rahasia"
                />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? "Memproses..." : "Masuk"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/admin/sign-up" className="text-sm text-gray-500 hover:text-emerald-600">
              Belum punya akun? Daftar
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// Admin Sign Up
const AdminSignUp = () => {
  const { signup, user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "", secretCode: "", fullName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate("/admin");
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signup(formData.username, formData.password, formData.secretCode, formData.fullName);
      navigate("/admin");
    } catch (err) {
      setError(err.response?.data?.detail || "Pendaftaran gagal");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="text-center">
            <img src={LOGO_URL} alt="Logo" className="h-16 w-16 mx-auto mb-4" />
            <CardTitle className="text-2xl">Daftar Admin</CardTitle>
            <CardDescription>Buat akun admin baru</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div>
                <Label>Nama Lengkap</Label>
                <Input 
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
              <div>
                <Label>Username</Label>
                <Input 
                  required 
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div>
                <Label>Password</Label>
                <Input 
                  type="password" 
                  required 
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
              <div>
                <Label>Secret Code</Label>
                <Input 
                  type="password" 
                  required 
                  value={formData.secretCode}
                  onChange={e => setFormData({...formData, secretCode: e.target.value})}
                  placeholder="Masukkan kode rahasia"
                />
              </div>
              <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                {loading ? "Memproses..." : "Daftar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center">
            <Link to="/admin/sign-in" className="text-sm text-gray-500 hover:text-emerald-600">
              Sudah punya akun? Masuk
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

// Admin Dashboard
const AdminDashboard = () => {
  const [stats, setStats] = useState({ articles: 0, events: 0, media: 0, tasks: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [articles, events, media, tasks] = await Promise.all([
          axios.get(`${API}/articles`),
          axios.get(`${API}/events`),
          axios.get(`${API}/media`),
          axios.get(`${API}/tasks`, { headers: { Authorization: `Bearer ${Cookies.get("token")}` } })
        ]);
        setStats({
          articles: articles.data.length,
          events: events.data.length,
          media: media.data.length,
          tasks: tasks.data.length
        });
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { label: "Artikel", value: stats.articles, icon: BookOpen, color: "from-emerald-500 to-teal-500" },
    { label: "Event", value: stats.events, icon: Calendar, color: "from-cyan-500 to-blue-500" },
    { label: "Media", value: stats.media, icon: Image, color: "from-teal-500 to-emerald-500" },
    { label: "Tugas", value: stats.tasks, icon: Activity, color: "from-blue-500 to-cyan-500" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-gray-500">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/admin/articles">
              <Button variant="outline" className="w-full justify-start">
                <Plus size={16} className="mr-2" /> Buat Artikel Baru
              </Button>
            </Link>
            <Link to="/admin/events">
              <Button variant="outline" className="w-full justify-start">
                <Plus size={16} className="mr-2" /> Buat Event Baru
              </Button>
            </Link>
            <Link to="/admin/tasks">
              <Button variant="outline" className="w-full justify-start">
                <Plus size={16} className="mr-2" /> Tambah Tugas
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Seed Data</CardTitle>
            <CardDescription>Generate sample data untuk testing</CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="gradient-primary"
              onClick={async () => {
                try {
                  await axios.post(`${API}/seed`);
                  alert("Data berhasil di-seed!");
                  window.location.reload();
                } catch (e) {
                  alert("Gagal seed data");
                }
              }}
            >
              <Sparkles size={16} className="mr-2" /> Generate Sample Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Admin CRUD Component (Generic)
const AdminCRUD = ({ title, endpoint, fields, renderItem }) => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}/${endpoint}`, { headers });
      setItems(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API}/${endpoint}/${editingId}`, formData, { headers });
      } else {
        await axios.post(`${API}/${endpoint}`, formData, { headers });
      }
      fetchItems();
      setDialogOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("Gagal menyimpan data");
    }
    setLoading(false);
  };

  const handleEdit = (item) => {
    setFormData(item);
    setEditingId(item.id);
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus?")) return;
    try {
      await axios.delete(`${API}/${endpoint}/${id}`, { headers });
      fetchItems();
    } catch (e) {
      console.error(e);
      alert("Gagal menghapus data");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary" onClick={() => { setFormData({}); setEditingId(null); }}>
              <Plus size={16} className="mr-2" /> Tambah
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Tambah"} {title}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <Label>{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea 
                      value={formData[field.name] || ""}
                      onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                      required={field.required}
                      rows={5}
                    />
                  ) : field.type === "select" ? (
                    <Select 
                      value={formData[field.name] || field.options?.[0]?.value || "default"} 
                      onValueChange={v => setFormData({...formData, [field.name]: v})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={`Pilih ${field.label}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {field.options.map(opt => (
                          <SelectItem key={opt.value} value={opt.value || "default"}>{opt.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : field.type === "tags" ? (
                    <Input 
                      value={(formData[field.name] || []).join(", ")}
                      onChange={e => setFormData({...formData, [field.name]: e.target.value.split(",").map(t => t.trim()).filter(Boolean)})}
                      placeholder="Tag1, Tag2, Tag3"
                    />
                  ) : (
                    <Input 
                      type={field.type || "text"}
                      value={formData[field.name] || ""}
                      onChange={e => setFormData({...formData, [field.name]: e.target.value})}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
                <Button type="submit" className="gradient-primary" disabled={loading}>
                  {loading ? "Menyimpan..." : "Simpan"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="divide-y">
            {items.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Belum ada data</div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                  <div className="flex-1">
                    {renderItem ? renderItem(item) : (
                      <div>
                        <div className="font-medium">{item.title || item.name}</div>
                        <div className="text-sm text-gray-500">{item.description || item.summary || ""}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
                      <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(item.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Admin Articles
const AdminArticles = () => (
  <AdminCRUD 
    title="Artikel"
    endpoint="articles"
    fields={[
      { name: "title", label: "Judul", required: true },
      { name: "slug", label: "Slug (URL)", required: true },
      { name: "summary", label: "Ringkasan", type: "textarea" },
      { name: "content", label: "Konten", type: "textarea" },
      { name: "coverImage", label: "Cover Image URL" },
      { name: "tags", label: "Tags", type: "tags" },
    ]}
    renderItem={(item) => (
      <div className="flex items-center gap-4">
        {item.coverImage && <img src={item.coverImage} alt="" className="w-16 h-12 object-cover rounded" />}
        <div>
          <div className="font-medium">{item.title}</div>
          <div className="text-sm text-gray-500">{item.summary?.substring(0, 60)}...</div>
        </div>
      </div>
    )}
  />
);

// Admin Media
const AdminMedia = () => (
  <AdminCRUD 
    title="Media"
    endpoint="media"
    fields={[
      { name: "title", label: "Judul", required: true },
      { name: "type", label: "Tipe", type: "select", options: [
        { value: "image", label: "Gambar" },
        { value: "video", label: "Video" }
      ]},
      { name: "url", label: "URL", required: true },
      { name: "description", label: "Deskripsi" },
    ]}
    renderItem={(item) => (
      <div className="flex items-center gap-4">
        {item.type === "image" && <img src={item.url} alt="" className="w-16 h-12 object-cover rounded" />}
        <div>
          <div className="font-medium">{item.title}</div>
          <Badge variant="secondary">{item.type}</Badge>
        </div>
      </div>
    )}
  />
);

// Admin Documents
const AdminDocuments = () => (
  <AdminCRUD 
    title="Dokumen"
    endpoint="documents"
    fields={[
      { name: "title", label: "Judul", required: true },
      { name: "slug", label: "Slug (URL)", required: true },
      { name: "docType", label: "Tipe", type: "select", required: true, options: [
        { value: "documentation", label: "Dokumentasi" },
        { value: "activity", label: "Kegiatan" },
        { value: "report", label: "Laporan" }
      ]},
      { name: "description", label: "Deskripsi" },
      { name: "content", label: "Konten", type: "textarea" },
    ]}
    renderItem={(item) => (
      <div>
        <div className="font-medium">{item.title}</div>
        <Badge variant="secondary">{item.docType}</Badge>
      </div>
    )}
  />
);

// Admin Events
const AdminEvents = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [regDialogOpen, setRegDialogOpen] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}/events`);
      setEvents(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRegistrations = async (eventId) => {
    try {
      const res = await axios.get(`${API}/events/${eventId}/registrations`, { headers });
      setRegistrations(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingId) {
        await axios.put(`${API}/events/${editingId}`, formData, { headers });
      } else {
        await axios.post(`${API}/events`, formData, { headers });
      }
      fetchEvents();
      setDialogOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (e) {
      alert("Gagal menyimpan");
    }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus?")) return;
    try {
      await axios.delete(`${API}/events/${id}`, { headers });
      fetchEvents();
    } catch (e) {
      alert("Gagal menghapus");
    }
  };

  const viewRegistrations = (event) => {
    setSelectedEvent(event);
    fetchRegistrations(event.id);
    setRegDialogOpen(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Event</h1>
        <Button className="gradient-primary" onClick={() => { setFormData({}); setEditingId(null); setDialogOpen(true); }}>
          <Plus size={16} className="mr-2" /> Tambah Event
        </Button>
      </div>

      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="divide-y">
            {events.map((event) => (
              <div key={event.id} className="p-4 flex justify-between items-center hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  {event.bannerImage && <img src={event.bannerImage} alt="" className="w-20 h-14 object-cover rounded" />}
                  <div>
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-gray-500">{event.date} • {event.location}</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => viewRegistrations(event)}>
                    <Users size={14} className="mr-1" /> Peserta
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setFormData(event); setEditingId(event.id); setDialogOpen(true); }}>
                    <Edit size={14} />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(event.id)}>
                    <Trash2 size={14} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Event Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Tambah"} Event</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Judul</Label>
                <Input required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <Label>Slug</Label>
                <Input required value={formData.slug || ""} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div>
                <Label>Tanggal</Label>
                <Input type="date" required value={formData.date || ""} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div>
                <Label>Waktu</Label>
                <Input value={formData.time || ""} onChange={e => setFormData({...formData, time: e.target.value})} placeholder="09:00 - 15:00 WIB" />
              </div>
              <div>
                <Label>Lokasi</Label>
                <Input value={formData.location || ""} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div>
                <Label>Kapasitas</Label>
                <Input type="number" value={formData.capacity || ""} onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})} />
              </div>
            </div>
            <div>
              <Label>Banner Image URL</Label>
              <Input value={formData.bannerImage || ""} onChange={e => setFormData({...formData, bannerImage: e.target.value})} />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea rows={4} value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="gradient-primary" disabled={loading}>Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Registrations Dialog */}
      <Dialog open={regDialogOpen} onOpenChange={setRegDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Peserta - {selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[500px]">
            {registrations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Belum ada peserta terdaftar</div>
            ) : (
              <div className="space-y-3">
                {registrations.map((reg, i) => (
                  <Card key={reg.id} className="border shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{i + 1}. {reg.fullName}</div>
                          <div className="text-sm text-gray-500 space-y-1 mt-1">
                            <div className="flex items-center gap-2"><Mail size={12} /> {reg.email}</div>
                            <div className="flex items-center gap-2"><Phone size={12} /> {reg.phone}</div>
                            {reg.organization && <div className="flex items-center gap-2"><Building size={12} /> {reg.organization}</div>}
                          </div>
                          {reg.notes && <p className="text-sm mt-2 text-gray-600">{reg.notes}</p>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              const csv = registrations.map(r => `${r.fullName},${r.email},${r.phone},${r.organization || ""},${r.notes || ""}`).join("\n");
              const blob = new Blob([`Nama,Email,Phone,Organisasi,Catatan\n${csv}`], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `peserta-${selectedEvent?.slug || "event"}.csv`;
              a.click();
            }}>
              <Download size={16} className="mr-2" /> Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Admin Tasks (AI Personal Agent)
const AdminTasks = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState({ status: "", assignee: "" });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [aiInput, setAiInput] = useState("");

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      let url = `${API}/tasks`;
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.assignee) params.append("assignee", filter.assignee);
      if (params.toString()) url += `?${params.toString()}`;
      const res = await axios.get(url, { headers });
      setTasks(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API}/tasks/${editingId}`, formData, { headers });
      } else {
        await axios.post(`${API}/tasks`, formData, { headers });
      }
      fetchTasks();
      setDialogOpen(false);
      setFormData({});
      setEditingId(null);
    } catch (e) {
      alert("Gagal menyimpan");
    }
  };

  const handleAI = async () => {
    if (!aiInput.trim()) return;
    try {
      const res = await axios.post(`${API}/ai-agent`, { text: aiInput }, { headers });
      setFormData(res.data.task);
      setDialogOpen(true);
      setAiInput("");
    } catch (e) {
      alert("Gagal memproses");
    }
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === "done" ? "pending" : "done";
    try {
      await axios.put(`${API}/tasks/${task.id}`, { ...task, status: newStatus }, { headers });
      fetchTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus?")) return;
    try {
      await axios.delete(`${API}/tasks/${id}`, { headers });
      fetchTasks();
    } catch (e) {
      alert("Gagal menghapus");
    }
  };

  const priorityColors = {
    low: "bg-gray-100 text-gray-700",
    medium: "bg-yellow-100 text-yellow-700",
    high: "bg-red-100 text-red-700"
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">AI Personal Agent</h1>
        <Button className="gradient-primary" onClick={() => { setFormData({}); setEditingId(null); setDialogOpen(true); }}>
          <Plus size={16} className="mr-2" /> Tambah Tugas
        </Button>
      </div>

      {/* AI Input */}
      <Card className="border-0 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="text-cyan-500" size={20} />
            Natural Language Input (Mock)
          </CardTitle>
          <CardDescription>Ketik tugas dalam bahasa natural, AI akan mengubahnya menjadi task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              placeholder="Contoh: Buat rapat dengan tim marketing besok jam 10 pagi"
              value={aiInput}
              onChange={e => setAiInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAI()}
            />
            <Button onClick={handleAI} className="gradient-primary">
              <Sparkles size={16} className="mr-2" /> Proses
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={filter.status || "all"} onValueChange={v => setFilter({...filter, status: v === "all" ? "" : v})}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-0">
          <div className="divide-y">
            {tasks.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Belum ada tugas</div>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="p-4 flex justify-between items-start hover:bg-gray-50">
                  <div className="flex gap-4">
                    <button onClick={() => toggleStatus(task)} className="mt-1">
                      {task.status === "done" ? (
                        <CheckCircle className="text-emerald-500" size={24} />
                      ) : (
                        <Circle className="text-gray-300" size={24} />
                      )}
                    </button>
                    <div>
                      <div className={`font-medium ${task.status === "done" ? "line-through text-gray-400" : ""}`}>
                        {task.title}
                      </div>
                      {task.description && <p className="text-sm text-gray-500 mt-1">{task.description}</p>}
                      <div className="flex gap-2 mt-2">
                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                        {task.dueDate && <Badge variant="outline"><Clock size={12} className="mr-1" /> {task.dueDate}</Badge>}
                        {task.assignee && <Badge variant="secondary">{task.assignee}</Badge>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => { setFormData(task); setEditingId(task.id); setDialogOpen(true); }}>
                      <Edit size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(task.id)}>
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Task Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit" : "Tambah"} Tugas</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Judul</Label>
              <Input required value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} />
            </div>
            <div>
              <Label>Deskripsi</Label>
              <Textarea value={formData.description || ""} onChange={e => setFormData({...formData, description: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tanggal Jatuh Tempo</Label>
                <Input type="date" value={formData.dueDate || ""} onChange={e => setFormData({...formData, dueDate: e.target.value})} />
              </div>
              <div>
                <Label>Assignee</Label>
                <Input value={formData.assignee || ""} onChange={e => setFormData({...formData, assignee: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Prioritas</Label>
                <Select value={formData.priority || "medium"} onValueChange={v => setFormData({...formData, priority: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select value={formData.status || "pending"} onValueChange={v => setFormData({...formData, status: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Reminder</Label>
              <Input type="datetime-local" value={formData.remindAt || ""} onChange={e => setFormData({...formData, remindAt: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button type="submit" className="gradient-primary">Simpan</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Admin Pages
const AdminPages = () => {
  const { token } = useAuth();
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState("home");
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetchPage(selectedPage);
  }, [selectedPage]);

  const fetchPage = async (pageId) => {
    try {
      const res = await axios.get(`${API}/pages/${pageId}`);
      setFormData(res.data);
    } catch (e) {
      setFormData({ pageId, heroTitle: "", heroSubtitle: "", heroDescription: "", heroImage: "", sections: [] });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/pages`, { ...formData, pageId: selectedPage }, { headers });
      alert("Berhasil disimpan!");
    } catch (e) {
      alert("Gagal menyimpan");
    }
    setSaving(false);
  };

  const pageOptions = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "philosophy", label: "Philosophy" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Halaman</h1>

      <Tabs value={selectedPage} onValueChange={setSelectedPage}>
        <TabsList className="mb-6">
          {pageOptions.map(p => (
            <TabsTrigger key={p.id} value={p.id}>{p.label}</TabsTrigger>
          ))}
        </TabsList>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6 space-y-6">
            <div>
              <Label>Hero Title</Label>
              <Input 
                value={formData.heroTitle || ""} 
                onChange={e => setFormData({...formData, heroTitle: e.target.value})}
              />
            </div>
            <div>
              <Label>Hero Subtitle</Label>
              <Input 
                value={formData.heroSubtitle || ""} 
                onChange={e => setFormData({...formData, heroSubtitle: e.target.value})}
              />
            </div>
            <div>
              <Label>Hero Description</Label>
              <Textarea 
                rows={4}
                value={formData.heroDescription || ""} 
                onChange={e => setFormData({...formData, heroDescription: e.target.value})}
              />
            </div>
            <div>
              <Label>Hero Image URL</Label>
              <Input 
                value={formData.heroImage || ""} 
                onChange={e => setFormData({...formData, heroImage: e.target.value})}
              />
            </div>

            <Button onClick={handleSave} className="gradient-primary" disabled={saving}>
              {saving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
};

// Admin Members
const AdminMembers = () => (
  <AdminCRUD 
    title="Anggota"
    endpoint="members"
    fields={[
      { name: "name", label: "Nama", required: true },
      { name: "position", label: "Jabatan" },
      { name: "division", label: "Divisi" },
    ]}
    renderItem={(item) => (
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold">
          {item.name.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{item.name}</div>
          <div className="text-sm text-gray-500">{item.position} - {item.division}</div>
        </div>
      </div>
    )}
  />
);

// ==================== MAIN APP ====================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <CustomCursor />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><PublicNavbar /><HomePage /><Footer /></>} />
          <Route path="/about" element={<><PublicNavbar /><AboutPage /><Footer /></>} />
          <Route path="/philosophy" element={<><PublicNavbar /><PhilosophyPage /><Footer /></>} />
          <Route path="/events" element={<><PublicNavbar /><EventsPage /><Footer /></>} />
          <Route path="/events/:slug" element={<><PublicNavbar /><EventDetailPage /><Footer /></>} />
          <Route path="/articles" element={<><PublicNavbar /><ArticlesPage /><Footer /></>} />
          <Route path="/articles/:slug" element={<><PublicNavbar /><ArticleDetailPage /><Footer /></>} />
          <Route path="/gallery" element={<><PublicNavbar /><GalleryPage /><Footer /></>} />
          <Route path="/documentation" element={<><PublicNavbar /><DocumentsPage docType="documentation" title="Dokumentasi" /><Footer /></>} />
          <Route path="/documentation/:slug" element={<><PublicNavbar /><DocumentDetailPage /><Footer /></>} />
          <Route path="/activities" element={<><PublicNavbar /><DocumentsPage docType="activity" title="Kegiatan" /><Footer /></>} />
          <Route path="/activities/:slug" element={<><PublicNavbar /><DocumentDetailPage /><Footer /></>} />
          <Route path="/reports" element={<><PublicNavbar /><DocumentsPage docType="report" title="Laporan" /><Footer /></>} />
          <Route path="/reports/:slug" element={<><PublicNavbar /><DocumentDetailPage /><Footer /></>} />

          {/* Auth Routes */}
          <Route path="/admin/sign-in" element={<AdminSignIn />} />
          <Route path="/admin/sign-up" element={<AdminSignUp />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute><AdminLayout><AdminDashboard /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/pages" element={<ProtectedRoute><AdminLayout><AdminPages /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/articles" element={<ProtectedRoute><AdminLayout><AdminArticles /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/media" element={<ProtectedRoute><AdminLayout><AdminMedia /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/documents" element={<ProtectedRoute><AdminLayout><AdminDocuments /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><AdminLayout><AdminEvents /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/tasks" element={<ProtectedRoute><AdminLayout><AdminTasks /></AdminLayout></ProtectedRoute>} />
          <Route path="/admin/members" element={<ProtectedRoute><AdminLayout><AdminMembers /></AdminLayout></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
