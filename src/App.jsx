import { supabase } from './supabaseClient';
import React, { useState, useRef, useEffect } from 'react'; 
import { 
  Camera, MessageCircle, Plus, X, Trash2, 
  ShieldCheck, Car, Search, Moon, Sun, Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); 
  const [showMobileMenu, setShowMobileMenu] = useState(false); 
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState("");
  const [cars, setCars] = useState([]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const SECRET_PASSCODE = "2026"; 

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data, error } = await supabase
      .from('cars')
      .select('*')
      .order('id', { ascending: false });
    if (!error) setCars(data || []);
  };

  const filteredCars = cars.filter(car => 
    car.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdminLogin = () => {
    if (passcodeInput === SECRET_PASSCODE) {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setPasscodeInput("");
      setShowMobileMenu(false);
    } else {
      alert("Invalid Dealer Passcode");
    }
  };
  
  const handleAddCar = async (newCar, file) => {
    let finalImageUrl = "";
    
    // 1. UPLOAD TO BUCKET
    if (file) {
      const fileName = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('car-images')
        .upload(fileName, file);

      if (uploadError) {
        alert("Upload Error: " + uploadError.message);
        return;
      }

      // 2. GET PUBLIC URL
      const { data } = supabase.storage.from('car-images').getPublicUrl(fileName);
      finalImageUrl = data.publicUrl;
    }

    // 3. INSERT INTO DATABASE
    const { error } = await supabase.from('cars').insert([{ 
      name: newCar.name, 
      price: newCar.price, 
      year: newCar.year, 
      condition: newCar.condition, 
      image_url: finalImageUrl 
    }]);

    if (!error) { 
      fetchCars(); 
      setShowPostModal(false); 
    } else {
      alert("Database Error: " + error.message);
    }
  };

  const deleteCar = async (id) => {
    if(window.confirm("Sold?")) {
      const { error } = await supabase.from('cars').delete().eq('id', id);
      if (!error) fetchCars();
    }
  };

  const contactDealer = (car) => {
    const phone = "2348079387611"; 
    const msg = `Hello! Interested in the ${car.year} ${car.name} (₦${car.price}).`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className={`min-h-screen font-sans relative transition-colors duration-500 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* BACKGROUNDS */}
      <div className="fixed inset-0 -z-20">
        <img src="/logored.jpeg" className="w-full h-full object-cover" alt="bg" />
      </div>
      <div className={`fixed inset-0 -z-10 backdrop-blur-2xl transition-colors duration-500 ${isDarkMode ? 'bg-black/80' : 'bg-white/60'}`} />

      {/* NAVBAR */}
      <nav className={`p-4 sticky top-0 z-50 flex justify-between items-center px-6 border-b transition-colors ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-white/20 border-white/40'}`}>
        <h1 className={`text-lg font-black italic tracking-tighter ${isDarkMode ? 'text-blue-400' : 'text-blue-700'}`}>
          DEMOLA KBJ<span className={isDarkMode ? 'text-white' : 'text-black'}>AUTOS</span>
        </h1>
        
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg bg-white/10 border border-white/20">
            {isDarkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-blue-700" />}
          </button>
          
          <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden p-2">
            <Menu size={24} className={isDarkMode ? 'text-white' : 'text-slate-900'} />
          </button>

          <div className="hidden md:block">
            <button onClick={() => isAdmin ? setIsAdmin(false) : setShowAdminLogin(true)} className="text-[10px] font-black uppercase px-4 py-2 rounded-lg border border-blue-100 bg-white/80 text-blue-800">
              {isAdmin ? "Logout" : "Dealer Access"}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`absolute top-16 left-0 w-full p-6 z-40 border-b shadow-2xl ${isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-100'}`}>
            <button onClick={() => { setShowAdminLogin(true); setShowMobileMenu(false); }} className="w-full py-4 text-center font-black uppercase text-xs tracking-widest border rounded-xl">
              {isAdmin ? "Admin Active" : "Dealer Access"}
            </button>
            {isAdmin && <button onClick={() => setIsAdmin(false)} className="w-full mt-2 py-4 text-red-500 text-xs font-black uppercase">Logout</button>}
          </motion.div>
        )}
      </AnimatePresence>

      <header className="px-6 py-8 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-bold mb-3 border uppercase tracking-tighter ${isDarkMode ? 'bg-blue-900/40 text-blue-300 border-blue-800' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
            <ShieldCheck size={10}/> Verified Dealer
          </div>
          <h2 className={`text-3xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Luxury Wheels. <br/> <span className="text-blue-500">Pure Excellence.</span></h2>
        </motion.div>
      </header>

      {/* SEARCH */}
      <div className="px-6 max-w-3xl mx-auto mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" placeholder="Search showroom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full p-4 pl-12 rounded-xl outline-none transition-all font-bold text-sm shadow-md ${isDarkMode ? 'bg-white/10 border-white/10 text-white' : 'bg-white/80 border-white text-slate-900'}`}
          />
        </div>
      </div>

      <main className="p-3 max-w-4xl mx-auto pb-32">
        <div className="flex justify-between items-center px-2 mb-6">
          <h3 className={`font-bold text-[10px] uppercase tracking-[0.2em] ${isDarkMode ? 'text-white/40' : 'text-slate-500'}`}>Inventory</h3>
          {isAdmin && (
            <button onClick={() => setShowPostModal(true)} className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-bold flex items-center gap-2 text-xs">
              <Plus size={16}/> New
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6"> 
          {filteredCars.map((car) => (
            <ProductCard key={car.id} car={car} isAdmin={isAdmin} isDarkMode={isDarkMode} onDelete={deleteCar} onContact={contactDealer} onImageClick={(url) => setSelectedImage(url)} />
          ))}
        </div>
      </main>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
            <button className="absolute top-6 right-6 text-white bg-white/10 p-3 rounded-full"><X size={24} /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} src={selectedImage} className="max-w-full max-h-[80vh] rounded-2xl object-contain" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Admin Login Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div initial={{y:20, opacity:0}} animate={{y:0, opacity:1}} className={`p-6 rounded-[2rem] w-full max-w-xs shadow-2xl ${isDarkMode ? 'bg-slate-900 border border-white/10' : 'bg-white'}`}>
              <h2 className="text-xl font-black mb-6 text-center uppercase italic text-blue-600">Admin</h2>
              <input type="password" value={passcodeInput} onChange={(e) => setPasscodeInput(e.target.value)} placeholder="••••" className={`w-full p-4 rounded-xl mb-4 text-center text-xl font-black outline-none border-2 ${isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-blue-500' : 'bg-slate-100 focus:border-blue-500'}`} />
              <button onClick={handleAdminLogin} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black uppercase text-xs tracking-widest">Login</button>
              <button onClick={() => setShowAdminLogin(false)} className="w-full text-slate-400 mt-4 text-[9px] font-black uppercase text-center">Cancel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <PostModal isDarkMode={isDarkMode} onClose={() => setShowPostModal(false)} onPost={handleAddCar} />
        )}
      </AnimatePresence>
    </div>
  );
};

