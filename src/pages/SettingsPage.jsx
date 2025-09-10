import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building, Settings, Globe, ArrowLeft } from 'lucide-react';
import BrandingSettings from '@/components/admin/BrandingSettings.jsx';
import ReceiptCustomization from '@/components/admin/ReceiptCustomization.jsx';
import CurrencySettings from '@/components/admin/CurrencySettings.jsx';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();
    
    const settingsTabs = [
        { value: 'branding', label: 'Branding', icon: Building, component: <BrandingSettings /> },
        { value: 'receipt', label: 'Receipt', icon: Settings, component: <ReceiptCustomization /> },
        { value: 'currency', label: 'Currency', icon: Globe, component: <CurrencySettings /> },
    ];

    return (
         <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <Settings className="w-8 h-8 text-amber-400"/>
                    <h1 className="text-3xl font-bold text-amber-100">System Settings</h1>
                </div>
                <Button variant="outline" onClick={() => navigate('/admin')} className="border-amber-800/50 text-amber-100">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                </Button>
            </div>
            <p className="mb-8 text-amber-200/80 max-w-2xl">
                Configure your business branding, customize receipt appearance, and manage your operational currency.
            </p>
            <Tabs defaultValue="branding" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-black/20 border border-amber-800/50">
                    {settingsTabs.map(tab => (
                        <TabsTrigger key={tab.value} value={tab.value}>
                            <tab.icon className="w-4 h-4 mr-2"/>
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {settingsTabs.map(tab => (
                     <TabsContent key={tab.value} value={tab.value} className="mt-6">
                        {tab.component}
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};

export default SettingsPage;
