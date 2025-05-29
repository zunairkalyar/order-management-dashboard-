import React, { useState, useEffect } from 'react';
import { WhatsAppAPIConfig } from '../types';
import { PaperAirplaneIcon, CheckCircleIcon, XCircleIcon } from './icons'; // Assuming you have these
import { LoadingSpinner } from './LoadingSpinner';

interface WhatsAppAPISettingsViewProps {
  initialConfig: WhatsAppAPIConfig;
  onSaveConfig: (config: WhatsAppAPIConfig) => void;
  onSendTestMessage: (recipient: string, message: string, config: WhatsAppAPIConfig) => Promise<{ success: boolean; response: any }>;
}

const defaultTestRecipient = '923001234567'; // Example, user should change

export const WhatsAppAPISettingsView: React.FC<WhatsAppAPISettingsViewProps> = ({
  initialConfig,
  onSaveConfig,
  onSendTestMessage,
}) => {
  const [config, setConfig] = useState<WhatsAppAPIConfig>(initialConfig);
  const [testRecipient, setTestRecipient] = useState<string>(defaultTestRecipient);
  const [testMessage, setTestMessage] = useState<string>('This is a test message from the Order Management Dashboard.');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [sendResponse, setSendResponse] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setConfig(initialConfig);
  }, [initialConfig]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setConfig(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSaveConfig(config);
    setSendResponse({type: 'success', message: 'API Settings saved successfully!'})
    setTimeout(() => setSendResponse(null), 3000);
  };

  const handleSendTest = async () => {
    if (!testRecipient || !testMessage) {
      setSendResponse({ type: 'error', message: 'Recipient number and message cannot be empty.' });
      return;
    }
    setIsSending(true);
    setSendResponse(null);
    try {
      const result = await onSendTestMessage(testRecipient, testMessage, config);
      if (result.success) {
        setSendResponse({ type: 'success', message: `Test message sent to ${testRecipient}. Mock Response: ${JSON.stringify(result.response)}` });
      } else {
        setSendResponse({ type: 'error', message: `Failed to send test message. Mock Response: ${JSON.stringify(result.response)}` });
      }
    } catch (error) {
      console.error("Error sending test message:", error);
      setSendResponse({ type: 'error', message: `Error sending test message: ${error instanceof Error ? error.message : String(error)}` });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 bg-white shadow-lg rounded-xl space-y-8">
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">WhatsApp API Configuration</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="apiUrl" className="block text-sm font-medium text-gray-700">API URL</label>
            <input
              type="text"
              name="apiUrl"
              id="apiUrl"
              value={config.apiUrl}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="instanceId" className="block text-sm font-medium text-gray-700">Instance ID</label>
            <input
              type="text"
              name="instanceId"
              id="instanceId"
              value={config.instanceId}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="accessToken" className="block text-sm font-medium text-gray-700">Access Token</label>
            <input
              type="text"
              name="accessToken"
              id="accessToken"
              value={config.accessToken}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            Save Settings
          </button>
        </div>
      </div>

      <hr className="my-6 border-gray-200" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Send Test Message</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="testRecipient" className="block text-sm font-medium text-gray-700">Recipient Phone Number (e.g., 923001234567)</label>
            <input
              type="tel"
              id="testRecipient"
              value={testRecipient}
              onChange={(e) => setTestRecipient(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="923001234567"
            />
          </div>
          <div>
            <label htmlFor="testMessage" className="block text-sm font-medium text-gray-700">Message</label>
            <textarea
              id="testMessage"
              rows={3}
              value={testMessage}
              onChange={(e) => setTestMessage(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            />
          </div>
          <button
            onClick={handleSendTest}
            disabled={isSending}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 flex items-center"
          >
            {isSending ? (
              <>
                <LoadingSpinner size="sm" color="text-white" />
                <span className="ml-2">Sending...</span>
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="w-4 h-4 mr-2" />
                Send Test Message
              </>
            )}
          </button>
          {sendResponse && (
            <div className={`mt-4 p-3 rounded-md text-sm ${sendResponse.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} flex items-center`}>
              {sendResponse.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2"/> : <XCircleIcon className="w-5 h-5 mr-2"/>}
              {sendResponse.message}
            </div>
          )}
        </div>
      </div>
      
      <hr className="my-6 border-gray-200" />

      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">API Information (PushFlow Example)</h2>
        <div className="space-y-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-md">
          <p><strong>Send Direct Message API (POST Text)</strong></p>
          <p>
            <strong>Resource URL (Example with GET-like params in URL for illustration only):</strong><br />
            <code className="break-all text-xs">https://btn.pushflow.xyz/api/send?number=84933313xxx&amp;type=text&amp;message=test+message&amp;instance_id=609ACF283XXXX&amp;access_token=671f379aa48d0</code>
          </p>
          <p>
            <strong>Actual Resource URL (for POST):</strong><br />
            <code className="text-xs">https://btn.pushflow.xyz/api/send</code>
          </p>
          <p><strong>POST Request Body Structure:</strong></p>
          <pre className="bg-gray-200 p-2 rounded text-xs overflow-x-auto">
            {`Content-Type: application/json
{
  "number": "{int}", // e.g., 923001234567
  "type": "text",
  "message": "{string}",
  "instance_id": "{string}", // Your Instance ID
  "access_token": "{string}" // Your Access Token
}`}
          </pre>
          <p><strong>Parameters:</strong></p>
          <ul className="list-disc list-inside pl-4">
            <li><code className="text-xs">number</code>: Recipient's phone number (e.g., 923001234567 for Pakistan).</li>
            <li><code className="text-xs">type</code>: Should be "text".</li>
            <li><code className="text-xs">message</code>: The text message content.</li>
            <li><code className="text-xs">instance_id</code>: Your PushFlow Instance ID.</li>
            <li><code className="text-xs">access_token</code>: Your PushFlow Access Token.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
