
import React, { useState, useEffect } from 'react';
import { Order, MessageTypeKey, CustomMessagesConfig, AppSettingsConfig } from '../types';
import { Modal } from './Modal';
import { LoadingSpinner } from './LoadingSpinner';
import { PaperAirplaneIcon, ArrowPathIcon } from './icons'; // Replaced SparklesIcon with ArrowPathIcon for reload
import { replacePlaceholders } from '../services/placeholderService';
import { DEFAULT_CUSTOM_MESSAGES } from '../constants';


interface MessageGenerationModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onSendMessage: (order: Order, message: string, messageTypeKey: MessageTypeKey) => void; // Removed sentByAI
  targetMessageTypeKey: MessageTypeKey | null; // Key to determine which template to load
  customMessagesConfig: CustomMessagesConfig;
  appSettings: AppSettingsConfig; 
}

export const MessageGenerationModal: React.FC<MessageGenerationModalProps> = ({ 
  order, 
  isOpen, 
  onClose, 
  onSendMessage,
  targetMessageTypeKey,
  customMessagesConfig,
  appSettings
}) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentLoadedKey, setCurrentLoadedKey] = useState<MessageTypeKey | null>(null);


  const loadTemplate = async () => {
    if (!order || !targetMessageTypeKey) {
      setMessage('');
      setCurrentLoadedKey(null);
      return;
    }
    setIsLoading(true);
    setCurrentLoadedKey(targetMessageTypeKey);
    try {
      let templateString = '';
      const customTemplateDef = customMessagesConfig[targetMessageTypeKey];
      
      if (customTemplateDef?.template) {
        templateString = customTemplateDef.template;
      } else {
        const defaultTemplateDef = DEFAULT_CUSTOM_MESSAGES[targetMessageTypeKey];
        templateString = defaultTemplateDef?.template || `Error: Template for ${targetMessageTypeKey} not found.`;
      }
      const finalMessage = replacePlaceholders(templateString, order, appSettings);
      setMessage(finalMessage);
    } catch (error) {
      console.error("Error loading template:", error);
      setMessage(`Error loading template for ${targetMessageTypeKey}. Please check console or template configuration.`);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isOpen && order && targetMessageTypeKey && targetMessageTypeKey !== currentLoadedKey) {
      loadTemplate();
    } else if (!isOpen) {
      setMessage(''); 
      setCurrentLoadedKey(null); // Reset when modal closes
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order, targetMessageTypeKey, customMessagesConfig, appSettings]);


  const handleSend = () => {
    if (order && message && targetMessageTypeKey) {
      onSendMessage(order, message, targetMessageTypeKey);
      onClose();
    }
  };

  if (!order) return null;

  const templateName = targetMessageTypeKey ? (customMessagesConfig[targetMessageTypeKey]?.name || DEFAULT_CUSTOM_MESSAGES[targetMessageTypeKey]?.name || "Selected Template") : "Message";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Prepare Message for Order: ${order.id}`} size="2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-800">
            {templateName} for {order.customerName}
          </h3>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <LoadingSpinner text="Loading template..." />
          </div>
        ) : (
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={12} 
            className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm min-h-[200px]"
            placeholder="Message content will appear here..."
          />
        )}

        <div className="flex justify-end items-center space-x-3 pt-4">
          <button
            type="button"
            onClick={loadTemplate} // Now reloads the current target template
            disabled={isLoading || !targetMessageTypeKey}
            className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 flex items-center"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" /> {/* Changed icon */}
            {isLoading ? 'Loading...' : 'Reload Template'}
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !message || !targetMessageTypeKey}
            className="px-6 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
          >
            <PaperAirplaneIcon className="w-4 h-4 mr-2" />
            Send Message
          </button>
        </div>
      </div>
    </Modal>
  );
};