const PostModal = ({ onClose, onPost, isDarkMode }) => {
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', year: '', condition: 'Tokunbo' });
  const fileRef = useRef();

  return (
    <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} className={`fixed inset-0 z-[200] p-6 overflow-y-auto ${isDarkMode ? 'bg-slate-950 text-white' : 'bg-white'}`}>
      <div className="max-w-md mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-black italic text-blue-600 uppercase">New Unit</h2>
          <X onClick={onClose} className="cursor-pointer p-2 rounded-full bg-slate-100 text-black" />
        </div>
        {!image ? (
          <div onClick={() => fileRef.current.click()} className="aspect-video border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer bg-white/5 border-white/20">
            <input type="file" accept="image/*" ref={fileRef} className="hidden" onChange={(e) => {
              const selectedFile = e.target.files[0];
              if (!selectedFile) return;
              setFile(selectedFile);
              const reader = new FileReader();
              reader.onload = (r) => setImage(r.target.result);
              reader.readAsDataURL(selectedFile);
            }} />
            <Camera size={32} className="text-blue-600 mb-2" />
            <p className="font-black uppercase text-[10px]">Add Photo</p>
          </div>
        ) : (
          <div className="space-y-4">
            <img src={image} className="aspect-video w-full object-cover rounded-2xl" alt="preview" />
            <input type="text" placeholder="Model" className={`w-full p-4 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-50'}`} onChange={(e) => setForm({...form, name: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Year" className={`w-full p-4 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-50'}`} onChange={(e) => setForm({...form, year: e.target.value})} />
              <input type="text" placeholder="Price" className={`w-full p-4 rounded-xl font-bold text-blue-500 text-sm ${isDarkMode ? 'bg-white/10 border-white/10' : 'bg-slate-50'}`} onChange={(e) => setForm({...form, price: e.target.value})} />
            </div>
            <select className={`w-full p-4 rounded-xl font-bold text-sm ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-black'}`} onChange={(e) => setForm({...form, condition: e.target.value})}>
                <option>Tokunbo</option>
                <option>Nigerian Used</option>
                <option>Brand New</option>
            </select>
            <button onClick={() => onPost(form, file)} className="w-full bg-blue-600 text-white py-4 rounded-xl font-black text-sm uppercase">Upload</button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const ProductCard = ({ car, isAdmin, isDarkMode, onDelete, onContact, onImageClick }) => (
  <motion.div layout whileHover={{ y: -5 }} className={`p-2.5 rounded-[1.8rem] shadow-lg group border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white/70 border-white shadow-blue-900/5'}`}>
    <div className="aspect-[4/3] rounded-[1.4rem] overflow-hidden relative mb-3 cursor-zoom-in" onClick={() => onImageClick(car.image_url)}>
      <img src={car.image_url} className="w-full h-full object-cover" alt="car" onError={(e) => { e.target.src = "https://via.placeholder.com/400x300?text=Image+Not+Found"; }}/>
      <div className="absolute top-2 right-2 bg-blue-600 px-2 py-0.5 rounded-full text-[7px] font-black uppercase text-white shadow-md">
        {car.condition}
      </div>
    </div>

    <div className="px-1 text-center">
      <p className={`text-[7px] font-black uppercase mb-0.5 ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>{car.year}</p>
      <h4 className={`text-[11px] font-black mb-0.5 uppercase truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{car.name}</h4>
      <p className="text-[10px] font-black text-blue-500 mb-3 italic">₦{car.price}</p>
      {isAdmin ? (
        <button onClick={() => onDelete(car.id)} className="w-full bg-red-500/10 text-red-500 py-2 rounded-lg font-black text-[8px] uppercase border border-red-500/20">Delete</button>
      ) : (
        <button onClick={() => onContact(car)} className={`w-full py-2 rounded-xl font-black text-[8px] uppercase flex items-center justify-center gap-1 active:scale-95 transition-all ${isDarkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}>
          <MessageCircle size={10}/> Enquiry
        </button>
      )}
    </div>
  </motion.div>
);

export default App;