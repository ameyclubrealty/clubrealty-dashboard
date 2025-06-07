'use client'
import GreenForm from '@/components/green-form';
import { LeadsList } from '@/components/leads-list';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { GoGreenList } from '@/components/ui/green-list';
import { getGoGreenData } from '@/lib/firebase/green';
import { Plus, RefreshCcw, X } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { motion,AnimatePresence } from 'framer-motion'

const page = () => {
    const [loading, setLoading] = useState(false);
    const [greenData, setGreenData] = useState(null);
    const [showGreenForm, setShowGreenForm] = useState(false);


    async function fetchGreenData() {
            setLoading(true);
            try {
                const response = await getGoGreenData();
                console.log(response)
                if (response.success) {
                    setGreenData(response?.data);
                } else {
                    console.error('Error fetching green initiatives:', response.error);
                }
            } catch (error) {
                console.error('Error fetching green initiatives:', error);
            } finally {
                setLoading(false);
            }
    };

    useEffect(() => {
        // Fetch green data when the component mounts
        fetchGreenData();

    }, []);

    const handleRefresh = () => {
        fetchGreenData();
    }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex flex-row  items-center w-full justify-between">
            {/* Left Side: Title and Description */}
            <div className="flex flex-col gap-3 items-start">
                <CardTitle>Go Green Initiative</CardTitle>
                <CardDescription>View and manage your green initiatives</CardDescription>
            </div>  
            {/* Right Side: Add Button */}
            <div className='uppercase flex items-center gap-4'>
                <Button onClick={() => setShowGreenForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add People
                </Button>
                 <Button size='icon' variant="outline" onClick={handleRefresh}>
                    <RefreshCcw className="h-4 w-4" />
                </Button>
            </div>
        </div>
        <AnimatePresence>
            {showGreenForm && (
                <motion.div
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 flex justify-center items-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="bg-white p-6 rounded-xl relative max-w-lg w-full"
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                    {/* Close Button */}
                    <button onClick={() => setShowGreenForm(false)} className="absolute z-40 cursor-pointer bg-gray-100 rounded-full p-1 hover:bg-gray-200 transition-all duration-200 text-black top-3 right-3">
                        <X size={28} className='hover:text-red-500 transition-all duration-200' />
                    </button>
                    {/* Form Component */}
                    <GreenForm />
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        <Card>
            <CardContent>
            {loading ? <div className="flex justify-center p-4">Loading leads...</div> : <GoGreenList goGreenList={greenData} />}
            </CardContent>
        </Card>
    </div>
  )
}

export default page
