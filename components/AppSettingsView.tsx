
import React, { useState, useEffect } from 'react';
import { AppSettingsConfig } from '../types';
import { LoadingSpinner } from './LoadingSpinner'; 

interface AppSettingsViewProps {
  initialSettings: AppSettingsConfig;
  onSaveSettings: (settings: AppSettingsConfig) => void;
  onResetMockData: () => Promise<void>;
  onClearLocalSettings: () => void;
}

export const AppSettingsView: React.FC<AppSettingsViewProps> = ({
  initialSettings,
  onSaveSettings,
  onResetMockData,
  onClearLocalSettings,
}) => {
  const [settings, setSettings] = useState<AppSettingsConfig>(initialSettings);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? (parseInt(value, 10) || 0) : value
    }));
  };

  const handleSave = () => {
    // Ensure advancePaymentDiscountPercentage is a number
    const processedSettings = {
        ...settings,
        advancePaymentDiscountPercentage: Number(settings.advancePaymentDiscountPercentage) || 0,
        confirmationDelayHours: Number(settings.confirmationDelayHours) || 1,
        pollingIntervalSeconds: Number(settings.pollingIntervalSeconds) || 5,
    };
    onSaveSettings(processedSettings);
  };

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset all mock order data to its initial state? This cannot be undone.")) {
      setIsResetting(true);
      await onResetMockData();
      setIsResetting(false);
    }
  };
  
  const handleClearSettings = () => {
    // Confirmation is handled in App.tsx, directly call here
    onClearLocalSettings();
  };

  interface InputRowProps {
    label: string;
    name: keyof AppSettingsConfig;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    unit?: string;
    min?: number;
    max?: number; // Added max prop
    step?: number;
    placeholder?: string;
  }

  const InputRow: React.FC<InputRowProps> = ({
    label, name, value, onChange, type = "text", unit, min, max, step, placeholder
  }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label} {unit ? `(${unit})` : ''}
      </label>
      <input
        type={type}
        name={name}
        id={name}
        value={value}
        onChange={onChange}
        min={min}
        max={max} // Pass max to input
        step={step}
        placeholder={placeholder}
        className="mt-1 block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
      />
    </div>
  );


  return (
    <div className="p-6 bg-white shadow-lg rounded-xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Application Settings</h2>
        <div className="space-y-6">
          <InputRow 
            label="Confirmation Reminder Delay" 
            name="confirmationDelayHours"
            type="number"
            value={settings.confirmationDelayHours}
            onChange={handleChange}
            unit="hours"
            min={1}
          />
          <InputRow 
            label="TCS Status Polling Interval" 
            name="pollingIntervalSeconds"
            type="number"
            value={settings.pollingIntervalSeconds}
            onChange={handleChange}
            unit="seconds"
            min={5}
          />
          
          <hr className="my-4 border-gray-200" />
          <h3 className="text-lg font-medium text-gray-700">Payment Settings</h3>
           <InputRow 
            label="Easypaisa Account Number" 
            name="easypaisaNumber"
            value={settings.easypaisaNumber}
            onChange={handleChange}
            placeholder="e.g., 03XXXXXXXXX"
          />
           <InputRow 
            label="Easypaisa Account Name" 
            name="easypaisaName"
            value={settings.easypaisaName}
            onChange={handleChange}
            placeholder="e.g., Ali Khan"
          />
          <InputRow 
            label="Advance Payment Discount" 
            name="advancePaymentDiscountPercentage"
            type="number"
            value={settings.advancePaymentDiscountPercentage}
            onChange={handleChange}
            unit="%"
            min={0}
            max={100}
          />
          
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Save App Settings
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Data Management</h2>
        <div className="space-y-4">
          <button
            onClick={handleResetData}
            disabled={isResetting}
            className="px-4 py-2 bg-yellow-500 text-white text-sm font-medium rounded-md shadow-sm hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 disabled:opacity-50 flex items-center"
          >
            {isResetting ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span className="ml-2">Resetting Data...</span>
              </>
            ) : (
              "Reset Mock Order Data"
            )}
          </button>
           <p className="text-xs text-gray-500">
            Resets all orders to their initial state as defined in the application.
          </p>
        </div>
        <div className="mt-6">
            <button
                onClick={handleClearSettings}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                Clear All Local Settings & Use Defaults
            </button>
            <p className="text-xs text-gray-500 mt-1">
                Clears WhatsApp API, App settings, and Custom Message Templates stored in your browser, then applies default values.
            </p>
        </div>
      </div>
    </div>
  );
};