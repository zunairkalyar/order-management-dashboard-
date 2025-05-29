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
  const [sendResponse, setSendResponse] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);
  const [fullResponseJson, setFullResponseJson] = useState<any>(null); // State to store full response

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
      setFullResponseJson(null);
      return;
    }
    setIsSending(true);
    setSendResponse(null);
    setFullResponseJson(null); // Clear previous response
    try {
      const result = await onSendTestMessage(testRecipient, testMessage, config);
      setFullResponseJson(result.response); // Store full response

      // Basic check for the mock response structure
      const isMockResponse = (
        result.response &&
        result.response.type === 'NewOrder' &&
        typeof result.response.content === 'string' &&
        typeof result.response.recipient === 'string'
      );

      if (result.success && !isMockResponse) {
        // Assuming result.success is true for any successful API call,
        // we now also check if it's NOT a mock response to show real success.
        setSendResponse({ type: 'success', message: `Test message sent successfully to ${testRecipient}.` });
      } else if (isMockResponse) {
         setSendResponse({ type: 'warning', message: `Test message sent, but received a potential mock response. Message may not have been delivered.` });
      }
      else {
        // Handle API errors or non-mock failures
        setSendResponse({ type: 'error', message: `Failed to send test message. Response: ${JSON.stringify(result.response)}` });
      }
    } catch (error: any) { // Explicitly type error as any
      console.error("Error sending test message:", error);
      setSendResponse({ type: 'error', message: `Error sending test message: ${error.message || String(error)}` });
      setFullResponseJson(error.response ? error.response.data : null); // Store error response if available
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
            <div className={`mt-4 p-3 rounded-md text-sm ${sendResponse.type === 'success' ? 'bg-green-100 text-green-700' : sendResponse.type === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'} flex items-center`}>
              {sendResponse.type === 'success' ? <CheckCircleIcon className="w-5 h-5 mr-2"/> : <XCircleIcon className="w-5 h-5 mr-2"/>}
              {sendResponse.message}
            </div>
          )}
        </div>
      </div>

      {/* Debug Panel to show full JSON response */}
      {fullResponseJson && (
        <div className="mt-4 p-3 bg-gray-100 rounded-md text-sm text-gray-800">
          <h3 className="text-lg font-semibold mb-2">Full API Response:</h3>
          <pre className="whitespace-pre-wrap break-all text-xs">
            {JSON.stringify(fullResponseJson, null, 2)}
          </pre>
        </div>
      )}
      
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
