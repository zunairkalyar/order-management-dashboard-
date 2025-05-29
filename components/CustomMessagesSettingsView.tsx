
import React, { useState, useEffect } from 'react';
import { CustomMessagesConfig, MessageTypeKey, CustomMessageDefinition } from '../types';
import { DEFAULT_CUSTOM_MESSAGES } from '../constants'; // To reset to defaults
import { SparklesIcon, ArrowUturnLeftIcon } from './icons'; 

interface CustomMessagesSettingsViewProps {
  initialMessagesConfig: CustomMessagesConfig;
  onSaveConfig: (config: CustomMessagesConfig) => void;
}

export const CustomMessagesSettingsView: React.FC<CustomMessagesSettingsViewProps> = ({
  initialMessagesConfig,
  onSaveConfig,
}) => {
  const [messagesConfig, setMessagesConfig] = useState<CustomMessagesConfig>(initialMessagesConfig);
  const [activeTemplateKey, setActiveTemplateKey] = useState<MessageTypeKey | null>(null);
  const [currentMessage, setCurrentMessage] = useState<string>('');
  const [charCount, setCharCount] = useState<number>(0);

  useEffect(() => {
    setMessagesConfig(initialMessagesConfig);
    if (activeTemplateKey && initialMessagesConfig[activeTemplateKey]) {
        setCurrentMessage(initialMessagesConfig[activeTemplateKey].template);
        setCharCount(initialMessagesConfig[activeTemplateKey].template.length);
    } else if (Object.keys(initialMessagesConfig).length > 0) {
        const firstKey = Object.keys(initialMessagesConfig)[0] as MessageTypeKey;
        setActiveTemplateKey(firstKey);
        setCurrentMessage(initialMessagesConfig[firstKey].template);
        setCharCount(initialMessagesConfig[firstKey].template.length);
    }
  }, [initialMessagesConfig, activeTemplateKey]);


  const handleTemplateSelect = (key: MessageTypeKey) => {
    setActiveTemplateKey(key);
    setCurrentMessage(messagesConfig[key].template);
    setCharCount(messagesConfig[key].template.length);
  };

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMessage(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleSaveCurrentTemplate = () => {
    if (activeTemplateKey) {
      const newConfig = {
        ...messagesConfig,
        [activeTemplateKey]: {
          ...messagesConfig[activeTemplateKey],
          template: currentMessage,
        },
      };
      setMessagesConfig(newConfig); 
      onSaveConfig(newConfig); 
    }
  };
  
  const handleResetCurrentToDefault = () => {
    if (activeTemplateKey && DEFAULT_CUSTOM_MESSAGES[activeTemplateKey]) {
      const defaultTemplate = DEFAULT_CUSTOM_MESSAGES[activeTemplateKey].template;
      setCurrentMessage(defaultTemplate);
      setCharCount(defaultTemplate.length);
       const newConfig = {
        ...messagesConfig,
        [activeTemplateKey]: {
          ...messagesConfig[activeTemplateKey],
          template: defaultTemplate,
        },
      };
      setMessagesConfig(newConfig);
      onSaveConfig(newConfig);
    }
  };

  const handleResetAllToDefault = () => {
    if (window.confirm("Are you sure you want to reset ALL message templates to their default values?")) {
        setMessagesConfig(DEFAULT_CUSTOM_MESSAGES);
        onSaveConfig(DEFAULT_CUSTOM_MESSAGES);
        if (activeTemplateKey && DEFAULT_CUSTOM_MESSAGES[activeTemplateKey]) {
            setCurrentMessage(DEFAULT_CUSTOM_MESSAGES[activeTemplateKey].template);
            setCharCount(DEFAULT_CUSTOM_MESSAGES[activeTemplateKey].template.length);
        } else if (Object.keys(DEFAULT_CUSTOM_MESSAGES).length > 0) {
            const firstKey = Object.keys(DEFAULT_CUSTOM_MESSAGES)[0] as MessageTypeKey;
            setActiveTemplateKey(firstKey);
            setCurrentMessage(DEFAULT_CUSTOM_MESSAGES[firstKey].template);
            setCharCount(DEFAULT_CUSTOM_MESSAGES[firstKey].template.length);
        }
    }
  };
  
  const messageTypeKeys = Object.keys(MessageTypeKey) as MessageTypeKey[];


  return (
    <div className="p-4 sm:p-6 bg-white shadow-xl rounded-xl flex flex-col md:flex-row gap-6 h-full max-h-[calc(100vh-100px)] overflow-hidden">
      {/* Sidebar for template selection */}
      <div className="md:w-1/3 lg:w-1/4 border-r border-gray-200 pr-4 overflow-y-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Message Templates</h2>
        <nav className="space-y-1">
          {messageTypeKeys.map((key) => {
            const def = messagesConfig[key] || DEFAULT_CUSTOM_MESSAGES[key];
            return (
            <button
              key={key}
              onClick={() => handleTemplateSelect(key)}
              className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-colors duration-150
                ${activeTemplateKey === key ? 'bg-purple-600 text-white shadow-md' : 'hover:bg-purple-50 text-gray-700'}`}
            >
              {def?.name || key.replace(/_/g, ' ')}
            </button>
          )})}
        </nav>
        <div className="mt-6">
            <button
                onClick={handleResetAllToDefault}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
                <ArrowUturnLeftIcon className="w-4 h-4 mr-2" />
                Reset All Templates
            </button>
        </div>
      </div>

      {/* Editor for selected template */}
      <div className="flex-1 flex flex-col overflow-y-auto pl-1">
        {activeTemplateKey && messagesConfig[activeTemplateKey] ? (
          <>
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-2xl font-semibold text-gray-800">
                        {messagesConfig[activeTemplateKey].name}
                    </h3>
                    <button
                        onClick={handleResetCurrentToDefault}
                        title="Reset this template to default"
                        className="px-3 py-1.5 text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-yellow-500 flex items-center"
                    >
                       <ArrowUturnLeftIcon className="w-3 h-3 mr-1.5" /> Reset to Default
                    </button>
                </div>
              <p className="text-sm text-gray-500 mt-1">{messagesConfig[activeTemplateKey].description}</p>
            </div>
            
            <div className="flex-grow flex flex-col">
                <label htmlFor="messageTemplate" className="block text-sm font-medium text-gray-700 mb-1">
                    Template Content (Supports WhatsApp formatting: *bold*, _italic_, ~strikethrough~)
                </label>
                <textarea
                    id="messageTemplate"
                    value={currentMessage}
                    onChange={handleMessageChange}
                    rows={18} // Increased from 15 to 18
                    className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm flex-grow min-h-[250px]" // Added min-h
                    placeholder="Enter your custom message template here..."
                />
                <div className="text-right text-xs text-gray-500 mt-1 pr-1">
                    Character count: {charCount}
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="text-md font-semibold text-gray-700 mb-2">Available Placeholders:</h4>
              <div className="flex flex-wrap gap-2">
                {messagesConfig[activeTemplateKey].availablePlaceholders.map(p => (
                  <span key={p} className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded-full cursor-copy" title="Click to copy" onClick={() => navigator.clipboard.writeText(p)}>{p}</span>
                ))}
              </div>
            </div>

            <div className="mt-8 flex justify-end sticky bottom-0 bg-white py-3">
              <button
                onClick={handleSaveCurrentTemplate}
                className="px-6 py-2.5 bg-purple-600 text-white text-sm font-medium rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 flex items-center"
              >
                <SparklesIcon className="w-5 h-5 mr-2" />
                Save This Template
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <SparklesIcon className="w-16 h-16 mb-4 text-gray-300" />
            <p className="text-lg">Select a message template from the left to start editing.</p>
            <p className="text-sm">You can customize messages for various order events.</p>
          </div>
        )}
      </div>
    </div>
  );
};
