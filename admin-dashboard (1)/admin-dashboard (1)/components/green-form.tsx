'use client';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {motion,AnimatePresence} from 'framer-motion'
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { db, storage } from '@/lib/firebase/config';


const GreenForm = () => {

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        photo: null as File | null,
    });

    const [loading, setLoading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<boolean>(false);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const [errorMsg,setErrorMsg] = useState<string>('')
    const router = useRouter();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768); // Adjust breakpoint if needed
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name,value } = e.target;

        if(name === 'phone'){
             // If value is not numeric
            if(!/^\d*$/.test(value)){
                setErrorMsg('Only numbers are allowed');
                return;
            }

            // If value exceeds 10 digits
            if (value.length > 10) return;

            // Clear error if everything is fine
            setErrorMsg('');
        };

        setFormData({ ...formData, [name]: value });
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if(!file){
            setErrorMsg('please upload photo')
            return;
        }
        if (file) {
            setFormData({ ...formData, photo: file });
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const removePhoto = () => {
        setFormData({ ...formData, photo: null });
        setPreviewUrl(null);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg('');

        //Validate phone Number
        if (!/^\d{10}$/.test(formData.phone)) {
            setErrorMsg("Phone number must be exactly 10 digits.");
            setLoading(false);
            return;
        }

        if(!formData.photo){
            setErrorMsg('Please upload your photo');
            setLoading(false)
            return;
        }

        try {
            let imageUrl = ''
            
            // Upload image if present
            if(formData.photo){
                const imageRef = ref(storage, `greenForms/${Date.now()}_${formData.photo.name}`);
                const snapShot = await uploadBytes(imageRef, formData.photo);
                imageUrl = await getDownloadURL(snapShot?.ref)
            };

            // Step 2: Save to Firestore
            const result = await addDoc(collection(db, 'greenForms'), {
                name: formData.name,
                phone: formData.phone,
                image: imageUrl,
                createdAt: new Date().toISOString(),
            });

            setSuccessMsg(true);
            setTimeout(() => {
                setFormData({ name: '', phone: '', photo: null });
                setPreviewUrl(null);
                setLoading(false);
                
            }, 3000);

        } catch (err) {
            console.error('Error:', err);
            setErrorMsg('Failed to submit form. Please try again');
        } finally {
            setLoading(false);
        }
    };


    return (
        <>
            {successMsg  ? (
                <div className='bg-gradient-to-br from-green-100 via-white to-green-50 p-6 rounded-2xl shadow-2xl max-w-md mx-auto text-black text-center animate-fade-in space-y-4'>
                    <div className='relative inline-block'>
                        {formData.photo && (
                            <img
                                src={URL.createObjectURL(formData.photo)}
                                alt='Uploaded Photo'
                                className='w-24 h-24 rounded-full object-cover shadow-lg border-4 border-green-400'
                            />
                        )}
                    </div>

                    <h2 className='text-3xl font-extrabold text-green-700'>Thank You!</h2>

                    <p className='text-lg font-medium'>
                        Dear <span className='text-green-800 underline decoration-green-400'>{formData.name}</span>,
                    </p>
                </div>

            ) : (
                <AnimatePresence>
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        className='bg-white p-6 rounded-sm shadow-xl max-w-lg mx-auto'>
                        <form onSubmit={handleSubmit} className='space-y-4 text-black'>
                            <h1 className='text-green-500 text-center uppercase font-semibold text-lg'>Go Green</h1>
                            {errorMsg && (
                                <span className='text-center text-red-500 text-sm sm:text-sm'>{errorMsg}</span>
                            )}

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Full Name</label>
                                <input
                                    type='text'
                                    name='name'
                                    value={formData.name}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-md px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500'
                                    placeholder='Your Name'
                                    required
                                />
                            </div>

                            <div>
                                <label className='block text-sm font-medium text-gray-700 mb-1'>Phone Number</label>
                                <input
                                    type='text'
                                    name='phone'
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className='w-full border border-gray-300 rounded-md px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-500'
                                    placeholder='e.g. 8976541234'
                                    required
                                />
                            </div>

                            <div>
                            <label className='block text-sm font-medium text-gray-700 mb-1'>Profile Image</label>
                            {!previewUrl ? (
                                <div className="flex flex-col sm:flex-row gap-2">
                                    {isMobile && (
                                        <label className="flex-1 cursor-pointer bg-green-100 hover:bg-green-200 text-green-700 text-sm py-2 rounded-md text-center border border-green-400">
                                            📸 Take Photo
                                            <input
                                                type="file"
                                                accept="image/*"
                                                capture="environment"
                                                onChange={handlePhotoChange}
                                                className="hidden"
                                            />
                                        </label>
                                    )}

                                    <label className="flex-1 cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm py-2 rounded-md text-center border border-blue-400">
                                        🖼️ Choose from Gallery
                                        <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="flex items-center space-x-4">
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className='w-20 h-20 rounded-full object-cover border border-gray-300'
                                    />
                                    <button
                                        type="button"
                                        onClick={removePhoto}
                                        className="text-red-600 hover:underline text-sm"
                                    >
                                        Remove
                                    </button>
                                </div>
                            )}
                            </div>

                            <button
                            type='submit'
                            disabled={loading}
                            className={`w-full uppercase font-semibold py-2 rounded-lg transition flex items-center justify-center ${
                                loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                            >
                            {loading ? (
                                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                                'Submit'
                            )}
                            </button>
                        </form>
                    </motion.div>
                </AnimatePresence>
            )}
        </>
    );
};

export default GreenForm;
